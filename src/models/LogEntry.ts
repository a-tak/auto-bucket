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
    const keyname = "log_" + this.id
    await browser.storage.sync.set({ [keyname]: this })
  }

  public async load(): Promise<boolean> {
    if (this.id_ == "" || this.id_ == undefined) throw new Error("Not set id")
    const keyname = "log_" + this.id
    const log = (await browser.storage.sync.get(keyname)) as {
      [kenyname: string]: LogEntry
    }
    const entry = log[keyname]
    if (typeof entry == "undefined") {
      // まだ一回も判定していない場合はみつからない
      return false
    }

    if (entry == undefined) {
      // まだ判定していないメールの場合はみつからない
      return false
    }

    // ストレージにはクラス変数名で保存されている(このクラスのプロパティ名でアクセスしても取れないので注意)
    // TODO: JSON.parseとかでそのままデシリアライズできるのでは?
    this.classifiedTag_ = entry.classifiedTag_
    this.logDate_ = entry.logDate_
    this.scoreEachWord_ = entry.scoreEachWord_
    this.targetText_ = entry.targetText_

    return true
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
