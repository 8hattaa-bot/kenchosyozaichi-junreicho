// ---------------------------------------------------------------------------
// 県庁所在地巡礼帳 — データ＆ロジック（React Native / Expo 用）
// UIは含みません。画面コンポーネントからこれらをimportして使ってください。
// ---------------------------------------------------------------------------

export const REGIONS = [
  {
    name: "北海道",
    prefs: [{ id: "hokkaido", pref: "北海道", capital: "札幌市", lat: 43.0642, lng: 141.3469, trivia: "市街地は碁盤の目状に区画整理されており、「条・丁目」という住所表記はアメリカ式の都市計画を参考にしたと言われる" }],
  },
  {
    name: "東北",
    prefs: [
      { id: "aomori", pref: "青森県", capital: "青森市", lat: 40.8244, lng: 140.74, trivia: "積雪量が世界の主要都市でもトップクラスとされる、屈指の豪雪都市" },
      { id: "iwate", pref: "岩手県", capital: "盛岡市", lat: 39.7036, lng: 141.1527, trivia: "「わんこそば」発祥の地とされ、給仕が椀に次々そばを継ぎ足すスタイルが名物" },
      { id: "miyagi", pref: "宮城県", capital: "仙台市", lat: 38.2682, lng: 140.8694, trivia: "並木や緑地が多く「杜の都」と呼ばれ、街路樹の本数は政令指定都市でも屈指" },
      { id: "akita", pref: "秋田県", capital: "秋田市", lat: 39.7186, lng: 140.1024, trivia: "東北三大祭りの一つ「竿燈まつり」の舞台。約280本の竿燈が夜空を埋める" },
      { id: "yamagata", pref: "山形県", capital: "山形市", lat: 38.2404, lng: 140.3633, trivia: "山寺（立石寺）など「山」を活かした信仰の地として知られ、市内に寺社が多い" },
      { id: "fukushima", pref: "福島県", capital: "福島市", lat: 37.7608, lng: 140.4747, trivia: "土湯温泉をはじめ多くの温泉地を市域に抱える、東北有数の温泉都市" },
    ],
  },
  {
    name: "関東",
    prefs: [
      { id: "ibaraki", pref: "茨城県", capital: "水戸市", lat: 36.3418, lng: 140.4468, trivia: "水戸黄門こと徳川光圀ゆかりの地で、日本三名園の一つ「偕楽園」がある" },
      { id: "tochigi", pref: "栃木県", capital: "宇都宮市", lat: 36.5658, lng: 139.8836, trivia: "「餃子のまち」として有名で、市民一人当たりの餃子消費量は全国トップクラスを争う" },
      { id: "gunma", pref: "群馬県", capital: "前橋市", lat: 36.3906, lng: 139.0608, trivia: "「かかあ天下と空っ風」で知られ、養蚕・製糸業で栄えた歴史を持つ" },
      { id: "saitama", pref: "埼玉県", capital: "さいたま市", lat: 35.8617, lng: 139.6455, trivia: "2001年に浦和市・大宮市・与野市が合併して誕生した、比較的新しい政令指定都市" },
      { id: "chiba", pref: "千葉県", capital: "千葉市", lat: 35.6073, lng: 140.1063, trivia: "地名の「千葉」は、生い茂る葉が多いことに由来するという説がある" },
      { id: "tokyo", pref: "東京都", capital: "新宿区", lat: 35.6938, lng: 139.7036, trivia: "新宿駅は1日の乗降客数が世界最多としてギネス認定されたことがある" },
      { id: "kanagawa", pref: "神奈川県", capital: "横浜市", lat: 35.4437, lng: 139.638, trivia: "日本初の洋式ガス灯やアイスクリームなど、「発祥の地」の記念碑が数多く点在する" },
    ],
  },
  {
    name: "中部",
    prefs: [
      { id: "niigata", pref: "新潟県", capital: "新潟市", lat: 37.9161, lng: 139.0364, trivia: "日本一長い川・信濃川の河口に位置し、水運とともに発展した港町" },
      { id: "toyama", pref: "富山県", capital: "富山市", lat: 36.6953, lng: 137.2113, trivia: "「反魂丹」に代表される配置薬、いわゆる「富山の薬売り」発祥の地として知られる" },
      { id: "ishikawa", pref: "石川県", capital: "金沢市", lat: 36.5613, lng: 136.6562, trivia: "大きな空襲や災害を免れたため、江戸時代の街並みが今も色濃く残る" },
      { id: "fukui", pref: "福井県", capital: "福井市", lat: 36.0652, lng: 136.2216, trivia: "福井県は恐竜化石の発掘量が日本一で、JR福井駅前には実物大の恐竜モニュメントが動いて出迎える" },
      { id: "yamanashi", pref: "山梨県", capital: "甲府市", lat: 35.6642, lng: 138.5686, trivia: "日本を代表する宝石研磨・貴金属加工（ジュエリー）の一大産地" },
      { id: "nagano", pref: "長野県", capital: "長野市", lat: 36.6513, lng: 138.181, trivia: "善光寺の門前町として発展し、「一生に一度は善光寺参り」と言われるほど参拝者を集めた" },
      { id: "gifu", pref: "岐阜県", capital: "岐阜市", lat: 35.4233, lng: 136.7606, trivia: "「岐阜」の名は織田信長が命名したと伝わり、古代中国の故事にちなむとされる" },
      { id: "shizuoka", pref: "静岡県", capital: "静岡市", lat: 34.9769, lng: 138.3831, trivia: "国内トップクラスの生産量を誇る、日本有数の茶どころ" },
      { id: "aichi", pref: "愛知県", capital: "名古屋市", lat: 35.1815, lng: 136.9066, trivia: "喫茶店文化が独特で、無料の軽食が付く「モーニングサービス」発祥の地とされる" },
    ],
  },
  {
    name: "近畿",
    prefs: [
      { id: "mie", pref: "三重県", capital: "津市", lat: 34.7185, lng: 136.5056, trivia: "「津」の一文字だけの、都道府県庁所在地の中で最も短い地名" },
      { id: "shiga", pref: "滋賀県", capital: "大津市", lat: 35.0045, lng: 135.8686, trivia: "日本最大の湖・琵琶湖のほとりにあり、市域の約6分の1を湖が占める" },
      { id: "kyoto", pref: "京都府", capital: "京都市", lat: 35.0116, lng: 135.7681, trivia: "通りの名前を覚えるための「京の通り名の歌」といったわらべ歌が今も伝わる" },
      { id: "osaka", pref: "大阪府", capital: "大阪市", lat: 34.6937, lng: 135.5023, trivia: "「くいだおれ」の街と呼ばれ、たこ焼きやお好み焼きなど粉もん文化の中心地" },
      { id: "hyogo", pref: "兵庫県", capital: "神戸市", lat: 34.6901, lng: 135.1955, trivia: "日本で最初期の洋菓子店・パン屋が生まれた地とされ、「洋菓子発祥の地」を名乗る" },
      { id: "nara", pref: "奈良県", capital: "奈良市", lat: 34.6851, lng: 135.8048, trivia: "市内に生息する野生の鹿は「国の天然記念物」に指定されている" },
      { id: "wakayama", pref: "和歌山県", capital: "和歌山市", lat: 34.2261, lng: 135.1675, trivia: "和歌山県はみかんの生産量が全国一。市内の和歌山城は徳川御三家の一つ紀州徳川家の居城だった" },
    ],
  },
  {
    name: "中国",
    prefs: [
      { id: "tottori", pref: "鳥取県", capital: "鳥取市", lat: 35.5039, lng: 134.238, trivia: "日本最大級の砂丘「鳥取砂丘」があるが、実は市街地からも比較的近い" },
      { id: "shimane", pref: "島根県", capital: "松江市", lat: 35.4723, lng: 133.0505, trivia: "「水の都」と呼ばれ、堀川めぐりの遊覧船で城下町をぐるりと巡ることができる" },
      { id: "okayama", pref: "岡山県", capital: "岡山市", lat: 34.6551, lng: 133.9195, trivia: "「桃太郎伝説」発祥の地とされ、駅前には桃太郎像が立つ" },
      { id: "hiroshima", pref: "広島県", capital: "広島市", lat: 34.3853, lng: 132.4553, trivia: "路面電車の保有車両数・運行規模は日本最大級" },
      { id: "yamaguchi", pref: "山口県", capital: "山口市", lat: 34.1859, lng: 131.4706, trivia: "大内氏の時代に京の文化が移植され、「西の京都」と呼ばれた歴史を持つ" },
    ],
  },
  {
    name: "四国",
    prefs: [
      { id: "tokushima", pref: "徳島県", capital: "徳島市", lat: 34.0658, lng: 134.5593, trivia: "「阿波おどり」の本場で、毎年お盆には100万人規模の観光客が訪れる" },
      { id: "kagawa", pref: "香川県", capital: "高松市", lat: 34.3401, lng: 134.0434, trivia: "うどん店の数が人口比で日本一とも言われる「うどん県」の県庁所在地" },
      { id: "ehime", pref: "愛媛県", capital: "松山市", lat: 33.8392, lng: 132.7657, trivia: "小説「坊っちゃん」の舞台として知られ、日本最古とされる道後温泉がある" },
      { id: "kochi", pref: "高知県", capital: "高知市", lat: 33.5597, lng: 133.5311, trivia: "幕末の志士・坂本龍馬の出身地で、街には龍馬ゆかりのスポットが多い" },
    ],
  },
  {
    name: "九州",
    prefs: [
      { id: "fukuoka", pref: "福岡県", capital: "福岡市", lat: 33.5904, lng: 130.4017, trivia: "屋台の数が日本一多い都市として知られる" },
      { id: "saga", pref: "佐賀県", capital: "佐賀市", lat: 33.2494, lng: 130.2988, trivia: "アジア最大級の熱気球大会「バルーンフェスタ」が毎年開催される" },
      { id: "nagasaki", pref: "長崎県", capital: "長崎市", lat: 32.7503, lng: 129.8779, trivia: "江戸時代、幕府がヨーロッパとの交易を認めた唯一の窓口「出島」が置かれた" },
      { id: "kumamoto", pref: "熊本県", capital: "熊本市", lat: 32.7898, lng: 130.7417, trivia: "熊本城は日本三名城の一つに数えられる名城" },
      { id: "oita", pref: "大分県", capital: "大分市", lat: 33.2382, lng: 131.6126, trivia: "温泉の源泉数・湧出量が日本一とされる「おんせん県」の県庁所在地" },
      { id: "miyazaki", pref: "宮崎県", capital: "宮崎市", lat: 31.9077, lng: 131.4202, trivia: "南国ムード漂う気候で、フェニックス（ヤシ）の並木道が街のシンボル" },
      { id: "kagoshima", pref: "鹿児島県", capital: "鹿児島市", lat: 31.5602, lng: 130.5581, trivia: "活火山・桜島がすぐ目の前にあり、日常的に「灰」が降る珍しい都市" },
    ],
  },
  {
    name: "沖縄",
    prefs: [{ id: "okinawa", pref: "沖縄県", capital: "那覇市", lat: 26.2124, lng: 127.6809, trivia: "都道府県庁所在地の中でも屈指の人口密度を誇り、独自の琉球文化が色濃く残る" }],
  },
];


