import AppletSchemaBuilder from './ProtocolBuilder/Builder';

import appletBuilderStore from '../store/modules/appletBuilder';
import config from '../config';

import html5Embed from 'markdown-it-html5-embed';
import markdownItImSize from 'markdown-it-imsize';
import Protocol from '../models/Protocol';
import MarkDownEditor from './ProtocolBuilder/MarkDownEditor';

const Components = {
  AppletSchemaBuilder,
  MarkDownEditor
};


export default {
  install: function (Vue, options = {}) {
    if (options.mavonEditor) {
      options.mavonEditor.markdownIt.use(html5Embed, {
        html5embed: {
          useImageSyntax: true
        }
      }).use(markdownItImSize);
    }
    options.store && options.store.registerModule(config.MODULE_NAME, appletBuilderStore);

    Object.keys(Components).forEach(name => {
      Vue.component(name, Components[name]);
    });
  },
  getBuilderFormat: Protocol.getBuilderFormat,
};
