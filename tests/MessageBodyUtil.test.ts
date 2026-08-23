import { describe, expect, it } from "vitest"

import MessageBodyUtil from "@/lib/MessageBodyUtil"

describe("MessageBodyUtil", () => {
  it("collects nested plain-text message parts", async () => {
    const part = {
      contentType: "multipart/alternative",
      parts: [
        { contentType: "text/plain", body: "Hello" },
        {
          contentType: "multipart/mixed",
          parts: [{ contentType: "text/plain", body: " World" }],
        },
      ],
    }

    await expect(MessageBodyUtil.getBodyMain(part as never)).resolves.toBe(
      "Hello World"
    )
  })

  it("prefers plain text when HTML is also available", async () => {
    const part = {
      contentType: "multipart/alternative",
      parts: [
        { contentType: "text/plain", body: "Plain body" },
        { contentType: "text/html", body: "<p>HTML body</p>" },
      ],
    }

    await expect(MessageBodyUtil.getBodyMain(part as never)).resolves.toBe(
      "Plain body"
    )
  })

  it("falls back to HTML and removes markup and non-breaking spaces", async () => {
    const part = {
      contentType: "text/html",
      body: "<p>Hello</p>&nbsp;World",
    }

    await expect(MessageBodyUtil.getBodyMain(part as never)).resolves.toBe(
      " Hello World"
    )
  })

  it("returns an empty body when no supported body part exists", async () => {
    await expect(
      MessageBodyUtil.getBodyMain({ contentType: "image/png" } as never)
    ).resolves.toBe("")
  })
})
