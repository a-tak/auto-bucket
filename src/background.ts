import 'webextension-polyfill'
import { BayesianClassifier } from 'simple-statistics'
import Segmenter from 'tiny-segmenter'

export default class backgroud {

  private classifier: BayesianClassifier

  constructor() {
    // イベント
    browser.browserAction.onClicked.addListener(this.doClassification)
    browser.commands.onCommand.addListener((command) => {
      obj.doClassification()
    })

    // ベイジアンフィルター初期化
    this.classifier = new BayesianClassifier()

    // モデル読み込み
    this.loadSetting()

    // メニュー作成
    this.createMenu()
  }

  /**
   * 設定の読み込み
   */
  private async loadSetting(): Promise<void> {
    console.log("設定ロード")
    this.classifier.data = await browser.storage.sync.get("data")
    // objectで保存しているのでタイプアサーションで型を指定している
    this.classifier.totalCount = 
      (await browser.storage.sync.get("totalCount") as {
        totalCount: number
      }).totalCount

    console.log("classiffier=" + JSON.stringify(this.classifier.data, null, 4))
    console.log("totalcount=" + this.classifier.totalCount)
  }

  private async saveSetting(): Promise<void> {
    console.log("設定セーブ")
    await browser.storage.sync.set({
      data: this.classifier.data,
      totalCount: this.classifier.totalCount
    })
  }

  private createMenu(): void {
    /**
     * 右クリックメニュー作成
     */
    browser.menus.create({
      id: "doLearn",
      title: "このメールを「仕事」として学習",
      contexts: ["message_list"],
      onclick: async (info: browser.menus.OnClickData) => {
        if (info.selectedMessages == undefined) return
        this.doLearn(info.selectedMessages.messages[0].id, "work")
      },
    })

    browser.menus.create({
      id: "doLearn2",
      title: "このメールを「広告」として学習",
      contexts: ["message_list"],
      onclick: async (info: browser.menus.OnClickData) => {
        if (info.selectedMessages == undefined) return
        this.doLearn(info.selectedMessages.messages[0].id, "promotion")
      },
    })

    browser.menus.create({
      id: "scoring",
      title: "このメールを判定",
      contexts: ["message_list"],
      onclick: async (info: browser.menus.OnClickData) => {
        if (info.selectedMessages == undefined) return
        this.scoring(info.selectedMessages.messages[0].id)
      },
    })

    browser.menus.create({
      id: "learn_clear",
      title: "学習状況をクリア",
      contexts: ["message_list"],
      onclick: async (info: browser.menus.OnClickData) => {
        if (info.selectedMessages == undefined) return
        this.scoring(info.selectedMessages.messages[0].id)
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
    const words = await this.divideMessage(messageId)
    for (const word of words) {
      // trainはプロパティと値のセットを引数に持つので、wordプロパティに単語をセットしてカテゴリを登録する
      this.classifier.train({ word: word }, category)
    }
    console.log("classiffier=" + JSON.stringify(this.classifier.data, null, 4))
    this.saveSetting()
  }

  /**
   * 学習状況をクリアする
   */
  async clearLearn() {
    // ベイジアンフィルター初期化
    this.classifier = new BayesianClassifier()
    this.saveSetting()
  }

  /**
   * 
   * @param messageId メールのScoring
   */
  async scoring(messageId: number) {
    const totalScore: Score = {
      "": 0
    }
    const words = await this.divideMessage(messageId)
  for (const word of words) {
      // trainはプロパティと値のセットを引数に持つので、wordプロパティに単語をセットしてカテゴリを登録する
      const categories = this.classifier.score({ word: word }) as Score
      for (const category in categories) {
        if (totalScore[category]==undefined) {
          totalScore[category] = 0  
        }
        totalScore[category] += categories[category]
      }
    }

    console.log("score=" + JSON.stringify(totalScore, null, 4))

  }

  private async divideMessage(messageId: number): Promise<Array<string>> {
    // メールをとりあえず本文だけを対象にする
    // 複数パート(HTMLメールなど)に分かれていたらすべてのパートを対象にする
    const messagePart = await browser.messages.getFull(messageId)
    const body = await this.getBody(messagePart)
    console.log("result=" + body)

    const seg = new Segmenter()
    const words: Array<string> = seg.segment(body)
    console.log("words=" + words)
    return words
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

/**
 * objectで戻ってくるscoreメソッド用に型定義
 */
interface Score {
  [key: string]: number
}

const obj = new backgroud()
