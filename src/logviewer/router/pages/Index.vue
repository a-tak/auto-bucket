<template>
  <div class="d-flex flex-column ma-4">
    <span class="title">AutoBacket Thunderbirdメール分類拡張機能</span>
    <v-card class="ma-2">
      <v-card-title class="ma-1">メール情報</v-card-title>
      <v-list>
        <v-list-item class="ma-1">
          <v-list-item-content>
            <v-list-item-title class="ma-1">件名</v-list-item-title>
            <v-list-item-subtitle class="ma-1">{{
              subject
            }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="ma-1">差出人</v-list-item-title>
            <v-list-item-subtitle class="ma-1">{{ from }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
    <v-card class="ma-2">
      <v-card-title class="ma-1">分類情報</v-card-title>
      <span v-if="notFound == true" class="ma-4">分類情報がみつかりません</span>
      <v-list v-if="notFound == false">
        <v-list-item class="ma-1">
          <v-list-item-content>
            <v-list-item-title class="ma-1">判定結果</v-list-item-title>
            <v-list-item-subtitle class="ma-1">{{
              classificate
            }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item class="ma-1" v-for="score in scores" :key="score.name">
          <v-list-item-content>
            <v-list-item-title
              class="ma-1"
              v-text="score.name"
            ></v-list-item-title>
            <v-list-item-subtitle
              class="ma-1"
              v-text="score.score"
            ></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item class="ma-1">
          <v-list-item-content>
            <v-list-item-title class="ma-1">対象本文</v-list-item-title>
            <div class="caption ma-1">{{ targetText }}</div>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import LogEntry from "../../../models/LogEntry"
import MessageUtil from "../../../lib/MessageUtil"
import TagUtil from "../../../lib/TagUtil"
import Tag from "../../../models/Tag"
import TotalScore from "../../../models/TotalScore"

@Component
export default class App extends Vue {
  // コストラクタで非同期処理で変数初期化してもコンパイル通らないので仕方なくundefined無視
  private subject_: string = ""
  public get subject(): string {
    return this.subject_
  }

  private from_: string = ""
  public get from(): string {
    return this.from_
  }

  private logEntry_: LogEntry = new LogEntry()

  private targetText_: string = ""
  public get targetText(): string {
    return this.targetText_
  }

  private classificate_: string = ""
  public get classificate(): string {
    return this.classificate_
  }
  public set classificate(v: string) {
    this.classificate_ = v
  }

  private scores_: Scores[] = []
  public get scores(): Scores[] {
    return this.scores_
  }
  public set scores(v: Scores[]) {
    this.scores_ = v
  }

  private notFound_: boolean = true
  private get notFound(): boolean {
    return this.notFound_
  }

  private tags_: Tag[] = []

  private created() {
    this.Initialize()
    browser.tabs.onActivated.addListener(this.refresh)
  }

  private async refresh(info: browser.tabs.activeInfo) {
    const thisTab = await browser.tabs.getCurrent()
    if (info.tabId == thisTab.id) {
      this.Initialize()
    }
  }

  private async Initialize() {
    const header = await this.getTargetMessage()
    this.subject_ = header.subject
    this.from_ = header.author

    this.notFound_ = false
    this.logEntry_.id = await MessageUtil.getMailMessageId(header.id)
    if ((await this.logEntry_.load()) == false) {
      this.notFound_ = true
      return
    }

    this.tags_ = await TagUtil.load()
    // 非同期で処理
    this.showClassifficateTag()
    this.showScore()
    this.targetText_ = this.logEntry_.targetText.join("/")
  }

  private async showScore(): Promise<void> {
    for (const score of this.logEntry_.score) {
      const tag = this.tags_.find((item) => {
        return item.key === score.category
      })
      if (tag != undefined) {
        this.scores_.push({
          name: tag.name,
          score: score.score,
        })
      } else {
        console.log("not found tag key=" + this.logEntry_.classifiedTag)
      }
    }
  }

  private async showClassifficateTag(): Promise<void> {
    const tag = this.tags_.find((item) => {
      return item.key === this.logEntry_.classifiedTag
    })
    if (tag != undefined) {
      this.classificate_ = tag.name
    } else {
      console.log("not found tag key=" + this.logEntry_.classifiedTag)
    }
  }

  private async getTargetMessage(): Promise<browser.messages.MessageHeader> {
    const header = (await browser.storage.sync.get("logTarget")) as
      | undefined
      | {
          logTarget: browser.messages.MessageHeader
        }
    if (header == undefined)
      throw new Error("Not save MessageHeader in storage")
    return header.logTarget
  }
}

/**
 * スコア表示用のオブジェクト定義
 */
interface Scores {
  name: string
  score: number
}
</script>

<style lang="scss" scoped>
p {
  font-size: 20px;
}
</style>
