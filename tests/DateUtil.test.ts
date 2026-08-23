import { describe, expect, it } from "vitest"

import DateUtil from "@/lib/DateUtil"

describe("DateUtil", () => {
  it("formats a local date as YYYY-MM-DD with zero padding", () => {
    expect(DateUtil.getYYYYMMDD(new Date(2026, 0, 5))).toBe("2026-01-05")
  })

  it("formats a local date as M/D without zero padding", () => {
    expect(DateUtil.getMD(new Date(2026, 10, 9))).toBe("11/9")
  })
})
