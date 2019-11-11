import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App.vue'

import 'vuetify/dist/vuetify.css'

Vue.config.productionTip = false

Vue.use(Vuetify);

new Vue({
  el: '#app',
  render: h => h(App)
})
