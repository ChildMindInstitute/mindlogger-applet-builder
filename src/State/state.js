import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

import { Store } from "vuex";
import createPersistedState from "vuex-persistedstate";

const getDefaultState = () => {
  return {
    items: [],
    conditionalItems: [],
  };
};

const state = getDefaultState();

const mutations = {
  resetState(state) {
    Object.assign(state, getDefaultState());
  },
  setItems(state, items) {
    state.items = items;
  },
  setConditionalItems(state, conditionalItems) {
    state.conditionalItems = conditionalItems;
  },
};

export const storeConfig = {
  state,
  mutations,
  plugins: [createPersistedState({ storage: window.sessionStorage })],
};

const store = new Store(storeConfig);

export default store;
