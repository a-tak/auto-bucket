import Vue from 'vue';
import VueI18n from 'vue-i18n'
import App from './App.vue';
import vuetify from '../plugins/vuetify'
import 'webextension-polyfill'

const data = require("./message.json")

Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: browser.i18n.getUILanguage().split('-')[0],
  // locale: "ja",
  messages: data,
  fallbackLocale: "en"
})

/* eslint-disable no-new */
new Vue({
  i18n: i18n,
  vuetify,
  el: '#app',
  render: h => h(App),
});
