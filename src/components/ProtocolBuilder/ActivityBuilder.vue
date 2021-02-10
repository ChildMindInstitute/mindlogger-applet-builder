<template>
  <div>
    <ActivityHeader
      class="pa-4 my-4"
    />

    <ItemList
      v-if="currentScreen == config.ITEM_SCREEN"
      class="pb-2"
    />

    <SubScaleList
      v-if="currentScreen == config.SUBSCALE_SCREEN"
      class="pb-2"
    />

    <ConditionalList
      v-if="currentScreen == config.CONDITIONAL_SCREEN"
      class="pb-2"
    />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import config from '../../config';
import ActivityHeader from './ActivityHeader';
import ItemList from './ItemList';
import SubScaleList from './SubScaleList';
import ConditionalList from './ConditionalList';

export default {
  components: {
    ActivityHeader,
    ItemList,
    SubScaleList,
    ConditionalList,
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
