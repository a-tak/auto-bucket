// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useOptions } from "@/hooks/useOptions"
import StatisticsUtil from "@/lib/StatisticsUtil"
import TagUtil from "@/lib/TagUtil"
import Tag from "@/models/Tag"

vi.mock("@/lib/TagUtil", () => ({
  default: { load: vi.fn(), save: vi.fn() },
}))
vi.mock("@/lib/StatisticsUtil", () => ({
  default: { resetStatistics: vi.fn() },
}))

describe("useOptions", () => {
  const get = vi.fn()
  const set = vi.fn()
  const remove = vi.fn()
  const clear = vi.fn()
  const enabled = new Tag(0, "enabled", "Enabled", true)
  const disabled = new Tag(1, "disabled", "Disabled", false)

  beforeEach(() => {
    vi.stubGlobal("browser", {
      storage: { local: { get, set, remove, clear } },
    })
    vi.mocked(TagUtil.load).mockResolvedValue([enabled, disabled])
    get.mockImplementation(async (key: string) =>
      key === "body_max_length"
        ? { body_max_length: undefined }
        : { log_delete_past_hour: undefined }
    )
  })

  it("loads tags and applies defaults for missing numeric settings", async () => {
    const { result } = renderHook(() => useOptions())

    await waitFor(() => expect(result.current.tags).toHaveLength(2))
    expect(result.current.selectedTags).toEqual([enabled])
    expect(result.current.bodyMaxLength).toBe(100)
    expect(result.current.logDeletePastHour).toBe(72)
  })

  it("saves the latest tag selection and numeric values", async () => {
    const { result } = renderHook(() => useOptions())
    await waitFor(() => expect(result.current.tags).toHaveLength(2))

    act(() => result.current.setSelectedTags([disabled]))
    await waitFor(() => expect(result.current.selectedTags).toEqual([disabled]))
    await act(() => result.current.save(150, 48))

    expect(TagUtil.save).toHaveBeenCalledWith([disabled])
    expect(set).toHaveBeenNthCalledWith(1, { body_max_length: 150 })
    expect(set).toHaveBeenNthCalledWith(2, { log_delete_past_hour: 48 })
  })

  it("clears learned data and delegates statistics reset", async () => {
    const { result } = renderHook(() => useOptions())
    await waitFor(() => expect(result.current.tags).toHaveLength(2))

    await act(() => result.current.clearLearn())
    await act(() => result.current.resetStatistic())

    expect(remove).toHaveBeenNthCalledWith(1, "data")
    expect(remove).toHaveBeenNthCalledWith(2, "totalCount")
    expect(StatisticsUtil.resetStatistics).toHaveBeenCalledOnce()
  })
})
