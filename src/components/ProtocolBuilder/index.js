import AppletSchemaBuilder from './ProtocolBuilder.vue';
import pmd from 'perfect-markdown'
import messages from 'perfect-markdown/src/lang';
import help from 'perfect-markdown/src/lang/help';

const Components = {
  AppletSchemaBuilder
};


export default {
  pmd,
  install: function (Vue, options = {}) {
    const { store } = options;
    Vue.use(pmd, store ? { store } : {});

    pmd.setHelp('en_US', help.en);
    Object.keys(Components).forEach(name => {
      Vue.component(name, Components[name]);
    });
  }
};
