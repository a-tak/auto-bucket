import Tag from "./Tag"

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

    headers.forEach((header, index) => {
      let useClassification = false
      if (resultObj != undefined) {
        // 分類用タグ設定の判定
        if (resultObj.tags.indexOf(header.key) >=0) {
          useClassification = true
        }
      }

      tags.push(new Tag(index, header.key, header.tag, useClassification))
    })

    console.log("Load Tags = " + JSON.stringify(tags, null, 4))
    return tags
  }

  public static async loadByArray(): Promise<Array<string>> {
    const tags = await this.load()
    const tagsArray: string[] = []
    for (const tag of tags) {
      tagsArray.push(tag.name)
    }
    return tagsArray
  }

  public static async save(tags: Tag[]) {
    const tagArray: string[] = []
    for (const tag of tags) {
      if (tag.useClassification) {
        tagArray.push(tag.name)
      }
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