export const ALL_PREFS = REGIONS.flatMap((r) => r.prefs.map((p) => ({ ...p, region: r.name })));
export const TOTAL = ALL_PREFS.length;

// Same shape as REGIONS, but every pref already carries its `region` name.
// The card list used to build these objects inline with `{...p, region}` on
// every render, which handed all 47 cards a brand-new prop object each time
// and made memoising them impossible. Computed once here instead.
export const REGIONS_WITH_PREFS = REGIONS.map((r) => ({
  name: r.name,
  prefs: r.prefs.map((p) => ({ ...p, region: r.name })),
}));
export const REROLL_LIMIT = 3;
// Distance is measured against LOCATION_TARGETS below — the landmark the
// mission actually names — not the city's center point. That was the fix for
// legitimate visits being rejected (岐阜公園 sat 1.45km off center, 大宮公園
// 5.39km). 1km is a deliberate choice, for a tighter "you actually went
// there" feel, and it only holds up because the target coordinate is the
// landmark itself. Any mission text change must be matched in LOCATION_TARGETS.
export const LOCATION_RADIUS_KM = 1;

export const RANKS = [
  { min: 0, label: "旅支度中", sub: "まずは第一歩から" },
  { min: 1, label: "駆け出し旅人", sub: "スタンプ帳、開封" },
  { min: 5, label: "見習い巡礼者", sub: "旅の勘がつかめてきた" },
  { min: 10, label: "街道の常連", sub: "二桁到達、快調" },
  { min: 20, label: "地方制覇の兆し", sub: "折り返し目前" },
  { min: 24, label: "半国踏破", sub: "日本の半分を歩いた" },
  { min: 35, label: "熟練の旅人", sub: "あと一息" },
  { min: 47, label: "全国制覇", sub: "県庁所在地、完全踏破" },
];


