# AutoBucket

![](https://github.com/a-tak/auto-bucket/raw/master/docs/github-open-graph.png)

## AutoBucketとは

ベイジアンフィルターを使ってメールをいくつかのバケツ(タグ)へ自動分類するThunderbird拡張機能です。

## 基本的な使い方

1. 分類用のタグをThunderbirdに追加してThunderbirdを再起動します
2. アドオンの設定から分類に使用するタグを選択します
[![](https://github.com/a-tak/auto-bucket/raw/master/docs/initial-setting1.jpg)](https://github.com/a-tak/auto-bucket/raw/master/docs/initial-setting1.jpg)
[![](https://github.com/a-tak/auto-bucket/raw/master/docs/initial-setting2.jpg)](https://github.com/a-tak/auto-bucket/raw/master/docs/initial-setting2.jpg)
3. メールを右クリックして、AutoBucketのメニューからどのタグに割り当てるか学習させます
4. いくつか分類をしたら右クリックかショートカットでメールを判定します。AutoBucketが学習内容に応じて自動で分類してタグをつけます。
5. 分類に誤ったメールがあれば再度学習させてください。次回からの分類精度が上がっていきます。

## 追加情報

* 新着メールに対して自動的に判定し分類タグを追加します(Thunderbird 78以降 + Autobucket 1.1.0以降の場合)
* 分類した内容に応じてメールをフォルダに振り分けたい場合は、Thunderbirdのメッセージフィルタ機能で振り分けの設定をしてください。
* AutoBucketはメールフィルタ機能の実行はしません。私がWeb Extensionの仕様からメールフィルタ機能の実行方法を見つけられなかったためです。自動でメールフィルタ機能を実行したい場合は、メールフィルタ機能の定期的な実行機能を使ってください。

## ショートカットキー

* ショートカットキーは拡張機能管理画面の右上の歯車アイコンから変更できます
[![](https://github.com/a-tak/auto-bucket/raw/master/docs/shortcut-setting1.jpg)](https://github.com/a-tak/auto-bucket/raw/master/docs/shortcut-setting1.jpg)
[![](https://github.com/a-tak/auto-bucket/raw/master/docs/shortcut-setting2.jpg)](https://github.com/a-tak/auto-bucket/raw/master/docs/shortcut-setting2.jpg)
* 各OS毎のショートカットの初期設定は以下の通りです

### ショートカット(Windows初期設定)

| 機能 | キー |
|-----|------|
|一括メール判定|Ctrl + B|
|メール判定|Ctrl + Shift + C|
|判定ログ表示|Ctrl + Shift + V|
|統計情報表示|Ctrl + Shift + S|


### ショートカット(Mac初期設定)

| 機能 | キー |
|-----|------|
|一括メール判定|Option + Shift + B|
|メール判定|Option + Shift + C|
|判定ログ表示|Option + Shift + V|
|統計情報表示|Option + Shift + S|

### ショートカット(Linux初期設定)

| 機能 | キー |
|-----|------|
|一括メール判定|Alt + Shift + B|
|メール判定|Alt + Shift + C|
|判定ログ表示|Ctrl + Shift + V|
|統計情報表示|Alt + Shift + S|

