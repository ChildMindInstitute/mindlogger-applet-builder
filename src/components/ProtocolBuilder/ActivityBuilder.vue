<template>
  <div>
    <ActivityHeader
      class="pa-4 my-4"
    />

    <ItemList
      class="pb-2"
    />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import config from '../../config';
import ActivityHeader from './ActivityHeader';
import ItemList from './ItemList';

export default {
  components: {
    ActivityHeader,
    ItemList,
  },
  computed: {
    config () {
      return config;
    },
    ...mapGetters(config.MODULE_NAME, [
      'currentScreen'
    ]),
  }
}
</script>
