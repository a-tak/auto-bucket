import { beforeEach, describe, expect, it, vi } from "vitest"

import MessageUtil from "@/lib/MessageUtil"

describe("MessageUtil", () => {
  const getFull = vi.fn()

  beforeEach(() => {
    vi.stubGlobal("browser", {
      messages: { getFull },
    })
  })

  it("returns the normalized message-id header", async () => {
    getFull.mockResolvedValue({
      headers: { "message-id": "<message@example.com>" },
    })

    await expect(
      MessageUtil.getMailMessageId({ id: 42 } as never)
    ).resolves.toBe("<message@example.com>")
    expect(getFull).toHaveBeenCalledWith(42)
  })

  it("rejects when the message-id header is missing", async () => {
    getFull.mockResolvedValue({ headers: {} })

    await expect(
      MessageUtil.getMailMessageId({ id: 42 } as never)
    ).rejects.toThrow("do not get mail message-id")
  })
})
