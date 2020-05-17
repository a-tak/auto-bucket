/**
 * メッセージユーティリティークラス
 */
export default class MessageUtil {
    /**
     * 指定されたメールのMessage-Idヘッダを取得して返す
     * @param messageId Thunderbird API内部メッセージID
     */
    public static async getMailMessageId(message: browser.messages.MessageHeader): Promise<string> {
        const messagePart = await browser.messages.getFull(message.id)
        const headers = messagePart.headers as {
          [key: string]: string
        }
        // ヘッダーはすべて小文字変換されているので小文字で探す
        const id = headers["message-id"]
        if (id == undefined) { throw new Error("do not get mail message-id")}
        return id
    }
}  