import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Directory, File, Paths } from "expo-file-system";
// react-native's own SafeAreaView is an iOS-only no-op, so on Android the
// header slid under the status bar. This one reads real insets on both.
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import HankoSeal from "./components/HankoSeal";
// Loaded on demand rather than at startup. This is the only thing that pulls in
// react-native-reanimated + react-native-worklets — together the largest chunk
// of the bundle by far — and none of it is needed until the first stamp is
// pressed. Metro only runs a module's code when it is first required, so
// deferring this keeps ~700 modules from being evaluated during launch.
const StampPressOverlay = React.lazy(() => import("./components/StampPressOverlay"));
import WashiTexture from "./components/WashiTexture";
import HotelAffiliateLink from "./components/HotelAffiliateLink";
import AdBanner from "./components/AdBanner";
// Icons are imported one file at a time rather than from the package root.
// The barrel export pulls every one of lucide's ~1500 icons into the bundle —
// it was over a third of the whole dev bundle on its own, and the download is
// what made the app sit on a blank loading screen for so long on device.
// `CheckCircle2` is lucide's alias for `circle-check`, hence the path.
import MapPin from "lucide-react-native/icons/map-pin";
import Sparkles from "lucide-react-native/icons/sparkles";
import RotateCcw from "lucide-react-native/icons/rotate-ccw";
import Camera from "lucide-react-native/icons/camera";
import Navigation from "lucide-react-native/icons/navigation";
import Dices from "lucide-react-native/icons/dices";
import CheckCircle2 from "lucide-react-native/icons/circle-check";
import Lightbulb from "lucide-react-native/icons/lightbulb";
import X from "lucide-react-native/icons/x";
// Collection icons. Imported per-icon like the rest so the whole lucide set
// never lands in the bundle.
import Cat from "lucide-react-native/icons/cat";
import Soup from "lucide-react-native/icons/soup";
import Fish from "lucide-react-native/icons/fish";
import Cake from "lucide-react-native/icons/cake";
import Store from "lucide-react-native/icons/store";
import Castle from "lucide-react-native/icons/castle";
import Trees from "lucide-react-native/icons/trees";
import Landmark from "lucide-react-native/icons/landmark";
import TowerControl from "lucide-react-native/icons/tower-control";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import Maximize2 from "lucide-react-native/icons/maximize-2";

import {
  REGIONS,
  REGIONS_WITH_PREFS,
  ALL_PREFS,
  TOTAL,
  RANKS,
  rankFor,
  todayStr,
  formatDateInput,
  isValidDate,
  MISSION_META,
  rollMission,
  allMissionsForPref,
  CITY_RANK_TIERS,
  cityRankFor,
  completedIdsFor,
  migrateStampRecord,
  missionById,
  buildCollectionProgress,
  buildCollectionDetail,
  distanceKm,
  LOCATION_RADIUS_KM,
  LOCATION_TARGETS,
  REROLL_LIMIT,
} from "./data";

// ---------------------------------------------------------------------------
// AsyncStorage helpers — mirrors the web version's window.storage usage,
// just backed by AsyncStorage instead (device-local; swap for a real backend
// like Supabase/Firebase later if you want cross-device sync).
// ---------------------------------------------------------------------------
const STAMP_PREFIX = "stamp:";
const ROLL_PREFIX = "reroll:";

// ---------------------------------------------------------------------------
// Evidence photos
//
// These must NOT go into AsyncStorage. On Android AsyncStorage is one SQLite
// database with a ~6MB default ceiling for the whole app, so base64-encoding a
// camera photo (which also inflates it by ~33%) exhausts the budget after a
// handful of cities and every later write fails. Instead the picked image is
// downscaled, re-encoded as JPEG, moved into the document directory, and only
// its file URI — a few dozen bytes — is persisted.
//
// saveAsync() writes into the cache directory, which the OS is free to purge,
// so moving the result into Paths.document is what actually makes the evidence
// survive.
// ---------------------------------------------------------------------------
const PHOTO_DIR_NAME = "stamp-photos";
const PHOTO_MAX_WIDTH = 1280;
const PHOTO_QUALITY = 0.6;
// The grid draws every stamped city's photo at 56x56. Pointing those at the
// full 1280px file meant Android decoded a full-size JPEG per stamped city on
// every launch — a startup cost that grew with the collection. A separate
// small copy is written once at save time and used for the grid instead.
const THUMB_MAX_WIDTH = 240;
const THUMB_QUALITY = 0.5;

function photoDirectory() {
  const dir = new Directory(Paths.document, PHOTO_DIR_NAME);
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

async function persistPhoto(sourceUri, prefId) {
  // expo-file-system's document directory has no web equivalent; on web the
  // picker's own URI is already usable, and web is only ever a dev target here.
  if (Platform.OS === "web") return sourceUri;

  const rendered = await ImageManipulator.manipulate(sourceUri)
    .resize({ width: PHOTO_MAX_WIDTH })
    .renderAsync();
  const saved = await rendered.saveAsync({ compress: PHOTO_QUALITY, format: SaveFormat.JPEG });

  const scratch = new File(saved.uri);
  const target = new File(photoDirectory(), `${prefId}-${Date.now()}.jpg`);
  await scratch.move(target);
  return scratch.uri;
}

// Small companion copy of an already-persisted photo, for the 56x56 grid.
// Never let a thumbnail failure lose the real photo — the caller falls back to
// the full-size file, which still renders, just less cheaply.
async function persistThumbnail(sourceUri, prefId) {
  if (Platform.OS === "web") return sourceUri;
  try {
    const rendered = await ImageManipulator.manipulate(sourceUri)
      .resize({ width: THUMB_MAX_WIDTH })
      .renderAsync();
    const saved = await rendered.saveAsync({ compress: THUMB_QUALITY, format: SaveFormat.JPEG });
    const scratch = new File(saved.uri);
    const target = new File(photoDirectory(), `${prefId}-${Date.now()}-thumb.jpg`);
    await scratch.move(target);
    return scratch.uri;
  } catch (e) {
    return null;
  }
}

// Only ever removes files this app wrote into its own photo directory.
function deletePhotoFile(uri) {
  if (Platform.OS === "web") return;
  if (!uri || !uri.includes(PHOTO_DIR_NAME)) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (e) {
    // A leftover file is harmless; never let cleanup break the stamp flow.
  }
}

// Bounds an awaited call that could otherwise hang forever (a native
// permission dialog or GPS fix that never resolves), so UI state driven by
// it — a "checking…" spinner, a disabled button — can never get stuck.
//
// The timer from the losing side of the race was never cleared here before.
// When the real call won (the common case), its abandoned setTimeout stayed
// alive for the full `ms` and fired later as an unhandled rejection on an
// orphaned promise — noise, not the cause of a second call hanging (each
// call builds its own Promise.race from scratch), but worth cleaning up
// properly regardless of whether it's the actual culprit here.
function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Android's fused location provider can throw "Current location is
// unavailable" on a getCurrentPositionAsync call that lands shortly after a
// previous one — the provider hasn't produced a new fix yet (GPS re-locking,
// or a stale network-location cache). It's a transient device-side state,
// not a permission or code problem, so this escalates through three
// increasingly forgiving attempts before giving up:
//   1. Balanced accuracy — the normal, reasonably fast path.
//   2. A short pause, then Lowest (network/cell-tower only) — sidesteps a
//      GPS re-lock in progress, which is the most common cause here.
//   3. getLastKnownPositionAsync — a cached recent fix. Coarser, but the
//      mission's 15km radius doesn't need pinpoint accuracy anyway.
async function acquirePosition() {
  try {
    return await withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), 20000);
  } catch (firstError) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      // Lowest accuracy resolves from a cell/Wi-Fi lookup, not a satellite
      // fix, so it doesn't need anywhere near as long a leash as the first
      // attempt did.
      return await withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest }), 8000);
    } catch (secondError) {
      const lastKnown = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000 });
      if (lastKnown) return lastKnown;
      throw secondError;
    }
  }
}

