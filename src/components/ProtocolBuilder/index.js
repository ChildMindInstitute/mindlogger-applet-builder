import AppletSchemaBuilder from './ProtocolBuilder.vue';

import { html5Media } from 'markdown-it-html5-media';

const Components = {
  AppletSchemaBuilder
};


export default {
  install: function (Vue, options = {}) {
    if (options.mavonEditor) {
      options.mavonEditor.markdownIt.use(html5Media);
    }

    Object.keys(Components).forEach(name => {
      Vue.component(name, Components[name]);
    });
  }
};
