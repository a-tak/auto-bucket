/**
 * 再学習ログ用オブジェクト
 * 情報をいくつか格納しているが現状つかってない。
 * 過去再学習をしたかの判断の為にログのエントリがあるかないかしか見てない
 */
export default interface ReLearnLog {
    messageId: string,  /* メールを一意に特定するMessage-IDヘッダの値 */
    date: Date,
    previousClassification: string,    /* 再学習前の分類 */
    changedClassification: string       /* 再学習後の分類 */
}