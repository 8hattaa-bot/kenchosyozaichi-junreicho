// ---------------------------------------------------------------------------
// 収益化の設定
//
// 本番稼働に必要なのは、このファイルの ID を差し替えることだけです。
// アプリ側のコードには ID を直接書かないでください。
// ---------------------------------------------------------------------------

// === 楽天トラベル アフィリエイト =============================================
//
// 【今の状態】プレースホルダーの ID が入っています。
//   この状態でもリンクは楽天トラベルの検索結果に正しく飛びますが、
//   成果は記録されません（誰の紹介か分からないため）。
//
// 【本番にするとき】
//   1. https://affiliate.rakuten.co.jp/ に登録（楽天会員があれば無料・審査あり）
//   2. 管理画面で発行される「アフィリエイトID」をコピー
//      （20桁前後の英数字。リンク内の /hgc/ の直後に入る部分です）
//   3. 下の RAKUTEN_AFFILIATE_ID を置き換える
//   4. それだけで全47都市のリンクが本番の成果計測付きに切り替わります

// ▼▼▼ 本番の ID をここに入れてください ▼▼▼
export const RAKUTEN_AFFILIATE_ID = "00000000.00000000.00000000.00000000";
// ▲▲▲ ここまで ▲▲▲

// プレースホルダーのままかどうか。
export const IS_AFFILIATE_PLACEHOLDER =
  !RAKUTEN_AFFILIATE_ID || RAKUTEN_AFFILIATE_ID.startsWith("00000000.");

/**
 * 指定した都市のホテル一覧（楽天トラベル）へのアフィリエイトリンクを組み立てます。
 *
 * 楽天アフィリエイトのリンクは
 *   https://hb.afl.rakuten.co.jp/hgc/<アフィリエイトID>/?pc=<遷移先>&m=<スマホ用遷移先>
 * という形式で、遷移先 URL は URL エンコードして渡す必要があります。
 *
 * @param {string} cityName 県庁所在地の市区名（例：「札幌市」）
 * @returns {string} タップして開く URL
 */
export function hotelSearchUrl(cityName) {
  const target = `https://search.travel.rakuten.co.jp/ds/hotellist/?f_query=${encodeURIComponent(cityName)}`;

  // ID 未設定のうちは、成果計測用のラッパーを挟まず楽天トラベルへ直接飛ばします。
  // 空の ID でラップしたリンクは楽天側でエラーページになるため。
  if (IS_AFFILIATE_PLACEHOLDER) return target;

  const encoded = encodeURIComponent(target);
  return `https://hb.afl.rakuten.co.jp/hgc/${RAKUTEN_AFFILIATE_ID}/?pc=${encoded}&m=${encoded}`;
}

// === AdMob（バナー広告）=====================================================
//
// 【動く環境・動かない環境】
//   ○ EAS でビルドしたアプリ（development / preview / production）
//   × Expo Go
//
//   react-native-google-mobile-ads は読み込んだ瞬間に
//     TurboModuleRegistry.getEnforcing('RNAppModule')
//   を実行します。対応するネイティブコードが無いと即座に落ちる呼び出しで、
//   しかも JS の try/catch では捕まえられません。Expo Go 本体にはその
//   ネイティブコードが入っていないため、原理的に動きません。
//   そのため components/AdBanner.native.js では、Expo Go を検出したときは
//   モジュールを読み込まずに何も描画しない作りにしてあります。
//
// 【今の状態】Google 公式のテスト用 ID を使っています。
//   テスト広告は本物と同じ見た目で表示されますが、収益は発生しません。
//   開発中に本番 ID を使うと「無効なトラフィック」と判定されて
//   AdMob アカウントが停止されることがあるため、リリースまではこのままにします。
//
// 【本番にする手順】
//   1. https://admob.google.com/ でアカウント作成
//   2. アプリを登録し「バナー」広告ユニットを作成
//   3. 下の PROD_* に発行された ID を入れる
//   4. USE_TEST_ADS を false にする
//   5. app.json の react-native-google-mobile-ads プラグインの
//      androidAppId も本番の App ID に差し替える（ここと2箇所あります）
//
//   App ID の形式      : ca-app-pub-0000000000000000~0000000000  （区切りが「~」）
//   広告ユニットIDの形式: ca-app-pub-0000000000000000/0000000000  （区切りが「/」）

export const USE_TEST_ADS = true;

// Google 公式のテスト用 ID（そのまま使って問題ないもの）
const ADMOB_TEST_ANDROID_APP_ID = "ca-app-pub-3940256099942544~3347511713";
const ADMOB_TEST_BANNER_UNIT_ID = "ca-app-pub-3940256099942544/6300978111";

// ▼▼▼ 本番の ID をここに入れてください ▼▼▼
const ADMOB_PROD_ANDROID_APP_ID = "";
const ADMOB_PROD_BANNER_UNIT_ID = "";
// ▲▲▲ ここまで ▲▲▲

export const ADMOB_ANDROID_APP_ID = USE_TEST_ADS ? ADMOB_TEST_ANDROID_APP_ID : ADMOB_PROD_ANDROID_APP_ID;
export const ADMOB_BANNER_UNIT_ID = USE_TEST_ADS ? ADMOB_TEST_BANNER_UNIT_ID : ADMOB_PROD_BANNER_UNIT_ID;
