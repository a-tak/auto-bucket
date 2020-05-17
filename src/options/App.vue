<template>
  <v-app>
    <v-content>
      <v-container fluid pa-0>
        <div id="main">
          <div id="title" class="title ma-3">{{ $t("message.classificate_tag_title") }}</div>
          <div class="body-1 ma-3">
            {{ $t("message.notice") }}
          </div>
          <v-form v-model="valid">
            <div class="d-flex flex-row">
              <div class="ma-3">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" color="accent" @click.stop="save()"
                      >{{ $t("message.save_button_label") }}</v-btn
                    >
                  </template>
                  <span>{{ $t("message.save_button_tip") }}</span>
                </v-tooltip>
              </div>
              <div class="ma-3">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" @click.stop="cancel()">{{ $t("message.cancel_button_label") }}</v-btn>
                  </template>
                  <span>{{ $t("message.cancel_button_tip") }}</span>
                </v-tooltip>
              </div>
            </div>
            <v-select
              v-model="values_"
              :items="tags_"
              attach
              chips
              :label="$t('message.classificate_tag_label')"
              multiple
              :hint="$t('message.classificate_tag_hint')"
              persistent-hint
              class="ma-3 pa-2"
            ></v-select>
            <v-text-field
              class="ma-3 pa-2"
              placeholder="100"
              single-line
              outline
              v-model="bodymaxlength_"
              suffix="KByte"
              :hint="$t('message.body_max_length_hint')"
              :rules="[rules.isNumeric]"
            ></v-text-field>
            <v-text-field
              class="ma-3 pa-2"
              placeholder="72"
              single-line
              outline
              v-model="logDeletePastHour"
              :suffix="$t('message.keep_log_hour_suffix')"
              :hint="$t('message.keep_log_hour_hint')"
              :rules="[rules.isNumeric]"
            ></v-text-field>
          </v-form>
        </div>
        <v-snackbar
          v-model="snackbarDisplay"
          :top="true"
          :timeout="3000"
          :multi-line="multiLine"
        >
          {{ snackbarText }}
        </v-snackbar>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator"
import Tag from "../models/Tag"
import TagUtil from "../lib/TagUtil"
import { numericSort } from "simple-statistics"

@Component
export default class App extends Vue {
  private tags_: Tag[] = []
  private values_: Tag[] = []
  private snackbarDisplay_: boolean = false
  private snackbarText_: string = ""
  private bodymaxlength_: number = 100

  private valid_: boolean = false
  public get valid(): boolean {
    return this.valid_
  }
  public set valid(v: boolean) {
    this.valid_ = v
  }
  private get bodymaxlength(): number {
    return this.bodymaxlength_
  }
  private set bodymaxlength(v: number) {
    this.bodymaxlength_ = v
  }
  private logDeletePastHour_: number = 24 * 3
  public get logDeletePastHour(): number {
    return this.logDeletePastHour_
  }
  public set logDeletePastHour(v: number) {
    this.logDeletePastHour_ = v
  }

  private get rules(): {} {
    return {
      isNumeric: (value: string) => {
        if (isNaN(Number(value))) return this.$i18n.tc('message.numeric_only_rule_error')
        return true
      },
    }
  }

  private get snackbarDisplay(): boolean {
    return this.snackbarDisplay_
  }

  private set snackbarDisplay(value: boolean) {
    this.snackbarDisplay_ = value
  }

  public get snackbarText(): string {
    return this.snackbarText_
  }

  private get tags(): Tag[] {
    return this.tags_
  }

  private get values(): Tag[] {
    return this.values_
  }

  private set values(v: Tag[]) {
    this.values_ = v
  }

  private created(): void {
    this.initialize()
  }

  private async initialize(): Promise<void> {
    // 初期化
    this.tags_ = []
    this.values_ = []

    const tags = await TagUtil.load()
    this.bodymaxlength_ = ((await browser.storage.sync.get(
      "body_max_length"
    )) as {
      body_max_length: number
    }).body_max_length

    this.logDeletePastHour_ = ((await browser.storage.sync.get(
      "log_delete_past_hour"
    )) as {
      log_delete_past_hour: number
    }).log_delete_past_hour

    this.tags_ = tags
    for (const tag of tags) {
      if (tag.useClassification) {
        this.values_.push(tag)
      }
    }
  }

  private save() {
    if (!this.valid_) {
      // タイムアウトリセットするため一度消す
      this.snackbarDisplay_ = false
      this.$nextTick(() => {
        // 画面更新がされたの待ってから処理しないとタイムアウトかリセットされない
        this.snackbarText_ = this.$i18n.tc('message.save_error_msg')
        this.snackbarDisplay_ = true
      })

      return
    }
    TagUtil.save(this.values_).then(() => {
      // 学習対象の上限サイズ保存
      browser.storage.sync.set({
        body_max_length: this.bodymaxlength_,
      })
      // ログ保持期間の保存
      browser.storage.sync.set({
        log_delete_past_hour: this.logDeletePastHour_,
      })

      // タイムアウトリセットするため一度消す
      this.snackbarDisplay_ = false
      this.$nextTick(() => {
        // 画面更新がされたの待ってから処理しないとタイムアウトかリセットされない
        this.snackbarText_ =
          this.$i18n.tc('message.save_msg')
        this.snackbarDisplay_ = true
      })
      // TODO: メニューを更新するコード
    })
  }

  private cancel() {
    this.initialize()
    this.$nextTick(() => {
      this.snackbarText_ = this.$i18n.tc('message.cancel_msg')
      this.snackbarDisplay_ = true
    })
  }
}
</script>

<style scoped>
p {
  font-size: 20px;
}
</style>
