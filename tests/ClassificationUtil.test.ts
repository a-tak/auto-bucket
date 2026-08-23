import { describe, expect, it } from "vitest"

import ClassificationUtil from "@/lib/ClassificationUtil"

describe("ClassificationUtil", () => {
  it("returns an empty category for an empty score list", () => {
    expect(ClassificationUtil.ranking([])).toBe("")
  })

  it("returns the category with the highest score", () => {
    expect(
      ClassificationUtil.ranking([
        { category: "tag-a", score: 0.2 },
        { category: "tag-b", score: 0.9 },
      ])
    ).toBe("tag-b")
  })

  it("keeps the first category when scores are tied", () => {
    expect(
      ClassificationUtil.ranking([
        { category: "tag-a", score: 0.5 },
        { category: "tag-b", score: 0.5 },
      ])
    ).toBe("tag-a")
  })

  it("sorts a copy for score-log display without mutating the caller", () => {
    const scores = [
      { category: "tag-a", score: 0.2 },
      { category: "tag-b", score: 0.9 },
    ]

    const sorted = ClassificationUtil.sortByScore(scores)

    expect(sorted.map((item) => item.category)).toEqual(["tag-b", "tag-a"])
    expect(scores.map((item) => item.category)).toEqual(["tag-a", "tag-b"])
  })
})
