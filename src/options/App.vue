<template>
  <v-app>
    <v-content>
      <v-container fluid pa-0>
        <div id="main">
          <v-btn fab dark color="accent" fixed floating bottom right @click="add()">
            <v-icon dark>add</v-icon>
          </v-btn>
          <div id="list" v-bind="listClass">
            <div id="title" class="headline ma-3">分類バケツ設定</div>
            <v-slide-y-transition class="py-0" group>
              <TagRow
                v-for="(tag, index) in tags"
                :key="tag.id"
                :tag_= tag
                :index_="index"
                v-on:clickDeleteButtomEvent="deleteRow()"
              ></TagRow>
            </v-slide-y-transition>
          </div>
        </div>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import TagRow from "../components/TagRow.vue"
import { Component, Vue, Watch } from 'vue-property-decorator'
import Tag from '../lib/Tag'

@Component({
  components: {
    TagRow,
  }
})

export default class App extends Vue {
  private tags_: Tag[] = []

  private get tags(): Tag[] {
    return this.tags_
  }

  private created(): void {
    this.tags_.push(new Tag(1, "work"))
    this.tags_.push(new Tag(2, "promotion"))
  } 
}
</script>

<style scoped>
p {
  font-size: 20px;
}
</style>
