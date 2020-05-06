# auto-backet
 Thunderbird用ベイジアンフィルターによる自動メール分類拡張機能

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

Addonとして公開する場合は同じバージョンはアップし直せないので、manifest.jsonのバージョンを変えること

## Linter

### インストール

```bash
npm install -g addons-linter
```

### 実行

```bash
addons-linter web-ext-artifacts/autobacket-1.0.zip
```
