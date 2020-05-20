# auto-backet

![](docs/github-open-graph.png)

 Thunderbird用ベイジアンフィルターによる自動メール分類拡張機能

## GitHub Pages

* https://a-tak.github.io/auto-backet/
* https://a-tak.github.io/auto-backet/README_ja

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
cd dist
# zip compress
```

Addonとして公開する場合は同じバージョンはアップし直せないので、package.jsonのバージョンを変えること
(manifest.jsonのバージョンはpackage.jsonのバージョンで書き換えられる)

## リリース

1. package.jsonのバージョンを変更
2. コミットしてgithubにプッシュ
3. タグをつける
4. githubにプッシュ(タグをフォロー)
5. githubでタグをリリースへ
   1. プルリクエストの説明を抜粋してリリースの説明を作る
6. ソースをダウンロード
7. ビルド
8. distの中をzip化
9.  https://addons.thunderbird.net/ja/developers/addon/autobacket/versions/submit/ へアップロード
10. ソースもアップロード
11. アップ完了後、各国語毎に説明を入れるページが表示さるのでgithubのリリースの説明を貼り付け

## Linter

### インストール

```bash
npm install -g addons-linter
```

### 実行

```bash
addons-linter web-ext-artifacts/autobacket-1.0.zip
```
