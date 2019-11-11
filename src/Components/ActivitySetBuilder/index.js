import ActivitySetBuilder from './ActivitySetBuilder.vue';
import Vue from 'vue';

const Components = {
  ActivitySetBuilder
};

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name]);
});

export default Components;