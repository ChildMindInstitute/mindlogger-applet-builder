import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import ActivitySetBuilder from '../components/index';

Vue.use(Vuetify);
Vue.use(ActivitySetBuilder);

export default new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
});