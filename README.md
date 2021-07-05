# CastBackground

StreamYardなどでのタブ共有用背景詳しくは動画をご確認ください。

* [CastBackgroundの機能紹介 \- YouTube](https://www.youtube.com/watch?v=8tKcuzFIHqE)

## 使い方

HTML標準のAPIしか使っていないため、Github Pages上の内容だけでも100%の機能を利用可能です。

### ページを開く

Github Pagesか、独自Webサーバか好きな方でどうぞ。独自Webサーバは公開サーバにする必要はありません。XAMPPやPHPのビルトインサーバだけでいいです。

#### Github Pagesで使う

以下のページにアクセスしてください。

* [Github Pages](https://side-beach-city.github.io/CastBackground/)

ブラウザのポップアップブロック機能が起動した場合は、このページを許可するようにしてください。

設定などの情報はすべてブラウザのLocal Storageに保存されます。

#### 独自にWebサーバを立ち上げて使う

ローカルHTMLでは使えないAPIも使っているのでなんらかのサーバ機能の利用が必要です。PHPのビルトインサーバ機能などを使うのがお勧めです。

ブラウザのポップアップブロック機能が起動した場合は、このページを許可するようにしてください。

### 読み込み後の使用方法

イメージがわからない場合は動画をどうぞ。

* [CastBackgroundの機能紹介 \- YouTube](https://www.youtube.com/watch?v=8tKcuzFIHqE)

ツールのバージョンアップまたはブラウザのバージョンアップにより動画と動作内容は異なることがあります。

* コントローラウィンドウ上のドロップエリアに、表示したいファイルをドロップする
* リスト上の項目をダブルクリックする
* Enjoy

テキスト、画像、動画はドロップして使用します。URLはコントローラウィンドウの下の+ボタンより追加できます。

## さらなる活用方法

### X-FrameOptionsヘッダが設定されたWebサイトを読み込む

CastBackgroundは、URLを読み込む際、Webサイトをiframeで読み込みます。そのため、X-FrameOptionsヘッダでフレーム内での読み込みが制限されているサイトをCastBackgroundで読み込むことはできません(代表的なサイトでは、Googleサービスや一部ブログサービスによって提供されているサイトなどが該当します)。

この場合、Chrome拡張でX-FrameOptionsヘッダを削除することで、読み込みが可能です。ブラウザのセキュリティリスクを上げてしまう場合もあるため、配信用に別のブラウザプロファイルを作成し、それを使用することをお勧めします。

* [Ignore X\-Frame headers \- Chrome ウェブストア](https://chrome.google.com/webstore/detail/ignore-x-frame-headers/gleekbfjekiniecknbkamfmkohkpodhe)