export function rankFor(count) {
  let r = RANKS[0];
  for (const rk of RANKS) if (count >= rk.min) r = rk;
  return r;
}


export function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

// Typing a date on a phone keyboard is miserable, so the visit-date field
// formats itself: digits go in, hyphens appear on their own. Stored values stay
// plain "YYYY-MM-DD" strings exactly as before, so records written by older
// builds keep working — this only guards what gets written from now on.
//
// These live here, next to todayStr, rather than in App.js because they are
// pure string logic with no React in them, which is what lets `npm run check`
// test them. That matters: a mangled backslash once turned the pattern below
// into /^d{4}-d{2}-d{2}$/, which matches no real date at all, and quietly made
// the 「スタンプを押す」 button impossible to enable.
export function formatDateInput(text) {
  const d = String(text).replace(/[^0-9]/g, "").slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return d.slice(0, 4) + "-" + d.slice(4);
  return d.slice(0, 4) + "-" + d.slice(4, 6) + "-" + d.slice(6);
}

// Not just the shape — 2026-02-31 matches the pattern but is not a real day.
export function isValidDate(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [y, m, d] = text.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}


const EAT_MISSIONS = [
  "ご当地グルメを1品食べる",
  "地元のラーメン屋でラーメンを食べる",
  "名物スイーツを味わう",
  "地元の定食屋でランチを食べる",
  "市場や屋台で何かひとつ食べる",
  "ご当地の日本酒・地サイダーなど飲み物を試す",
];
const PHOTO_MISSIONS = [
  "お城または史跡の写真を撮る",
  "ご当地キャラクターを探して撮影する",
  "駅前のシンボルを撮影する",
  "地元の商店街を1枚撮る",
  "夕焼け・夜景を1枚撮る",
  "海・山・川などその土地らしい風景を撮る",
];
const LOCATION_MISSIONS = [
  (capital) => `${capital}エリアまで実際に足を運ぶ`,
  (capital) => `${capital}の中心部（駅・繁華街）に到達する`,
  (capital) => `現在地から${capital}周辺にいることを確認する`,
];


// 「現地に行く」ミッションの目的地座標。
//
// 判定にはこちらを使う。以前は市の中心点（pref.lat/lng）と比べていたため、
// ミッションが名指しするランドマークに立っていても達成できなかった
// （例：岐阜公園で 1.45km、大宮公園で 5.39km 離れていた）。
//
// 座標は OpenStreetMap(Nominatim) から1件ずつ取得し、
// 市の中心から妥当な距離（8km以内）に収まることを検算して採用している。
// ミッション文を書き換えるときは、ここの座標も必ず合わせて見直すこと。
export const LOCATION_TARGETS = {
  hokkaido: { lat: 43.0599, lng: 141.34751 },  // 大通公園
  aomori: { lat: 40.82957, lng: 140.73595 },  // 青森ねぶたの家ワ・ラッセ
  iwate: { lat: 39.70159, lng: 141.14995 },  // 盛岡城跡公園
  miyagi: { lat: 38.2618, lng: 140.90355 },  // 仙台城跡（青葉城址）
  akita: { lat: 39.72155, lng: 140.12354 },  // 千秋公園
  yamagata: { lat: 38.25558, lng: 140.32824 },  // 霞城公園
  fukushima: { lat: 37.75557, lng: 140.46877 },  // 福島稲荷神社
  ibaraki: { lat: 36.37514, lng: 140.45354 },  // 偕楽園
  tochigi: { lat: 36.5593, lng: 139.89816 },  // 宇都宮駅前
  gunma: { lat: 36.395, lng: 139.06071 },  // 前橋公園
  saitama: { lat: 35.91903, lng: 139.63181 },  // 大宮公園
  chiba: { lat: 35.60042, lng: 140.09786 },  // 千葉ポートタワー
  tokyo: { lat: 35.68507, lng: 139.70955 },  // 新宿御苑
  kanagawa: { lat: 35.4524, lng: 139.64292 },  // 横浜赤レンガ倉庫
  niigata: { lat: 37.91957, lng: 139.05313 },  // 萬代橋
  toyama: { lat: 36.6932, lng: 137.21083 },  // 富山城址公園
  ishikawa: { lat: 36.56243, lng: 136.66235 },  // 兼六園
  fukui: { lat: 36.06019, lng: 136.22993 },  // 福井城址
  yamanashi: { lat: 35.66512, lng: 138.57133 },  // 舞鶴城公園
  nagano: { lat: 36.66142, lng: 138.18766 },  // 善光寺
  gifu: { lat: 35.43477, lng: 136.77461 },  // 岐阜公園
  shizuoka: { lat: 34.97928, lng: 138.38298 },  // 駿府城公園
  aichi: { lat: 35.1844, lng: 136.9001 },  // 名古屋城
  mie: { lat: 34.71811, lng: 136.50666 },  // 津城跡
  shiga: { lat: 34.98929, lng: 135.89623 },  // 琵琶湖岸
  kyoto: { lat: 34.9943, lng: 135.78444 },  // 清水寺
  osaka: { lat: 34.66903, lng: 135.50157 },  // 道頓堀
  hyogo: { lat: 34.67851, lng: 135.18031 },  // 神戸ハーバーランド
  nara: { lat: 34.6829, lng: 135.8546 },  // 奈良公園
  wakayama: { lat: 34.22765, lng: 135.17151 },  // 和歌山城
  tottori: { lat: 35.5413, lng: 134.22773 },  // 鳥取砂丘
  shimane: { lat: 35.47514, lng: 133.05076 },  // 松江城
  okayama: { lat: 34.66633, lng: 133.93739 },  // 後楽園
  hiroshima: { lat: 34.39317, lng: 132.4523 },  // 平和記念公園
  yamaguchi: { lat: 34.19018, lng: 131.47292 },  // 瑠璃光寺五重塔
  tokushima: { lat: 34.06086, lng: 134.5164 },  // 眉山山頂
  kagawa: { lat: 34.3295, lng: 134.04393 },  // 栗林公園
  ehime: { lat: 33.85206, lng: 132.7864 },  // 道後温泉本館
  kochi: { lat: 33.56069, lng: 133.53146 },  // 高知城
  fukuoka: { lat: 33.59348, lng: 130.40562 },  // 中洲屋台
  saga: { lat: 33.2452, lng: 130.29677 },  // 佐賀城公園
  nagasaki: { lat: 32.74342, lng: 129.87296 },  // 出島
  kumamoto: { lat: 32.80527, lng: 130.70546 },  // 熊本城
  oita: { lat: 33.24006, lng: 131.61123 },  // 府内城跡
  miyazaki: { lat: 31.93843, lng: 131.43054 },  // 宮崎神宮
  kagoshima: { lat: 31.59653, lng: 130.5628 },  // 桜島フェリーターミナル
  okinawa: { lat: 26.21691, lng: 127.69011 },  // 国際通り
};

