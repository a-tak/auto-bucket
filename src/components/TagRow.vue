<template>
  <v-container grid-list-md text-xs-center pa-1>
    <v-layout row wrap>
      <v-flex>
        <v-card class="elevation-3 ma-1">
          <v-layout v-bind="layoutAttributes" fill-height align-center justify-space-between>
            <v-flex>
              <v-layout row>
                <v-flex ma-2>
                  <v-text-field v-bind:id="'section-title-field-' + section_.id" placeholder="セクション名" single-line outline clearable v-model="section_.title" @change="changeSection(section_)" ></v-text-field>
                </v-flex>
                <v-flex ma-2>
                  <v-text-field v-bind:id="'section-start-field-' + section_.id" type="number" placeholder="開始時間" single-line outline clearable hint="数字3または4桁。9時20分は「920」と入力" v-model="startTime_" @change="changeStartTime()"></v-text-field>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex md3 xs3 sm3>
              <v-layout row>
                <v-flex xs4 sm2 md2 lg2 lx2>
                  <v-btn icon ripple @click.stop="deleteSection(section_)">
                      <v-icon color="accent">delete</v-icon>
                    </v-btn>
                </v-flex>
                <v-flex xs4 sm2 md2 lg2 lx2>
                  <v-tooltip top v-if="index_!==0">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        icon ripple @click.stop="setFirtstSection(section_)"
                      >
                        <v-icon color="accent">vertical_align_top</v-icon>
                      </v-btn>
                    </template>
                    <span>一日の開始セクションに指定</span>
                  </v-tooltip>
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

</script>

<style scoped>
</style>


