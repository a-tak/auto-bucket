import "webextension-polyfill"
import { BayesianClassifier } from "simple-statistics"
import Segmenter from "tiny-segmenter"
import TagUtil from "./lib/TagUtil"
import Tag from "./models/Tag"
import LogEntry from "./models/LogEntry"
import MessageUtil from "./lib/MessageUtil"
import TotalScore from "./models/TotalScore"
import StatisticsLog from "./models/StatisticsLog"
import StatisticsUtil from "./lib/StatisticsUtil"
import { StorageObj } from "./lib/StorageUtil"
import StorageUtil from "./lib/StorageUtil"
import ReLearnLog from "./models/ReLearnLog"
import pMap from "p-map"

export default class backgroud {
  /** 再学習ログの並行処理数 */
  static readonly DELETE_OLD_JUDGE_LOG_CONCURRENCY: number = 10
  /** メール判定の対象ヘッダをプールする数 ここに指定したメールヘッダ分のメモリが必要になる */
  static readonly JUDGE_MSG_POOL_COUNT: number = 20
  /** メール判定の並行処理数 プールしているメールヘッダに対しての判定処理を並列で行う数 負荷やメモリに影響 */
  static readonly JUDGE_MSG_QUEUE_COUNT: number = 5

  private classifier_: BayesianClassifier
  private tags_: Tag[] = []
  private bodymaxlength_: number = 100
  private totalStatistics_: StatisticsLog = StatisticsUtil.getInitialObj()
  private todayStatistics_: StatisticsLog = StatisticsUtil.getInitialObj()
  /** 設定読み込み済みフラグ */
  private settingLoaded_: boolean = false

  static readonly NOTIFY_ID_NOT_SET: string = "notset"

  constructor() {
    browser.notifications.onClicked.addListener((notificateionId) => {
      switch (notificateionId) {
        case backgroud.NOTIFY_ID_NOT_SET:
          {
            browser.runtime.openOptionsPage()
          }
          this.noticeClearNotSetting()
          break
      }
    })

    browser.runtime.onInstalled.addListener(async ({ reason }) => {
      switch (reason) {
        case "install":
          {
            const url = browser.runtime.getURL(
              browser.i18n.getMessage("homepage")
            )
            await browser.tabs.create({ url })
          }
          break
      }
    })

    browser.commands.onCommand.addListener((command) => {
      switch (command) {
        case "all-classificate":
          this.executeAllClassificate()
          break
        case "classificate":
          this.executeClassificate()
          break
        case "view-log":
          this.executeViewLog()
          break
        case "statsitics":
          const createData = {
            url: "/statistics/statistics.html",
          }
          browser.tabs.create(createData)
          break
        default:
          throw new Error("not shortcut define")
      }
    })

    browser.messages.onNewMailReceived.addListener((folder, messages) => {
      this.executeNewMailClassificate(messages)
    })

    browser.storage.onChanged.addListener((changes, areaName) => {
      this.storageChangedHook(changes, areaName)
    })

    // ベイジアンフィルター初期化
    this.classifier_ = new BayesianClassifier()

    // モデル読み込み
    this.loadSetting().then(() => {
      // メニュー作成
      this.createMenu()
    })
  }

  private async storageChangedHook(
    changes: { [key: string]: browser.storage.StorageChange },
    areaName: String
  ): Promise<void> {
    if (areaName === "sync") {
      if ("body_max_length" in changes) {
        if ((await this.loadMaxLengthSetting()) === false) {
          // 通常、未設定状態に変更することはないので、それを検知したら例外
          throw new Error("Changed body_max_length property to undefined.")
        }
      }
      if ("tags" in changes) {
        if ((await this.loadTagSetting()) === false) {
          // 通常、未設定状態に変更することはないので、それを検知したら例外
          throw new Error("Changed tag property to undefined.")
        }
        // メニュー再生成
        this.createMenu()
      }
    }
  }

