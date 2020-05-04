<template>
  <v-container grid-list-md text-xs-center pa-1>
    <v-layout row wrap>
      <v-flex>
        <v-card class="elevation-3 ma-1">
          <v-layout v-bind="layoutAttributes" fill-height align-center justify-space-between>
            <v-flex>
              <v-layout row>
                <v-flex ma-2>
                  <v-text-field v-bind:id="'section-title-field-' + tag_.id" placeholder="タグ名" single-line outline clearable v-model="tag_.name" @change="changeSection(tag_)" ></v-text-field>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex md3 xs3 sm3>
              <v-layout row>
                <v-flex xs4 sm2 md2 lg2 lx2>
                  <v-btn icon ripple @click.stop="deleteRow(tag_)">
                      <v-icon color="accent">delete</v-icon>
                    </v-btn>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import Tag from '../lib/Tag'

@Component
export default class TagRow extends Vue {
  @Prop() private tag_!: Tag
  @Prop() private index_!: number

  @Emit('clickDeleteButtomEvent')
  // tslint:disable-next-line:no-empty
  public deleteRow(tag: Tag): void {
    console.log("tag=" + tag.name)
  }

  private created(): void {
    if (this.tag_==undefined) {
      throw new Error("tag prop undefine")
    }
  }
}

</script>

<style scoped>
</style>


