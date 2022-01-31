import Vue from "vue";
import App from "./App";
import store from "./store/index.js";
import * as filters from "./utils/filter.js";
import * as util from "./utils/util.js";
import * as api from "./utils/apis";

Object.keys(filters).forEach((key) => {
    Vue.filter(key, filters[key]);
});
Vue.config.productionTip = false;
Vue.prototype.$util = util;
Vue.prototype.$api = api;
Vue.prototype.$log = console.log;

App.mpType = "app";

const app = new Vue({
    store,
    ...App
});
app.$mount();
