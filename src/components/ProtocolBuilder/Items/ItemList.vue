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
          @click="checkVariableNameOnMovement"
          dark
        >
          Move to ...
        </v-btn>

        <div class="flex-grow-1" />

        <v-btn
          v-if="!selectingItems"
          class="ml-4"
          icon
          @click="selectingItems = !selectingItems"
          :disabled="activities.length == 1"
        >
          <v-icon color="lighten-1">
            mdi-cursor-move
          </v-icon>
        </v-btn>

        <v-tooltip v-else bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              class="ml-4"
              icon
              @click="selectingItems = !selectingItems"
              :disabled="activities.length == 1"
              v-on="on"
            >
              <v-icon color="lighten-1">
                mdi-cancel
              </v-icon>
            </v-btn>
          </template>
          <span>Cancel</span>
        </v-tooltip>
      </div>
    </v-card-title>

    <div>
      <draggable
        v-model="draggableItems"
        handle=".dragging-handle"
        @change="handleChange($event)"
        :scroll-sensitivity="100"
        :force-fallback="true"
      >
        <transition-group>
          <template
            v-for="(item, index) in currentActivity.items"
          >
            <div
              v-if="item.inputType != 'cumulativeScore'"
              :key="`${item.timestamp}-${item.id || 0}`"
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
                :variablesItems="variablesItems"
                :header="item.header"
                :section="item.section"
                class="ma-4 flex-grow-1 item-builder"
                @addItem="addBlankItem(index+1)"
              />
            </div>
          </template>
        </transition-group>
      </draggable>

      <div
        v-if="cumulativeItem"
        :key="`${cumulativeItem.timestamp}-${cumulativeItem.id || 0}`"
        class="d-flex align-center"
      >
        <ItemBuilder
          :item-index="currentActivity.items.indexOf(cumulativeItem)"
          :variablesItems="variablesItems"
          :header="cumulativeItem.header"
          :section="cumulativeItem.section"
          class="ma-4 flex-grow-1 item-builder"
        />
      </div>

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
      v-model="successDlg"
      max-width="600"
    >
      <v-card>
        <v-card-title class="text-h5">
          Successfully moved
        </v-card-title>
        <v-card-text>
          <p>These items have been successfully moved to {{ targetActivity }}</p>
          <ul class="list-group">
            <li v-for="(name, index) in movedItems.map(item => item.name)" :key="index">
              {{ name }}
            </li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="successDlg = false"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="transferConfirmDlg"
      max-width="600"
    >
      <v-card>
        <v-card-title>
          Do you want to continue?
        </v-card-title>

        <v-card-text>
          <p>By moving these items to {{ targetActivity }}, it will result in the below</p>
          <ul class="list-group">
            <li v-for="(errorMessage, index) in errorMessages" :key="index">
              {{ errorMessage }}
            </li>
          </ul>
        </v-card-text>

        <v-card-actions class="justify-space-around">
          <v-btn
            @click="moveItemsToOtherActivity"
          >
            OK
          </v-btn>

          <v-btn
            @click="cancelMovingItems"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
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
            @click="confirmMovementOfItems"
            :disabled="transferItemDlg.index < 0"
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
            {{warningMsg}}
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
import { checkItemVariableNameIndex } from '../../../utilities/util';

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
      transferConfirmDlg: false,
      successDlg: false,
      transferItemDlg: {
        visible: false,
        index: -1,
      },
      cachedItems: [],
      selectedItems: [],
      movedItems: [],
      errorMessages: [],
      cumulativeData: [],
      subScaleData: [],
      movedItem: 0,
      warningMsg: 'Moving this item will cause your conditional logic to fail.',
      variablesItems: {},
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

    targetActivity () {
      const targetActivity = this.activities[this.transferItemDlg.index];

      if (targetActivity) {
        return targetActivity.name;
      } else {
        return '';
      }
    },

    draggableItems: {
      get () {
        return this.currentActivity.items;
      },
      set (value) {
        this.cachedItems = this.draggableItems;
        this.updateItemList(value);
      }
    },

    cumulativeItem () {
      return this.currentActivity.items.find(item => item.inputType == 'cumulativeScore')
    }
  },
  methods: {
    ...mapMutations(config.MODULE_NAME,
      [
        'updateItemList',
        'deleteConditional',
        'transferItems',
        'removeScoresAndSubScals',
        'addItem',
      ]
    ),

    importItem () {
      this.urlDialog = true;
      this.urlItemUploaderKey ++;
    },

    handleChange (evt) {
      const { element, oldIndex, newIndex } = evt.moved;

      const invalidLargeTextIndex = checkItemVariableNameIndex(element.question.text, { items: this.cachedItems }, true);
      if (newIndex <= invalidLargeTextIndex ) {
        this.warningMsg = "This item has been moved above the user's input. Please move it above  in order for the variable to work correctly.";
        this.warningFlag = true;
        return;
      }

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
      if (this.warningMsg && this.warningMsg.includes('By moving')){
        this.warningFlag = false
        return;
      }

      this.draggableItems = this.cachedItems;
      this.warningFlag = false
    },

    confirmChanges () {
      if (this.warningMsg && this.warningMsg.includes('By moving')) {
        this.transferItemDlg.visible = true
        this.warningFlag = false
        return;
      }
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

    checkVariableNameOnMovement() {
      const items = this.cachedItems.length ? this.cachedItems : this.draggableItems;
      for (const item of this.selectedItems) {
        const invalidLargeTextIndex = checkItemVariableNameIndex(item.question.text, { items });
        if (invalidLargeTextIndex != -1) {
          if (this.selectedItems.length > 1)
            this.warningMsg = `By moving these items, to another activity will cause some items to fail. Do you want to continue? (Please fix those items if you choose to continue.)`;
          else
            this.warningMsg = `By moving ${item.name}, to another activity will cause ${item.name} to fail. Do you want to continue? (Please fix ${item.name} if you choose to continue.)`;
          this.warningFlag = true;
          return;
        } else {
          for (const cachedItem of items) {
            const invalidLargeTextIndex = checkItemVariableNameIndex(cachedItem.question.text, { items: [item] });
            if (invalidLargeTextIndex != -1) {
              if (this.selectedItems.length > 1)
                this.warningMsg = `By moving these items, to another activity will cause some items to fail. Do you want to continue? (Please fix those items if you choose to continue.)`;
              else
                this.warningMsg = `By moving ${item.name}, to another activity will cause ${cachedItem.name} to fail. Do you want to continue? (Please fix ${cachedItem.name} if you choose to continue.)`;
              this.warningFlag = true;
              return;
            }
          }
        }
      }
      this.transferItemDlg.visible = true
    },

    confirmMovementOfItems () {
      const cumulativeItem = this.currentActivity.items.find(({ name }) => name === "cumulatives");

      this.selectedItems.forEach(item => {
        if (cumulativeItem) {
          this.cumulativeData = cumulativeItem.cumulativeScores.map(score => {
            let { jsExpression } = score.compute;
            if (jsExpression.includes(item.name)) {
              const values = jsExpression.split(' + ');
              let scoreName = score.name;

              if (!scoreName) {
                scoreName = score.compute.variableName;
              }

              jsExpression = values.filter(value => value !== item.name).join(" + ");
              this.errorMessages.push(`${item.name} is removed from ${scoreName}`);
            }

            return {
              ...score,
              compute: {
                ...score.compute,
                jsExpression
              }
            };
          })
        }

        this.currentActivity.subScales.forEach(subScale => {
          const currentSubScale = this.subScaleData.find(({ variableName }) => variableName === subScale.variableName);
          const items = currentSubScale
            ? currentSubScale.items.filter(({ name }) => name !== item.name)
            : subScale.items.filter(({ name }) => name !== item.name);
          let { jsExpression } = currentSubScale ? currentSubScale : subScale;

          if (items.length !== subScale.items.length) {
            const values = jsExpression.split(' + ');

            jsExpression = values.filter(value => value !== item.name).join(" + ");
            this.errorMessages.push(`${item.name} is removed from your ${subScale.variableName}`);
          }

          this.subScaleData = this.subScaleData.filter(({ variableName }) => variableName !== subScale.variableName);

          if (items.length) {
            this.subScaleData.push({
              ...subScale,
              jsExpression,
              items
            });
          }
        });

        for (let i = this.conditionals.length-1; i >= 0; i -= 1) {
          const conditional = this.conditionals[i];

          if (
            item.name === conditional.showValue.name ||
            conditional.conditions.find(({ ifValue }) => item.name === ifValue.name)
          ) {
            this.errorMessages.push(`${item.name} will cause your conditional logic to fail`);
            break;
          }
        }
      })

      if (this.errorMessages.length) {
        this.transferConfirmDlg = true;
      } else {
        this.successDlg = true;
        this.transferItems({
          target: this.transferItemDlg.index,
          items: this.selectedItems
        });

        this.movedItems = this.selectedItems;
        this.selectedItems = [];
      }
      this.transferItemDlg.visible = false;
    },

    cancelMovingItems () {
      this.errorMessages = [];
      this.transferConfirmDlg = false;
    },

    moveItemsToOtherActivity () {
      const itemConditionals = [];
      const names = this.selectedItems.map(item => item.name);

      for (let i = this.conditionals.length-1; i >= 0; i--) {
        const conditional = this.conditionals[i];

        if (names.includes(conditional.showValue.name)) {
          this.deleteConditional(i);
        }
        else if(conditional.conditions.find(({ ifValue }) => names.includes(ifValue.name))) {
          this.deleteConditional(i);
        }
      }

      this.transferItems({
        target: this.transferItemDlg.index,
        items: this.selectedItems
      });
      this.removeScoresAndSubScals({
        scores: this.cumulativeData,
        subScales: this.subScaleData,
      })
      this.movedItems = this.selectedItems;
      this.selectedItems = [];
      this.errorMessages = [];
      this.subScaleData = [];
      this.transferConfirmDlg = false;
      this.successDlg = true;
    }
  }
}
</script>
