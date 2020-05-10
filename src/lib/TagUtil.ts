import Tag from "../models/Tag"

/**
 * タグユーティリティークラス
 */
export default class TagUtil {
  /**
   * 設定画面用にタグ一覧を返す
   * またストレージから設定を読み込み分類につかうタグにフラグをつけて返す
   * @returns Tagクラスの配列の参照。idも設定済み
   */
  public static async load(): Promise<Tag[]> {
    const tags: Tag[] = []
    const resultObj = (await browser.storage.sync.get("tags")) as {
      tags: string[]
    }

    // Thunderbirdのタグを読み込み
    const headers = await browser.messages.listTags()
    if (headers != undefined) {
      headers.forEach((header, index) => {
        let useClassification = false
        if (resultObj.tags != undefined) {
          // 分類用タグ設定の判定
          if (resultObj.tags.indexOf(header.key) >= 0) {
            useClassification = true
          }
        }

        tags.push(new Tag(index, header.key, header.tag, useClassification))
      })
    }

    // console.log("Load Tags = " + JSON.stringify(tags, null, 4))
    return tags
  }

  /**
   * 分類対象タグの設定を保存する
   *
   * 渡されたTagオブジェクトをストレージに保存する。
   * loadは分類対象のタグとThunderbird内に設定されている全てのタグを返すが、
   * このメソッドは分類対象タグかどうかを判断していないので分類対象のタグのみを渡さなくてはいけない(loadとは非対称な動きなので注意)
   * このような動作としているのは保存する対象を渡せば良いというシンプルな動きにしたかったため。
   * TODO: いずれ現在のloadメソッドはThunderbird内のタグをすべて返さない形にしてsaveと対象な動きになるようにする。
   *       現在と同じ動作のメソッドは名称を変更して別に作成する。
   *
   * @param tags
   */
  public static async save(tags: Tag[]) {
    const tagArray: string[] = []
    for (const tag of tags) {
      // useClassificationは見ずにオブジェクトが渡ってきたら保存対象にする
      tagArray.push(tag.key)
      // console.log("target tag=" + JSON.stringify(tag,null, 4))
    }

    await browser.storage.sync.set({
      tags: tagArray,
    })

    // console.log(
    //   "Save Tags = " +
    //     JSON.stringify(
    //       (await browser.storage.sync.get("tags")) as {
    //         tags: string[]
    //       }
    //     )
    // )
  }
}