export const MISSION_META = {
  eat: { label: "食べる", color: "#BD3B28" },
  photo: { label: "撮る", color: "#223A5E" },
  location: { label: "現地に行く", color: "#B8923F" },
};

const PREF_MISSIONS = {
  hokkaido: { eat: ["名物「スープカレー」を専門店で食べる", "「ジンギスカン」を味わう", "二条市場で新鮮な海鮮丼を食べる"], photo: ["時計台の写真を撮る", "ご当地キャラ「テレビ父さん」を撮る（像・パネル・グッズなど何でも可）", "狸小路商店街のアーケードを撮る"], location: ["大通公園まで実際に足を運ぶ"] },
  aomori: { eat: ["「味噌カレー牛乳ラーメン」を食べる", "青森名物「せんべい汁」を味わう", "古川市場の「のっけ丼」を自分で作って食べる"], photo: ["ねぶたのモニュメントを撮影する", "青森ベイブリッジを1枚撮る", "青森県観光物産館アスパム（三角形のビル）を撮る"], location: ["青森ねぶたの家ワ・ラッセ周辺まで足を運ぶ"] },
  iwate: { eat: ["盛岡のソウルフード「福田パン」を食べる", "「盛岡冷麺」を食べる", "「じゃじゃ麺」を食べる"], photo: ["岩手公園（盛岡城跡）の石垣を撮る", "石割桜を撮影する", "開運橋から盛岡駅方面を撮る"], location: ["盛岡城跡公園まで実際に足を運ぶ"] },
  miyagi: { eat: ["名物「牛タン定食」を食べる", "「ずんだ餅」を味わう", "仙台のご当地グルメ「マーボー焼きそば」を食べる"], photo: ["伊達政宗騎馬像を撮影する", "ご当地キャラ「むすび丸」を撮る（像・パネル・グッズなど何でも可）", "定禅寺通のケヤキ並木を撮る"], location: ["仙台城跡（青葉城址）まで実際に足を運ぶ"] },
  akita: { eat: ["名物「きりたんぽ鍋」を食べる", "「稲庭うどん」を味わう", "「秋田比内地鶏」料理を食べる"], photo: ["久保田城跡（千秋公園）を撮影する", "赤れんが郷土館（旧秋田銀行本店本館）を撮る", "秋田市文化創造館の外観を撮る"], location: ["千秋公園まで実際に足を運ぶ"] },
  yamagata: { eat: ["「玉こんにゃく」を屋台で食べる", "名物「冷やしラーメン」を食べる", "「どんどん焼き」を食べる"], photo: ["霞城公園（山形城跡）を撮影する", "文翔館（旧県庁舎）を撮る", "旧済生館本館（山形市郷土館）を撮る"], location: ["霞城公園まで実際に足を運ぶ"] },
  fukushima: { eat: ["「ソースカツ丼」を食べる", "「円盤餃子」を味わう", "「いか人参」を食べる"], photo: ["福島稲荷神社を撮影する", "信夫山からの景色を撮る", "福島駅東口の古関裕而モニュメントを撮る"], location: ["福島稲荷神社まで実際に足を運ぶ"] },
  ibaraki: { eat: ["「常陸秋そば」のそばを食べる", "水戸名物「そぼろ納豆」を味わう", "銘菓「水戸の梅」を食べる"], photo: ["偕楽園の好文亭を撮影する", "水戸黄門像（水戸駅前）を撮る", "弘道館を撮る"], location: ["偕楽園まで実際に足を運ぶ"] },
  tochigi: { eat: ["名物「宇都宮餃子」を食べる", "「レモン牛乳」を飲む", "宇都宮の老舗ジャズ喫茶や飲食店街に立ち寄る"], photo: ["餃子像（宇都宮駅前）を撮影する", "大谷資料館・大谷観音を撮る", "カトリック松が峰教会を撮る"], location: ["宇都宮駅前まで実際に足を運ぶ"] },
  gunma: { eat: ["群馬のソウルフード「登利平の鳥めし」を食べる", "名物「焼きまんじゅう」を味わう", "「ひもかわうどん」を食べる"], photo: ["前橋公園・前橋城跡を撮影する", "ご当地キャラ「ぐんまちゃん」を撮る（像・パネル・グッズなど何でも可）", "群馬県庁32階展望ホールから街を撮る"], location: ["前橋公園まで実際に足を運ぶ"] },
  saitama: { eat: ["ご当地グルメ「大宮ナポリタン」を食べる", "「十万石まんじゅう」を味わう", "「浦和餃子」を食べる"], photo: ["さいたまスーパーアリーナを撮影する", "大宮盆栽美術館周辺を撮る", "氷川参道のケヤキ並木を撮る"], location: ["大宮公園まで実際に足を運ぶ"] },
  chiba: { eat: ["「勝浦タンタンメン」を食べる", "落花生を使ったご当地グルメを味わう", "「なめろう」料理を食べる"], photo: ["千葉ポートタワーを撮影する", "加曽利貝塚を撮る", "千葉神社を撮る"], location: ["千葉ポートタワー周辺まで実際に足を運ぶ"] },
  tokyo: { eat: ["新宿・思い出横丁でご当地グルメを食べる", "都庁近くの名店で「つけ麺」を食べる", "新宿の老舗喫茶店でコーヒーを飲む"], photo: ["東京都庁舎の展望室から1枚撮る", "新宿駅東口の巨大猫看板を撮影する", "花園神社の鳥居を撮る"], location: ["新宿御苑まで実際に足を運ぶ"] },
  kanagawa: { eat: ["横浜中華街で好きな中華料理を食べる", "「サンマー麺」を味わう", "野毛で横浜家系ラーメンを食べる"], photo: ["横浜赤レンガ倉庫を撮影する", "横浜ランドマークタワーを撮る", "みなとみらいの観覧車コスモクロック21を撮る"], location: ["横浜赤レンガ倉庫まで実際に足を運ぶ"] },
  niigata: { eat: ["「へぎそば」を食べる", "「タレかつ丼」を味わう", "新潟名物「イタリアン（焼きそば＋ミートソース）」を食べる"], photo: ["朱鷺メッセ展望台からの景色を撮影する", "萬代橋を撮る", "新潟市歴史博物館みなとぴあを撮る"], location: ["萬代橋周辺まで実際に足を運ぶ"] },
  toyama: { eat: ["「富山ブラックラーメン」を食べる", "「ますの寿司」を味わう", "白えび料理を食べる"], photo: ["富山城址公園を撮影する", "富山市役所展望塔（入場無料）から市街地を撮る", "富岩運河環水公園を撮る"], location: ["富山城址公園まで実際に足を運ぶ"] },
  ishikawa: { eat: ["「金沢おでん」を食べる", "近江町市場で海鮮丼を味わう", "金沢の郷土料理「治部煮」を食べる"], photo: ["兼六園を撮影する", "金沢21世紀美術館「スイミング・プール」を撮る", "ひがし茶屋街の格子戸を撮る"], location: ["兼六園まで実際に足を運ぶ"] },
  fukui: { eat: ["「ソースかつ丼」を食べる", "「越前おろしそば」を味わう", "「羽二重餅」を食べる"], photo: ["福井城址（山里口御門）を撮影する", "恐竜モニュメント（JR福井駅前）を撮る", "養浩館庭園を撮る"], location: ["福井城址まで実際に足を運ぶ"] },
  yamanashi: { eat: ["名物「ほうとう」を食べる", "甲州名物「鳥もつ煮」を味わう", "甲州ワインを飲む"], photo: ["甲府城跡（舞鶴城公園）を撮影する", "武田信玄公銅像を撮る", "山梨県立美術館周辺を撮る"], location: ["舞鶴城公園まで実際に足を運ぶ"] },
  nagano: { eat: ["善光寺門前で「そば」を食べる", "「おやき」を味わう", "「みそすき丼」を食べる"], photo: ["善光寺本堂を撮影する", "仁王門を撮る", "ご当地キャラ「アルクマ」を撮る（像・パネル・グッズなど何でも可）"], location: ["善光寺まで実際に足を運ぶ"] },
  gifu: { eat: ["「鶏ちゃん（けいちゃん）」を食べる", "「奥美濃カレー」を味わう", "「岐阜タンメン」を食べる"], photo: ["金華山の岐阜城を撮影する（麓からでも可）", "長良川の河畔から岐阜市街を撮る", "川原町の古い町並みを撮る"], location: ["岐阜公園まで実際に足を運ぶ"] },
  shizuoka: { eat: ["「静岡おでん」を食べる", "「桜えびのかき揚げ」を味わう", "「安倍川もち」を食べる"], photo: ["駿府城公園を撮影する", "静岡浅間神社を撮る", "登呂遺跡を撮る"], location: ["駿府城公園まで実際に足を運ぶ"] },
  aichi: { eat: ["「味噌カツ」を食べる", "モーニングサービス付きの喫茶店で朝食を食べる", "名古屋めし「あんかけスパゲッティ」を食べる"], photo: ["名古屋城の金鯱を撮影する", "オアシス21を撮る", "大須商店街を撮る"], location: ["名古屋城まで実際に足を運ぶ"] },
  mie: { eat: ["「津ぎょうざ」を食べる", "津発祥の「天むす」（えび天のおにぎり）を食べる", "「伊勢うどん」を食べる"], photo: ["津城跡を撮影する", "高山神社を撮る", "津偕楽公園を撮る"], location: ["津城跡まで実際に足を運ぶ"] },
  shiga: { eat: ["大津名物「三井寺力餅」を食べる", "近江牛コロッケなど手頃な近江牛グルメを食べる", "湖魚の佃煮を食べる"], photo: ["琵琶湖畔から近江大橋を撮影する", "三井寺（園城寺）を撮る", "びわ湖大津館を撮る"], location: ["琵琶湖岸まで実際に足を運ぶ"] },
  kyoto: { eat: ["「にしんそば」を食べる", "抹茶スイーツを味わう", "錦市場で食べ歩きをする"], photo: ["清水寺の舞台を撮影する", "伏見稲荷大社の千本鳥居を撮る", "祇園・花見小路を撮る"], location: ["清水寺まで実際に足を運ぶ"] },
  osaka: { eat: ["「たこ焼き」を食べる", "「お好み焼き」を味わう", "新世界で串カツを食べる"], photo: ["道頓堀のグリコサインを撮影する", "大阪城天守閣を撮る", "通天閣を撮る"], location: ["道頓堀まで実際に足を運ぶ"] },
  hyogo: { eat: ["神戸牛コロッケなど手頃な神戸牛グルメを食べる", "南京町（中華街）で点心を味わう", "「そばめし」を食べる"], photo: ["神戸ポートタワーを撮影する", "北野異人館街を撮る", "メリケンパークのBE KOBEモニュメントを撮る"], location: ["神戸ハーバーランドまで実際に足を運ぶ"] },
  nara: { eat: ["「柿の葉寿司」を食べる", "奈良名物「茶粥」を味わう", "奈良漬けを使った料理を食べる"], photo: ["東大寺大仏殿を撮影する", "奈良公園の鹿を撮る", "ご当地キャラ「せんとくん」を撮る（像・パネル・グッズなど何でも可）"], location: ["奈良公園まで実際に足を運ぶ"] },
  wakayama: { eat: ["「和歌山ラーメン」を食べる", "早寿司（早ずし）を味わう", "めはり寿司を食べる"], photo: ["和歌山城を撮影する", "紀の川の風景を1枚撮る", "和歌浦の景色を撮る"], location: ["和歌山城まで実際に足を運ぶ"] },
  tottori: { eat: ["「鳥取牛骨ラーメン」を食べる", "鳥取港の海鮮丼を食べる", "「とうふちくわ」を食べる"], photo: ["鳥取砂丘で砂の造形を撮影する", "仁風閣を撮る", "白兎神社を撮る"], location: ["鳥取砂丘まで実際に足を運ぶ"] },
  shimane: { eat: ["「出雲そば」を食べる", "宍道湖のしじみ汁を味わう", "「どじょう掬い饅頭」を食べる"], photo: ["松江城天守を撮影する", "堀川めぐりの遊覧船を撮る", "ご当地キャラ「しまねっこ」を撮る（像・パネル・グッズなど何でも可）"], location: ["松江城まで実際に足を運ぶ"] },
  okayama: { eat: ["「岡山ばらずし」を食べる", "「デミカツ丼」を味わう", "きびだんごを食べる"], photo: ["岡山城（烏城）を撮影する", "後楽園の庭園を撮る", "岡山県立美術館周辺を撮る"], location: ["後楽園まで実際に足を運ぶ"] },
  hiroshima: { eat: ["「広島風お好み焼き」を食べる", "牡蠣料理を食べる（通年提供の店が多い）", "広島つけ麺を食べる"], photo: ["原爆ドームを撮影する", "路面電車を1枚撮る", "本通商店街を撮る"], location: ["平和記念公園まで実際に足を運ぶ"] },
  yamaguchi: { eat: ["「瓦そば」を食べる", "山口の郷土料理「けんちょう」を食べる", "山口名物のういろうを食べる"], photo: ["瑠璃光寺五重塔を撮影する", "山口サビエル記念聖堂を撮る", "常栄寺雪舟庭を撮る"], location: ["瑠璃光寺五重塔まで実際に足を運ぶ"] },
  tokushima: { eat: ["「徳島ラーメン」を食べる", "「阿波尾鶏」料理を味わう", "たらいうどんを食べる"], photo: ["眉山ロープウェイからの景色を撮影する", "阿波おどり会館のからくり時計を撮る", "徳島中央公園（徳島城跡）を撮る"], location: ["眉山山頂まで実際に足を運ぶ"] },
  kagawa: { eat: ["名物「讃岐うどん」を食べる", "骨付き鳥を味わう", "香川の郷土料理「しょうゆ豆」を食べる"], photo: ["栗林公園を撮影する", "高松城跡（玉藻公園）を撮る", "サンポート高松のシンボルタワーを撮る"], location: ["栗林公園まで実際に足を運ぶ"] },
  ehime: { eat: ["「鯛めし」を食べる", "「じゃこ天」を味わう", "郷土菓子「タルト」を食べる"], photo: ["松山城天守を撮影する", "道後温泉本館を撮る", "ご当地キャラ「みきゃん」を撮る（像・パネル・グッズなど何でも可）"], location: ["道後温泉本館まで実際に足を運ぶ"] },
  kochi: { eat: ["「カツオのたたき」を食べる", "高知の「田舎寿司」を食べる", "ひろめ市場で食べ歩きをする"], photo: ["高知城を撮影する", "はりまや橋を撮る", "桂浜の坂本龍馬像を撮る"], location: ["高知城まで実際に足を運ぶ"] },
  fukuoka: { eat: ["屋台で「豚骨ラーメン」を食べる", "「もつ鍋」を味わう", "明太子を使った料理を食べる"], photo: ["福岡タワーを撮影する", "中洲の屋台街の夜景を撮る", "キャナルシティ博多の噴水ショーを撮る"], location: ["中洲屋台エリアまで実際に足を運ぶ"] },
  saga: { eat: ["佐賀の銘菓「丸ぼうろ」を食べる", "「シシリアンライス」を味わう", "呉服元町商店街で食べ歩きをする"], photo: ["佐賀城本丸歴史館を撮影する", "佐賀バルーンミュージアムを撮る", "徴古館を撮る"], location: ["佐賀城公園まで実際に足を運ぶ"] },
  nagasaki: { eat: ["「長崎ちゃんぽん」を食べる", "「皿うどん」を味わう", "カステラを食べる"], photo: ["出島を撮影する", "グラバー園から港を1枚撮る", "眼鏡橋を撮る"], location: ["出島まで実際に足を運ぶ"] },
  kumamoto: { eat: ["「熊本ラーメン」を食べる", "馬刺しを味わう", "「太平燕（タイピーエン）」を食べる"], photo: ["熊本城天守を撮影する", "水前寺成趣園を撮る", "ご当地キャラ「くまモン」を撮る（像・パネル・グッズなど何でも可）"], location: ["熊本城まで実際に足を運ぶ"] },
  oita: { eat: ["「とり天」を食べる", "「だんご汁」を味わう", "「りゅうきゅう」を食べる"], photo: ["大分県立美術館（OPAM）を撮影する", "府内城跡を撮る", "大分いこいの道商店街を撮る"], location: ["府内城跡まで実際に足を運ぶ"] },
  miyazaki: { eat: ["「チキン南蛮」を食べる", "「冷や汁」を味わう", "マンゴーを使ったスイーツを食べる"], photo: ["宮崎神宮を撮影する", "フェニックス並木を1枚撮る", "宮崎県庁本館の洋風建築を撮る"], location: ["宮崎神宮まで実際に足を運ぶ"] },
  kagoshima: { eat: ["「黒豚料理」を食べる", "「鹿児島ラーメン」を味わう", "「白熊（かき氷）」を食べる"], photo: ["桜島を撮影する", "西郷隆盛像を撮る", "天文館アーケードを撮る"], location: ["桜島フェリーターミナル周辺まで実際に足を運ぶ"] },
  okinawa: { eat: ["「沖縄そば」を食べる", "「タコライス」を味わう", "ちんすこうを食べる"], photo: ["首里城・守礼門を撮影する", "国際通りを1枚撮る", "壺屋やちむん通りを撮る"], location: ["国際通りまで実際に足を運ぶ"] },
};

