import StatisticsLog from "@/models/StatisticsLog"
import msgUtil from "./MessageUtil"
import ReLearnLog from "@/models/ReLearnLog"

export default class StatisticsUtil {
  static readonly STATISTICS_LOG_PREFIX = "__stat_"
  static readonly RE_LEARN_LOG_PREFIX = "__relog_"
  static readonly DELETE_STATISTICS_PAST_DAY: number = 30
  static readonly DELETE_RE_LEARN_LOG_PAST_DAY: number = 30

  public static async loadTotalStatistics(): Promise<StatisticsLog> {
    let result = (await browser.storage.sync.get("statistics")) as {
      statistics: StatisticsLog
    }

    if (result.statistics == undefined) {
      result.statistics = this.getInitialObj()
    }
    return result.statistics
  }

  public static async saveTotalStatistics(value: StatisticsLog) {
    await browser.storage.sync.set({
      statistics: value,
    })
  }

  /**
   * 指定した日付の統計情報を取得する
   * @param date
   * @returns ストレージに情報がなければ指定された日付の空の統計情報を返す
   */
  public static async loadStatsitics(date: Date): Promise<StatisticsLog> {
    const keyname = this.STATISTICS_LOG_PREFIX + date.toDateString()

    let result = (await browser.storage.sync.get(keyname)) as {
      [keyname: string]: StatisticsLogObj
    }
    console.log("load obj " + JSON.stringify(result, null, 4))

    let obj = result[keyname]
    if (typeof obj === "undefined") {
      return this.getInitialObj()
    }
    console.log("load obj2 " + JSON.stringify(obj, null, 4))
    const ret = this.toStatisticsLog(obj)
    console.log("stat load")
    console.log(ret)
    return ret
  }

  public static toStatisticsLog(obj: StatisticsLogObj): StatisticsLog {
    const ret: StatisticsLog = {
      date: new Date(obj.date),
      totalCount: obj.totalCount,
      wrongCount: obj.wrongCount,
    }
    return ret
  }

  public static toStatistcsObj(log: StatisticsLog): StatisticsLogObj {
    if (typeof log.date === "undefined")
      throw new Error("not set date property of StatisticsLog")
    console.log("toObj")
    console.log(log)
    console.log(log.totalCount)
    console.log(log)
    console.log("toS" + JSON.stringify(log, null, 4))
    const ret: StatisticsLogObj = {
      date: log.date.toISOString(),
      totalCount: log.totalCount,
      wrongCount: log.wrongCount,
    }
    return ret
  }

  public static async saveStatistics(statLog: StatisticsLog, date: Date) {
    console.log("ここでは値ある?↓")
    console.log(statLog.totalCount)
    const obj = this.toStatistcsObj(statLog)
    const keyname = this.STATISTICS_LOG_PREFIX + date.toDateString()
    await browser.storage.sync.set({
      [keyname]: obj,
    })
    console.log("stat save")
    console.log(statLog)
    console.log(obj)
    console.log(statLog.totalCount)
  }

  /**
   * 古い日付の統計データを削除する
   */
  public static async removeOldStatistics() {
    const nowDate = new Date()
    const deleteDate = this.DELETE_STATISTICS_PAST_DAY

    this.listStatistics(async (keyName, log) => {
      if (typeof log.date != "undefined") {
        const dateDiff =
          (nowDate.getTime() - log.date.getTime()) / (1000 * 60 * 60 * 24)
        if (dateDiff > deleteDate) {
          console.log("remove learn log " + keyName)
          browser.storage.sync.remove(keyName)
        }
      }
    })
  }

  /**
   * 日付昇順にソートした統計オブジェクトの配列を返す
   */
  public static async getListStatistics(): Promise<StatisticsLog[]> {
    const ret: StatisticsLog[] = []
    await this.listStatistics(async (keyname, log) => {
        console.log("get key" + keyname)
      ret.push(log)
    })
    const retSorted: StatisticsLog[] = ret.sort((a, b): number => {
      const aDate = typeof a.date === "undefined" ? new Date(0) : a.date
      const bDate = typeof b.date === "undefined" ? new Date(0) : b.date

      return aDate.getDate() - bDate.getDate()
    })

    return retSorted
  }

