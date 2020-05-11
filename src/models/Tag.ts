export default class Tag {
  private id_: number /** リスト表示用インデックス */
  private key_: string /** ThunderbirdタグKey */
  private name_: string /** 表示用名称 */
  private useClassification_: boolean /** 分類に使用するタグかを表すフラグ */

  /**
   * コンストラクタ
  public set value(v : string) {
   */
  constructor(
    id: number,
    key: string,
    name: string,
    useClassification: boolean
  ) {
    this.id_ = id
    this.key_ = key
    this.name_ = name
    this.useClassification_ = useClassification
  }

  /**
   * valueはv-selectのitems用プロパティ
   */
  public get value() : Tag {
    return this
  }
  /**
   * textはv-selectのitems用プロパティ
   * 一旦、nameと同じ値を返すようにする
   */
  public get text() : string {
    return this.name_
  }
  public set text(v : string) {
    this.name_ = v
  }
  public get useClassification(): boolean {
    return this.useClassification_
  }
  public set useClassification(v: boolean) {
    this.useClassification_ = v
  }
  public get key(): string {
    return this.key_
  }
  public set key(v: string) {
    this.key_ = v
  }
  public get id(): number {
    return this.id_
  }
  public set id(value: number) {
    this.id_ = value
  }
  get name(): string {
    return this.name_
  }
  set name(value: string) {
    this.name_ = value
  }
}
