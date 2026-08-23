import { beforeEach, describe, expect, it, vi } from "vitest"

import TagUtil from "@/lib/TagUtil"
import Tag from "@/models/Tag"

describe("TagUtil", () => {
  const get = vi.fn()
  const listTags = vi.fn()
  const set = vi.fn()

  beforeEach(() => {
    vi.stubGlobal("browser", {
      messages: { listTags },
      storage: { local: { get, set } },
    })
  })

  it("marks only configured Thunderbird tags for classification", async () => {
    get.mockResolvedValue({ tags: ["tag-b"] })
    listTags.mockResolvedValue([
      { key: "tag-a", tag: "Alpha" },
      { key: "tag-b", tag: "Beta" },
    ])

    await expect(TagUtil.load()).resolves.toEqual([
      new Tag(0, "tag-a", "Alpha", false),
      new Tag(1, "tag-b", "Beta", true),
    ])
  })

  it("returns all Thunderbird tags as unselected when no setting exists", async () => {
    get.mockResolvedValue({})
    listTags.mockResolvedValue([{ key: "tag-a", tag: "Alpha" }])

    await expect(TagUtil.load()).resolves.toEqual([
      new Tag(0, "tag-a", "Alpha", false),
    ])
  })

  it("persists the keys of the supplied classification tags", async () => {
    const tags = [
      new Tag(0, "tag-a", "Alpha", true),
      new Tag(1, "tag-b", "Beta", false),
    ]

    await TagUtil.save(tags)

    expect(set).toHaveBeenCalledWith({ tags: ["tag-a", "tag-b"] })
  })
})
