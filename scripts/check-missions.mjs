// ミッションデータの健全性チェック。`npm run check` で実行する。
//
// いちばん大事なのは「IDの安定性」。ミッションのIDは配列の並び順から作られる
// ので、並べ替えや途中の削除をすると、既存ユーザーの達成記録が別のミッション
// に付け替わってしまう。mission-ids.json はその見張り番で、既存IDの割り当てが
// 変わっていないかを比べる。文言の書き換えは自由（それがID化した目的）。
//
// IDを意図的に増やしたとき（末尾に追加したとき）は --update で撮り直す。
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  ALL_PREFS, LOCATION_TARGETS, LOCATION_RADIUS_KM,
  allMissionsForPref, buildCollectionProgress, buildCollectionDetail, classifyMission,
  formatDateInput, isValidDate, todayStr,
} from "../data.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT = path.join(here, "..", "mission-ids.json");
const update = process.argv.includes("--update");

let problems = 0;
const fail = (m) => { problems++; console.log("  ! " + m); };

console.log("== 構成 ==");
console.log("  都市数: " + ALL_PREFS.length);
for (const p of ALL_PREFS) {
  const ms = allMissionsForPref(p);
  const key = ["eat", "photo", "location"].map((t) => ms.filter((m) => m.type === t).length).join("/");
  if (key !== "3/3/1") fail(p.capital + " の構成が " + key);
}
console.log("  食3/撮3/現地1 が全都市で成立");

console.log("\n== 重複 ==");
const byText = new Map();
for (const p of ALL_PREFS) for (const m of allMissionsForPref(p)) {
  if (byText.has(m.text)) fail("文言の重複: 「" + m.text + "」(" + byText.get(m.text) + " / " + p.capital + ")");
  byText.set(m.text, p.capital);
}
console.log("  総ミッション数 " + byText.size + " / 完全重複なし");

console.log("\n== IDの安定性 ==");
const current = {};
for (const p of ALL_PREFS) for (const m of allMissionsForPref(p)) current[m.id] = m.text;
if (update) {
  fs.writeFileSync(SNAPSHOT, JSON.stringify(current, null, 1) + "\n", "utf8");
  console.log("  スナップショットを更新しました (" + Object.keys(current).length + "件)");
} else if (!fs.existsSync(SNAPSHOT)) {
  fail("mission-ids.json がない。初回は --update で作成すること");
} else {
  const saved = JSON.parse(fs.readFileSync(SNAPSHOT, "utf8"));
  const lost = Object.keys(saved).filter((id) => !(id in current));
  const added = Object.keys(current).filter((id) => !(id in saved));
  const reworded = Object.keys(saved).filter((id) => id in current && saved[id] !== current[id]);
  for (const id of lost) fail("IDが消えた: " + id + "（並べ替え・削除は記録を壊す）");
  if (added.length) console.log("  IDが増えた（末尾追加なら問題なし）: " + added.join(", "));
  if (reworded.length) console.log("  文言だけ変わった（記録は保持される）: " + reworded.length + "件");
  if (!lost.length && !added.length && !reworded.length) console.log("  変化なし");
}

console.log("\n== 位置ミッションの座標 ==");
const km = (a, b, c, d) => {
  const R = 6371, x = ((c - a) * Math.PI) / 180, y = ((d - b) * Math.PI) / 180;
  const s = Math.sin(x / 2) ** 2 + Math.cos((a * Math.PI) / 180) * Math.cos((c * Math.PI) / 180) * Math.sin(y / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};
for (const p of ALL_PREFS) {
  const t = LOCATION_TARGETS[p.id];
  if (!t) { fail(p.capital + " の座標がない"); continue; }
  if (km(p.lat, p.lng, t.lat, t.lng) > 8) fail(p.capital + " の座標が市中心から8km超");
}
console.log("  47件すべて存在・市中心から8km以内（判定半径 " + LOCATION_RADIUS_KM + "km）");

console.log("\n== 運任せ・高額ワードの残存 ==");
const banned = ["旬季", "季節限定", "冬季", "幸運", "探して撮る", "見つけたら",
  "神戸牛」料理", "佐賀牛料理", "近江牛料理", "上州牛", "のどぐろ", "ふぐ料理",
  "松葉ガニ", "わんこそば", "皿鉢", "ひつまぶし", "うなぎ料理"];
for (const p of ALL_PREFS) for (const m of allMissionsForPref(p))
  for (const w of banned) if (m.text.includes(w)) fail(p.capital + "「" + w + "」: " + m.text);
console.log("  残存なし");

console.log("\n== 訪問日の整形と検証 ==");
// 「弾けること」だけを試すと、全部弾く壊れ方を見逃す。通ることを先に確かめる。
const mustPass = [todayStr(), "2026-08-23", "2024-02-29", "1999-12-31"];
for (const v of mustPass) if (!isValidDate(v)) fail("通るべき日付が弾かれた: " + v);
const mustFail = ["", "あ", "2026-02-31", "2026-13-01", "2026-8-3", "20260823", "dddd-dd-dd"];
for (const v of mustFail) if (isValidDate(v)) fail("弾くべき値が通った: " + JSON.stringify(v));
const formats = [["20260823", "2026-08-23"], ["あ2026", "2026"], ["202608", "2026-08"],
  ["9999999999999", "9999-99-99"], ["", ""]];
for (const [inp, want] of formats) {
  const got = formatDateInput(inp);
  if (got !== want) fail("整形が想定と違う: " + JSON.stringify(inp) + " -> " + JSON.stringify(got) + "（期待 " + JSON.stringify(want) + "）");
}
// 入力欄に今日の日付が入った状態で、そのまま押印できることの担保
if (!isValidDate(formatDateInput(todayStr()))) fail("今日の日付が整形→検証を通らない（押印できなくなる）");
console.log("  有効 " + mustPass.length + "件が通り、無効 " + mustFail.length + "件を弾き、整形 " + formats.length + "件が一致");

console.log("\n== コレクション ==");
for (const c of buildCollectionProgress({})) {
  const rows = buildCollectionDetail(c.cat, {});
  if (rows.length !== c.total) fail(c.label + ": 一覧と詳細の件数が不一致");
  if (!c.icon || !c.hint) fail(c.label + ": icon か hint がない");
  console.log("  " + c.label.padEnd(14) + String(c.total).padStart(3) + "都市" + (c.total <= 1 ? "  <- 1都市のみ" : ""));
}

console.log("\n" + (problems ? "問題 " + problems + " 件" : "問題なし（0件）"));
process.exit(problems ? 1 : 0);
