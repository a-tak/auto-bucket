import Tag from "@/models/Tag"

export interface ClassifierData {
  [key: string]: {
    word: Record<string, number>
  }
}

export interface GarbageCollectedModel {
  data: ClassifierData
  totalCount: number
}

export default class LearnModelUtil {
  static garbageCollect(
    source: ClassifierData,
    tags: Tag[]
  ): GarbageCollectedModel {
    const enabledKeys = new Set(
      tags.filter((tag) => tag.useClassification).map((tag) => tag.key)
    )
    const data = Object.fromEntries(
      Object.entries(source)
        .filter(([key]) => enabledKeys.has(key))
        .map(([key, value]) => [key, { word: { ...value.word } }])
    )
    const totalCount = Object.values(data).reduce(
      (categoryTotal, category) =>
        categoryTotal +
        Object.values(category.word).reduce(
          (wordTotal, count) => wordTotal + count,
          0
        ),
      0
    )

    return { data, totalCount }
  }
}
