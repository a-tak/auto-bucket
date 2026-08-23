export default class MailAddressUtil {
  public static getMailAddress(mail: string): string {
    if (mail.length === 0) return ""

    const start = mail.lastIndexOf("<")
    const closingBracket = mail.lastIndexOf(">")
    const end = closingBracket === -1 ? mail.length : closingBracket
    return mail.slice(start + 1, end)
  }

  public static getDomain(mail: string): string | undefined {
    const parts = this.getMailAddress(mail).split("@")
    if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) {
      return undefined
    }
    return parts[1]
  }
}
