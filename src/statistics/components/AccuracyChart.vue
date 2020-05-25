<script lang="ts">
import { Component, Mixins, Prop } from "vue-property-decorator"
import Chart from "chart.js"
import { Line, mixins } from "vue-chartjs"

@Component({})
export default class AccuracyChart extends Mixins(Line, mixins.reactiveProp) {
  // グラフ用のデータ
  @Prop() public chartData!: Chart.ChartData

  // 表示オプションなど
  @Prop() public chartOptions!: Chart.ChartOptions

  // スタイル
  @Prop() public styles!: {}

  public mounted() {
    this.refresh()
  }

  private refresh() {
    this.renderChart(this.chartData, this.chartOptions)
  }
}
</script>
