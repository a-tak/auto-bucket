import StatisticsLog from "@/models/StatisticsLog"
import msgUtil from "./MessageUtil"
import ReLearnLog from "@/models/ReLearnLog"
import pMap from "p-map"
import { StorageObj } from "./StorageUtil"
import StorageUtil from "./StorageUtil"

export default class StatisticsUtil {
  static readonly STATISTICS_LOG_PREFIX = "__stat_"
  static readonly RE_LEARN_LOG_PREFIX = "__relog_"
  static readonly TOTAL_STATISTICS_KEY: string = "statistics"
  static readonly DELETE_STATISTICS_PAST_DAY: number = 30
  static readonly DELETE_RE_LEARN_LOG_PAST_DAY: number = 0
  /** 再学習ログの並行処理数 */
  static readonly DELETE_RE_LEARN_LOG_CONCURRENCY: number = 10

  public static async loadTotalStatistics(): Promise<StatisticsLog> {
    const result = (await browser.storage.local.get(
      this.TOTAL_STATISTICS_KEY
    )) as {
      statistics: StatisticsLogObj
    }

    if (result.statistics == undefined) {
      return this.getInitialObj()
    }
    return this.toStatisticsLog(result.statistics)
  }

  public static async saveTotalStatistics(value: StatisticsLog) {
    // 統計情報がリセットされていたら今日の日付をセットする
    if (typeof value.date === "undefined") {
      value.date = new Date()
    }
    const obj = this.toStatistcsObj(value)
    await browser.storage.local.set({
      [this.TOTAL_STATISTICS_KEY]: obj,
    })
  }

  public static async removeTotalStatistics() {
    await browser.storage.local.remove(this.TOTAL_STATISTICS_KEY)
  }

  /**
   * 指定した日付の統計情報を取得する
   * @param date
   * @returns ストレージに情報がなければ指定された日付の空の統計情報を返す
   */
  public static async loadStatsitics(date: Date): Promise<StatisticsLog> {
    const keyname = this.STATISTICS_LOG_PREFIX + date.toDateString()

    let result = (await browser.storage.local.get(keyname)) as {
      [keyname: string]: StatisticsLogObj
    }

    let obj = result[keyname]
    if (typeof obj === "undefined") {
      return this.getInitialObj()
    }
    const ret = this.toStatisticsLog(obj)
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
    const ret: StatisticsLogObj = {
      date: log.date.toISOString(),
      totalCount: log.totalCount,
      wrongCount: log.wrongCount,
    }
    return ret
  }

  public static async saveStatistics(statLog: StatisticsLog, date: Date) {
    const obj = this.toStatistcsObj(statLog)
    const keyname = this.STATISTICS_LOG_PREFIX + date.toDateString()
    await browser.storage.local.set({
      [keyname]: obj,
    })
  }

  /**
   * 古い日付の統計データを削除する
   */
  public static async removeOldStatistics(setting: StorageObj) {
    const nowDate = new Date()
    const deleteDate = this.DELETE_STATISTICS_PAST_DAY

    this.listStatistics(async (keyName, log) => {
      if (typeof log.date != "undefined") {
        const dateDiff =
          (nowDate.getTime() - log.date.getTime()) / (1000 * 60 * 60 * 24)
        if (dateDiff > deleteDate) {
          await browser.storage.local.remove(keyName)
        }
      }
    }, setting)
  }

  /**
   * 日付毎の統計情報をすべて削除する
   */
  public static async removeAllStatistics() {
    const setting = await StorageUtil.getStorageAll()
    this.listStatistics(async (keyName) => {
      await browser.storage.local.remove(keyName)
    }, setting)
  }

  public static async getListStatisticsFromStorage(): Promise<StatisticsLog[]> {
    const setting = await StorageUtil.getStorageAll()
    return await this.getListStatistics(setting)
  }

  /**
   * 日付昇順にソートした統計オブジェクトの配列を返す
   */
  public static async getListStatistics(
    setting: StorageObj
  ): Promise<StatisticsLog[]> {
    const ret: StatisticsLog[] = []
    await this.listStatistics(async (keyname, log) => {
      ret.push(log)
    }, setting)

    const retSorted: StatisticsLog[] = ret.sort((a, b): number => {
      const aDate = typeof a.date === "undefined" ? new Date(0) : a.date
      const bDate = typeof b.date === "undefined" ? new Date(0) : b.date
      return aDate.getTime() - bDate.getTime()
    })

    return retSorted
  }

  public static async resetStatistics() {
    const promises: Promise<void>[] = []
    promises.push(this.removeTotalStatistics())
    promises.push(this.removeAllStatistics())
    promises.push(this.removeAllReLearnLog())

    await Promise.all(promises)
  }

  /**
   * 日付毎の統計オブジェクト毎にコールバックで指定された処理を実行する
   * @param callback 統計オブジェクト毎に行いたい処理を指定
   */
  public static async listStatistics(
    callback: (keyName: string, log: StatisticsLog) => Promise<void>,
    setting: StorageObj
  ) {
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
    return true
  }

  public static async loadReLearnLog(
    message: browser.messages.MessageHeader
  ): Promise<ReLearnLog | undefined> {
    const messageId: string = await msgUtil.getMailMessageId(message)
    const keyname: string = this.RE_LEARN_LOG_PREFIX + messageId
    const ret = (await browser.storage.local.get(keyname)) as {
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
    await browser.storage.local.set({ [keyname]: this.toReLearnObj(log) })
  }

  /**
   * 古い日付の再学習ログデータを削除する
   */
  public static async removeOldReLearnLog(setting: StorageObj) {
    const nowDate = new Date()
    const deleteDate = this.DELETE_RE_LEARN_LOG_PAST_DAY

    const keys: string[] = []
    await this.listReLearnLog(async (keyName, log) => {
      if (typeof log.date != "undefined") {
        const dateDiff =
          (nowDate.getTime() - log.date.getTime()) / (1000 * 60 * 60 * 24)
        if (dateDiff > deleteDate) {
          keys.push(keyName)
        }
      }
    }, setting)
    // 負荷を抑えるために非同期処理の並行処理数を制限する
    await pMap(
      keys,
      async (keyName) => {
        await browser.storage.local.remove(keyName)
      },
      { concurrency: this.DELETE_RE_LEARN_LOG_CONCURRENCY }
    )
  }

  /**
   * 再学習ログデータをすべて削除する
   */
  public static async removeAllReLearnLog() {
    const setting = await StorageUtil.getStorageAll()
    this.listReLearnLog(async (keyName) => {
      browser.storage.local.remove(keyName)
    }, setting)
  }

  /**
   * 再学習ログに順次処理を行う
   * @param callback 再学習ログ毎に行いたい処理を指定
   */
  public static async listReLearnLog(
    callback: (keyName: string, log: ReLearnLog) => Promise<void>,
    setting: StorageObj
  ) {
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