  /**
   * 日付毎の統計オブジェクト毎にコールバックで指定された処理を実行する
   * @param callback 統計オブジェクト毎に行いたい処理を指定
   */
  public static async listStatistics(
    callback: (keyName: string, log: StatisticsLog) => Promise<void>
  ) {
    // まずsettingが名前インデックス付きであることを定義
    const setting = (await browser.storage.sync.get(null)) as {
      [keyname: string]: object
    }

    const ret: StatisticsLog[] = []
    for (const item in setting) {
      // キーの先頭文字でログであることを判断。他の設定で同様のキーを作ると誤動作する。
      if (item.indexOf(this.STATISTICS_LOG_PREFIX, 0) === 0) {
        // いけてないがここまでくるとオブジェクトの中にstatisticsメンバがあるのは間違いなのでasで指定して読み込む
        const log = this.toStatisticsLog(setting[item] as StatisticsLogObj)
        callback(item, log)
      }
    }
    return ret
  }

  public static getInitialObj(): StatisticsLog {
    return {
      date: new Date(),
      totalCount: 0,
      wrongCount: 0,
    }
  }

  public static async isReLearned(
    message: browser.messages.MessageHeader
  ): Promise<boolean> {
    if (typeof (await this.loadReLearnLog(message)) === "undefined") {
      return false
    }
    console.log("typeoff" + typeof (await this.loadReLearnLog(message)))
    return true
  }

  public static async loadReLearnLog(
    message: browser.messages.MessageHeader
  ): Promise<ReLearnLog | undefined> {
    const messageId: string = await msgUtil.getMailMessageId(message)
    const keyname: string = this.RE_LEARN_LOG_PREFIX + messageId
    const ret = (await browser.storage.sync.get(keyname)) as {
      [kenyname: string]: ReLearnLogObj
    }
    const rellog: ReLearnLog | undefined = this.toReLearnLog(ret[keyname])
    if (typeof rellog === "undefined") {
      // 再学習していない場合
      return undefined
    }
    return rellog
  }

  public static async saveReLearnLog(log: ReLearnLog) {
    const messageId = log.messageId
    const keyname = this.RE_LEARN_LOG_PREFIX + messageId
    await browser.storage.sync.set({ [keyname]: this.toReLearnObj(log) })
  }

  /**
   * 古い日付の再学習ログデータを削除する
   */
  public static async removeOldReLearnLog() {
    const nowDate = new Date()
    const deleteDate = this.DELETE_RE_LEARN_LOG_PAST_DAY

    this.listReLearnLog(async (keyName, log) => {
      if (typeof log.date != "undefined") {
        const dateDiff =
          (nowDate.getTime() - log.date.getTime()) / (1000 * 60 * 60 * 24)
        if (dateDiff > deleteDate) {
          browser.storage.sync.remove(keyName)
          console.log("remove statistics log " + keyName)
        }
      }
    })
  }

  /**
   * 再学習ログに順次処理を行う
   * @param callback 再学習ログ毎に行いたい処理を指定
   */
  public static async listReLearnLog(
    callback: (keyName: string, log: ReLearnLog) => Promise<void>
  ) {
    // まずsettingが名前インデックス付きであることを定義
    const setting = (await browser.storage.sync.get(null)) as {
      [keyname: string]: object
    }

    const ret: ReLearnLog[] = []
    for (const item in setting) {
      // キーの先頭文字でログであることを判断。他の設定で同様のキーを作ると誤動作する。
      if (item.indexOf(this.RE_LEARN_LOG_PREFIX, 0) === 0) {
        // いけてないがここまでくるとオブジェクトの中にstatisticsメンバがあるのは間違いなのでasで指定して読み込む
        const log: ReLearnLog | undefined = this.toReLearnLog(
          setting[item] as ReLearnLogObj
        )
        if (typeof log != "undefined") {
          callback(item, log)
        }
      }
    }
    return ret
  }

  public static toReLearnLog(obj: ReLearnLogObj): ReLearnLog | undefined {
    if (obj === undefined) return undefined
    const ret: ReLearnLog = {
      messageId: obj.messageId,
      date: new Date(obj.date),
      previousClassification: obj.previousClassification,
      changedClassification: obj.changedClassification,
    }
    return ret
  }

  public static toReLearnObj(log: ReLearnLog): ReLearnLogObj {
    const ret: ReLearnLogObj = {
      messageId: log.messageId,
      date: log.date.toISOString(),
      previousClassification: log.previousClassification,
      changedClassification: log.changedClassification,
    }
    return ret
  }
}

interface StatisticsLogObj {
  date: string
  totalCount: number
  wrongCount: number
}

interface ReLearnLogObj {
  messageId: string /* メールを一意に特定するMessage-IDヘッダの値 */
  date: string
  previousClassification: string /* 再学習前の分類 */
  changedClassification: string /* 再学習後の分類 */
}
