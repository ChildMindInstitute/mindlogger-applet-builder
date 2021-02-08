import AppletSchemaBuilder from './ProtocolBuilder/Builder';

import { html5Media } from 'markdown-it-html5-media';
import appletBuilderStore from '../store/modules/appletBuilder';
import config from '../config';

const Components = {
  AppletSchemaBuilder
};


export default {
  install: function (Vue, options = {}) {
    if (options.mavonEditor) {
      options.mavonEditor.markdownIt.use(html5Media);
    }
    options.store && options.store.registerModule(config.MODULE_NAME, appletBuilderStore);

    Object.keys(Components).forEach(name => {
      Vue.component(name, Components[name]);
    });
  },
};
