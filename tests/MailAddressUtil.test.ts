import { describe, expect, it } from "vitest"

import MailAddressUtil from "@/lib/MailAddressUtil"

describe("MailAddressUtil", () => {
  it.each([
    ["Alice <alice@example.com>", "alice@example.com"],
    ["plain@example.jp", "plain@example.jp"],
    ["", ""],
  ])("extracts an address from %j", (input, expected) => {
    expect(MailAddressUtil.getMailAddress(input)).toBe(expected)
  })

  it.each([
    ["Alice <alice@example.com>", "example.com"],
    ["plain@example.jp", "example.jp"],
  ])("extracts a domain from %j", (input, expected) => {
    expect(MailAddressUtil.getDomain(input)).toBe(expected)
  })

  it.each(["", "missing-at.example", "a@b@c", "@example.com", "user@"])(
    "rejects an invalid address %j",
    (input) => {
      expect(MailAddressUtil.getDomain(input)).toBeUndefined()
    }
  )
})