async function loadAllWithPrefix(prefix) {
  const keys = await AsyncStorage.getAllKeys();
  const matching = keys.filter((k) => k.startsWith(prefix));
  const pairs = await AsyncStorage.multiGet(matching);
  const out = {};
  for (const [key, value] of pairs) {
    if (!value) continue;
    try {
      out[key.slice(prefix.length)] = JSON.parse(value);
    } catch (e) {
      // 壊れたレコードは無視
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------
// 都/府/県 are suffixes and drop off for the seal; 道 is part of 北海道 itself,
// so stripping it would print 「北海」.
function shortPrefName(name) {
  return name.replace(/[都府県]$/, "");
}

function CityBadge({ label, size = 44 }) {
  return (
    <View style={styles.hankoWrap}>
      <HankoSeal label={label} size={size} />
    </View>
  );
}

// Memoised: all 47 of these are on screen at once and each one draws an SVG
// (a seal, or the empty-slot pin). Without this, every open/close of the
// mission modal re-rendered the entire grid — the most visible source of lag.
// `pref` comes from the precomputed REGIONS_WITH_PREFS so its identity is
// stable, and `record` only changes for the city that was actually stamped.
const COLLECTION_ICONS = {
  cat: Cat, soup: Soup, fish: Fish, cake: Cake, store: Store,
  castle: Castle, trees: Trees, landmark: Landmark, tower: TowerControl,
};

function CollectionIcon({ name, size = 18, color = "#16283F" }) {
  const Ico = COLLECTION_ICONS[name] || Cat;
  return <Ico size={size} color={color} />;
}

// One row of the collection list. Shows what the collection wants and how far
// along it is, and opens the city breakdown when tapped.
const CollectionRow = React.memo(function CollectionRow({ item, onPress }) {
  const pct = item.total ? Math.round((item.done / item.total) * 100) : 0;
  const complete = item.total > 0 && item.done === item.total;
  return (
    <TouchableOpacity style={styles.collCard} onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={[styles.collIconWrap, complete && styles.collIconWrapDone]}>
        <CollectionIcon name={item.icon} color={complete ? "#FBF3E4" : "#16283F"} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.collCardTop}>
          <Text style={styles.collCardLabel}>{item.label}</Text>
          <Text style={[styles.collCardCount, complete && styles.collCardCountDone]}>
            {item.done} / {item.total}
          </Text>
        </View>
        <Text style={styles.collCardHint} numberOfLines={2}>{item.hint}</Text>
        <View style={styles.collBarTrack}>
          <View style={[styles.collBarFill, { width: pct + "%" }, complete && styles.collBarFillDone]} />
        </View>
      </View>
      <ChevronRight size={16} color="#706962" />
    </TouchableOpacity>
  );
});

// The breakdown behind a collection: every city it covers, the exact mission
// that counts there, and whether it is already done.
function CollectionModal({ item, stamps, onClose, onPickCity }) {
  const rows = useMemo(() => buildCollectionDetail(item.cat, stamps), [item.cat, stamps]);
  const complete = item.done === item.total;
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <WashiTexture opacity={0.06} />
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 28 }}>
            <TouchableOpacity style={styles.modalClose} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={22} color="#5C544A" />
            </TouchableOpacity>

            <View style={styles.collHead}>
              <View style={[styles.collIconWrap, styles.collIconWrapLarge, complete && styles.collIconWrapDone]}>
                <CollectionIcon name={item.icon} size={24} color={complete ? "#FBF3E4" : "#16283F"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalCapital}>{item.label}</Text>
                <Text style={styles.modalPref}>{item.hint}</Text>
              </View>
            </View>

            <View style={styles.collSummary}>
              <Text style={styles.collSummaryCount}>{item.done} / {item.total} 都市</Text>
              <Text style={styles.collSummaryNote}>
                {complete ? "この実績は制覇済みです" : "残り " + (item.total - item.done) + " 都市"}
              </Text>
            </View>

            <Text style={styles.collListLabel}>対象の都市とミッション</Text>
            {rows.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.collCityRow, r.done && styles.collCityRowDone]}
                onPress={() => onPickCity(r.id)}
                activeOpacity={0.7}
              >
                <View style={styles.collCityMark}>
                  {r.done
                    ? <CheckCircle2 size={16} color="#2D7944" />
                    : <View style={styles.collCityDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.collCityName}>
                    {r.capital}
                    <Text style={styles.collCityRegion}>　{r.region}</Text>
                  </Text>
                  {r.missions.map((m) => (
                    <Text key={m} style={styles.collCityMission}>・{m}</Text>
                  ))}
                </View>
                <ChevronRight size={14} color="#706962" />
              </TouchableOpacity>
            ))}
            <Text style={styles.collFootNote}>
              都市をタップすると、その都市のスタンプ画面が開きます。
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const StampCard = React.memo(function StampCard({ pref, record, onPress }) {
  const visited = !!record?.visited;
  return (
    <TouchableOpacity style={[styles.card, visited && styles.cardVisited]} onPress={() => onPress(pref)}>
      {record?.photo ? (
        // Falls back to the full photo for records saved before thumbnails
        // existed, so older stamps keep showing their picture.
        <Image source={{ uri: record.photoThumb || record.photo }} style={styles.cardPhoto} />
      ) : visited ? (
        <CityBadge label={shortPrefName(pref.pref)} />
      ) : (
        <View style={styles.cardEmpty}>
          <MapPin size={20} color="rgba(43,38,33,0.3)" />
        </View>
      )}
      <Text style={styles.cardCapital}>{pref.capital}</Text>
      <Text style={styles.cardPref}>{pref.pref}</Text>
      {visited && record?.date && <Text style={styles.cardDate}>{record.date}</Text>}
    </TouchableOpacity>
  );
});

// ---------------------------------------------------------------------------
// Mission modal — roulette, evidence (photo / location), stamping, and the
// post-stamp "extra mission" flow for city-rank progression.
// react-native-web ships Alert.alert as an empty function, so on the web dev
// target every confirmation — and every permission error — silently does
// nothing. Route through here so the browser gets a real dialog and the
// destructive path can actually be exercised during development.
function confirmDestructive({ title, message, confirmLabel, onConfirm }) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(title + "\n\n" + message)) onConfirm();
    return;
  }
  Alert.alert(
    title,
    message,
    [
      { text: "キャンセル", style: "cancel" },
      { text: confirmLabel, style: "destructive", onPress: onConfirm },
    ],
    { cancelable: true }
  );
}

