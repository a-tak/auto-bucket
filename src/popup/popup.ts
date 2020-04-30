import Vue from 'vue'
import App from './App.vue'
import store from '../store'
import router from './router'
import 'webextension-polyfill'

Vue.prototype.$browser = browser;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App),
});
