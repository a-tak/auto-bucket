export default class StorageUtil {
  /**
   * ストレージから全設定データを取得する
   */
  public static async getStorageAll(): Promise<StorageObj> {
    // まずsettingが名前インデックス付きであることを定義
    return (await browser.storage.sync.get(null)) as StorageObj
  }
}

/**
 * ストレージ(設定)用 型定義
 */
export interface StorageObj {
  [keyname: string]: object
}
