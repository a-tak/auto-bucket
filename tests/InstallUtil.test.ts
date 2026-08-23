import { beforeEach, describe, expect, it, vi } from "vitest"

import InstallUtil from "@/lib/InstallUtil"

describe("InstallUtil", () => {
  const create = vi.fn()
  const getMessage = vi.fn()
  const getURL = vi.fn()

  beforeEach(() => {
    vi.stubGlobal("browser", {
      i18n: { getMessage },
      runtime: { getURL },
      tabs: { create },
    })
  })

  it("opens the localized external homepage after installation", async () => {
    getMessage.mockReturnValue("https://a-tak.github.io/auto-bucket/")

    await InstallUtil.handleInstalled("install")

    expect(create).toHaveBeenCalledWith({
      url: "https://a-tak.github.io/auto-bucket/",
    })
    expect(getURL).not.toHaveBeenCalled()
  })

  it("does not open the welcome page after an update", async () => {
    await InstallUtil.handleInstalled("update")

    expect(create).not.toHaveBeenCalled()
  })
})
