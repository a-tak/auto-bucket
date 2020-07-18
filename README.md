# auto-bucket

![](docs/github-open-graph.png)

 Thunderbird用ベイジアンフィルターによる自動メール分類拡張機能

## Thunderdアドオンページ

https://addons.thunderbird.net/ja/thunderbird/addon/autobucket/

## GitHub Pages

* https://a-tak.github.io/auto-bucket/ (English)
* https://a-tak.github.io/auto-bucket/README_ja (日本語)

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

Addonとして公開する場合は同じバージョンはアップし直せないので、package.jsonのバージョンを変えること
(manifest.jsonのバージョンはpackage.jsonのバージョンで書き換えられる)

## リリース

1. ブランチをプッシュ
2. GitHubでプルリクエスト作成しマージ
3. masterをプル
4. package.jsonのバージョンを変更
5. コミットしてgithubにプッシュ
6. タグをつける
7. githubにプッシュ(タグをフォロー)
8. githubでタグをリリースへ
   1. プルリクエストの説明を抜粋してリリースの説明を作る
9. ソースをダウンロード
10. ビルド ```npm run build```
11. distの中をzip化 ```npm run build-zip```
12. https://addons.thunderbird.net/ja/developers/addon/autobucket/versions/submit/ へアップロード
13. ソースもアップロード
14. アップ完了後、各国語毎に説明を入れるページが表示さるのでgithubのリリースの説明を貼り付け

## Linter

### インストール

```bash
npm install -g addons-linter
```

### 実行

```bash
addons-linter web-ext-artifacts/autobucket-1.0.zip
```
