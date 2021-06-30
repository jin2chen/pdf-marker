import "pdfjs-dist/web/pdf_viewer.css";
import Vue from "vue";
import VueClipboard from "vue-clipboard2";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import "./core/monkey-patch";

Vue.config.productionTip = false;
Vue.use(VueClipboard);

new Vue({
  vuetify,
  render: h => h(App)
}).$mount("#app");
