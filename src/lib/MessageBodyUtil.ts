const ContentType = {
  PlainText: "text/plain",
  Html: "text/html",
} as const

type ContentType = (typeof ContentType)[keyof typeof ContentType]

export default class MessageBodyUtil {
  public static async getBodyMain(
    messagePart: browser.messages.MessagePart
  ): Promise<string> {
    const plainBody = await this.getBody(messagePart, ContentType.PlainText)
    if (plainBody.length > 0) return plainBody
    return this.getBody(messagePart, ContentType.Html)
  }

  public static async getBody(
    messagePart: browser.messages.MessagePart,
    contentType: ContentType
  ): Promise<string> {
    let body = ""
    if ("parts" in messagePart) {
      for (const part of messagePart.parts) {
        body += await this.getBody(part, contentType)
      }
    }

    if ("body" in messagePart && messagePart.contentType === contentType) {
      let result = messagePart.body
      if (messagePart.contentType === ContentType.Html) {
        result = result.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, " ")
        result = result.replace(/&nbsp;/g, "")
      }
      result = result.replace(
        /([\u0000-\u002f])|([\u003a-\u0040])|([\u005b-\u0060])|([\u007b-\u00bf])|([\u02b9-\u0362])|([\u0374-\u0375])|([\u037A-\u037E])|([\u0384-\u0385])|\u0387/g,
        " "
      )
      result = result.replace(
        /([\u2000-\u203e])|([\u20dd-\u20f0])|([\u2190-\u27ff])|([\u2900-\u2e70])|([\u2ff0-\u2ffb])/g,
        " "
      )
      result = result.replace(/([\u3000-\u3040])|([\u3200-\u33ff])/g, " ")
      result = result.replace(
        /([\ufe30-\ufe6b])|([\uff00-\uff0f])|([\uff1a-\uff20])|([\uff3b-\uff40])|([\uff5b-\uff65])/g,
        " "
      )
      body += result
    }

    return body
  }
}