  /**
   * 本文処理上限設定の読み込み
   * @returns 初期設定が未完了の場合はfalseを返す
   */
  private async loadMaxLengthSetting(): Promise<boolean> {
    // 本文の処理サイズ上限読み込み
    const maxLengthObj = (await browser.storage.sync.get(
      "body_max_length"
    )) as {
      body_max_length?: number | undefined
    }

    if (typeof maxLengthObj.body_max_length === "undefined") {
      // 未設定であれば、初期設定完了前と見直して抜ける
      return false
    } else {
      this.bodymaxlength_ = maxLengthObj.body_max_length
    }
    return true
  }

  /**
   * タグ設定の読み込み
   * @returns 初期設定が未完了の場合はfalseを返す(現状は常にtrueを応答)
   */
  private async loadTagSetting(): Promise<boolean> {
    // タグ設定読み込み
    // TODO: 可能であればcategories_廃止してtags_の管理で統一する(可能であれば。そのままでもいい気もしている。)
    this.tags_ = await TagUtil.load()
    return true
  }

  /**
   * 設定の読み込み
   */
  private async loadSetting(): Promise<void> {
    // 本文の処理サイズ上限読み込み
    if ((await this.loadMaxLengthSetting()) === false) {
      return
    }

    // タグ設定読み込み
    if ((await this.loadTagSetting()) === false) {
      return
    }

    // objectで保存されているのでタイプアサーションで型を指定している
    const resultObj = (await browser.storage.sync.get("data")) as {
      data: object
    }
    if (resultObj.data == undefined) {
      this.classifier_.data = {}
    } else {
      this.classifier_.data = resultObj.data
    }
    const setting = await StorageUtil.getStorageAll()
    await StatisticsUtil.removeOldStatistics(setting)
    await StatisticsUtil.removeOldReLearnLog(setting)

    // 学習モデルの整理
    this.garbageCollectionLearnModel()
    // 古いログの削除
    await this.deleteOldJudgeLog(setting)
    // 統計読み込み
    await this.loadStatistics()
    // 設定読み込み完了フラグ オン
    this.settingLoaded_ = true
  }

  private async loadStatistics() {
    this.totalStatistics_ = await StatisticsUtil.loadTotalStatistics()
  }

  private async deleteOldJudgeLog(setting: StorageObj) {
    // 設定読み込み
    let deleteHour = ((await browser.storage.sync.get(
      "log_delete_past_hour"
    )) as {
      log_delete_past_hour: number
    }).log_delete_past_hour
    if (typeof deleteHour === "undefined") {
      // デフォルトでは3日前のログは削除する
      deleteHour = 24 * 3
    }

    const nowDate = new Date()
    const keys: string[] = []
    for (const item in setting) {
      // キーの先頭文字でログであることを判断。他の設定で同様のキーを作ると誤動作する。
      if (item.indexOf("__log_", 0) === 0) {
        // いけてないがここまでくるとオブジェクトの中にlogDate_メンバがあるのは間違いなのでasで指定して読み込む
        const logEntry = setting[item] as { logDate_: string }
        const logDate = new Date(logEntry.logDate_)
        const hourdiff =
          (nowDate.getTime() - logDate.getTime()) / (1000 * 60 * 60)
        if (hourdiff > deleteHour) {
          keys.push(item)
        }
      }
    }
    await pMap(
      keys,
      async (keyName) => {
        await browser.storage.sync.remove(keyName)
      },
      { concurrency: backgroud.DELETE_OLD_JUDGE_LOG_CONCURRENCY }
    )
  }

