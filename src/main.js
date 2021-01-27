import Vue from 'vue'
import * as Sentry from '@sentry/browser';
import { Vue as VueIntegration } from '@sentry/integrations';
import store from './store'
import mavonEditor from 'mavon-editor';
import 'mavon-editor/dist/css/index.css'
import { html5Media } from 'markdown-it-html5-media';

import App from './App.vue'
import vuetify from './plugins/vuetify';


const env = process.env.NODE_ENV || 'development';

if (env !== 'development') {
  Sentry.init({
    dsn: 'https://8f2a17ca3da0466d8ecdefc0a25313c6@o414302.ingest.sentry.io/5324293',
    integrations: [new VueIntegration({Vue, attachProps: true})],
  });
}

Vue.config.productionTip = false;

Vue.use(mavonEditor);
mavonEditor.markdownIt.use(html5Media);

new Vue({
  vuetify,
  store,
  render: (h) => h(App),
}).$mount("#app");