// Every prefecture has a hand-picked, specific mission set above (real dish
// names, real landmarks). The generic pools just below are a safety-net
// fallback in case a prefecture is ever missing from that table.
// A mission's identity is this id, never its text. Records store the id, so
// the wording can be improved later without silently un-completing anything
// somebody already did.
//
// The id is derived from the mission's SLOT: prefecture, type, and position in
// the array. That makes the rule for editing PREF_MISSIONS simple but strict:
//
//   OK  — rewrite the text of an entry in place (same slot, same id)
//   OK  — append a new entry to the end of a type's array (fresh id)
//   NO  — reorder entries, or delete one from the middle
//
// Reordering silently reassigns ids and would move people's completions onto
// missions they never did. To retire a mission, overwrite it in place instead.
// audit の "ID の安定性" チェックが、この約束が破られていないかを見張っている。
export function missionIdFor(prefId, type, index) {
  return prefId + ":" + type + ":" + index;
}

export function allMissionsForPref(pref) {
  const specific = PREF_MISSIONS[pref.id];
  const eatPool = specific?.eat?.length ? specific.eat : EAT_MISSIONS;
  const photoPool = specific?.photo?.length ? specific.photo : PHOTO_MISSIONS;
  const locationPool = specific?.location?.length
    ? specific.location
    : LOCATION_MISSIONS.map((fn) => fn(pref.capital));
  const tag = (type, pool) =>
    pool.map((text, i) => ({ id: missionIdFor(pref.id, type, i), type, text }));
  return [
    ...tag("eat", eatPool),
    ...tag("photo", photoPool),
    ...tag("location", locationPool),
  ];
}

