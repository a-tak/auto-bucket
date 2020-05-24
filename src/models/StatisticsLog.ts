export default interface StatisticsLog {
    date?: Date,    /* 日付毎の統計ログの場合は指定。累計統計の場合は指定しない。 */ 
    totalCount: number, /* 判定したメールの件数 */
    wrongCount: number  /* 間違ったメールの件数 */
}