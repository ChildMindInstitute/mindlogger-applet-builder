import Vue from 'vue'
import * as Sentry from '@sentry/browser';
import { Vue as VueIntegration } from '@sentry/integrations';

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

new Vue({
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
