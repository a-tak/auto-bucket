// @vitest-environment jsdom

import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useStatistics } from "@/hooks/useStatistics"
import StatisticsUtil from "@/lib/StatisticsUtil"

vi.mock("@/lib/StatisticsUtil", () => ({
  default: {
    loadTotalStatistics: vi.fn(),
    getListStatisticsFromStorage: vi.fn(),
  },
}))

describe("useStatistics", () => {
  beforeEach(() => {
    vi.mocked(StatisticsUtil.loadTotalStatistics).mockResolvedValue({
      date: new Date("2026-08-23T00:00:00.000Z"),
      totalCount: 3,
      wrongCount: 1,
    })
    vi.mocked(StatisticsUtil.getListStatisticsFromStorage).mockResolvedValue([
      {
        date: new Date("2026-08-22T00:00:00.000Z"),
        totalCount: 0,
        wrongCount: 0,
      },
      {
        date: new Date("2026-08-23T00:00:00.000Z"),
        totalCount: 3,
        wrongCount: 1,
      },
    ])
  })

  it("builds chart data without NaN when a day has no judgments", async () => {
    const { result } = renderHook(() => useStatistics())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.totalAccuracy).toBe(66.7)
    expect(result.current.accuracyData.labels).toEqual(["8/22", "8/23"])
    expect(result.current.accuracyData.datasets[0].data).toEqual([0, 66.7])
  })
})
