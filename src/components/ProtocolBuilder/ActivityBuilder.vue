<template>
  <div>
    <ActivityHeader
      :headerExpanded="isExpanded"
      @onExpand="handleExpansion()"
      class="pa-4 my-4"
    />

    <ItemList
      v-if="currentScreen == config.ITEM_SCREEN"
      @onAddItem="handleAddItem()"
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
import ItemList from './Items/ItemList';
import SubScaleList from './SubScales/SubScaleList';
import ConditionalList from './Conditionals/ConditionalList';

export default {
  components: {
    ActivityHeader,
    ItemList,
    SubScaleList,
    ConditionalList,
  },
  data() {
    return {
      isExpanded: true,
    }
  },
  computed: {
    config () {
      return config;
    },
    ...mapGetters(config.MODULE_NAME, [
      'currentScreen'
    ]),
  },
  methods: {
    handleAddItem() {
      this.isExpanded = false;
    },
    handleExpansion() {
      this.isExpanded = true;
    }
  }
}
</script>