// Every photo in this app used to be a plain <Image>: a meal shot rendered at
// 34px in the checklist, a memo photo at 74px, both cropped to a square by the
// default "cover" resize. There was nowhere to see the actual picture. Tapping
// any of them now opens this.
function PhotoViewer({ photos, index, onClose }) {
  const [i, setI] = useState(index);
  const current = photos[i];
  const many = photos.length > 1;
  if (!current) return null;
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.viewerBackdrop}>
        {/* Tapping the background closes, the way a photo viewer is expected
            to behave. The image itself sits above this and swallows taps. */}
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        <Image source={{ uri: current }} style={styles.viewerImage} resizeMode="contain" />

        <TouchableOpacity
          style={styles.viewerClose}
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <X size={24} color="#FBF3E4" />
        </TouchableOpacity>

        {many && (
          <>
            <TouchableOpacity
              style={[styles.viewerNav, styles.viewerNavLeft]}
              onPress={() => setI((n) => (n - 1 + photos.length) % photos.length)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ChevronLeft size={26} color="#FBF3E4" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewerNav, styles.viewerNavRight]}
              onPress={() => setI((n) => (n + 1) % photos.length)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ChevronRight size={26} color="#FBF3E4" />
            </TouchableOpacity>
            <Text style={styles.viewerCount}>{i + 1} / {photos.length}</Text>
          </>
        )}
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// NOTE: this component is only ever mounted with a non-null `pref`, and the
// caller keys it by pref.id so every city starts from a clean slate. Both of
// those matter — see the comment on the render site in App().
function MissionModal({ pref, record, rerollRecord, onClose, onSave, onClear, onMissionChange, onAddProgress }) {
  const alreadyVisited = !!record?.visited;
  const today = todayStr();
  const hasFreshRerollRecord = rerollRecord && rerollRecord.date === today;

  const [date, setDate] = useState(record?.date || today);
  const [memo, setMemo] = useState(record?.memo || "");
  // `photo` is the first mission's evidence — the one saved at record.photo.
  // `extraPhoto` is the picker for an extra mission, kept in its own state:
  // the two used to share `photo`, so entering extra mode blanked it and the
  // first mission's evidence disappeared from the screen. They are separate
  // records on disk, so they get separate state here too.
  const [photo, setPhoto] = useState(record?.photo || null);
  // Grid-sized copy of `photo`. Only the main photo needs one — it is the only
  // one the 47-card list draws on launch.
  const [photoThumb, setPhotoThumb] = useState(record?.photoThumb || null);
  const [extraPhoto, setExtraPhoto] = useState(null);
  // Photos attached to the note itself — a small album for the visit, separate
  // from the single evidence photo above, which has a fixed job (proving the
  // mission). Any number of these, purely for the memory.
  const [memoPhotos, setMemoPhotos] = useState(record?.memoPhotos || []);
  // { photos: [uri], index } — 全部のサムネイルからここに集約する
  const [viewer, setViewer] = useState(null);
  const openViewer = (photos, index = 0) => {
    const list = (Array.isArray(photos) ? photos : [photos]).filter(Boolean);
    if (list.length) setViewer({ photos: list, index });
  };
  const [photoBusy, setPhotoBusy] = useState(false);
  const [memoPhotoBusy, setMemoPhotoBusy] = useState(false);

  const [mission, setMission] = useState(
    alreadyVisited
      ? record?.mission || null
      : hasFreshRerollRecord
      ? { ...rerollRecord.mission, completed: false, completedAt: undefined, distanceKm: undefined }
      : null
  );
  const [missionNote, setMissionNote] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [extraMode, setExtraMode] = useState(false);
  const [geoStatus, setGeoStatus] = useState("idle");
  const [geoDistance, setGeoDistance] = useState(null);
  const [geoErrorDetail, setGeoErrorDetail] = useState(null);
  const spinTimer = useRef(null);

  const rerollsUsedToday = hasFreshRerollRecord ? rerollRecord.count : 0;
  const rerollsLeft = REROLL_LIMIT - rerollsUsedToday;

  const cityMissions = allMissionsForPref(pref);
  const completedIds = completedIdsFor(record, pref.id);
  const cityDoneCount = completedIds.length;
  const cityRank = cityRankFor(cityDoneCount);
  const allMissionsDone = cityDoneCount >= cityMissions.length;

  // The first mission's evidence lives at record.photo; every mission earned
  // afterward through the "extra mission" flow gets its own entry in
  // record.missionPhotos, keyed by mission text. Two separate fields, so an
  // extra mission's photo never overwrites the first one's — but nothing
  // used to ever render the first one's again once extraMode cleared the
  // shared `photo` field it also doubles as the picker preview for, which
  // read as "my first mission's photo vanished." This looks it up from
  // whichever of the two fields actually holds it, so the checklist below
  // can keep showing every mission's own evidence permanently.
  const photoForMissionId = (id) =>
    record?.mission?.id === id ? record?.photo : record?.missionPhotos?.[id];

  // Whichever picker is on screen right now. Everything that reads or writes
  // "the photo the user is currently choosing" goes through these, so neither
  // flow can clobber the other's state.
  const activePhoto = extraMode ? extraPhoto : photo;
  const setActivePhoto = extraMode ? setExtraPhoto : setPhoto;

  useEffect(() => () => clearInterval(spinTimer.current), []);

  useEffect(() => {
    if (mission && (mission.type === "eat" || mission.type === "photo") && !mission.completed && activePhoto) {
      setMission((m) => ({ ...m, completed: true, completedAt: todayStr() }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePhoto]);

  const missionRequired = !alreadyVisited;
  const inMissionAttempt = missionRequired || extraMode;
  const missionCleared = !inMissionAttempt || (mission && mission.completed);
  const dateValid = isValidDate(date);
  const canConfirm = missionCleared && !photoBusy && !spinning && (extraMode || dateValid);

  // The lock hint used to say "ミッションを達成すると先に進めます" whatever the
  // actual blocker was, including while a photo was still being written.
  const lockReason = spinning
    ? "ミッションを選んでいます…"
    : photoBusy
      ? "写真を読み込んでいます…"
      : !missionCleared
        ? "ミッションを達成すると先に進めます"
        : "訪問日を正しく入力してください";

  // Clearing a city throws away the stamp, the date, the note and every photo
  // file behind it, with nothing to undo it. It used to fire on the first tap,
  // from a button sitting 9px from the primary one. Say what will be lost.
  const confirmClear = () => {
    const losing = [];
    if (record?.photo) losing.push("旅の一枚");
    const evidenceCount = Object.keys(record?.missionPhotos || {}).length;
    if (evidenceCount) losing.push("証拠写真" + evidenceCount + "枚");
    if (record?.memoPhotos?.length) losing.push("メモの写真" + record.memoPhotos.length + "枚");
    if (record?.memo) losing.push("メモ");
    const detail = losing.length
      ? losing.join("・") + "も削除されます。"
      : "この都市の達成状況がすべて失われます。";
    confirmDestructive({
      title: pref.capital + "の記録を消しますか？",
      message: detail + "元に戻すことはできません。",
      confirmLabel: "削除する",
      onConfirm: () => onClear(pref.id),
    });
  };
  const photoIsMissionEvidence =
    inMissionAttempt && mission && !mission.completed && (mission.type === "eat" || mission.type === "photo");

  const spin = (isReroll = false) => {
    if (spinning) return;
    if (isReroll && rerollsLeft <= 0) return;
    // Spending one of three daily changes only to be handed the same mission
    // back reads as a bug, so the one on screen is excluded from the re-roll.
    const excluded = isReroll && mission?.id ? [...completedIds, mission.id] : completedIds;
    setSpinning(true);
    setMission(null);
    // Only the picker in play — re-rolling an extra mission must not wipe the
    // first mission's already-saved evidence.
    setActivePhoto(null);
    setGeoStatus("idle");
    setGeoDistance(null);
    setMissionNote("");
    let ticks = 0;
    spinTimer.current = setInterval(() => {
      ticks++;
      if (ticks > 10) {
        clearInterval(spinTimer.current);
        const finalMission = { ...rollMission(pref, excluded), completed: false };
        setMission(finalMission);
        setSpinning(false);
        onMissionChange?.(pref.id, finalMission, isReroll);
      }
    }, 80);
  };

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("権限が必要です", "写真ライブラリへのアクセスを許可してください。");
      return;
    }
    setPhotoBusy(true);
    try {
      // Ask for the full-quality original; persistPhoto does the downscaling so
      // the compression happens once, on a known target width.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
      });
      if (result.canceled || !result.assets?.[0]?.uri) return;
      const saved = await persistPhoto(result.assets[0].uri, pref.id);
      setActivePhoto(saved);
      // Only the main photo feeds the grid, so only it gets a thumbnail.
      if (!extraMode) setPhotoThumb(await persistThumbnail(saved, pref.id));
    } catch (e) {
      Alert.alert("写真を保存できませんでした", String(e?.message ?? e));
    } finally {
      setPhotoBusy(false);
    }
  };

  const addMemoPhotos = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("権限が必要です", "写真ライブラリへのアクセスを許可してください。");
      return;
    }
    setMemoPhotoBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
        // Picking several shots of one visit in a single go is the common case
        // for a travel note, so this picker is multi-select unlike the
        // single-shot evidence one above.
        allowsMultipleSelection: true,
        selectionLimit: 6,
      });
      if (result.canceled || !result.assets?.length) return;
      // Persisted one at a time: each needs its own resize + move, and a
      // partial failure should still keep the ones that did succeed.
      const saved = [];
      for (const asset of result.assets) {
        if (!asset?.uri) continue;
        saved.push(await persistPhoto(asset.uri, pref.id));
      }
      setMemoPhotos((prev) => [...prev, ...saved]);
    } catch (e) {
      Alert.alert("写真を保存できませんでした", String(e?.message ?? e));
    } finally {
      setMemoPhotoBusy(false);
    }
  };

  const removeMemoPhotoAt = (idx) => {
    // Only drops it from the list here; the file itself is deleted on save,
    // once the record no longer points at it. Deleting eagerly would lose the
    // photo for good if the person then backs out without saving.
    setMemoPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const checkLocation = async () => {
    // Split into two sub-phases so the button can say which native call it's
    // actually waiting on — if this gets stuck again, knowing whether it
    // died on the permission round-trip or the GPS fix narrows it down
    // immediately instead of a single opaque "checking".
    setGeoStatus("checking-permission");
    setGeoErrorDetail(null);
    try {
      // Both awaits below are wrapped with a timeout. requestForegroundPermissionsAsync()
      // previously sat outside any try/catch, and on top of that neither call had a
      // time limit — if the permission dialog's promise or the GPS fix never
      // settled, the status was left stuck on "checking" forever, with the
      // button disabled in that state so there was no way to even retry.
      const perm = await withTimeout(Location.requestForegroundPermissionsAsync(), 20000);
      if (!perm.granted) {
        setGeoErrorDetail(`権限が許可されていません（status: ${perm.status}）`);
        setGeoStatus("error");
        return;
      }
      setGeoStatus("checking-gps");
      const pos = await acquirePosition();
      // Measure against the landmark the mission actually names, not the city
      // centre — those can be several km apart, which made missions
      // unachievable even while standing at the right place. Falls back to the
      // city centre if a city ever lacks a target entry.
      const target = LOCATION_TARGETS[pref.id] || { lat: pref.lat, lng: pref.lng };
      const d = distanceKm(pos.coords.latitude, pos.coords.longitude, target.lat, target.lng);
      setGeoDistance(d);
      if (d <= LOCATION_RADIUS_KM) {
        setGeoStatus("idle");
        setMission((m) => ({ ...m, completed: true, completedAt: todayStr(), distanceKm: d }));
      } else {
        setGeoStatus("far");
      }
    } catch (e) {
      setGeoErrorDetail(e?.message === "timeout" ? "20秒以内に応答がありませんでした" : String(e?.message ?? e));
      setGeoStatus("error");
    }
  };

  const startExtra = () => {
    setExtraMode(true);
    setMission(null);
    // Starts the extra mission's own empty picker. `photo` is left alone so
    // the first mission's evidence stays on screen and on record.
    setExtraPhoto(null);
    setMissionNote("");
    setGeoStatus("idle");
  };

  const cancelExtra = () => {
    setExtraMode(false);
    setMission(null);
    setExtraPhoto(null);
  };

  const recordProgress = () => {
    if (!mission?.completed) return;
    // The extra-mission screen demands evidence, so hand that evidence to the
    // record too — otherwise the photo the person was just required to supply
    // would be dropped on the floor (and orphaned on disk).
    onAddProgress?.(pref.id, mission.id, extraPhoto);
    onClose();
  };

  const finalMission = mission && mission.type === "eat" && missionNote.trim()
    ? { ...mission, note: missionNote.trim() }
    : mission;

  const confirmStamp = () => {
    // A first stamp always carries the mission that earned it; bail rather than
    // dereference null if the button is ever reachable without one.
    if (!alreadyVisited && !finalMission) return;
    onSave(pref.id, {
      visited: true,
      date,
      memo,
      memoPhotos,
      photo,
      photoThumb,
      mission: finalMission,
      completedMissionIds: alreadyVisited
        ? (record?.completedMissionIds?.length ? record.completedMissionIds : completedIds)
        : [finalMission.id],
    });
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
        <WashiTexture opacity={0.06} />
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
          // Without this the first tap after typing only dismisses the
          // keyboard, so 「記録を更新する」 needed two taps and looked broken.
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.modalClose} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={22} color="#5C544A" />
          </TouchableOpacity>

          <View style={styles.modalHead}>
            <CityBadge label={shortPrefName(pref.pref)} size={52} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.modalCapital}>{pref.capital}</Text>
              <Text style={styles.modalPref}>{pref.pref}・{pref.region}地方</Text>
            </View>
          </View>

          {pref.trivia && (
            <View style={styles.triviaBox}>
              <Lightbulb size={15} color="#B8923F" />
              <Text style={styles.triviaText}>{pref.trivia}</Text>
            </View>
          )}

          {/* 「その街のことを読んだ直後」＝宿を調べたくなる位置。
              ミッション本体より上には置かないこと。 */}
          <HotelAffiliateLink cityName={pref.capital} />

          {alreadyVisited && (
            <View style={styles.rankBox}>
              <View style={styles.rankTop}>
                <Text style={[styles.rankBadge, { color: cityRank.color, borderColor: cityRank.color }]}>
                  {cityRank.label}
                </Text>
                <Text style={styles.rankCount}>{cityDoneCount} / {cityMissions.length} ミッション達成</Text>
              </View>
              {cityMissions.map((m) => {
                const done = completedIds.includes(m.id);
                const thumb = done ? photoForMissionId(m.id) : null;
                return (
                  <View key={m.id} style={[styles.checklistItem, styles.checklistRow]}>
                    {thumb && (
                      <TouchableOpacity
                        onPress={() => openViewer(thumb)}
                        accessibilityLabel="証拠写真を拡大"
                        // The thumbnail is only 34px — too small to aim at
                        // reliably, and it sits in a tight list row.
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Image source={{ uri: thumb }} style={styles.checklistThumb} />
                      </TouchableOpacity>
                    )}
                    <Text style={[styles.checklistText, done && styles.checklistTextDone]}>
                      {done ? "✓ " : "・"}{m.text}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {alreadyVisited && !extraMode && !allMissionsDone && (
            <TouchableOpacity style={styles.rouletteBtn} onPress={startExtra}>
              <Dices size={18} color="#16283F" />
              <Text style={styles.rouletteBtnText}>追加ミッションに挑戦する（ランクアップ）</Text>
            </TouchableOpacity>
          )}
          {alreadyVisited && !extraMode && allMissionsDone && (
            <View style={styles.completeBanner}>
              <CheckCircle2 size={14} color="#2D7944" />
              <Text style={styles.completeBannerText}>この都市の全ミッションを制覇しました！</Text>
            </View>
          )}

          {inMissionAttempt && (
            <View style={styles.missionSection}>
              <View style={styles.missionSectionHead}>
                <Text style={styles.fieldLabel}>ミッション</Text>
                {extraMode && (
                  <TouchableOpacity onPress={cancelExtra} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.cancelLink}>キャンセル</Text>
                  </TouchableOpacity>
                )}
              </View>

              {!mission && !spinning && (
                <TouchableOpacity style={styles.rouletteBtn} onPress={() => spin(false)}>
                  <Dices size={20} color="#16283F" />
                  <Text style={styles.rouletteBtnText}>ミッションルーレットを回す</Text>
                </TouchableOpacity>
              )}

              {spinning && (
                <View style={styles.missionCard}>
                  <ActivityIndicator color="#BD3B28" />
                  <Text style={styles.missionText}>ミッションを選んでいます…</Text>
                </View>
              )}

              {!spinning && mission && (
                <View style={styles.missionCard}>
                  <Text style={[styles.missionTypeLabel, { color: MISSION_META[mission.type].color }]}>
                    {MISSION_META[mission.type].label}ミッション
                  </Text>
                  <Text style={styles.missionText}>{mission.text}</Text>

                  {!mission.completed && mission.type === "eat" && (
                    <Text style={styles.pendingText}>下の写真を追加すると自動で達成になります</Text>
                  )}
                  {!extraMode && mission.type === "eat" && (
                    <TextInput
                      style={styles.noteInput}
                      placeholder="食べたものメモ（任意）例：味噌ラーメン"
                      value={missionNote}
                      onChangeText={setMissionNote}
                    />
                  )}
                  {!mission.completed && mission.type === "photo" && (
                    <Text style={styles.pendingText}>下の写真を追加すると自動で達成になります</Text>
                  )}
                  {!mission.completed && mission.type === "location" && (
                    <View>
                      <TouchableOpacity
                        style={styles.smallBtn}
                        onPress={checkLocation}
                        disabled={geoStatus === "checking-permission" || geoStatus === "checking-gps"}
                      >
                        <Navigation size={13} color="#FBF3E4" />
                        <Text style={styles.smallBtnText}>
                          {geoStatus === "checking-permission"
                            ? "権限を確認中…"
                            : geoStatus === "checking-gps"
                            ? "現在地を取得中…"
                            : "現在地を確認する"}
                        </Text>
                      </TouchableOpacity>
                      {geoStatus === "far" && geoDistance != null && (
                        <Text style={[styles.geoText, styles.geoTextWarning]}>
                          目的地まで約{geoDistance.toFixed(1)}km。もう少し近づいてください
                        </Text>
                      )}
                      {geoStatus === "error" && (
                        <Text style={[styles.geoText, styles.geoTextWarning]}>
                          位置情報を取得できませんでした。端末の位置情報をオンにして、
                          屋外で試してみてください{geoErrorDetail ? `（${geoErrorDetail}）` : ""}
                        </Text>
                      )}
                    </View>
                  )}
                  {mission.completed && (
                    <View style={styles.doneRow}>
                      <CheckCircle2 size={13} color="#2D7944" />
                      <Text style={styles.doneText}>
                        ミッション達成（証拠を保存しました）
                        {mission.type === "location" && mission.distanceKm != null &&
                          `（約${mission.distanceKm.toFixed(1)}km）`}
                      </Text>
                    </View>
                  )}

                  {!mission.completed && (
                    rerollsLeft > 0 ? (
                      <TouchableOpacity style={styles.rerollBtn} onPress={() => spin(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <RotateCcw size={13} color="#5C544A" />
                        <Text style={styles.rerollBtnText}>別のミッションにする（本日あと{rerollsLeft}回）</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.rerollLimitText}>
                        本日のミッション変更回数を使い切りました。明日また挑戦できます
                      </Text>
                    )
                  )}
                </View>
              )}
            </View>
          )}

          {/* Shown in extra mode too — this is exactly when people worried the
              first mission's evidence had been lost. */}
          {alreadyVisited && record?.mission && (
            <View style={styles.missionSection}>
              <Text style={styles.fieldLabel}>最初の達成ミッション（証拠あり）</Text>
              <View style={styles.missionCard}>
                <Text style={[styles.missionTypeLabel, { color: MISSION_META[record.mission.type].color }]}>
                  {MISSION_META[record.mission.type].label}ミッション
                </Text>
                <Text style={styles.missionText}>
                  {/* Resolve through the id so a mission whose wording was
                      improved later shows the current text, not the snapshot
                      taken on the day it was stamped. */}
                  {missionById(pref.id, record.mission.id)?.text ?? record.mission.text}
                </Text>
                <Text style={styles.doneText}>
                  {record.mission.completedAt ? `${record.mission.completedAt}に達成` : "達成済み"}
                </Text>
                {record.mission.note && <Text style={styles.pendingText}>メモ：{record.mission.note}</Text>}
                {record.photo && (
                  <TouchableOpacity onPress={() => openViewer(record.photo)} accessibilityLabel="写真を拡大">
                    <Image source={{ uri: record.photo }} style={styles.missionCardThumb} />
                    <View style={styles.zoomBadge}><Maximize2 size={13} color="#FBF3E4" /></View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <Text style={styles.fieldLabel}>
            {extraMode
              ? (photoIsMissionEvidence ? "証拠写真（このミッションの達成に必須）" : "証拠写真（任意）")
              : (photoIsMissionEvidence ? "旅の一枚（ミッションの証拠として必須）" : "旅の一枚（任意）")}
          </Text>
          {activePhoto ? (
            <View style={styles.photoPreviewWrap}>
              <TouchableOpacity onPress={() => openViewer(activePhoto)} accessibilityLabel="写真を拡大">
                <Image source={{ uri: activePhoto }} style={styles.photoPreview} />
                <View style={styles.zoomBadge}><Maximize2 size={13} color="#FBF3E4" /></View>
              </TouchableOpacity>
              <View style={styles.photoActions}>
                <TouchableOpacity style={styles.ghostBtn} onPress={pickPhoto}>
                  <Text style={styles.ghostBtnText}>差し替え</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.ghostBtn}
                  onPress={() => {
                    setActivePhoto(null);
                    if (!extraMode) setPhotoThumb(null);
                    if (inMissionAttempt && mission?.completed && (mission.type === "eat" || mission.type === "photo")) {
                      setMission((m) => ({ ...m, completed: false, completedAt: undefined }));
                    }
                  }}
                >
                  <Text style={styles.ghostBtnText}>削除</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoPicker} onPress={pickPhoto} disabled={photoBusy}>
              <Camera size={18} color="#5C544A" />
              <Text style={styles.photoPickerText}>{photoBusy ? "読み込み中…" : "写真を選ぶ"}</Text>
            </TouchableOpacity>
          )}

          {!extraMode && (
            <>
              <Text style={styles.fieldLabel}>訪問日</Text>
              <TextInput
                style={[styles.dateInput, !dateValid && styles.inputInvalid]}
                value={date}
                onChangeText={(t) => setDate(formatDateInput(t))}
                placeholder="YYYY-MM-DD"
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={10}
              />
              {!dateValid && (
                <Text style={styles.inputError}>
                  数字8桁で入力してください（例：20260823 → 2026-08-23）
                </Text>
              )}
              <Text style={styles.fieldLabel}>ひとことメモ（任意）</Text>
              <TextInput
                style={styles.memoInput}
                value={memo}
                onChangeText={setMemo}
                multiline
                placeholder="立ち寄った場所、食べたもの、印象など…"
              />

              {/* メモに添える写真。横スクロールの小さな帯にして、
                  上の「旅の一枚」と役割が違うことが見た目で分かるようにしている。 */}
              {memoPhotos.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.memoPhotoStrip}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {memoPhotos.map((uri, idx) => (
                    <View key={uri + "#" + idx} style={styles.memoPhotoItem}>
                      <TouchableOpacity onPress={() => openViewer(memoPhotos, idx)} accessibilityLabel="メモの写真を拡大">
                        <Image source={{ uri }} style={styles.memoPhotoThumb} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.memoPhotoRemove}
                        onPress={() => removeMemoPhotoAt(idx)}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      >
                        <X size={12} color="#FBF3E4" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              <TouchableOpacity
                style={styles.memoPhotoAddBtn}
                onPress={addMemoPhotos}
                disabled={memoPhotoBusy}
              >
                <Camera size={15} color="#5C544A" />
                <Text style={styles.memoPhotoAddText}>
                  {memoPhotoBusy
                    ? "読み込み中…"
                    : memoPhotos.length > 0
                    ? "写真を追加する"
                    : "メモに写真を添える（任意）"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.primaryBtn, !canConfirm && styles.btnDisabled]}
              disabled={!canConfirm}
              onPress={extraMode ? recordProgress : confirmStamp}
            >
              <Sparkles size={15} color="#FBF3E4" />
              <Text style={styles.primaryBtnText}>
                {extraMode ? "この達成を記録する" : alreadyVisited ? "記録を更新する" : "スタンプを押す"}
              </Text>
            </TouchableOpacity>
          </View>
          {!canConfirm && (
            <Text style={styles.lockHint}>{lockReason}</Text>
          )}

          {/* Kept well away from 「記録を更新する」, and behind a confirm step. */}
          {alreadyVisited && !extraMode && (
            <View style={styles.dangerZone}>
              <TouchableOpacity style={styles.dangerBtn} onPress={confirmClear}>
                <RotateCcw size={15} color="#9A2E1F" />
                <Text style={styles.dangerBtnText}>この都市の記録を消す</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        </View>
      </View>

      {viewer && (
        <PhotoViewer photos={viewer.photos} index={viewer.index} onClose={() => setViewer(null)} />
      )}
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Main app
// ---------------------------------------------------------------------------
export default function App() {
  const [stamps, setStamps] = useState({});
  const [rerollData, setRerollData] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [activeRegion, setActiveRegion] = useState("すべて");
  const [openPref, setOpenPref] = useState(null);
  const [stampAnim, setStampAnim] = useState(null);

  // Mutable mirrors of the two persisted maps. The handlers below are invoked
  // from callbacks that a child captured on an earlier render (the roulette
  // fires from inside a setInterval), so reading `stamps` / `rerollData`
  // directly would read whatever those maps held when that closure was made.
  // That is what made the daily reroll counter stick at 1: `carry` was always
  // computed from an empty map, so every reroll re-wrote count = 0 + 1.
  const stampsRef = useRef(stamps);
  const rerollRef = useRef(rerollData);

  const commitStamps = (nextMap) => {
    stampsRef.current = nextMap;
    setStamps(nextMap);
  };
  const commitRerolls = (nextMap) => {
    rerollRef.current = nextMap;
    setRerollData(nextMap);
  };

  useEffect(() => {
    (async () => {
      // Records saved before missions had ids keyed everything off the mission
      // text. Bring them across once, on the way in, and write back only the
      // ones that actually changed shape.
      const raw = await loadAllWithPrefix(STAMP_PREFIX);
      const migrated = {};
      const writeBack = [];
      for (const [id, rec] of Object.entries(raw)) {
        const next = migrateStampRecord(rec, id);
        migrated[id] = next;
        if (next !== rec) writeBack.push([STAMP_PREFIX + id, JSON.stringify(next)]);
      }
      commitStamps(migrated);
      commitRerolls(await loadAllWithPrefix(ROLL_PREFIX));
      setLoaded(true);
      if (writeBack.length) {
        // After the first paint: the screen already has the migrated data, so
        // persisting it is housekeeping and must not delay startup.
        AsyncStorage.multiSet(writeBack).catch(() => {});
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visitedCount = useMemo(() => Object.values(stamps).filter((s) => s?.visited).length, [stamps]);
  const rank = rankFor(visitedCount);
  const nextRank = RANKS.find((r) => r.min > visitedCount);
  const collectionProgress = useMemo(() => buildCollectionProgress(stamps), [stamps]);
  const [openCollection, setOpenCollection] = useState(null);

  const handleMissionChange = async (id, missionObj, isReroll) => {
    const today = todayStr();
    const existing = rerollRef.current[id];
    const carry = existing && existing.date === today ? existing.count : 0;
    const next = { date: today, count: isReroll ? carry + 1 : carry, mission: missionObj };
    commitRerolls({ ...rerollRef.current, [id]: next });
    await AsyncStorage.setItem(ROLL_PREFIX + id, JSON.stringify(next));
  };

  const clearReroll = async (id) => {
    const next = { ...rerollRef.current };
    delete next[id];
    commitRerolls(next);
    await AsyncStorage.removeItem(ROLL_PREFIX + id);
  };

  const handleSave = async (id, record) => {
    const previous = stampsRef.current[id];
    const wasVisited = !!previous?.visited;
    commitStamps({ ...stampsRef.current, [id]: { ...previous, ...record } });
    setOpenPref(null);
    const pref = ALL_PREFS.find((p) => p.id === id);
    if (pref) setStampAnim({ label: shortPrefName(pref.pref), caption: `${pref.capital}　${record.date}` });
    await AsyncStorage.setItem(STAMP_PREFIX + id, JSON.stringify({ ...previous, ...record }));
    if (!wasVisited) clearReroll(id);
    // Only after the new record is committed — never drop the old evidence
    // while it is still the thing the record points at.
    if (previous?.photo && previous.photo !== record.photo) deletePhotoFile(previous.photo);
    if (previous?.photoThumb && previous.photoThumb !== record.photoThumb) {
      deletePhotoFile(previous.photoThumb);
    }
    // Same for note photos the person removed in this edit: they are no longer
    // referenced by the saved record, so their files can go.
    if (Array.isArray(record.memoPhotos)) {
      (previous?.memoPhotos || [])
        .filter((uri) => !record.memoPhotos.includes(uri))
        .forEach(deletePhotoFile);
    }
  };

  const handleClear = async (id) => {
    const previous = stampsRef.current[id];
    const next = { ...stampsRef.current };
    delete next[id];
    commitStamps(next);
    setOpenPref(null);
    await AsyncStorage.removeItem(STAMP_PREFIX + id);
    clearReroll(id);
    deletePhotoFile(previous?.photo);
    deletePhotoFile(previous?.photoThumb);
    Object.values(previous?.missionPhotos || {}).forEach(deletePhotoFile);
    (previous?.memoPhotos || []).forEach(deletePhotoFile);
  };

  const handleAddProgress = async (id, missionId, evidencePhoto) => {
    const existing = stampsRef.current[id];
    if (!existing?.visited) return;
    const base = completedIdsFor(existing, id);
    if (base.includes(missionId)) {
      deletePhotoFile(evidencePhoto);
      return;
    }
    const next = {
      ...existing,
      completedMissionIds: [...base, missionId],
      missionPhotos: evidencePhoto
        ? { ...(existing.missionPhotos || {}), [missionId]: evidencePhoto }
        : existing.missionPhotos,
    };
    commitStamps({ ...stampsRef.current, [id]: next });
    await AsyncStorage.setItem(STAMP_PREFIX + id, JSON.stringify(next));
  };

  const visibleRegions = useMemo(
    () =>
      activeRegion === "すべて"
        ? REGIONS_WITH_PREFS
        : REGIONS_WITH_PREFS.filter((r) => r.name === activeRegion),
    [activeRegion]
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
      <WashiTexture />
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={styles.headerTitle}>県庁所在地 巡礼帳</Text>
        <Text style={styles.headerSub}>ミッションを達成して、スタンプを集めよう</Text>

        <View style={styles.passport}>
          <Text style={styles.passportRank}>{rank.label}</Text>
          <Text style={styles.passportCount}>{visitedCount} / {TOTAL}</Text>
          {nextRank && (
            <Text style={styles.passportNext}>次の称号「{nextRank.label}」まであと{nextRank.min - visitedCount}都市</Text>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <TouchableOpacity
            style={[styles.tab, activeRegion === "すべて" && styles.tabActive]}
            onPress={() => setActiveRegion("すべて")}
          >
            <Text style={[styles.tabText, activeRegion === "すべて" && styles.tabTextActive]}>すべて</Text>
          </TouchableOpacity>
          {REGIONS.map((r) => (
            <TouchableOpacity
              key={r.name}
              style={[styles.tab, activeRegion === r.name && styles.tabActive]}
              onPress={() => setActiveRegion(r.name)}
            >
              <Text style={[styles.tabText, activeRegion === r.name && styles.tabTextActive]}>{r.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {!loaded && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#BD3B28" />
            <Text style={styles.loadingText}>巡礼帳を開いています…</Text>
          </View>
        )}

        {loaded && visibleRegions.map((region) => (
          <View key={region.name} style={{ marginBottom: 20 }}>
            <Text style={styles.regionTitle}>{region.name}</Text>
            <View style={styles.grid}>
              {region.prefs.map((p) => (
                <StampCard key={p.id} pref={p} record={stamps[p.id]} onPress={setOpenPref} />
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.collectionTitle}>全国コレクション</Text>
        <Text style={styles.collectionLead}>
          テーマごとの実績です。タップすると対象の都市と、そこで達成すべきミッションが見られます。
        </Text>
        {collectionProgress.map((c) => (
          <CollectionRow key={c.cat} item={c} onPress={setOpenCollection} />
        ))}
      </ScrollView>

      {/* Mounted only while a city is open, and keyed by city id. The modal
          keeps the picked photo / rolled mission / date in useState, and those
          initialisers run once per mount — without the key, opening a second
          city would inherit the first city's mission and photo. */}
      {openPref && (
        <MissionModal
          key={openPref.id}
          pref={openPref}
          record={stamps[openPref.id]}
          rerollRecord={rerollData[openPref.id]}
          onClose={() => setOpenPref(null)}
          onSave={handleSave}
          onClear={handleClear}
          onMissionChange={handleMissionChange}
          onAddProgress={handleAddProgress}
        />
      )}

      {openCollection && (
        <CollectionModal
          item={openCollection}
          stamps={stamps}
          onClose={() => setOpenCollection(null)}
          onPickCity={(id) => {
            // Hand off to the city sheet rather than stacking two modals.
            setOpenCollection(null);
            const target = ALL_PREFS.find((p) => p.id === id);
            if (target) setOpenPref(target);
          }}
        />
      )}

      {stampAnim && (
        // No fallback UI: the overlay is pure decoration, so on the very first
        // press it simply starts a beat later rather than flashing a spinner.
        <Suspense fallback={null}>
          <StampPressOverlay
            label={stampAnim.label}
            caption={stampAnim.caption}
            onFinished={() => setStampAnim(null)}
          />
        </Suspense>
      )}

      {/* 画面下端に固定。押印オーバーレイより前に置いてあるので、
          演出中はオーバーレイが広告の上に重なります。 */}
      <AdBanner />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F3ECDC" },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#16283F", textAlign: "center" },
  headerSub: { fontSize: 12, color: "#5C544A", textAlign: "center", marginBottom: 16 },
  passport: { backgroundColor: "#223A5E", borderRadius: 16, padding: 16, marginBottom: 16 },
  passportRank: { color: "#F4EAD0", fontSize: 18, fontWeight: "700" },
  passportCount: { color: "#CFA84E", fontSize: 20, fontWeight: "800", marginTop: 4 },
  passportNext: { color: "rgba(239,230,210,0.7)", fontSize: 11, marginTop: 6 },
  tab: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 999, borderWidth: 1, borderColor: "rgba(43,38,33,0.14)", marginRight: 8, backgroundColor: "rgba(255,255,255,0.5)" },
  tabActive: { backgroundColor: "#BD3B28", borderColor: "#BD3B28" },
  tabText: { fontSize: 13, fontWeight: "700", color: "#5C544A" },
  tabTextActive: { color: "#FBF3E4" },
  regionTitle: { fontSize: 16, fontWeight: "700", color: "#16283F", marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { width: "31%", backgroundColor: "rgba(255,255,255,0.55)", borderRadius: 12, padding: 8, alignItems: "center", borderWidth: 1, borderColor: "rgba(43,38,33,0.14)" },
  cardVisited: { backgroundColor: "rgba(255,255,255,0.85)", borderColor: "rgba(189,59,40,0.3)" },
  cardPhoto: { width: 56, height: 56, borderRadius: 10, marginBottom: 6 },
  cardEmpty: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: "rgba(43,38,33,0.2)", borderStyle: "dashed", alignItems: "center", justifyContent: "center", marginBottom: 6 },
  cardCapital: { fontSize: 12, fontWeight: "700", color: "#2B2621", textAlign: "center" },
  cardPref: { fontSize: 11, color: "#5C544A" },
  cardDate: { fontSize: 11, color: "#9A2E1F", fontWeight: "700", marginTop: 2 },
  hankoWrap: { alignItems: "center", justifyContent: "center", marginBottom: 6 },
  collectionTitle: { fontSize: 16, fontWeight: "700", color: "#16283F", marginTop: 10, marginBottom: 6 },
  collectionLead: { fontSize: 12, color: "#5C544A", lineHeight: 17, marginBottom: 10 },
  collCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(43,38,33,0.14)", padding: 10, marginBottom: 8 },
  collIconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(184,146,63,0.18)", borderWidth: 1, borderColor: "rgba(184,146,63,0.4)" },
  collIconWrapLarge: { width: 46, height: 46, borderRadius: 23 },
  // #B8923F under the cream icon was only 2.64:1 — completing a collection
  // made its icon *harder* to see than the unfinished state. Same gold as the
  // done count, which carries the light glyph at 5.55:1.
  collIconWrapDone: { backgroundColor: "#785E27", borderColor: "#785E27" },
  collCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  collCardLabel: { fontSize: 13, fontWeight: "800", color: "#16283F" },
  collCardCount: { fontSize: 12, fontWeight: "800", color: "#5C544A" },
  collCardCountDone: { color: "#785E27" },
  collCardHint: { fontSize: 11, color: "#5C544A", marginTop: 1, marginBottom: 5 },
  collBarTrack: { height: 5, borderRadius: 3, backgroundColor: "rgba(43,38,33,0.12)", overflow: "hidden" },
  collBarFill: { height: 5, borderRadius: 3, backgroundColor: "#BD3B28" },
  collBarFillDone: { backgroundColor: "#B8923F" },
  collHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  collSummary: { flexDirection: "row", alignItems: "baseline", gap: 10, backgroundColor: "rgba(184,146,63,0.12)", borderWidth: 1, borderColor: "rgba(184,146,63,0.3)", borderRadius: 10, padding: 12, marginBottom: 16 },
  collSummaryCount: { fontSize: 18, fontWeight: "800", color: "#16283F" },
  collSummaryNote: { fontSize: 12, color: "#5C544A", fontWeight: "700" },
  collListLabel: { fontSize: 12, fontWeight: "700", color: "#5C544A", marginBottom: 8 },
  collCityRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "rgba(255,255,255,0.55)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(43,38,33,0.14)", padding: 10, marginBottom: 6 },
  // rgba spelling of #2D7944, so the done tint matches the done text colour.
  collCityRowDone: { backgroundColor: "rgba(45,121,68,0.08)", borderColor: "rgba(45,121,68,0.3)" },
  collCityMark: { width: 16, alignItems: "center", paddingTop: 1 },
  collCityDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: "rgba(43,38,33,0.3)", borderStyle: "dashed" },
  collCityName: { fontSize: 13, fontWeight: "700", color: "#2B2621" },
  collCityRegion: { fontSize: 11, fontWeight: "400", color: "#706962" },
  collCityMission: { fontSize: 11, color: "#5C544A", marginTop: 2, lineHeight: 16 },
  collFootNote: { fontSize: 11, color: "#706962", marginTop: 8, textAlign: "center" },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(22,20,17,0.5)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#F3ECDC", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "88%", overflow: "hidden" },
  modalClose: { alignSelf: "flex-end", padding: 11 },
  modalHead: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  modalCapital: { fontSize: 20, fontWeight: "700", color: "#16283F" },
  modalPref: { fontSize: 12, color: "#5C544A", marginTop: 2 },
  triviaBox: { flexDirection: "row", gap: 8, backgroundColor: "rgba(184,146,63,0.12)", borderRadius: 10, padding: 10, marginBottom: 14, borderWidth: 1, borderColor: "rgba(184,146,63,0.3)" },
  triviaText: { fontSize: 12, color: "#2B2621", flex: 1 },
  rankBox: { borderRadius: 12, borderWidth: 1, borderColor: "rgba(43,38,33,0.14)", backgroundColor: "rgba(255,255,255,0.55)", padding: 12, marginBottom: 14 },
  rankTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  rankBadge: { fontSize: 11, fontWeight: "800", borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  rankCount: { fontSize: 11, color: "#5C544A", fontWeight: "700" },
  checklistItem: { marginBottom: 3 },
  checklistRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  checklistThumb: { width: 34, height: 34, borderRadius: 6 },
  checklistText: { fontSize: 12, color: "#5C544A" },
  checklistTextDone: { color: "#2B2621", fontWeight: "700" },
  rouletteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderColor: "#B8923F", borderStyle: "dashed", borderRadius: 10, padding: 14, marginBottom: 14, backgroundColor: "rgba(184,146,63,0.08)" },
  rouletteBtnText: { fontSize: 13, fontWeight: "800", color: "#16283F" },
  completeBanner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(45,121,68,0.1)", borderColor: "rgba(45,121,68,0.3)", borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 14 },
  completeBannerText: { fontSize: 12, fontWeight: "800", color: "#2D7944" },
  missionSection: { marginBottom: 14 },
  missionSectionHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: "#5C544A", marginBottom: 6, marginTop: 6 },
  cancelLink: { fontSize: 11, fontWeight: "700", color: "#5C544A", textDecorationLine: "underline" },
  missionCard: { borderRadius: 12, borderWidth: 1, borderColor: "rgba(43,38,33,0.14)", backgroundColor: "rgba(255,255,255,0.6)", padding: 12 },
  missionCardThumb: { width: "100%", height: 140, borderRadius: 8, marginTop: 8 },
  missionTypeLabel: { fontSize: 11, fontWeight: "800" },
  missionText: { fontSize: 14, fontWeight: "700", color: "#2B2621", marginTop: 3, marginBottom: 6 },
  pendingText: { fontSize: 11, color: "#5C544A", marginBottom: 6 },
  noteInput: { borderWidth: 1, borderColor: "rgba(43,38,33,0.14)", borderRadius: 8, padding: 8, fontSize: 13, backgroundColor: "rgba(255,255,255,0.7)", marginBottom: 6 },
  smallBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#BD3B28", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 14, alignSelf: "flex-start" },
  smallBtnText: { color: "#FBF3E4", fontSize: 12, fontWeight: "700" },
  geoText: { fontSize: 14, fontWeight: "600", color: "#5C544A", marginTop: 6, lineHeight: 19 },
  geoTextWarning: { color: "#9A2E1F" },
  doneRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  doneText: { fontSize: 11, fontWeight: "800", color: "#2D7944" },
  // Was a bare 24px-tall text link for an action people only get three of a
  // day. Given a border and real padding it reads as — and behaves like — a
  // button.
  rerollBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1, borderColor: "rgba(43,38,33,0.2)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 13, marginTop: 10, backgroundColor: "rgba(255,255,255,0.5)" },
  rerollBtnText: { fontSize: 12, fontWeight: "700", color: "#5C544A" },
  dangerZone: { marginTop: 22, paddingTop: 14, borderTopWidth: 1, borderTopColor: "rgba(43,38,33,0.14)", alignItems: "center" },
  dangerBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "rgba(154,46,31,0.4)", borderRadius: 999, paddingHorizontal: 16, paddingVertical: 13 },
  dangerBtnText: { fontSize: 12, fontWeight: "700", color: "#9A2E1F" },
  inputInvalid: { borderColor: "#9A2E1F", borderWidth: 1.5 },
  inputError: { fontSize: 11, color: "#9A2E1F", marginTop: -6, marginBottom: 10 },
  viewerBackdrop: { flex: 1, backgroundColor: "rgba(12,10,8,0.94)", alignItems: "center", justifyContent: "center" },
  // contain, not cover: the point of opening this is to see the whole frame.
  viewerImage: { width: "100%", height: "82%" },
  viewerClose: { position: "absolute", top: 40, right: 18, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  viewerNav: { position: "absolute", top: "48%", width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 22, backgroundColor: "rgba(255,255,255,0.12)" },
  viewerNavLeft: { left: 12 },
  viewerNavRight: { right: 12 },
  viewerCount: { position: "absolute", bottom: 42, color: "#FBF3E4", fontSize: 13, fontWeight: "700" },
  // Small corner marker so the bigger previews read as tappable.
  zoomBadge: { position: "absolute", right: 8, bottom: 8, width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(12,10,8,0.55)" },
  loadingBox: { alignItems: "center", gap: 8, paddingVertical: 40 },
  loadingText: { fontSize: 12, color: "#5C544A" },
  rerollLimitText: { fontSize: 11, fontWeight: "700", color: "#9A2E1F", marginTop: 8 },
  photoPreviewWrap: { borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: "rgba(43,38,33,0.14)", marginBottom: 6 },
  photoPreview: { width: "100%", height: 180 },
  photoActions: { flexDirection: "row", gap: 8, padding: 8, backgroundColor: "rgba(255,255,255,0.6)" },
  photoPicker: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderColor: "rgba(43,38,33,0.28)", borderStyle: "dashed", borderRadius: 10, padding: 16, marginBottom: 6 },
  photoPickerText: { fontSize: 13, fontWeight: "700", color: "#5C544A" },
  dateInput: { borderWidth: 1, borderColor: "rgba(43,38,33,0.14)", borderRadius: 8, padding: 9, fontSize: 14, backgroundColor: "rgba(255,255,255,0.7)", marginBottom: 10 },
  memoInput: { borderWidth: 1, borderColor: "rgba(43,38,33,0.14)", borderRadius: 8, padding: 9, fontSize: 14, backgroundColor: "rgba(255,255,255,0.7)", minHeight: 70, textAlignVertical: "top", marginBottom: 8 },
  memoPhotoStrip: { marginBottom: 8 },
  memoPhotoItem: { position: "relative" },
  memoPhotoThumb: { width: 74, height: 74, borderRadius: 8, borderWidth: 1, borderColor: "rgba(43,38,33,0.14)" },
  memoPhotoRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(22,20,17,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  memoPhotoAddBtn: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1.5,
    borderColor: "rgba(43,38,33,0.22)",
    borderStyle: "dashed",
    borderRadius: 9,
    paddingVertical: 11,
    marginBottom: 10,
  },
  memoPhotoAddText: { fontSize: 13, fontWeight: "700", color: "#5C544A" },
  actionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 6 },
  ghostBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: "rgba(43,38,33,0.14)", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 13 },
  ghostBtnText: { fontSize: 12, fontWeight: "700", color: "#5C544A" },
  primaryBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#BD3B28", borderRadius: 999, paddingHorizontal: 18, paddingVertical: 13 },
  primaryBtnText: { color: "#FBF3E4", fontSize: 13, fontWeight: "700" },
  // opacity: 0.5 washed the white label out along with the fill. A solid
  // muted colour keeps the text at 5.29:1 while still reading as disabled.
  btnDisabled: { backgroundColor: "#6B645C" },
  lockHint: { fontSize: 11, color: "#9A2E1F", textAlign: "right", marginTop: 6 },
});
