import { beforeEach, describe, expect, it, vi } from "vitest"

import { createI18n } from "@/i18n/createI18n"

const translations = {
  ja: { message: { greeting: "こんにちは" } },
  en: { message: { greeting: "Hello" } },
}

describe("createI18n", () => {
  const getUILanguage = vi.fn()

  beforeEach(() => {
    vi.stubGlobal("browser", {
      i18n: { getUILanguage },
    })
  })

  it("normalizes a regional Japanese locale", () => {
    getUILanguage.mockReturnValue("ja-JP")

    const instance = createI18n(translations)

    expect(instance.language).toBe("ja")
    expect(instance.t("message.greeting")).toBe("こんにちは")
  })

  it("falls back to English for an unsupported locale", () => {
    getUILanguage.mockReturnValue("fr-CA")

    const instance = createI18n(translations)

    expect(instance.t("message.greeting")).toBe("Hello")
  })

  it("disables React Suspense during initialization", () => {
    getUILanguage.mockReturnValue("en-US")

    const instance = createI18n(translations)

    expect(instance.options.react?.useSuspense).toBe(false)
  })
})
