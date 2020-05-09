import "webextension-polyfill"
import { BayesianClassifier } from "simple-statistics"
import Segmenter from "tiny-segmenter"
import TagUtil from "./lib/TagUtil"
import Tag from "./lib/Tag"

export default class backgroud {
  private classifier_: BayesianClassifier
  private tags_: Tag[] = []
  private bodymaxlength_: number = 100

  constructor() {
    // イベント
    // browser.browserAction.onClicked.addListener(this.doClassification)
    // browser.commands.onCommand.addListener((command) => {
    //   obj.doClassification()
    // })

    // ベイジアンフィルター初期化
    this.classifier_ = new BayesianClassifier()

    // モデル読み込み
    this.loadSetting().then(() => {
      // メニュー作成
      this.createMenu()
    })
  }

  /**
   * 設定の読み込み
   */
  private async loadSetting(): Promise<void> {
    // objectで保存されているのでタイプアサーションで型を指定している
    const resultObj = (await browser.storage.sync.get("data")) as {
      data: object
    }
    if (resultObj.data == undefined) {
      this.classifier_.data = {}
    } else {
      this.classifier_.data = resultObj.data
    }

    // タグ設定読み込み
    // TODO: 可能であればcategories_廃止してtags_の管理で統一する(可能であれば。そのままでもいい気もしている。)
    this.tags_ = await TagUtil.load()

    // 本文の処理サイズ上限読み込み
    browser.storage.sync.get("body_max_length").then((value) => {
      this.bodymaxlength_ = (value as {
        body_max_length: number
      }).body_max_length
    })

    // 学習モデルの整理
    this.garbageCollection()

    console.log("load settings totalcount : " + this.classifier_.totalCount)
  }

  /**
   * 存在しないタグまたは分類対象外のタグの学習結果を削除する
   *
   * 事前にclassifier_.dataに整理対象の学習データとtags_にタグ情報をセットしておくこと
   */
  private async garbageCollection() {
    const target = this.classifier_.data as ClassiffierObj

    // 既に存在しないタグの学習結果は削除
    for (const obj in target) {
      if (
        this.tags_.findIndex((tag) => {
          if (obj == tag.key) {
            if (tag.useClassification) {
              return true
            }
          }
          return false
        }) == -1
      ) {
        // 見つからなかった
        console.log("parge lean model : " + obj)
        delete target[obj]
      }
    }

    // トータルカウントを更新
    let count = 0
    for (const obj in target) {
      for (const word in target[obj].word) {
        count += target[obj].word[word]
      }
    }

    this.classifier_.data = target
    this.classifier_.totalCount = count
  }

  private async saveSetting(): Promise<void> {
    await browser.storage.sync.set({
      data: this.classifier_.data,
      totalCount: this.classifier_.totalCount,
    })
  }

  private async removeSetting(): Promise<void> {
    await browser.storage.sync.clear()
    this.classifier_ = new BayesianClassifier()
  }