export function rollMission(pref, excludeIds = []) {
  const full = allMissionsForPref(pref);
  const pool = excludeIds.length ? full.filter((m) => !excludeIds.includes(m.id)) : full;
  const usable = pool.length ? pool : full; // never return an empty pool
  return usable[Math.floor(Math.random() * usable.length)];
}

// Look a mission up by id. Returns undefined for an id that no longer exists,
// which is why callers keep the stored text around as a display fallback.
export function missionById(prefId, id) {
  const pref = ALL_PREFS.find((p) => p.id === prefId);
  if (!pref) return undefined;
  return allMissionsForPref(pref).find((m) => m.id === id);
}

// ---------------------------------------------------------------------------
// City completion rank — how many of a prefecture's ~7 missions the person
// has personally completed there (not just the one that earned the stamp).
// ---------------------------------------------------------------------------
export const CITY_RANK_TIERS = [
  { min: 0, label: "スタンプのみ", color: "#5C544A" },
  { min: 3, label: "シルバー踏破", color: "#8C93A6" },
  { min: 5, label: "ゴールド踏破", color: "#B8923F" },
  { min: 7, label: "プラチナ踏破（完全制覇）", color: "#BD3B28" },
];

export function cityRankFor(doneCount) {
  let r = CITY_RANK_TIERS[0];
  for (const tier of CITY_RANK_TIERS) if (doneCount >= tier.min) r = tier;
  return r;
}