  /**
   * 存在しないタグまたは分類対象外のタグの学習結果を削除する
   *
   * 事前にclassifier_.dataに整理対象の学習データとtags_にタグ情報をセットしておくこと
   */
  private async garbageCollectionLearnModel() {
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

  private createMenu(): void {
    /**
     * 右クリックメニュー作成
     */

    browser.menus.removeAll().then(() => {
      for (const tag of this.tags_) {
        if (tag.useClassification) {
          browser.menus.create({
            id: "doLearn" + tag.key,
            title: browser.i18n.getMessage("learnMenu", tag.name),
            contexts: ["message_list"],
            onclick: async () => {
              this.executeLearn(tag)
            },
          })
        }
      }

      browser.menus.create({
        id: "all_classificate",
        title: browser.i18n.getMessage("allClassificateMenu"),
        contexts: ["message_list"],
        onclick: async () => {
          this.executeAllClassificate()
        },
      })

      browser.menus.create({
        id: "classificate",
        title: browser.i18n.getMessage("classificateMenu"),
        contexts: ["message_list"],
        onclick: async () => {
          this.executeClassificate()
        },
      })

      browser.menus.create({
        id: "view_log",
        title: browser.i18n.getMessage("viewLogMenu"),
        contexts: ["message_list"],
        onclick: async () => {
          this.executeViewLog()
        },
      })
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

  private async executeAllClassificate() {
    // 設定の読み込みが完了していない場合は、処理を続行しない
    if (this.settingLoaded_ === false) {
      this.noticeNotSetting()
      return
    }

    // 本日統計情報読み込み
    const logDate = new Date()
    this.todayStatistics_ = await StatisticsUtil.loadStatsitics(logDate)

    // 現在アクティブなタブのメール一覧を取得
    const mailTabs = await browser.mailTabs.query({
      active: true,
      currentWindow: true,
    })
    if (mailTabs.length === 0) return
    const folder = mailTabs[0].displayedFolder
    const messageList = await browser.messages.list(folder)

    await this.classificateMain(messageList)

  }

  private async subAllClassificate(message: browser.messages.MessageHeader) {
    // まだタグがついていないか判断
    if ((await this.isTagged(message)) === false) {
      // タグ付け
      await this.classificationMessage(message)
    }
  }

  /**
   * 分類用タグがついているか応答する
   * @param message
   */
  private async isTagged(
    message: browser.messages.MessageHeader
  ): Promise<boolean> {
    if ((await this.getClassificateTag(message)) === "") {
      return false
    }
    return true
  }

  /**
   * メッセージにセットされている分類用タグ名を返す
   * @param message
   * @returns タグ名を返す。分類用タグが設定されていなければ""を返す
   */
  private async getClassificateTag(
    message: browser.messages.MessageHeader
  ): Promise<string> {
    for (const msgTag of message.tags) {
      for (const tag of this.tags_) {
        if (tag.useClassification) {
          if (tag.key === msgTag) {
            return msgTag
          }
        }
      }
    }
    return ""
  }

  private async saveStatistcs(logDate: Date) {
    StatisticsUtil.saveTotalStatistics(this.totalStatistics_)
    StatisticsUtil.saveStatistics(this.todayStatistics_, logDate)
  }

  /**
   * メールを学習する
   * @param tag 分類(タグ)
   */
  private async executeLearn(tag: Tag) {
    // 本日統計情報読み込み
    const logDate = new Date()
    this.todayStatistics_ = await StatisticsUtil.loadStatsitics(logDate)

    const generator = this.listMessages(
      await browser.mailTabs.getSelectedMessages()
    )
    let result = generator.next()
    const promises: Promise<void>[] = []
    while (!(await result).done) {
      const message = (await result).value
      // ジェネレーターはundefinedが返る場合もあるので戻ってきた型を見る必要がある
      if (typeof message != "undefined") {
        promises.push(this.doLearn(message, tag.key))
      }
      result = generator.next()
    }

    // 処理待ち
    await Promise.all(promises)
    this.saveStatistcs(logDate)
  }

  private async executeClassificate() {
    await this.classificateMain(await browser.mailTabs.getSelectedMessages())
  }

  private async executeNewMailClassificate(
    messages: browser.messages.MessageList
  ) {
    await this.classificateMain(messages)
  }

  private async classificateMain(
    messageList: browser.messages.MessageList
  ): Promise<void> {
    // 設定の読み込みが完了していない場合は、処理を続行しない
    if (this.settingLoaded_ === false) {
      this.noticeNotSetting()
      return
    }
    // 本日統計情報読み込み
    const logDate = new Date()
    this.todayStatistics_ = await StatisticsUtil.loadStatsitics(logDate)

    const generator = this.listMessages(messageList)

    let messages: browser.messages.MessageHeader[] = []
    // メール毎に処理
    let result = generator.next()
    while (!(await result).done) {
      const message = (await result).value
      // ジェネレーターはundefinedが返る場合もあるので戻ってきた型を見る必要がある
      if (typeof message != "undefined") {
        messages.push(message)
      }
      
      // 何件か取得したらキューに入れて処理開始し、プールしたメッセージはクリアして続行する
      // メモリ使用量増大を防ぐためキューが空になるまで待つ　
      if (messages.length >= backgroud.JUDGE_MSG_POOL_COUNT) {
        await pMap(
          messages,
          async (message) => {
            await this.subAllClassificate(message)
          },
          { concurrency: backgroud.JUDGE_MSG_QUEUE_COUNT }
        )
        // プールしたメッセージクリア
        messages = []
      }

      result = generator.next()

    }

    // 残りを処理
    await pMap(
      messages,
      async (message) => {
        await this.subAllClassificate(message)
      },
      { concurrency: backgroud.JUDGE_MSG_QUEUE_COUNT }
    )
    // プールしたメッセージクリア
    messages = []
    
    this.saveStatistcs(logDate)
  }

  private async executeViewLog() {
    // 設定の読み込みが完了していない場合は、処理を続行しない
    if (this.settingLoaded_ === false) {
      this.noticeNotSetting()
      return
    }

    this.showLogViewer(
      await (await browser.mailTabs.getSelectedMessages()).messages[0]
    )
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

  private async getBodyMain(messagePart: browser.messages.MessagePart) {
    let body = this.getBody(messagePart, ContentType.PlainText)
    // プレーンテキストが無かった場合はHTMLを対象とする
    if ((await body).length === 0) {
      body = this.getBody(messagePart, ContentType.Html)
    }
    return body
  }

  /**
   * メールの本文を取得する
   * 再帰読み込みでbodyを検索する
   * @param   {MessagePart} messagePart ThunderbirdのMessagePartオブジェクト
   * @param contentType 取得対象のコンテンツタイプ
   * @returns {string}                  メールのBody
   */
  private async getBody(
    messagePart: browser.messages.MessagePart,
    contentType: ContentType
  ) {
    let body = ""
    if ("parts" in messagePart) {
      for (var part of messagePart.parts) {
        body = body + (await this.getBody(part, contentType))
      }
    }
    // コンテンツタイプが一致するbodyがあれば処理
    if ("body" in messagePart && messagePart.contentType === contentType) {
      let result = messagePart.body
      if (messagePart.contentType === ContentType.Html) {
        // HTMLタグ除去
        result = result.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, " ")
        // 半角空白削除(文字列で指定すると最初の一つしか置換しないので正規表現で)
        result = result.replace(/&nbsp;/g, "")
      }
      // 記号と数字を削除する(0000-0FFF)
      // サロゲートペアで表す文字列は一旦対応放置
      // https://ja.wikipedia.org/wiki/Unicode一覧_0000-0FFF
      result = result.replace(
        /([\u0000-\u002f])|([\u003a-\u0040])|([\u005b-\u0060])|([\u007b-\u00bf])|([\u02b9-\u0362])|([\u0374-\u0375])|([\u037A-\u037E])|([\u0384-\u0385])|\u0387/g,
        " "
      )
      // 記号と数字を削除する(2000-2FFF)
      result = result.replace(
        /([\u2000-\u203e])|([\u20dd-\u20f0])|([\u2190-\u27ff])|([\u2900-\u2e70])|([\u2ff0-\u2ffb])/g,
        " "
      )
      // 記号と数字を削除する(3000-3FFF)
      result = result.replace(/([\u3000-\u3040])|([\u3200-\u33ff])/g, " ")
      // 記号と数字を削除する(F000-FFFF)
      result = result.replace(
        /([\ufe30-\ufe6b])|([\uff00-\uff0f])|([\uff1a-\uff20])|([\uff3b-\uff40])|([\uff5b-\uff65])/g,
        " "
      )

      body = body + result
    }

    return body
  }

  /**
   * メール分類学習実行 メイン処理
   * @param {string}  category  分類名
   */
  async doLearn(message: browser.messages.MessageHeader, category: string) {
    const words = await this.getTargetMessage(message)
    let relearn: number = 0
    do {
      relearn += 1
      for (const word of words) {
        // trainはプロパティと値のセットを引数に持つので、wordプロパティに単語をセットしてカテゴリを登録する
        this.classifier_.train({ word: word }, category)
      }
    } while (
      // 再度判定して指定したタグとして判定されるまで繰り返し学習する
      (await this.judgeClassification(message)) != category
    )

    // 現在の分類タグを待避
    const previousTag = await this.getClassificateTag(message)

    // タグ付けも実施する
    if (previousTag != "") {
      // 分類タグが既にセットされている場合は再学習。この場合はメールカウントは増やさない
      await this.classificationMessage(message, true)
    } else {
      await this.classificationMessage(message, false)
    }

    this.saveSetting()

    // 統計情報更新
    if (previousTag != "") {
      // 過去に一度再学習したメールであれば誤判定回数は二重に増やさない
      if ((await StatisticsUtil.isReLearned(message)) === false) {
        this.totalStatistics_.wrongCount += 1
        this.todayStatistics_.wrongCount += 1
      }
      //再学習ログを残す
      const log: ReLearnLog = {
        messageId: await MessageUtil.getMailMessageId(message),
        date: new Date(),
        previousClassification: previousTag,
        changedClassification: await this.getClassificateTag(message),
      }
      StatisticsUtil.saveReLearnLog(log)
    }
  }

  /**
   * メールのスコアリング
   * @param {number}  messageId 対象のメールid
   */
  private async scoring(
    message: browser.messages.MessageHeader
  ): Promise<{ scoreTotal: TotalScore[]; logEntry: LogEntry }> {
    const totalScore: Score = {}
    const words = await this.getTargetMessage(message)
    const logEntry = new LogEntry()
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
        // ログ用スコア集計
        if (logEntry.scoreEachWord[word] == undefined) {
          logEntry.scoreEachWord[word] = {
            count: 0,
            score: {
              [category]: 0,
            },
          }
        } else if (logEntry.scoreEachWord[word].score[category] == undefined) {
          logEntry.scoreEachWord[word].score[category] = 0
        }
        logEntry.scoreEachWord[word].score[category] += categories_[category]
      }
      // ログ用スコア集計
      logEntry.scoreEachWord[word].count += 1
      logEntry.targetText = words
    }
    let resultScores: Array<TotalScore> = new Array(0)
    for (const category in totalScore) {
      resultScores.push({
        category: category,
        score: totalScore[category],
      })
    }

    return { scoreTotal: resultScores, logEntry: logEntry }
  }

  private async getTargetMessage(
    message: browser.messages.MessageHeader
  ): Promise<Array<string>> {
    if (this.bodymaxlength_ == undefined) {
      throw new Error(
        "bodymaxlength_ property not set. The settings may not be loaded yet."
      )
    }
    // メールをとりあえず本文だけを対象にする
    // 複数パート(HTMLメールなど)に分かれていたらすべてのパートを対象にする
    const messagePart = await browser.messages.getFull(message.id)
    let body = await this.getBodyMain(messagePart)

    // subjectを追加する
    body = message.subject + body

    // 本文の最初の方だけを対象にする
    body = body.slice(0, this.bodymaxlength_ * 1024)

    const seg = new Segmenter()

    let words: Array<string> = seg.segment(body)

    words = words.filter((item) => {
      // 1文字ワードは学習対象から外す
      item = item.trim()
      if (item.length <= 1) return false
      return true
    })

    // ヘッダを学習対象に追加
    words = words.concat(await this.getHeaderArray(message))

    return words
  }

  /**
   * 学習・判定用のメールヘッダ配列を返す
   * @param message メッセージオブジェクト
   */
  private async getHeaderArray(
    message: browser.messages.MessageHeader
  ): Promise<string[]> {
    let ret: string[] = []
    // From
    ret.push("from:" + this.getMailAddress(message.author))
    const from = this.getDomain(message.author)
    if (typeof from != "undefined") {
      ret.push("from:" + from)
    }

    // To
    for (const mail of message.recipients) {
      ret.push("to:" + this.getMailAddress(mail))
      const to = this.getDomain(mail)
      if (typeof to != "undefined") {
        ret.push("to:" + to)
      }
    }

    // cc
    for (const mail of message.ccList) {
      ret.push("cc:" + this.getMailAddress(mail))
      const cc = this.getDomain(mail)
      if (typeof cc != "undefined") {
        ret.push("cc:" + cc)
      }
    }

    return ret
  }

  private getMailAddress(mail: string): string {
    if (mail.length === 0) return ""
    let start = mail.lastIndexOf("<")

    let end = mail.lastIndexOf(">")
    if (end === -1) end = mail.length
    return mail.slice(start + 1, end)
  }
  /**
   * 指定されたアドレスのドメイン部分の学習対象文字列を返す
   * @param mail メールアドレス
   * @returns ドメイン部分。見つからない場合はundefined。
   */
  private getDomain(mail: string): string | undefined {
    mail = this.getMailAddress(mail)
    const ret = mail.split("@")
    if ((ret.length = 2)) {
      return ret[1]
    } else {
      return undefined
    }
  }

  /**
   * 指定したメールをスコアリングし分類タグをセットする
   * @param messageId 対象のメッセージid
   * @param isLearn 再学習時のタグ付けの場合はtrueをセット。統計情報のメール数を加算しない。
   */
  private async classificationMessage(
    message: browser.messages.MessageHeader,
    isReLearn: boolean = false
  ) {
    const messageId = message.id
    const tag: string = await this.judgeClassification(message)
    if (tag == "") return
    await this.setClassificationTag(messageId, tag, isReLearn)
  }

  /**
   * 指定したメッセージを評価して分類タグを返す
   * @param messageId 対象のメッセージid
   */
  private async judgeClassification(
    message: browser.messages.MessageHeader
  ): Promise<string> {
    const result = await this.scoring(message)
    const tag = this.ranking(result.scoreTotal)
    // ログに残す
    const logEntry = result.logEntry
    logEntry.id = await MessageUtil.getMailMessageId(message)
    logEntry.classifiedTag = tag
    logEntry.score = result.scoreTotal
    await logEntry.save()

    return tag
  }

  /**
   *  最も高いスコアのタグを返す
   * @param scores スコア一覧
   * @returns 最も高いスコアのタグ文字列を返す。スコアが何も指定されていない場合は0バイト文字列を返す。
   */
  private ranking(scores: TotalScore[]): string {
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
   * @param isReLearn 再学習のタグ付け処理の場合はtrueを指定。統計情報のメール数にカウントしない。
   */
  private async setClassificationTag(
    messageId: number,
    tagName: string,
    isReLearn: boolean = false
  ): Promise<void> {
    // 現在のメッセージのプロパティ取得
    const header = await browser.messages.get(messageId)

    // 分類用タグをすべて取り除く
    const newTags = header.tags.filter((item: string) => {
      for (const tag of this.tags_) {
        if (tag.useClassification) {
          if (tag.key == item) {
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

    // 統計情報更新
    if (isReLearn === false) {
      this.totalStatistics_.totalCount += 1
      this.todayStatistics_.totalCount += 1
    }

    await browser.messages.update(messageId, newProp)
  }

  private noticeNotSetting(): void {
    browser.notifications.create(backgroud.NOTIFY_ID_NOT_SET, {
      type: "basic",
      title: "AutoBucket",
      iconUrl: browser.extension.getURL("icons/icon_48.png"),
      message: browser.i18n.getMessage("infoNotSetting"),
    })
  }

  private noticeClearNotSetting(): void {
    browser.notifications.clear(backgroud.NOTIFY_ID_NOT_SET)
  }
}

/**
 * objectで戻ってくるscoreメソッド用に型定義
 */
interface Score {
  [key: string]: number
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

// ContentType引数用 ユニオン型
const ContentType = {
  PlainText: "text/plain",
  Html: "text/html",
}
type ContentType = typeof ContentType[keyof typeof ContentType]

const obj = new backgroud()
