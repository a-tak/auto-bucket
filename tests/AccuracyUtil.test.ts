import { describe, expect, it } from "vitest"

import AccuracyUtil from "@/lib/AccuracyUtil"

describe("AccuracyUtil", () => {
  it("returns zero when no messages have been judged", () => {
    expect(AccuracyUtil.calculate({ totalCount: 0, wrongCount: 0 })).toBe(0)
  })

  it("rounds accuracy to one decimal place", () => {
    expect(AccuracyUtil.calculate({ totalCount: 3, wrongCount: 1 })).toBe(66.7)
  })

  it("returns 100 when every judgment was correct", () => {
    expect(AccuracyUtil.calculate({ totalCount: 4, wrongCount: 0 })).toBe(100)
  })
})
