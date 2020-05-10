/**
 * ログエントリを表すクラス
 */
export default class LogEntry {
  private id_: string
  public get id(): string {
    return this.id_
  }
  public set id(v: string) {
    this.id_ = v
  }
  private logDate_: Date
  public get logDate(): Date {
    return this.logDate_
  }
  public set logDate(v: Date) {
    this.logDate_ = v
  }
  private scoreEachWord_: LogScore
  public get scoreEachWord(): LogScore {
    return this.scoreEachWord_
  }
  public set scoreEachWord(v: LogScore) {
    this.scoreEachWord_ = v
  }
  private targetText_: string[]
  public get targetText(): string[] {
    return this.targetText_
  }
  public set targetText(v: string[]) {
    this.targetText_ = v
  }
  private classifiedTag_: string
  public get classifiedTag(): string {
    return this.classifiedTag_
  }
  public set classifiedTag(v: string) {
    this.classifiedTag_ = v
  }

  constructor() {
    this.id_ = ""
    this.logDate_ = new Date()
    this.scoreEachWord_ = {}
    this.targetText_ = []
    this.classifiedTag_ = ""
  }

  public async save() {
    if (this.id_ == "" || this.id_ == undefined) throw new Error("Not set id")
    if (Object.keys(this.scoreEachWord_).length == 0)
      throw new Error("Not set scoreEachWord")
    if (this.targetText_.length == 0) throw new Error("Not set targetText")
    if (this.classifiedTag_ == "" || this.classifiedTag_ == undefined)
      throw new Error("Not set classifiedTag")
    const log: {
      log: {
        [key: string]: LogEntry
      }
    } = {
      log: {
        [this.id_]: this,
      },
    }

    await browser.storage.sync.set(log)
    console.log(
      "logObj = " +
        JSON.stringify(await browser.storage.sync.get("log"), null, 4)
    )
  }
}

/**
 * 単語をキーとして出現回数とスコア合計が入った連想配列
 */
interface LogScore {
  [word: string]: {
    //単語をキーとして連想配列
    count: number // 単語の出現回数
    score: {
      // タグキー名をキーとした連想配列
      [tag: string]: number
    }
  }
}
