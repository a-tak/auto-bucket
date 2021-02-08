# AutoBucket

![](https://github.com/a-tak/auto-bucket/raw/master/docs/github-open-graph.png)

## AutoBucketとは

ベイジアンフィルターを使ってメールをいくつかのバケツ(タグ)へ自動分類するThunderbird拡張機能です。

## 基本的な使い方

1. 分類用のタグをThunderbirdに追加してThunderbirdを再起動します
2. アドオンの設定から分類に使用するタグを選択して、保存ボタンを押します
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

## バージョン1.1.7以前をお使いだった方へ

バージョン1.2.0からデータの保存先をSyncストレージ領域からLocalストレージ領域へ変更しました。
理由としては、Syncストレージ領域はデータを削除してもdeletedフラグが設定されるだけで実際のデータは削除されず蓄積され続けることが分かったからです。
その結果、Thunderbirdの起動に時間がかかるようになっていました。

今回の変更で起動時に遅くなる問題は解決しましたが、Syncストレージにはdeletedフラグがついたデータが残っています。これについて特に動作上の問題はありませんが、データが残り続けることが気になる方は以下の方法で過去のデータを削除することが出来ます。
ただし、Thunderbirdのデータベースを直接編集するため十分な注意を払うようお願いします。

1. DB Browserをダウンロードする https://sqlitebrowser.org/
2. Thunderbirdを終了する
3. Thunderbirdの対象のプロファイルが保存されているフォルダに存在する `storage-sync.sqlite` を DB Browserで開く
4. `SQL実行` タブで `delete from collection_data where collection_name = 'default/autobacket@a-tak.com' and record  like '%"_status":"deleted"%'` を実行する

これで作業完了です。
