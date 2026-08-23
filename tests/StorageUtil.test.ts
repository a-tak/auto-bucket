import { beforeEach, describe, expect, it, vi } from "vitest"

import StorageUtil from "@/lib/StorageUtil"

describe("StorageUtil", () => {
  const clearSync = vi.fn()
  const getLocal = vi.fn()
  const getSync = vi.fn()
  const setLocal = vi.fn()

  beforeEach(() => {
    vi.stubGlobal("browser", {
      storage: {
        local: { get: getLocal, set: setLocal },
        sync: { clear: clearSync, get: getSync },
      },
    })
  })

  it("loads all local storage entries", async () => {
    getLocal.mockResolvedValue({ tags: ["tag-a"] })

    await expect(StorageUtil.getStorageAll()).resolves.toEqual({
      tags: ["tag-a"],
    })
    expect(getLocal).toHaveBeenCalledWith(null)
  })

  it("loads all sync storage entries for migration", async () => {
    getSync.mockResolvedValue({ body_max_length: 100 })

    await expect(StorageUtil.getSyncStorageAll()).resolves.toEqual({
      body_max_length: 100,
    })
    expect(getSync).toHaveBeenCalledWith(null)
  })

  it("writes migrated entries to local storage", async () => {
    const values = { body_max_length: { value: 100 } }

    await StorageUtil.setLocalStorageAll(values)

    expect(setLocal).toHaveBeenCalledWith(values)
  })

  it("clears sync storage after migration", async () => {
    await StorageUtil.clearSyncStorageAll()

    expect(clearSync).toHaveBeenCalledOnce()
  })
})