// Missions whose wording changed while records still keyed off the text.
// Only true rewordings belong here — the same errand, described better. A
// mission that was swapped for a *different* errand must NOT be aliased, or
// people get credited for something they never did.
const LEGACY_MISSION_ALIASES = {
  // ご当地キャラ8件: 売店・県庁への限定を外しただけで、やることは同じ
  "さっぽろテレビ塔のご当地キャラ「テレビ父さん」のパネルやグッズを撮る": "hokkaido:photo:1",
  "宮城県庁1階でご当地キャラ「むすび丸」のグッズを撮る": "miyagi:photo:1",
  "群馬県庁の県民センターでご当地キャラ「ぐんまちゃん」のグッズを撮る": "gunma:photo:1",
  "長野駅ビルMIDORIのご当地キャラ「アルクマ」と写真を撮る": "nagano:photo:2",
  "奈良県庁前のご当地キャラ「せんとくん」立像を撮る": "nara:photo:2",
  "島根県物産観光館でご当地キャラ「しまねっこ」のグッズを撮る": "shimane:photo:2",
  "松山城本丸広場の売店でご当地キャラ「みきゃん」のグッズを撮る": "ehime:photo:2",
  // くまモンは3回言い換えているので、途中の形も拾う
  "くまモンスクエアでくまモンを探して撮る": "kumamoto:photo:2",
  "くまモンスクエアのくまモン装飾を撮る": "kumamoto:photo:2",
  "くまモンスクエアでご当地キャラ「くまモン」の装飾を撮る": "kumamoto:photo:2",
  // 対象そのものは変えず、条件の書き方だけ直したもの
  "牡蠣料理を味わう（旬季）": "hiroshima:eat:1",
  "岐阜城（金華山山頂）の写真を撮る": "gifu:photo:0",
  "富山市役所展望塔から立山連峰を撮る": "toyama:photo:1",
};

// Text -> id for every mission currently in the table. Built once; used only
// to migrate records saved before ids existed.
const TEXT_TO_ID = (() => {
  const map = {};
  for (const pref of ALL_PREFS) {
    for (const m of allMissionsForPref(pref)) map[m.text] = m.id;
  }
  return map;
})();

function idForLegacyText(text, prefId) {
  const id = TEXT_TO_ID[text] || LEGACY_MISSION_ALIASES[text] || null;
  if (!id) return null;
  // A record can only ever have completed missions belonging to its own city.
  // Anything else is a text collision, and crediting it would attach one
  // city's record to another city's mission.
  if (prefId && !id.startsWith(prefId + ":")) return null;
  return id;
}

// The completed mission ids on a record, migrating older text-keyed records on
// the way through. A text that matches nothing is dropped rather than guessed
// at: it means that mission was replaced by a different one, and the person
// never did the new one.
// `prefId` scopes the lookup to the city the record belongs to. Mission texts
// are unique across the whole table today, so an unscoped lookup happens to
// land on the right city — but nothing enforces that, and a text that ever
// appeared in two cities would migrate a record onto another city's mission.
// Passing the owner in makes the wrong answer impossible rather than unlikely.
export function completedIdsFor(record, prefId) {
  if (!record) return [];
  if (record.completedMissionIds?.length) return record.completedMissionIds;
  const texts = record.completedMissionTexts?.length
    ? record.completedMissionTexts
    : record.mission?.text
      ? [record.mission.text]
      : [];
  return texts.map((t) => idForLegacyText(t, prefId)).filter(Boolean);
}

