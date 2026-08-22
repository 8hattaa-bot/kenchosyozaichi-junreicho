# 県庁所在地巡礼帳（Android版・Expo）

このフォルダは、Claude.aiのアーティファクト版（Web）をReact Native（Expo）に移植したものです。
Expo SDK 54で実機（Expo Go）・Web版の両方で動作確認済みです。

## 置き場所について（重要）

このプロジェクトは `C:\dev\kenchosyozaichi-junreicho` に置いてください。**OneDrive配下（`OneDrive\Desktop\...` など）には置かないこと。**
元はOneDrive配下にありましたが、OneDriveが`node_modules`内の数万個のファイルを裏で同期しようとしてビルドツールと競合し、
`expo-asset`や`react-native-reanimated`の一部ファイルが「存在するのに解決できない」状態になる障害が3回発生しました
（症状：`Unable to resolve module ...` / `Failed to get the SHA-1 for: ...`）。そのたびに`node_modules`の入れ直しが必要でした。
OneDrive外に移してからは再発しておらず、ビルド時間も約24秒→約2.5秒に短縮しています。

## 中身
- `data.js` — 47都道府県のデータ、ミッション内容、ランク判定などのロジック（UIなし）
- `App.js` — 画面本体（スタンプ一覧・ミッションルーレット・証拠写真・位置情報チェック）
- `package.json` / `app.json` — Expoプロジェクトの設定

## Web版からの主な変更点（技術面）
- 保存先：`window.storage`（Claude専用）→ `AsyncStorage`（端末内保存）
- 位置情報：`navigator.geolocation` → `expo-location`
- 写真：ファイル選択+canvas圧縮 → `expo-image-picker`（quality指定で圧縮）
- 見た目：CSS → React NativeのStyleSheet + react-native-svg（ハンコ）+ react-native-reanimated（押印アニメーション）

## Expo SDK / Expo Goのバージョンについて（重要）

**Expo Goストア版は、Expoが公開している最新SDKに追従しているとは限りません。** 2026年5月の方針転換により、
Google Play/App StoreのExpo GoアプリはSDK 54に固定され、それ以降のSDK（55・56・57…）は
`eas build --profile development` によるカスタム開発ビルド、または `eas go` でのみ利用可能になりました。
そのため本プロジェクトは `expo` を `~54.0.36` に合わせています。

さらに、`react-native-reanimated` と `react-native-worklets` は、Expo Goのネイティブバイナリに
**あらかじめ焼き込まれている正確なバージョン**（SDK 54の場合 reanimated `4.1.1` / worklets `0.5.1` —
[bundledNativeModules.json](https://github.com/expo/expo/blob/sdk-54/packages/expo/bundledNativeModules.json)で確認可能）
と完全に一致していないと、エラー表示すらされずに起動スプラッシュで無言のままハングします。
`package.json`ではこの2つを`~`や`^`を付けずに**厳密に固定**しています。SDKを上げる／`expo install --fix`を
実行する際は、この2パッケージのバージョンが対象SDKの`bundledNativeModules.json`と一致しているか必ず確認してください。

## 動かす手順（Claude Codeまたはローカル環境で）

```bash
# 1. このフォルダに移動して依存パッケージをインストール
npm install

# 2. 開発サーバーを起動（実機のExpo Goアプリ or エミュレータで確認）
npx expo start

# 3. Android実機で確認する場合
#    - スマホにExpo Goアプリをインストール
#    - QRコードを読み取るとその場で動作確認できる
```

## 実際にAPK/AAB（ストア提出用）を作る手順

```bash
# 初回のみ：EAS CLIをインストールしてログイン
npm install -g eas-cli
eas login

# ビルド設定を初期化
eas build:configure

# Android向けにクラウドビルド（Expoのサーバー上でビルドされる。ローカルにAndroid Studio不要）
eas build -p android --profile preview
```

ビルドが終わると、ダウンロード用のURLが発行されます。そこからAPKを取得して実機にインストール、
動作確認後に `--profile production` でストア提出用のAABを作成してください。

## 進捗状況（2026-08-14 更新）

- [x] `app.json` の `android.package` を `com.rokugo.kenchojunreicho` に設定済み
- [x] アプリアイコン・スプラッシュ画像（`assets/icon.png` 等、朱印風デザイン）は既に作成済み（`assets/generate-icons.ps1` で再生成可能）
- [x] プライバシーポリシー・利用規約を確定（`PRIVACY_POLICY.md` / `TERMS_OF_SERVICE.md`。プレースホルダーなし、連絡先はrokugoshitu@hotmail.co.jp）
- [x] Web版（`expo start --web`）でバンドル・画面遷移・ミッション画面の表示を確認済み（コンソールエラーなし）
- [x] **実機（Expo Go、SDK 54）での動作確認済み** — 都道府県一覧・スタンプ押印・Reanimatedによる押印アニメーションまで確認済み
- [ ] AdMob広告：**今回はスキップ**（要望により組み込みを見送り。必要になったら`react-native-google-mobile-ads`を追加する形で再開できます）

## まだやっていないこと（次にやるべきこと）

- [ ] `PRIVACY_POLICY.md` / `TERMS_OF_SERVICE.md` を、GitHub Pagesなど一般公開できるURLでホスティングする（Play Console登録に必須。ストア提出のタイミングで対応すればOK）
- [ ] （任意）アイコン・スプラッシュ画像をGemini等で作り直したい場合は、生成した画像を `assets/icon.png`・`assets/adaptive-icon.png`・`assets/splash-icon.png`（すべて1024×1024）に置き換えるだけでOK。現状のままでも公開可能な完成度の朱印デザインが入っています
- [ ] Google Play Consoleアカウントの作成・ストア掲載情報（スクリーンショット、説明文、上記プライバシーポリシーURL）の準備・提出（このステップはご自身のアカウントで行っていただく必要があります）
- [ ] `eas build`でのAPK/AABビルド（Expo Goでの動作確認は完了。ストア提出用ビルドはご自身のEASアカウントでのログインが必要です）

前に渡した `roadmap.md` に、この続きの手順（ストア申請・審査対応・収益化など）をまとめてあります。
