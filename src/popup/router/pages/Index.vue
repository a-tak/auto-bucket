<template>
  <div class="d-flex flex-column ma-4">
    <span class="title">{{ $t("message.page_title") }}</span>
    <v-card class="ma-2">
      <v-avatar class="ma-3" size="125" tile>
        <v-img src="../../../../icons/icon_128.png"></v-img>
      </v-avatar>
      <v-card-text>{{ $t("message.page_head_content") }}</v-card-text>
      <v-card-actions>
        <v-btn text color="accent" @click="openLearnMore">{{
          $t("message.learn_more")
        }}</v-btn>
        <v-btn text color="accent" @click="openStatistics">{{
          $t("message.statistics_btn_label")
        }}</v-btn>
        <!-- <v-btn text color="accent" @click="openOption">{{
          $t("message.option_btn_label")
        }}</v-btn> -->
      </v-card-actions>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"

@Component
export default class App extends Vue {
  private openLearnMore() {
    browser.tabs.create({ url: this.$t("message.learn_more_url").toString() })
  }
  private openStatistics() {
    const createData = {
      url: "/statistics/statistics.html",
    }
    browser.tabs.create(createData)
  }

  private openOption() {
    // Thunderbird 77以降でしか実装されていないらしいので、今は未使用
    // https://www.thunderbird.net/en-US/thunderbird/77.0beta/releasenotes/
    browser.runtime.openOptionsPage()
  }
}
</script>

<style lang="scss" scoped>
p {
  font-size: 20px;
}
</style>
