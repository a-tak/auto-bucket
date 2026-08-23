import TotalScore from "../models/TotalScore"

export default class ClassificationUtil {
  public static sortByScore(scores: TotalScore[]): TotalScore[] {
    return [...scores].sort((a, b) => b.score - a.score)
  }

  public static ranking(scores: TotalScore[]): string {
    if (scores.length === 0) return ""

    return scores.reduce((best, current) =>
      current.score > best.score ? current : best
    ).category
  }
}
