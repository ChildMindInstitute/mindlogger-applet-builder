import ProtocolBuilder from './ProtocolBuilder.vue';
import Vue from 'vue';

const Components = {
  ProtocolBuilder
};

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name]);
});

export default Components;