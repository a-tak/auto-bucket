<template>
  <v-app>
    <v-content>
      <v-container fluid pa-0>
        <div id="main">
          <div id="list" v-bind="listClass">
            <div id="title" class="title ma-3">分類用タグ設定</div>
            <div class="d-flex flex-row">
              <div class="ma-2">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" color="accent" @click.stop="save()"
                      >SAVE</v-btn
                    >
                  </template>
                  <span>分類タグ設定を保存</span>
                </v-tooltip>
              </div>
              <div class="ma-2">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" @click.stop="cancel()">CANCEL</v-btn>
                  </template>
                  <span>編集をキャンセルする</span>
                </v-tooltip>
              </div>
            </div>
            <v-select
              v-model="values"
              :items="tagNames"
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
  private values_: string[] = []
  private tagNames_ : string[] = []

  public get tagNames() : string[] {
    return this.tagNames_
  }
  public set tagNames(v : string[]) {
    this.tagNames_ = v
  }
  
  private get tags(): Tag[] {
    return this.tags_
  }

  private get values() : string[] {
    return this.values_
  }

  private created(): void {
    this.initialize()
  }

  private initialize(): void {
    TagUtil.load().then((value) => {
      this.tags_ = value
      for(const tag of value) {
        this.tagNames_.push(tag.name)
        if (tag.useClassification) {
          this.values_.push(tag.name)
        }
      }
    })
    browser.messages.listTags().then(value => {
      console.log("タグ一覧" + JSON.stringify(value, null, 4))
    })
  }

  private save() {
    for (const values of this.values_) {
      this.tags_
    }
    TagUtil.save(this.tags_).then(() => {
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