// One stored record, brought up to the id-based shape. Returns the same object
// when nothing needs changing so React can keep bailing out of re-renders.
export function migrateStampRecord(record, prefId) {
  if (!record || record.completedMissionIds) return record;
  const next = { ...record, completedMissionIds: completedIdsFor(record, prefId) };
  if (next.mission && !next.mission.id) {
    const id = idForLegacyText(next.mission.text, prefId);
    next.mission = id ? { ...next.mission, id } : next.mission;
  }
  // missionPhotos was keyed by mission text too.
  if (record.missionPhotos) {
    const rekeyed = {};
    for (const [text, uri] of Object.entries(record.missionPhotos)) {
      const id = idForLegacyText(text, prefId);
      if (id) rekeyed[id] = uri;
    }
    next.missionPhotos = rekeyed;
  }
  delete next.completedMissionTexts;
  return next;
}

// ---------------------------------------------------------------------------
// Cross-prefecture collection categories — classified from mission text by
// keyword so the ~330 mission strings don't need hand-tagging one by one.
// ---------------------------------------------------------------------------
// NOTE: keywords are matched with plain substring search, so short/common
// fragments cause false positives. Anything added here must be specific enough
// that it cannot appear inside an unrelated word — e.g. bare "宮" also matches
// 宇都宮 and 大宮, and bare "モン" also matches レモン牛乳.
// Each rule carries the icon and the one-line "what am I collecting" hint the
// collection list shows. Without them the list was nine lines of grey text —
// a count with no way to tell what it wanted or which cities it meant.
export const COLLECTION_RULES = [
  // mascot is checked first, and deliberately so. Its missions name the place
  // the character lives (さっぽろテレビ塔, 松山城本丸広場, 奈良県庁前), and those
  // words would otherwise be swallowed by the tower / castle / park rules below.
  // Each of those collections still keeps the city via one of its other missions.
  { cat: "mascot", label: "ご当地キャラ制覇", icon: "cat", hint: "8地方に1体ずつ。像でもパネルでもグッズでも可", keywords: ["ご当地キャラ", "キャラクター", "マスコット", "ゆるキャラ", "くまモン", "テレビ父さん", "むすび丸", "ぐんまちゃん", "アルクマ", "せんとくん", "しまねっこ", "みきゃん"] },
  { cat: "noodle", label: "麺類制覇", icon: "soup", hint: "ラーメン・そば・うどんなどご当地の麺を食べる", keywords: ["麺", "そば", "うどん", "ちゃんぽん"] },
  { cat: "seafood", label: "海鮮制覇", icon: "fish", hint: "海鮮丼や地魚など、その土地の海の幸を食べる", keywords: ["海鮮", "カニ", "かに", "のどぐろ", "しじみ", "牡蠣", "鯛", "いか", "えび", "海の幸", "カツオ", "ふぐ", "うなぎ", "馬刺し"] },
  { cat: "sweets", label: "スイーツ制覇", icon: "cake", hint: "餅・饅頭・カステラなどご当地の甘味を食べる", keywords: ["スイーツ", "餅", "饅頭", "まんじゅう", "カステラ", "ちんすこう", "タルト", "かき氷", "白熊", "ういろう", "きびだんご"] },
  { cat: "market", label: "市場・横丁制覇", icon: "store", hint: "市場・商店街・屋台など、人の集まる場所を訪ねる", keywords: ["市場", "商店街", "横丁", "アーケード", "屋台"] },
  { cat: "castle", label: "城めぐり制覇", icon: "castle", hint: "天守や城跡を撮る", keywords: ["城"] },
  // park_garden is checked before shrine_temple so 水前寺成趣園 lands in gardens
  // rather than being swallowed by the "寺" in its name.
  { cat: "park_garden", label: "公園・庭園制覇", icon: "trees", hint: "兼六園・後楽園など名園と公園をめぐる", keywords: ["公園", "庭園", "偕楽園", "兼六園", "後楽園", "成趣園", "グラバー園", "御苑"] },
  { cat: "shrine_temple", label: "寺社仏閣制覇", icon: "landmark", hint: "寺社を訪ねて撮る", keywords: ["寺", "神社", "神宮", "大社", "稲荷", "参道", "聖堂", "本堂", "門前"] },
  { cat: "tower_landmark", label: "タワー・展望制覇", icon: "tower", hint: "タワーや展望スポットから街を見下ろす", keywords: ["タワー", "展望", "五重塔", "テレビ塔", "通天閣"] },
];

export function classifyMission(text) {
  for (const rule of COLLECTION_RULES) {
    if (rule.keywords.some((k) => text.includes(k))) return rule.cat;
  }
  return null;
}

export function buildCollectionProgress(stamps) {
  const totals = {};
  const done = {};
  for (const rule of COLLECTION_RULES) {
    totals[rule.cat] = 0;
    done[rule.cat] = 0;
  }
  for (const pref of ALL_PREFS) {
    const missions = allMissionsForPref(pref);
    const catsInThisPref = new Set();
    for (const m of missions) {
      const cat = classifyMission(m.text);
      if (cat) catsInThisPref.add(cat);
    }
    catsInThisPref.forEach((cat) => {
      totals[cat] = (totals[cat] || 0) + 1;
    });

    const completed = completedIdsFor(stamps[pref.id], pref.id);
    if (!completed.length) continue;
    const completedCats = new Set();
    for (const m of missions) {
      if (!completed.includes(m.id)) continue;
      const cat = classifyMission(m.text);
      if (cat) completedCats.add(cat);
    }
    completedCats.forEach((cat) => {
      done[cat] = (done[cat] || 0) + 1;
    });
  }
  return COLLECTION_RULES.map((rule) => ({
    cat: rule.cat,
    label: rule.label,
    icon: rule.icon,
    hint: rule.hint,
    done: done[rule.cat] || 0,
    total: totals[rule.cat] || 0,
  })).filter((c) => c.total > 0);
}


// Which cities a collection actually covers, and whether each is done yet.
// The list screen only ever had the counts, so "0/8都市" gave no way to find
// the eight cities it meant. This backs the tap-through detail view.
export function buildCollectionDetail(cat, stamps = {}) {
  const rows = [];
  for (const pref of ALL_PREFS) {
    const missions = allMissionsForPref(pref).filter((m) => classifyMission(m.text) === cat);
    if (!missions.length) continue;
    const completed = completedIdsFor(stamps[pref.id], pref.id);
    rows.push({
      id: pref.id,
      capital: pref.capital,
      pref: pref.pref,
      region: pref.region,
      missions: missions.map((m) => m.text),
      done: missions.some((m) => completed.includes(m.id)),
    });
  }
  return rows;
}

export function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
