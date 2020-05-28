import AppletSchemaBuilder from './ProtocolBuilder.vue';
import Vue from 'vue';

const Components = {
  AppletSchemaBuilder
};

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name]);
});

export default Components;