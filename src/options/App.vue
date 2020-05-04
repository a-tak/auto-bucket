<template>
  <v-app>
    <v-content>
      <v-container fluid pa-0>
        <div id="main">
          <v-btn fab dark color="accent" fixed floating bottom right @click="addRow()">
            <v-icon dark>add</v-icon>
          </v-btn>
          <div id="list" v-bind="listClass">
            <div id="title" class="title ma-3">分類用タグ設定</div>
            <div class="d-flex flex-row">
              <div class="ma-2">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" color="accent" @click.stop="save()">SAVE</v-btn>
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
            <v-slide-y-transition class="py-0" group>
              <TagRow
                v-for="(tag, index) in tags"
                :key="tag.id"
                :tag_="tag"
                :index_="index"
                v-on:clickDeleteButtomEvent="deleteRow"
              ></TagRow>
            </v-slide-y-transition>
          </div>
        </div>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import TagRow from "../components/TagRow.vue";
import Tag from "../lib/Tag";

@Component({
  components: {
    TagRow
  }
})
export default class App extends Vue {
  private tags_: Tag[] = [];
  private tagCounter_: number = 0;

  private get tags(): Tag[] {
    return this.tags_;
  }

  private created(): void {}

  private addRow(): void {
    // カウント増加させてIDにセット
    this.tags_.push(new Tag((this.tagCounter_ += 1), ""));
  }

  private deleteRow(tag: Tag): void {
    if (tag == undefined) {
      console.log("Delete target Tag is undefined");
    }
    const index = this.tags_.indexOf(tag);
    console.log("index=" + index + "/id=" + tag.id + "/name=" + tag.name);
    this.tags_.splice(index, 1);
  }
}
</script>

<style scoped>
p {
  font-size: 20px;
}
</style>
