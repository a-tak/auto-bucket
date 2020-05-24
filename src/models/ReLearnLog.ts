/**
 * 再学習ログ用オブジェクト
 */
export default interface ReLearnLog {
    messageId: string,  /* メールを一意に特定するMessage-IDヘッダの値 */
    date: Date,
    previousClassification: string,    /* 再学習前の分類 */
    changedClassification: string       /* 再学習後の分類 */
}