<template>
  <div class="d-flex flex-column ma-4">
    <span class="title">AutoBacket Thunderbirdメール分類拡張機能</span>
    <v-card class="ma-2">
      <v-card-title class="ma-1">メール情報</v-card-title>
      <v-list>
        <v-list-item class="ma-1">
          <v-list-item-title class="ma-1">件名</v-list-item-title>
          <v-list-item-subtitle class="ma-1">{{
            subject
          }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title class="ma-1">差出人</v-list-item-title>
          <v-list-item-subtitle class="ma-1">{{
            from
          }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"

@Component
export default class App extends Vue {
  // コストラクタで非同期処理で変数初期化してもコンパイル通らないので仕方なくundefined無視
  private subject_: string = ""
  public get subject(): string {
    return this.subject_
  }

  private from_ : string = ""
  public get from() : string {
    return this.from_
  }

  private created() {
    this.getTargetMessage().then((header) => {
      this.subject_ = header.subject
      this.from_ = header.author
    })
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
</script>

<style lang="scss" scoped>
p {
  font-size: 20px;
}
</style>
