<template>
  <div class="d-flex flex-column ma-4">
    <span class="title">{{ $t("message.page_title") }}</span>
    <v-skeleton-loader
      :loading="loading"
      transition="scale-transition"
      height="200"
      type="article"
      class="ma-2"
    >
      <v-card class="ma-2">
        <v-card-title>{{ $t("message.total_accuracy_title") }}</v-card-title>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="ma-1">
              {{ $t("message.total_accuracy_label") }}
            </v-list-item-title>
            <v-list-item-subtitle class="ma-1">
              {{ totalAccurancy }} %
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-content>
            <v-list-item-title class="ma-1">
              {{ $t("message.total_judge_count_label") }}
            </v-list-item-title>
            <v-list-item-subtitle class="ma-1">
              {{ totalJudgeCount }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-content>
            <v-list-item-title class="ma-1">
              {{ $t("message.total_wrong_count_label") }}
            </v-list-item-title>
            <v-list-item-subtitle class="ma-1">
              {{ totalWrongCount }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-card>
    </v-skeleton-loader>
    <v-card class="ma-2">
      <v-card-title class="ma-1">{{
        $t("message.accuracy_title")
      }}</v-card-title>
      <v-skeleton-loader
        :loading="loading"
        transition="scale-transition"
        height="250"
        type="article"
        class="ma-2"
      >
        <AccuracyChart
          :chartData="accuracyData"
          :chartOptions="accuracyOptions"
          :styles="styles"
          :height="100"
          class="ma-2"
        ></AccuracyChart>
      </v-skeleton-loader>
      <v-skeleton-loader
        :loading="loading"
        transition="scale-transition"
        height="150"
        type="article"
        class="ma-2"
      >
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="ma-1">
              {{ $t("message.statistics_reset_date_title") }}
            </v-list-item-title>
            <v-list-item-subtitle class="ma-1">
              {{ totalStatisticsResetDate }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-skeleton-loader>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import AccuracyChart from "../../components/AccuracyChart.vue";
import StatisticsUtil from "../../../lib/StatisticsUtil";
import StatisticsLog from "../../../models/StatisticsLog";
import DateUtil from "../../../lib/DateUtil";
import Chart, { ChartOptions } from "chart.js";

@Component({
  components: {
    AccuracyChart
  }
})
export default class App extends Vue {
  // コストラクタで非同期処理で変数初期化してもコンパイル通らないので仕方なくundefined無視
  private accuracyData_: {} = {};
  public get accuracyData(): {} {
    return this.accuracyData_;
  }

  public get accuracyOptions(): ChartOptions {
    const ret: ChartOptions = {
      responsive: true,
      legend: {
        display: false
      },
      scales: {
        yAxes: [
          {
            ticks: {
              min: 0,
              max: 100
            }
          }
        ]
      }
    };

    return ret;
  }

  private totalStatistics: StatisticsLog = {
    totalCount: 0,
    wrongCount: 0
  };
  public get totalAccurancy(): number {
    if (this.totalStatistics.totalCount === 0) return 0;

    return (
      // 第一位で四捨五入するにはこうするしかないらしい…
      100 -
      Math.round(
        (this.totalStatistics.wrongCount / this.totalStatistics.totalCount) *
          100 *
          10
      ) /
        10
    );
  }

  public get totalJudgeCount(): number {
    return this.totalStatistics.totalCount;
  }

  public get totalWrongCount(): number {
    return this.totalStatistics.wrongCount;
  }

  public get totalStatisticsResetDate(): string {
    return typeof this.totalStatistics.date === "undefined"
      ? ""
      : this.totalStatistics.date.toLocaleString();
  }

  private styles_: {} = {};
  public get styles(): {} {
    return this.styles_;
  }
  public set styles(v: {}) {
    this.styles_ = v;
  }

  private loading_: boolean = true;
  public get loading(): boolean {
    return this.loading_;
  }

  private mounted() {
    this.Initialize();

    this.styles_ = {
      position: "relative"
    };
  }

  private async Initialize() {
    const promises: Promise<void>[] = [];
    promises.push(this.loadStatistics());
    promises.push(this.loadTotalStatistics());

    await Promise.all(promises);
    this.loading_ = false;
  }

  private async loadTotalStatistics() {
    this.totalStatistics = await StatisticsUtil.loadTotalStatistics();
  }

  private async loadStatistics() {
    let data: number[] = [];
    let dateLabel: string[] = [];
    const items: StatisticsLog[] = await StatisticsUtil.getListStatistics();
    for (const item of items) {
      data.push(
        100 - Math.round((item.wrongCount / item.totalCount) * 100 * 10) / 10
      );
      dateLabel.push(
        typeof item.date === "undefined" ? "" : DateUtil.getMD(item.date)
      );
    }

    // グラフ表示テスト用コード
    // dateLabel = []
    // data = []
    // const s = new Date()
    // s.setDate(s.getDate() - 31)
    // for (let i = 0; i < 30; i++) {
    //   dateLabel.push(DateUtil.getMD(s))
    //   data.push(Math.round(Math.random()*1000)/10)
    //   s.setDate(s.getDate() + 1)
    // }

    this.accuracyData_ = {
      labels: dateLabel,
      datasets: [
        {
          label: "精度",
          data: data,
          backgroundColor: "rgba(128, 203, 196, 0.5)"
        }
      ]
    };
  }
}

interface LineData {
  labels: string[];
  data: number[];
}
</script>

<style lang="scss" scoped>
p {
  font-size: 20px;
}
</style>
