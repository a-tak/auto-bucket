import { beforeEach, describe, expect, it, vi } from "vitest"

import StatisticsUtil from "@/lib/StatisticsUtil"

describe("StatisticsUtil", () => {
  it("serializes and restores a statistics log", () => {
    const date = new Date("2026-08-23T01:02:03.000Z")

    const stored = StatisticsUtil.toStatistcsObj({
      date,
      totalCount: 10,
      wrongCount: 2,
    })

    expect(stored).toEqual({
      date: "2026-08-23T01:02:03.000Z",
      totalCount: 10,
      wrongCount: 2,
    })
    expect(StatisticsUtil.toStatisticsLog(stored)).toEqual({
      date,
      totalCount: 10,
      wrongCount: 2,
    })
  })

  it("rejects statistics without a date before storage", () => {
    expect(() =>
      StatisticsUtil.toStatistcsObj({ totalCount: 1, wrongCount: 0 })
    ).toThrow("not set date property of StatisticsLog")
  })

  it("returns daily statistics in ascending date order and ignores other settings", async () => {
    const result = await StatisticsUtil.getListStatistics({
      unrelated: { value: true },
      __stat_later: {
        date: "2026-08-23T00:00:00.000Z",
        totalCount: 2,
        wrongCount: 1,
      },
      __stat_earlier: {
        date: "2026-08-21T00:00:00.000Z",
        totalCount: 3,
        wrongCount: 0,
      },
    })

    expect(result.map((log) => log.date?.toISOString())).toEqual([
      "2026-08-21T00:00:00.000Z",
      "2026-08-23T00:00:00.000Z",
    ])
  })

  it("waits for asynchronous statistics callbacks", async () => {
    const completed: string[] = []

    await StatisticsUtil.listStatistics(
      async (key) => {
        await new Promise((resolve) => setTimeout(resolve, 0))
        completed.push(key)
      },
      {
        __stat_today: {
          date: "2026-08-23T00:00:00.000Z",
          totalCount: 1,
          wrongCount: 0,
        },
      }
    )

    expect(completed).toEqual(["__stat_today"])
  })

  it("waits for asynchronous re-learning callbacks", async () => {
    const completed: string[] = []

    await StatisticsUtil.listReLearnLog(
      async (key) => {
        await new Promise((resolve) => setTimeout(resolve, 0))
        completed.push(key)
      },
      {
        __relog_message: {
          messageId: "<message@example.com>",
          date: "2026-08-23T00:00:00.000Z",
          previousClassification: "tag-a",
          changedClassification: "tag-b",
        },
      }
    )

    expect(completed).toEqual(["__relog_message"])
  })

  it("waits until all daily statistics have been removed", async () => {
    const removed: string[] = []
    vi.stubGlobal("browser", {
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({
            unrelated: { value: true },
            __stat_today: {
              date: "2026-08-23T00:00:00.000Z",
              totalCount: 1,
              wrongCount: 0,
            },
          }),
          remove: vi.fn(async (key: string) => {
            await new Promise((resolve) => setTimeout(resolve, 0))
            removed.push(key)
          }),
        },
      },
    })

    await StatisticsUtil.removeAllStatistics()

    expect(removed).toEqual(["__stat_today"])
  })
})

describe("StatisticsUtil persistence", () => {
  const get = vi.fn()
  const set = vi.fn()

  beforeEach(() => {
    vi.stubGlobal("browser", {
      storage: { local: { get, set, remove: vi.fn() } },
    })
  })

  it("saves and restores total statistics with an ISO date", async () => {
    const date = new Date("2026-08-23T01:02:03.000Z")
    const stored = {
      date: date.toISOString(),
      totalCount: 8,
      wrongCount: 2,
    }
    get.mockResolvedValue({ statistics: stored })

    await StatisticsUtil.saveTotalStatistics({
      date,
      totalCount: 8,
      wrongCount: 2,
    })
    await expect(StatisticsUtil.loadTotalStatistics()).resolves.toEqual({
      date,
      totalCount: 8,
      wrongCount: 2,
    })

    expect(set).toHaveBeenCalledWith({ statistics: stored })
    expect(get).toHaveBeenCalledWith("statistics")
  })

  it("uses a date-specific key for daily statistics", async () => {
    const date = new Date("2026-08-23T00:00:00.000Z")
    const key = `__stat_${date.toDateString()}`
    const stored = {
      date: date.toISOString(),
      totalCount: 4,
      wrongCount: 1,
    }
    get.mockResolvedValue({ [key]: stored })

    await StatisticsUtil.saveStatistics(
      { date, totalCount: 4, wrongCount: 1 },
      date
    )
    await expect(StatisticsUtil.loadStatsitics(date)).resolves.toEqual({
      date,
      totalCount: 4,
      wrongCount: 1,
    })

    expect(set).toHaveBeenCalledWith({ [key]: stored })
    expect(get).toHaveBeenCalledWith(key)
  })

  it("saves a re-learning log with an ISO date", async () => {
    const date = new Date("2026-08-23T02:00:00.000Z")

    await StatisticsUtil.saveReLearnLog({
      messageId: "message-id",
      date,
      previousClassification: "tag-a",
      changedClassification: "tag-b",
    })

    expect(set).toHaveBeenCalledWith({
      "__relog_message-id": {
        messageId: "message-id",
        date: date.toISOString(),
        previousClassification: "tag-a",
        changedClassification: "tag-b",
      },
    })
  })
})
