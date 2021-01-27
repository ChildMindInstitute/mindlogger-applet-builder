import Vue from 'vue'
import Vuex from 'vuex'
import appletBuilder from './modules/appletBuilder'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
      appletBuilder
    }
})
