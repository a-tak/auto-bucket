import Vue from 'vue';
import App from './App';

declare var global: any

global.browser = require('webextension-polyfill');

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
});
