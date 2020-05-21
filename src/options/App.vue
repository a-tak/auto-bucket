<template>
  <v-app>
    <div id="main">
      <v-card class="ma-1">
        <v-card-title>
          {{ $t("message.classificate_tag_title") }}
        </v-card-title>
        <v-card-subtitle> {{ $t("message.notice") }}</v-card-subtitle>
        <v-form v-model="valid">
          <div class="d-flex flex-row">
            <div class="ma-3">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" color="accent" @click.stop="save()">{{
                    $t("message.save_button_label")
                  }}</v-btn>
                </template>
                <span>{{ $t("message.save_button_tip") }}</span>
              </v-tooltip>
            </div>
            <div class="ma-3">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" @click.stop="cancel()">{{
                    $t("message.cancel_button_label")
                  }}</v-btn>
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
            v-model="bodymaxlength_"
            suffix="KByte"
            :label="$t('message.body_max_length_label')"
            :hint="$t('message.body_max_length_hint')"
            :rules="[rules.isNumeric]"
          ></v-text-field>
          <v-text-field
            class="ma-3 pa-2"
            v-model="logDeletePastHour"
            :suffix="$t('message.keep_log_hour_suffix')"
            :label="$t('message.keep_log_hour_label')"
            :hint="$t('message.keep_log_hour_hint')"
            :rules="[rules.isNumeric]"
          ></v-text-field>
        </v-form>
      </v-card>
      <v-card class="ma-1" color="red lighten-4">
        <v-card-title>{{ $t("message.reset_learn_title") }}</v-card-title>
        <v-card-subtitle>{{
          $t("message.reset_learn_subtitle")
        }}</v-card-subtitle>
        <v-card-actions>
          <v-btn color="red lighten-2" @click="clearLearn">
            {{ $t("message.reset_learn_btn_label") }}
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-card class="ma-1" color="red lighten-4">
        <v-card-title>{{ $t("message.reset_all_title") }}</v-card-title>
        <v-card-subtitle>{{
          $t("message.reset_all_subtitle")
        }}</v-card-subtitle>
        <v-card-actions>
          <v-btn color="red lighten-2" @click="clearSetting">
            {{ $t("message.reset_all_btn_label") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
    <v-snackbar
      v-model="snackbarDisplay"
      :top="snackTop === true"
      :bottom="snackTop === false"
      :timeout="3000"
      :multi-line="multiLine"
    >
      {{ snackbarText }}
    </v-snackbar>
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
  private snackTop_: boolean = true
  public get snackTop(): boolean {
    return this.snackTop_
  }
  public set snackTop(v: boolean) {
    this.snackTop_ = v
  }

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
        if (isNaN(Number(value)))
          return this.$i18n.tc("message.numeric_only_rule_error")
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
      this.snackTop_ = true
      this.$nextTick(() => {
        // 画面更新がされたの待ってから処理しないとタイムアウトかリセットされない
        this.snackbarText_ = this.$i18n.tc("message.save_error_msg")
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
      this.snackTop_ = true
      this.snackbarDisplay_ = false
      this.$nextTick(() => {
        // 画面更新がされたの待ってから処理しないとタイムアウトかリセットされない
        this.snackbarText_ = this.$i18n.tc("message.save_msg")
        this.snackbarDisplay_ = true
      })
      // TODO: メニューを更新するコード
    })
  }

  private cancel() {
    this.initialize()
    this.$nextTick(() => {
      this.snackTop_ = true
      this.snackbarText_ = this.$i18n.tc("message.cancel_msg")
      this.snackbarDisplay_ = true
    })
  }

  private clearLearn() {
    browser.storage.sync.remove("data")
    browser.storage.sync.remove("totalCount")

    // タイムアウトリセットするため一度消す
    this.snackTop_ = false
    this.snackbarDisplay_ = false
    this.$nextTick(() => {
      // 画面更新がされたの待ってから処理しないとタイムアウトかリセットされない
      this.snackbarText_ = this.$i18n.tc("message.clear_learn_msg")
      this.snackbarDisplay_ = true
    })
  }

  private clearSetting() {
    browser.storage.sync.clear()

    // タイムアウトリセットするため一度消す
    this.snackTop_ = false
    this.snackbarDisplay_ = false
    this.$nextTick(() => {
      // 画面更新がされたの待ってから処理しないとタイムアウトかリセットされない
      this.snackbarText_ = this.$i18n.tc("message.clear_setting_msg")
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
