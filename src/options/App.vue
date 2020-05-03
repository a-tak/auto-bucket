<template>
  <div id="main">
    <div class="fixed-header">
      <Header></Header>
    </div>
    <v-btn fab dark color="accent" fixed floating bottom right @click="addSection()">
      <v-icon dark>add</v-icon>
    </v-btn>
    <div id="list" v-bind="listClass">
      <div id="title" class="headline ma-3">
        セクション設定
      </div>
      <v-slide-y-transition
        class="py-0"
        group
      >
        <SectionRow
          v-for="(section, index) in sections"
          :key="section.id"
          :section_="section"
          :index_="index"
          v-on:clickDeleteButtomEvent="deleteSection"
          v-on:changeEvent="changeSection"
          v-on:setFirstSectionEvent="setFirstSection"
        >
        </SectionRow>
      </v-slide-y-transition>
    </div>
    <Footer></Footer>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import TagRow from './components/TagRow.vue'

export default Vue.extend({
  name: 'App',
})
</script>

<style scoped>
p {
  font-size: 20px;
}
</style>
