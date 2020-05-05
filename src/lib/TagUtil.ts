import Tag from "./Tag"

/**
 * 分類用タグを管理するクラス
 * 内部参照をそのまま返しているがVue.jsの画面とリンクさせるため仕方ない
 */
export default class TagUtil {
  /**
   * ストレージから分類用タグを読み込む
   * @returns Tagクラスの配列の参照。idも設定済み
   */
  public static async load(): Promise<Tag[]>{
    const tags: Tag[] = []
    const resultObj = await browser.storage.sync.get("tags") as {
      tags: string[]
    }

    if (resultObj != undefined) {
      resultObj.tags.forEach((tag, index) => {
        tags.push(new Tag(index, tag))
      })
    }
    console.log("Load Tags = " + JSON.stringify(tags, null, 4))
    return tags
  }

  public static async save(tags: Tag[]){
    const tagArray: string[] = [] 
    for (const tag of tags) {
      tagArray.push(tag.name)
    }

    await browser.storage.sync.set({
      tags: tagArray
    })

    console.log("Save Tags = " + JSON.stringify(await browser.storage.sync.get("tags") as {
      tags: string[]
    }))

  }

  public static getRemovedList(tags: Tag[], tag: Tag): Tag[] {
    const index = tags.indexOf(tag)
    tags.splice(index, 1)
    return tags
  }

  public static getNewTag(tags: Tag[]) {
    const max: number = tags.reduce((a, b) => {
      if (a.id > b.id) {
        return a
      }else{
        return b
      }
    }).id

    return new Tag(max + 1, "")
 }
}