<template>
  <v-card>
    <v-card-title>
      Items
    </v-card-title>

    <div>
      <ItemBuilder
        v-for="(item, index) in currentActivity.items"
        :key="`${index}-${item.id || 0}`"
        :item-index="index"
        class="ma-4"
      >
      </ItemBuilder>
    </div>

    <v-dialog
      v-model="urlDialog"
    >
      <UrlItemUploader
        :key="urlItemUploaderKey"
        @uploadItem="onUploadItem"
      />
    </v-dialog>

    <v-menu
      bottom
    >
      <template
        v-slot:activator="{ on, attrs }"
      >
        <v-btn
          v-bind="attrs"
          v-on="on"
          color="primary"
          class="mx-4 my-2"
          rounded
        >
          Add item
        </v-btn>
      </template>

      <v-list>
        <v-list-item
          @click="addBlankItem"
        >
          <v-list-item-title>Blank item</v-list-item-title>
        </v-list-item>

        <v-list-item
          @click="importItem"
        >
          <v-list-item-title>Upload from GitHub</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-card>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import config from '../../../config';
import ItemBuilder from './ItemBuilder';
import UrlItemUploader from './UrlItemUploader';

export default {
  data() {
    return {
      urlItemUploaderKey: 0,
      urlDialog: false,
      baseKey: 0,
    }
  },
  components: {
    ItemBuilder,
    UrlItemUploader,
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

    importItem () {
      this.urlDialog = true;
      this.urlItemUploaderKey++;
    },

    onUploadItem (response) {
      this.urlDialog = false;
      if (response) {
        this.addItem(response);
        this.$emit('onAddItem');
      }
    },

    addBlankItem () {
      this.addItem();
      this.$emit('onAddItem');
    }
  }
}
</script>
