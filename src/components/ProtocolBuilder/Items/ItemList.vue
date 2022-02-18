<template>
  <v-card>
    <v-card-title class="d-flex">
      <span>Items</span>

      <div
        class="ml-4 d-flex flex-grow-1"
      >
        <v-btn
          v-if="selectingItems && selectedItems.length"
          rounded
          color="green"
          @click="transferItemDlg.visible = true"
          dark
        >
          Move to ...
        </v-btn>

        <div class="flex-grow-1" />

        <v-btn
          class="ml-4"
          icon
          @click="selectingItems = !selectingItems"
          :disabled="activities.length == 1"
        >
          <v-icon
            v-if="!selectingItems"
            color="lighten-1"
          >
            mdi-cursor-move
          </v-icon>

          <v-icon
            v-else
            color="lighten-1"
          >
            mdi-cancel
          </v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <div>
      <draggable
        v-model="draggableItems"
        handle=".dragging-handle"
        @change="handleChange($event)"
      >
        <transition-group>
          <div
            v-for="(item, index) in currentActivity.items"
            :key="`${index}-${item.id || 0}-${item.timestamp || ''}`"
            class="d-flex align-center"
          >
            <v-checkbox
              class="ml-4"
              v-if="selectingItems"
              :input-value="selectedItems.includes(item)"
              @click="switchOption(item)"
            />

            <ItemBuilder
              :item-index="index"
              class="ma-4 flex-grow-1 item-builder"
              @addItem="addBlankItem(index+1)"
            />
          </div>
        </transition-group>
      </draggable>
    </div>

    <v-dialog
      v-model="urlDialog"
    >
      <UrlItemUploader
        :key="urlItemUploaderKey"
        @uploadItem="onUploadItem"
      />
    </v-dialog>

    <v-dialog
      v-model="transferItemDlg.visible"
      max-width="600"
    >
      <v-card>
        <v-card-title>
          Please select an activity to transfer selected items to
        </v-card-title>

        <v-card-text>
          <v-radio-group
            v-model="transferItemDlg.index"
          >
            <template
              v-for="(activity, index) in activities"
            >
              <v-radio
                v-if="activity != currentActivity"
                :key="index"
                :label="activity.name"
                :value="index"
              ></v-radio>
            </template>
          </v-radio-group>
        </v-card-text>

        <v-card-actions class="justify-space-around">
          <v-btn
            @click="moveItemsToOtherActivity"
          >
            OK
          </v-btn>

          <v-btn
            @click="transferItemDlg.visible = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
        v-model="warningFlag"
        persistent
        width="500"
      >
        <v-card>
          <v-card-text class="pt-4">
            Moving this item will cause your conditional logic to fail.
          </v-card-text>

          <v-card-actions
            class="justify-space-around"
          >
            <v-btn
              @click="confirmChanges"
            >
              Continue
            </v-btn>

            <v-btn
              @click="revertChanges"
            >
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    <v-menu
      bottom
    >
      <template
        v-slot:activator="{ on, attrs }"
      >
        <v-btn
          v-bind="attrs"
          color="primary"
          class="mx-4 my-2"
          rounded
          v-on="on"
        >
          Add item
        </v-btn>
      </template>

      <v-list>
        <v-list-item
          @click="addBlankItem(-1)"
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

<style scoped>
.sortable-chosen .item-builder {
  border: 2px solid gray;
}
</style>

<script>
import { mapGetters, mapMutations } from 'vuex';
import config from '../../../config';
import ItemBuilder from './ItemBuilder';
import UrlItemUploader from './UrlItemUploader';
import draggable from 'vuedraggable'


export default {
  components: {
    ItemBuilder,
    UrlItemUploader,
    draggable
  },
  data() {
    return {
      urlItemUploaderKey: 0,
      urlDialog: false,
      warningFlag: false,
      baseKey: 0,
      selectingItems: false,
      transferItemDlg: {
        visible: false,
        index: -1,
      },
      cachedItems: [],
      selectedItems: [],
      movedItem: 0,
    }
  },
  computed: {
    config () {
      return config;
    },

    conditionals () {
      return this.currentActivity.conditionalItems;
    },

    ...mapGetters(config.MODULE_NAME,
      [
        'currentActivity',
        'activities',
      ]
    ),

    draggableItems: {
      get () {
        return this.currentActivity.items;
      },
      set (value) {
        this.cachedItems = this.draggableItems;
        this.updateItemList(value);
      }
    }
  },
  methods: {
    ...mapMutations(config.MODULE_NAME,
      [
        'addItem', 'updateItemList', 'deleteConditional', 'transferItems',
      ]
    ),

    importItem () {
      this.urlDialog = true;
      this.urlItemUploaderKey ++;
    },

    handleChange (evt) {
      const { element, oldIndex, newIndex } = evt.moved;

      this.movedItem = newIndex;
      this.conditionals.map(conditional => {
        if (conditional.showValue.name === element.name) {
          conditional.conditions.map(condition => {
            const itemIndex = this.cachedItems.findIndex(({ name }) => name === condition.ifValue.name);

            if (itemIndex >= newIndex) {
              this.warningFlag = true;
            }
          })
        } else {
          conditional.conditions.map(condition => {
            if (condition.ifValue.name === element.name) {
              const itemIndex = this.cachedItems.findIndex(({ name }) => name === conditional.showValue.name);

              if (itemIndex <= newIndex) {
                this.warningFlag = true;
              }
            }
          })
        }
      });
    },

    revertChanges () {
      this.draggableItems = this.cachedItems;
      this.warningFlag = false
    },

    confirmChanges () {
      const name = this.draggableItems[this.movedItem].name;

      for (let i = this.conditionals.length - 1; i >= 0; i -= 1) {
        const conditional = this.conditionals[i];

        if (name === conditional.showValue.name) {
          this.deleteConditional(i);
        } else if(conditional.conditions.find(({ ifValue }) => name === ifValue.name)) {
          this.deleteConditional(i);
        }
      }

      this.warningFlag = false;
    },

    onUploadItem (response) {
      this.urlDialog = false;
      if (response) {
        this.addItem({ obj: response, index: -1 });
        this.$emit('onAddItem');
      }
    },

    addBlankItem (index = -1) {
      this.addItem({ index });
      this.$emit('onAddItem');
    },

    switchOption (item) {
      const index = this.selectedItems.findIndex(d => d == item);

      if (index >= 0) {
        this.selectedItems.splice(index, 1);
      } else {
        this.selectedItems.push(item);
      }
    },

    moveItemsToOtherActivity () {
      const itemConditionals = [];
      const names = this.selectedItems.map(item => item.name);

      for (let i = this.conditionals.length-1; i >= 0; i--) {
        const conditional = this.conditionals[i];

        if (names.includes(conditional.showValue)) {
          this.deleteConditional(i);
        }
        else if(conditional.conditions.find(({ ifValue }) => names.includes(ifValue.name))) {
          this.deleteConditional(i);
        }
      }

      this.transferItems({
        target: this.transferItemDlg.index,
        items: this.selectedItems
      })

      this.transferItemDlg.visible = false;
    }
  }
}
</script>
