import Vue from 'vue';
import App from './App.vue';
import vuetify from '../plugins/vuetify'
import 'webextension-polyfill'

/* eslint-disable no-new */
new Vue({
  vuetify,
  el: '#app',
  render: h => h(App),
});
