<template>
  <v-card>
    <v-card-title>
      Items
    </v-card-title>

    <ItemBuilder
      v-for="(item, index) in currentActivity.items"
      :key="index"
      :item-index="index"
      class="ma-4"
    >
    </ItemBuilder>

    <v-btn
      @click="addItem"
      color="primary"
      class="ma-2"
      rounded
    >
      <v-icon>
        add
      </v-icon>
      Add Item
    </v-btn>
  </v-card>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import config from '../../config';
import ItemBuilder from './ItemBuilder';

export default {
  data() {
    return {
    }
  },
  components: {
    ItemBuilder,
  },
  computed: {
    config () {
      return config;
    },
    ...mapGetters(config.MODULE_NAME,
      ['currentActivity']
    ),
  },
  methods: {
    ...mapMutations(config.MODULE_NAME,
      ['addItem']
    ),
  }
}
</script>
