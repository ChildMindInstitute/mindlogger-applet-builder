import AppletSchemaBuilder from './ProtocolBuilder.vue';

import html5Embed from 'markdown-it-html5-embed';
import markdownItImSize from 'markdown-it-imsize';

const Components = {
  AppletSchemaBuilder
};


export default {
  install: function (Vue, options = {}) {
    if (options.mavonEditor) {
      options.mavonEditor.markdownIt.use(html5Embed, {
        html5embed: {
          useImageSyntax: true
      }}).use(markdownItImSize);
    }

    Object.keys(Components).forEach(name => {
      Vue.component(name, Components[name]);
    });
  }
};
