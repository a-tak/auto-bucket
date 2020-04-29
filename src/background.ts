declare var global: any
declare var browser: any

global.browser = require('webextension-polyfill');

/**
 * 右クリックメニュー作成
 */
browser.menus.create({
    id: "doLearn",
    title: "このメールを「仕事」として学習",
    contexts: ["message_list"],
    async onclick(info) {
      // メールをとりあえず本文だけを対象にする
      // 複数パート(HTMLメールなど)に分かれていたらすべてのパートを対象にする
      let id = info.selectedMessages.messages[0].id
      let messagePart = await browser.messages.getFull(id)
      let body = await getBody(messagePart)
      console.log("result=" + body)
    },
  });
  
  browser.menus.create({
    id: "doLearn2",
    title: "このメールを「広告」として学習",
    contexts: ["message_list"],
    async onclick(info) {
      let message = info.selectedMessages.messages[0]
    },
  })
  
  /**
   * 指定したメールの本文を取得する
   * 再帰読み込みでbodyを検索する
   * @param   {MessagePart} messagePart ThunderbirdのMessagePartオブジェクト
   * @returns {string}                  メールのBody
   */
  async function getBody(messagePart) {
    console.log(messagePart)
    let body = ""
    if ('parts' in messagePart) {
      for (var part of messagePart.parts) {
        body = body + await getBody(part)
      }
    }
    if ('body' in messagePart) {
      body = body + messagePart.body
    }
  
    return body
  
  }
  
  /**
   * メール分類学習実行 メイン処理
   */
  async function doLearn() {
  
  }
  
  /**
   * メール分類メイン処理
   */
  async function doClassification() {
  
    // フォルダ内のメールをすべて取得
  
    // ベイジアンフィルタにかける
  
    // タグづけする
  
    let messages = await browser.mailTabs.getSelectedMessages()
    
    messages.messages.forEach(async (message) => {
      let messagePart = await browser.messages.getFull(message.id)
      messagePart.headers['x-popfile-link'].forEach((link) => {
        browser.tabs.create({
          url: link
        })
      })
    })
  }
  
  /**
   * 分類実施
   * @param   {String}  message 仮メッセージ本文
   * @return  {String}          分類名
   */
  async function getClassification(message) {
    return ""
  }
  
  /**
   * タグ付け
   * @param {Message} message 仮)メッセージオブジェクト
   */
  async function setTag(message) {
  
  }
  
  // エントリーポイント
  browser.browserAction.onClicked.addListener(doClassification)
  
  browser.commands.onCommand.addListener((command) => {
    doClassification()
  })
  
