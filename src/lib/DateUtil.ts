export default class DateUtil {
  // 現地時間のyyyy-mm-dd形式の文字列を返す
  public static getYYYYMMDD(d: Date): string {
    return `${d.getFullYear().toString()}-${(
      "0" + (d.getMonth() + 1).toString()
    ).slice(-2)}-${("0" + d.getDate().toString()).slice(-2)}`
  }
  public static getMD(d: Date): string {
    return `${(d.getMonth() + 1).toString()}/${d.getDate().toString()}`
  }
}
