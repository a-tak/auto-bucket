import StatisticsLog from "@/models/StatisticsLog"

export default class StatisticsUtil {
  public static async LoadTotalStatistics(): Promise<StatisticsLog> {
    let result = (await browser.storage.sync.get("statistics")) as {
      statistics: StatisticsLog
    }

    if (result.statistics == undefined) {
      result.statistics = this.getInitialObj()
    }
    return result.statistics
  }
  public static async SaveTotalStatistics(value: StatisticsLog) {
    browser.storage.sync.set({
      statistics: value,
    })
  }
  public static getInitialObj(): StatisticsLog {
    return {
      totalCount: 0,
      wrongCount: 0,
    }
  }
}
