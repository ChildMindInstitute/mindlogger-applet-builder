import Vue from 'vue';
import Vuex from 'vuex';
import appletBuilder from './modules/appletBuilder';
import createPersistedState from 'vuex-persistedstate';
import config from '../config';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {

  },
  modules: {
    [config.MODULE_NAME]: appletBuilder
  },
  plugins: [
    createPersistedState({
      storage: window.sessionStorage,
      paths: [config.MODULE_NAME],
    }),
  ],
})