  private createMenu(): void {
    /**
     * 右クリックメニュー作成
     */

    for (const tag of this.tags_) {
      if (tag.useClassification) {
        browser.menus.create({
          id: "doLearn" + tag.key,
          title: "このメールを「" + tag.name + "」として学習",
          contexts: ["message_list"],
          onclick: async (info: browser.menus.OnClickData) => {
            if (info.selectedMessages == undefined) return
            const generator = this.listMessages(info.selectedMessages)
            let result = generator.next()
            while (!(await result).done) {
              const message = (await result).value
              // ジェネレーターはundefinedが返る場合もあるので戻ってきた型を見る必要がある
              if (typeof message != "undefined") {
                this.doLearn(message, tag.key)
              }
              result = generator.next()
            }
          },
        })
      }
    }

    browser.menus.create({
      id: "scoring",
      title: "このメールを判定",
      contexts: ["message_list"],
      onclick: async (info: browser.menus.OnClickData) => {
        if (info.selectedMessages == undefined) return
        const generator = this.listMessages(info.selectedMessages)
        let result = generator.next()
        while (!(await result).done) {
          const message = (await result).value
          // ジェネレーターはundefinedが返る場合もあるので戻ってきた型を見る必要がある
          if (typeof message != "undefined") {
            this.classificationMessage(message)
          }
          result = generator.next()
        }
      },
    })

    browser.menus.create({
      id: "view_log",
      title: "判定ログを表示する",
      contexts: ["message_list"],
      onclick: async (info: browser.menus.OnClickData) => {
        if (typeof info.selectedMessages != "undefined") {
          this.showLogViewer(info.selectedMessages.messages[0])
        }
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
   * メッセージを順次返すジェネレーター関数
   * .next()で次の値を返す
   * @param messageList
   */
  async *listMessages(messageList: browser.messages.MessageList) {
    let page = messageList
    for (let message of page.messages) {
      yield message
    }

    while (page.id) {
      page = await browser.messages.continueList(page.id)
      for (let message of page.messages) {
        yield message
      }
    }
  }

  async showLogViewer(messageHeader: browser.messages.MessageHeader) {
    // 一旦ストレージにmessageを保存しログ画面でそれを取り出す
    await browser.storage.sync.set({
      logTarget: messageHeader,
    })

    const createData = {
      url: "logviewer/logviewer.html",
    }
    browser.tabs.create(createData)
  }
  /**
   * 指定したメールの本文を取得する
   * 再帰読み込みでbodyを検索する
   * @param   {MessagePart} messagePart ThunderbirdのMessagePartオブジェクト
   * @returns {string}                  メールのBody
   */
  private async getBody(messagePart: browser.messages.MessagePart) {
    let body = ""
    if ("parts" in messagePart) {
      for (var part of messagePart.parts) {
        body = body + (await this.getBody(part))
      }
    }
    if ("body" in messagePart) {
      body = body + messagePart.body
    }

    return body
  }

  /**
   * メール分類学習実行 メイン処理
   * @param {string}  category  分類名
   */
  async doLearn(message: browser.messages.MessageHeader, category: string) {
    const messageId = message.id
    const words = await this.divideMessage(messageId)
    let relearn: number = 0
    do {
      relearn += 1
      console.log("re-learn count:" + relearn)
      for (const word of words) {
        // trainはプロパティと値のセットを引数に持つので、wordプロパティに単語をセットしてカテゴリを登録する
        this.classifier_.train({ word: word }, category)
      }
    } while (
      // 再度判定して指定したタグとして判定されるまで繰り返し学習する
      (await this.getClassificationTag(messageId)) != category
    )

    // タグ付けも実施する
    await this.classificationMessage(message)
    this.saveSetting()
  }

  /**
   * 学習状況をクリアする
   */
  async clearLearn() {
    // ベイジアンフィルター初期化
    this.classifier_ = new BayesianClassifier()
    // TODO: ストレージの設定は全部消しているがオプション画面のインスタンスは破棄していないので不整合がある
    this.removeSetting()
  }

  /**
   * メールのスコアリング
   * @param {number}  messageId 対象のメールid
   */
  private async scoring(messageId: number): Promise<ScoreTotal[]> {
    const totalScore: Score = {}
    performance.mark("本文分割開始")
    const words = await this.divideMessage(messageId)
    performance.mark("本文分割終了")
    for (const word of words) {
      // trainはプロパティと値のセットを引数に持つので、wordプロパティに単語をセットしてカテゴリを登録する
      // TODO: 現状、モデルに入っている分類名をそのままタグのkeyとして後続処理で使っている。
      //       モデルに古いキーが残っていると誤動作する可能性がある(何も起きないというパターンが正しいか)
      const categories_ = this.classifier_.score({ word: word }) as Score
      for (const category in categories_) {
        if (totalScore[category] == undefined) {
          totalScore[category] = 0
        }
        totalScore[category] += categories_[category]
      }
    }
    performance.mark("スコア集計終了")
    let resultScores: Array<ScoreTotal> = new Array(0)
    for (const category in totalScore) {
      resultScores.push({
        category: category,
        score: totalScore[category],
      })
    }

    performance.measure("本文分割処理", "本文分割開始", "本文分割終了")
    performance.measure("スコア集計処理", "本文分割終了", "スコア集計終了")
    console.log(performance.getEntriesByName("本文分割処理"))
    console.log(performance.getEntriesByName("スコア集計処理"))

    return resultScores
  }

  private async divideMessage(messageId: number): Promise<Array<string>> {
    // メールをとりあえず本文だけを対象にする
    // 複数パート(HTMLメールなど)に分かれていたらすべてのパートを対象にする
    performance.mark("A")
    const messagePart = await browser.messages.getFull(messageId)
    performance.mark("B")
    let body = await this.getBody(messagePart)
    performance.mark("C")
    // 本文の最初の方だけを対象にする
    body = body.slice(0, this.bodymaxlength_ * 1024)

    const seg = new Segmenter()
    performance.mark("D")
    const words: Array<string> = seg.segment(body)
    performance.mark("E")
    performance.measure("メッセージパート取得", "A", "B")
    performance.measure("メッセージボディー取得", "B", "C")
    performance.measure("Segmenter new", "C", "D")
    performance.measure("Segmenter処理", "D", "E")
    console.log(performance.getEntriesByType("measure"))
    return words
  }

  /**
   * 指定したメールをスコアリングし分類タグをセットする
   * @param messageId 対象のメッセージid
   */
  private async classificationMessage(message: browser.messages.MessageHeader) {
    performance.mark("分類開始")
    const messageId = message.id
    const tag: string = await this.getClassificationTag(messageId)
    performance.mark("分類判定終了")
    if (tag == "") return
    this.setClassificationTag(messageId, tag)
    performance.mark("分類終了")
    performance.measure("分類メイン", "分類開始", "分類終了")
    performance.measure("分類判定処理", "分類開始", "分類判定終了")
    console.log(performance.getEntriesByName("分類メイン"))
    console.log(performance.getEntriesByName("分類判定処理"))
  }

  /**
   * 指定したメッセージを評価して分類タグを返す
   * @param messageId 対象のメッセージid
   */
  private async getClassificationTag(messageId: number): Promise<string> {
    const scores: ScoreTotal[] = await this.scoring(messageId)
    return this.ranking(scores)
  }

  /**
   *  最も高いスコアのタグを返す
   * @param scores スコア一覧
   * @returns 最も高いスコアのタグ文字列を返す。スコアが何も指定されていない場合は0バイト文字列を返す。
   */
  private ranking(scores: ScoreTotal[]): string {
    if (scores.length == 0) return ""

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
  private async setClassificationTag(
    messageId: number,
    tagName: string
  ): Promise<void> {
    // 現在のメッセージのプロパティ取得
    const header = await browser.messages.get(messageId)

    // 分類用タグをすべて取り除く
    const newTags = header.tags.filter((item: string) => {
      for (const tag of this.tags_) {
        if (tag.useClassification) {
          if (tag.key == item) {
            console.log("tag.key=" + tag.key + "/item=" + item)
            return false
          }
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

interface ClassiffierObj {
  [key: string]: {
    word: {
      [key: string]: number
    }
  }
}

const obj = new backgroud()
