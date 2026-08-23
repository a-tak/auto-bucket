import StatisticsLog from "../models/StatisticsLog"

export default class AccuracyUtil {
  public static calculate(log: StatisticsLog): number {
    if (log.totalCount === 0) return 0
    return 100 - Math.round((log.wrongCount / log.totalCount) * 100 * 10) / 10
  }
}
