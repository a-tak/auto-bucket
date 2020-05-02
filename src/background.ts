import 'webextension-polyfill'
import {BayesianClassifier} from 'simple-statistics' 
import Segmenter from 'tiny-segmenter'

export default class backgroud {

  private classifier: BayesianClassifier

  constructor() {
    // エントリーポイント
    browser.browserAction.onClicked.addListener(this.doClassification)
    browser.commands.onCommand.addListener((command) => {
      obj.doClassification()
    })

    // ベイジアンフィルター初期化
    this.classifier = new BayesianClassifier()

    this.createMenu()
  }

  private createMenu(): void {
    /**
     * 右クリックメニュー作成
     */
    browser.menus.create({
      id: "doLearn",
      title: "このメールを「仕事」として学習",
      contexts: ["message_list"],
      onclick : async (info: browser.menus.OnClickData) => {
        if (info.selectedMessages == undefined) return
        this.doLearn(info.selectedMessages.messages[0].id, "work")
      },
    })

    browser.menus.create({
      id: "doLearn2",
      title: "このメールを「広告」として学習",
      contexts: ["message_list"],
      onclick : async (info: browser.menus.OnClickData) => {
        if (info.selectedMessages == undefined) return
        this.doLearn(info.selectedMessages.messages[0].id, "promotion")
      },
    })
  }

  /**
   * 指定したメールの本文を取得する
   * 再帰読み込みでbodyを検索する
   * @param   {MessagePart} messagePart ThunderbirdのMessagePartオブジェクト
   * @returns {string}                  メールのBody
   */
  private async getBody(messagePart: browser.messages.MessagePart) {
  console.log(messagePart)
  let body = ""
  if ('parts' in messagePart) {
    for (var part of messagePart.parts) {
      body = body + await this.getBody(part)
    }
  }
  if ('body' in messagePart) {
    body = body + messagePart.body
  }

  return body

}

/**
 * メール分類学習実行 メイン処理
 * @param {string}  category  分類名
 */
async doLearn(messageId: number, category: string) {
    // メールをとりあえず本文だけを対象にする
    // 複数パート(HTMLメールなど)に分かれていたらすべてのパートを対象にする
    const messagePart = await browser.messages.getFull(messageId)
    const body = await this.getBody(messagePart)
    console.log("result=" + body)
    
    const seg = new Segmenter()
    const words: Array<string> = seg.segment(body)

    await this.classifier.train(words,category)
    console.log("classiffier=" + JSON.stringify(this.classifier.data, null, 4))

}

/**
 * メール分類メイン処理
 */
async doClassification() {

  // フォルダ内のメールをすべて取得

  // ベイジアンフィルタにかける

  // タグづけする

}

/**
 * 分類実施
 * @param   {String}  message 仮メッセージ本文
 * @return  {String}          分類名
 */
// async function getClassification(message) {
//   return ""
// }

/**
 * タグ付け
 * @param {Message} message 仮)メッセージオブジェクト
 */
// async function setTag(message) {

// }

}

const obj = new backgroud()
