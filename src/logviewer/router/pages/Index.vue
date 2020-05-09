<template>
  <div>
    <span class="title">AutoBacket Thunderbirdメール分類拡張機能</span>
    <p>拡張機能の設定から分類に使用するタグを選択しメールを右クリックし振り分けの学習をしてください。
      その後はメールを選択して右クリックしてメールの判定処理を行ってください。
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue} from "vue-property-decorator"

@Component
export default class App extends Vue {
}
</script>

<style lang="scss" scoped>
p {
  font-size: 20px;
}
</style>
