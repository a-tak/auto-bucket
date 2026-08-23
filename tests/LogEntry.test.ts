import { beforeEach, describe, expect, it, vi } from "vitest"

import LogEntry from "@/models/LogEntry"

describe("LogEntry", () => {
  const get = vi.fn()
  const set = vi.fn()

  beforeEach(() => {
    vi.stubGlobal("browser", {
      storage: { local: { get, set } },
    })
  })

  it("requires an id before saving", async () => {
    await expect(new LogEntry().save()).rejects.toThrow("Not set id")
  })

  it("requires word scores before saving", async () => {
    const entry = new LogEntry()
    entry.id = "message-id"

    await expect(entry.save()).rejects.toThrow("Not set scoreEachWord")
  })

  it("requires target text before saving", async () => {
    const entry = new LogEntry()
    entry.id = "message-id"
    entry.scoreEachWord = { word: { count: 1, score: { tag: 0.5 } } }

    await expect(entry.save()).rejects.toThrow("Not set targetText")
  })

  it("requires a classified tag before saving", async () => {
    const entry = new LogEntry()
    entry.id = "message-id"
    entry.scoreEachWord = { word: { count: 1, score: { tag: 0.5 } } }
    entry.targetText = ["word"]

    await expect(entry.save()).rejects.toThrow("Not set classifiedTag")
  })

  it("stores a complete entry under its message-id key", async () => {
    const entry = new LogEntry()
    entry.id = "message-id"
    entry.scoreEachWord = { word: { count: 1, score: { tag: 0.5 } } }
    entry.targetText = ["word"]
    entry.classifiedTag = "tag"
    entry.score = [{ category: "tag", score: 0.5 }]

    await entry.save()

    expect(set).toHaveBeenCalledWith({ "__log_message-id": entry })
  })

  it("returns false when no stored entry exists", async () => {
    get.mockResolvedValue({})
    const entry = new LogEntry()
    entry.id = "missing"

    await expect(entry.load()).resolves.toBe(false)
  })

  it("restores stored fields and converts the stored date to Date", async () => {
    get.mockResolvedValue({
      "__log_message-id": {
        classifiedTag_: "tag-b",
        logDate_: "2026-08-23T00:00:00.000Z",
        scoreEachWord_: { word: { count: 2, score: { "tag-b": 0.8 } } },
        totalScore_: [{ category: "tag-b", score: 0.8 }],
        targetText_: ["word"],
      },
    })
    const entry = new LogEntry()
    entry.id = "message-id"

    await expect(entry.load()).resolves.toBe(true)
    expect(entry.logDate).toEqual(new Date("2026-08-23T00:00:00.000Z"))
    expect(entry.classifiedTag).toBe("tag-b")
    expect(entry.score).toEqual([{ category: "tag-b", score: 0.8 }])
    expect(entry.scoreEachWord).toEqual({
      word: { count: 2, score: { "tag-b": 0.8 } },
    })
    expect(entry.targetText).toEqual(["word"])
  })
})
