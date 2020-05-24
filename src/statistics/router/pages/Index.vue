<template>
  <div class="d-flex flex-column ma-4">
    <span class="title">{{ $t("message.page_title") }}</span>
    <v-card class="ma-2">
      <v-card-title class="ma-1">{{
        $t("message.accuracy_title")
      }}</v-card-title>
      <AccuracyChart
        :chartData="accuracyData"
        :chartOptions="accuracyOptions"
        :styles="styles"
      ></AccuracyChart>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import AccuracyChart from "../../components/AccuracyChart.vue"

@Component({
  components: {
    AccuracyChart,
  },
})
export default class App extends Vue {
  // コストラクタで非同期処理で変数初期化してもコンパイル通らないので仕方なくundefined無視
  private accuracyData_: {} = {}
  public get accuracyData(): {} {
    return this.accuracyData_
  }
  public set accuracyData(v: {}) {
    this.accuracyData_ = v
  }

  private accuracyOptions_: {} = {}
  public get accuracyOptions(): {} {
    return this.accuracyOptions_
  }
  public set accuracyOptions(v: {}) {
    this.accuracyOptions_ = v
  }

  private styles_: {} = {}
  public get styles(): {} {
    return this.styles_
  }
  public set styles(v: {}) {
    this.styles_ = v
  }

  private created() {
    this.Initialize()
  }

  private async Initialize() {
    this.accuracyData_ = {
      labels: ["1/1", "1/2", "1/3", "1/4"],
      datasets: [
        {
          label: "精度",
          data: [80, 85, 75, 90, 100],
        },
      ],
    }

    this.accuracyOptions_ = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            ticks: {
              min: 0,
              max: 100,
            },
          },
        ],
      },
    }

    this.styles_ = {
      height: "300px",
      position: "relative",
    }
  }
}

interface LineData {
  labels: string[]
  data: number[]
}
</script>

<style lang="scss" scoped>
p {
  font-size: 20px;
}
</style>
