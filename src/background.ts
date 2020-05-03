import 'webextension-polyfill'
import { BayesianClassifier } from 'simple-statistics'
import Segmenter from 'tiny-segmenter'

export default class backgroud {

  private classifier: BayesianClassifier
  private categories: Array<string> = new Array(0)

  constructor() {
    // イベント
    // browser.browserAction.onClicked.addListener(this.doClassification)
    // browser.commands.onCommand.addListener((command) => {
    //   obj.doClassification()
    // })

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
    // objectで保存されているのでタイプアサーションで型を指定している
    const resultObj = await browser.storage.sync.get("data") as {
      data: object
    }
    this.classifier.data = resultObj.data

    // objectで保存されているのでタイプアサーションで型を指定している
    this.classifier.totalCount = 
      (await browser.storage.sync.get("totalCount") as {
        totalCount: number
      }).totalCount

    // todo カテゴリの設定読み込み
    this.categories.push("work")
    this.categories.push("promotion")

    // console.log("classiffier=" + JSON.stringify(this.classifier.data, null, 4))
    // console.log("totalcount=" + this.classifier.totalCount)
  }

  private async saveSetting(): Promise<void> {
    console.log("設定セーブ")
    await browser.storage.sync.set({
      data: this.classifier.data,
      totalCount: this.classifier.totalCount
    })

    // console.log("save classiffier=" + JSON.stringify(await browser.storage.sync.get(null), null, 4))

  }

  private async removeSetting(): Promise<void> {
    console.log("設定削除")
    await browser.storage.sync.clear()
    this.classifier = new BayesianClassifier()
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
        this.classificationMessage(info.selectedMessages.messages)
      },
    })

    browser.menus.create({
      id: "learn_clear",
      title: "学習状況と設定をクリア",
      contexts: ["message_list"],
      onclick: async (info: browser.menus.OnClickData) => {
        this.clearLearn()
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
    this.saveSetting()
  }

  /**
   * 学習状況をクリアする
   */
  async clearLearn() {
    // ベイジアンフィルター初期化
    this.classifier = new BayesianClassifier()
    this.removeSetting()
  }

  /**
   * メールのスコアリング
   * @param {number}  messageId 対象のメールid
   */
  private async scoring(messageId: number): Promise<ScoreTotal[]> {
    const totalScore: Score = {}
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

    let resultScores: Array<ScoreTotal> = new Array(0)
    for (const category in totalScore) {
      resultScores.push({
        category: category,
        score: totalScore[category]
      })
    }

    console.log("score=" + JSON.stringify(resultScores, null, 4))
    return resultScores

  }

  private async divideMessage(messageId: number): Promise<Array<string>> {
    // メールをとりあえず本文だけを対象にする
    // 複数パート(HTMLメールなど)に分かれていたらすべてのパートを対象にする
    const messagePart = await browser.messages.getFull(messageId)
    const body = await this.getBody(messagePart)
    // console.log("result=" + body)

    const seg = new Segmenter()
    const words: Array<string> = seg.segment(body)
    // console.log("words=" + words)
    return words
  }

  /**
   * 指定したメールをスコアリングし分類タグをセットする
   * @param messageId 対象のメッセージid
   */
  private async classificationMessage(messages: browser.messages.MessageHeader[]) {
    for (const message of messages) {
      const messageId = message.id
      const scores: ScoreTotal[] = await this.scoring(messageId)
      const tag: string|undefined = this.ranking(scores)
      if (tag==undefined) return
      console.log("Tagged " + tag)
      this.setClassificationTag(messageId, tag)
    }
  }

  /**
   *  最も高いスコアを返す
   * @param scores スコア一覧
   * @returns 最も高いスコアのタグ文字列を返す。スコアが何も指定されていない場合はundefinedを返す。
   */
  private ranking(scores: ScoreTotal[]): string|undefined {
    if (scores.length == 0) return undefined

    const sortedScore = scores.sort((a, b) => {
      // 降順
      return b.score - a.score
    })

    return sortedScore[0].category
  }

  /**
   * 分類用タグのセット
   * @param {number} messageId 対象メールのid
   * @param {string} tagName  設定する分類用タグ
   */
  private async setClassificationTag(messageId: number, tagName: string): Promise<void> {
    // 現在のメッセージのプロパティ取得
    const header = await browser.messages.get(messageId)
    
    // 分類用タグをすべて取り除く
    const newTags = header.tags.filter((item: string) => {
      for (const tag of this.categories) {
        if ( tag == item) {
          return false
        }
      }
      return true
    })

    // 新しいメッセージのプロパティをセット
    newTags.push(tagName)
    const newProp: NewProperties = {
      flagged: header.flagged,
      junk: header.junk,
      read: header.read,
      tags: newTags,
    }
    await browser.messages.update(messageId, newProp)
  }
}

/**
 * objectで戻ってくるscoreメソッド用に型定義
 */
interface Score {
  [key: string]: number
}

/** 
 * スコアリング結果応答用オブジェクト
 */
interface ScoreTotal {
  category: string
  score: number
}

/**
 * メッセージプロパティ設定用オブジェクト
 */
interface NewProperties {
  flagged: boolean
  junk: boolean
  read: boolean
  tags: Array<string>
}

const obj = new backgroud()
