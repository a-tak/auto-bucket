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

```bash
# Macの場合
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
brew install nodebrew
nodebrew install v13.13.0
nodebrew use v13.13.0
```

```bash
npm install -g @vue/cli
npm install -g @vue/cli-init
npm i
```

## ビルド(Build)

```
npm run build
npm run build-zip
```

Addon として公開する場合は同じバージョンはアップし直せないので、package.json のバージョンを変えること
(manifest.json のバージョンは package.json のバージョンで書き換えられる)

## リリース

1. ブランチをプッシュ
2. GitHub でプルリクエスト作成しマージ
3. master をプル
4. package.json のバージョンを変更
5. 同様に manifest.json のバージョンも合わせる
6. コミットして github にプッシュ
7. タグをつける
8. github にプッシュ(タグをフォロー)(Git Push Tags?にしないといけない?)
9. github でタグをリリースへ
   1. プルリクエストの説明を抜粋してリリースの説明を作る
10. ソースをダウンロード
11. ビルド `npm run build`
12. dist の中を zip 化 `npm run build-zip`
13. https://addons.thunderbird.net/ja/developers/addon/autobucket/versions/submit/ へアップロード
14. ソースもアップロード
15. アップ完了後、各国語毎に説明を入れるページが表示さるので github のリリースの説明を貼り付け

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

### インストール

```bash
npm install -g addons-linter
```

### 実行

```bash
addons-linter web-ext-artifacts/autobucket-1.0.zip
```

## デバッグ方法

- Thunderbird で拡張機能のページの右上歯車アイコンから `アドオンをデバッグ`
- zip を指定
- Thunderbird 側でこの状態のままだと zip を作り直しても生成されないので削除して zip は作り直すこと
