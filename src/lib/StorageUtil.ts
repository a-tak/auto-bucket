export default class StorageUtil {
  /**
   * ストレージから全設定データを取得する
   */
  public static async getStorageAll(): Promise<StorageObj> {
    // まずsettingが名前インデックス付きであることを定義
    return (await browser.storage.local.get(null)) as StorageObj
  }
  /**
   * Syncストレージから全設定データを取得する(データ移行用)
   */
  public static async getSyncStorageAll(): Promise<StorageObj> {
    return (await browser.storage.sync.get(null)) as StorageObj
  }
  /**
   * Localストレージへ全設定データを書き込む(データ移行用)
   */
  public static async setLocalStorageAll(storageObj: StorageObj): Promise<void> {
    await browser.storage.local.set(storageObj)
  }
  /**
   * Syncストレージの全設定データ削除(データ移行用)
   */
  public static async clearSyncStorageAll(): Promise<void> {
    await browser.storage.sync.clear()
  }
}

/**
 * ストレージ(設定)用 型定義
 */
export interface StorageObj {
  [keyname: string]: object
}
