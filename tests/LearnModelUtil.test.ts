import { describe, expect, it } from "vitest"

import LearnModelUtil from "@/lib/LearnModelUtil"
import Tag from "@/models/Tag"

describe("LearnModelUtil", () => {
  it("keeps only enabled existing tags and recalculates the total count", () => {
    const source = {
      keep: { word: { a: 2, b: 1 } },
      disabled: { word: { a: 5 } },
      stale: { word: { a: 9 } },
    }
    const tags = [
      new Tag(0, "keep", "Keep", true),
      new Tag(1, "disabled", "Disabled", false),
    ]

    expect(LearnModelUtil.garbageCollect(source, tags)).toEqual({
      data: { keep: { word: { a: 2, b: 1 } } },
      totalCount: 3,
    })
    expect(source).toEqual({
      keep: { word: { a: 2, b: 1 } },
      disabled: { word: { a: 5 } },
      stale: { word: { a: 9 } },
    })
  })

  it("returns an empty model when no classification tag is enabled", () => {
    expect(
      LearnModelUtil.garbageCollect({ stale: { word: { a: 4 } } }, [
        new Tag(0, "stale", "Stale", false),
      ])
    ).toEqual({ data: {}, totalCount: 0 })
  })
})
