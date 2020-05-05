<template>
  <v-app>
    <v-content>
      <v-container fluid pa-0>
        <div id="main">
          <div id="list" v-bind="listClass">
            <div id="title" class="title ma-3">分類用タグ設定</div>
            <div class="body-1 ma-3">分類用タグを変更したらThunderbirdを再起動してください</div>
            <div class="d-flex flex-row">
              <div class="ma-3">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" color="accent" @click.stop="save()"
                      >SAVE</v-btn
                    >
                  </template>
                  <span>分類タグ設定を保存</span>
                </v-tooltip>
              </div>
              <div class="ma-3">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" @click.stop="cancel()">CANCEL</v-btn>
                  </template>
                  <span>編集をキャンセルする</span>
                </v-tooltip>
              </div>
            </div>
            <v-select
              v-model="values_"
              :items="tags_"
              attach
              chips
              label="分類用タグ"
              multiple
            ><v-select>
          </div>
        </div>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator"
import Tag from "../lib/Tag"
import TagUtil from "../lib/TagUtil"

@Component
export default class App extends Vue {
  private tags_: Tag[] = []
  private values_: Tag[] = []
  
  private get tags(): Tag[] {
    return this.tags_
  }

  private get values() : Tag[] {
    return this.values_
  }

  private set values(v: Tag[]) {
    this.values_ = v
  }

  private created(): void {
    this.initialize()
  }

  private initialize(): void {
    // 初期化
    this.tags_ = []
    this.values_ = []

    TagUtil.load().then((value) => {
      this.tags_ = value
      for(const tag of value) {
        if (tag.useClassification) {
          this.values_.push(tag)
        }
      }
    })
  }

  private save() {
    TagUtil.save(this.values_).then(() => {
      // TODO: メニューを更新するコード 
    })

  }

  private cancel() {
    this.initialize()
  }
}
</script>

<style scoped>
p {
  font-size: 20px;
}
</style>
