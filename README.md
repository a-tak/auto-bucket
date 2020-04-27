# auto-backet
 Thunderbird用ベイジアンフィルターによる自動メール分類拡張機能

## ビルド

--overwrite-destをつけないと2回目のビルド以降更新されない

```bash
web-ext build --overwrite-dest  
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
