# auto-bucket

![](docs/github-open-graph.png)

Thunderbird 用ベイジアンフィルターによる自動メール分類拡張機能

## Thunderd アドオンページ

https://addons.thunderbird.net/ja/thunderbird/addon/autobucket/

## GitHub Pages

- https://a-tak.github.io/auto-bucket/ (English)
- https://a-tak.github.io/auto-bucket/README_ja (日本語)

## ブログ

https://a-tak.com/blog/tag/autobucket/

## ビルド環境準備(Build Environment)

- Node.js 22.12.0 以上
- npm

```bash
npm ci
```

## ビルド(Build)

```bash
npm run typecheck
npm run build
npm run build-zip
```

リリースと同じ検査・ビルド・ZIP 作成をまとめて実行する場合は、次のコマンドを使用します。

```bash
npm run build:release
```

成果物は `dist-zip/autobucket-v<version>.zip` に作成されます。審査用ソースからビルドする場合も、ソース ZIP を展開して `npm ci` と `npm run build:release` を実行してください。グローバルパッケージは不要です。

## リリース

GitHub Release を公開すると、[GitHub Actions](.github/workflows/release.yml)が次の処理を実行します。

1. GitHub Release のタグ、`package.json`、`package-lock.json`、`src/manifest.json`のバージョン一致を検査
2. 型検査、Vite ビルド、WebExtension の lint を実行
3. アドオン ZIP、審査用ソース ZIP、SHA-256 チェックサムを生成
4. 生成物を GitHub Release へ添付
5. アドオン ZIP を Thunderbird Add-ons（ATN）へ提出

### 初回設定

1. [Thunderbird Add-ons Developer Hub](https://addons.thunderbird.net/ja/developers/)で JWT API キーを発行
2. GitHub リポジトリの `Settings` → `Secrets and variables` → `Actions` に次の Repository secrets を登録
   - `ATN_API_KEY`: JWT issuer
   - `ATN_API_SECRET`: JWT secret
3. ATN の AutoBucket 登録情報に設定されているライセンスを確認

API キーはリポジトリやローカルファイルへ保存しないでください。現在のリポジトリは MIT ライセンスです。ATN 側で別のライセンスが設定されている場合は、最初の自動提出前にどちらを正とするか決めて揃えてください。

### 動作確認

GitHub の `Actions` → `Build and submit release` → `Run workflow` から手動実行できます。手動実行はビルドと成果物検証だけを行い、ATN への提出や GitHub Release の変更は行いません。

### 公開手順

1. `package.json`、`package-lock.json`、`src/manifest.json`を同じ新バージョンへ更新
2. `npm run build:release`が成功することを確認して master へマージ
3. `vX.Y.Z`形式のタグ（例: `v1.3.0`）で GitHub Release を作成し、リリースノートを記入して公開
4. `Build and submit release` workflow の完了を確認
5. [ATN の AutoBucket 管理画面](https://addons.thunderbird.net/ja/developers/addon/autobucket/versions/)で提出されたバージョンを開き、GitHub Release に添付された審査用ソース ZIP と各言語のリリースノートを登録

ATN の API v4 は審査用ソース、リリースノート、ライセンス情報のアップロードに対応していないため、この 3 項目だけは管理画面での操作が残ります。プレリリースとして公開した GitHub Release は ATN へ提出されません。

ATN では同じバージョンを再提出できません。workflow が提出処理中に失敗した場合は、ATN のバージョン一覧に登録済みか確認してから再実行してください。

## セキュリティーアップデート手順

ソースにセキュリティーフィックスパッチを当てる手順

1. ブランチ作成
1. マイナーバージョンアップ適用
   ```
   npm update
   ```
1. 一旦コミット
1. メジャーアップデートが残るので確認して一つずつ適用
   ```
   npm outdate
   npm install パッケージ名@latest
   ```
1. 動作確認して問題なければコミット & プッシュ

## Linter

GitHub Actions ではビルド済みの `dist` に対して `web-ext lint` を実行します。ローカルでは型検査を次のコマンドで実行できます。

```bash
npm run typecheck
```

## デバッグ方法

- Thunderbird で拡張機能のページの右上歯車アイコンから `アドオンをデバッグ`
- zip を指定
- Thunderbird 側でこの状態のままだと zip を作り直しても生成されないので削除して zip は作り直すこと
