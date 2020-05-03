
export default class Tag {

  private id_: number
  private name_: string

  /**
   * コンストラクタ
   */
  constructor(id: number, name: string) {
    this.id_ = id
    this.name_ = name
  }

  public get id(): number {
    return this.id_
  }
  public set id(value: number) {
    this.id_ = value
  }
  get name(): string { return this.name_ }
  set name(value: string) { this.name_ = value }
}
