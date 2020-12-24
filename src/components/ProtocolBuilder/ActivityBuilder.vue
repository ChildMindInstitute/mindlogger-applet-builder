<template>
  <div>
    <v-card>
      <v-card-title class="headline grey lighten-2" primary-title>
        <v-icon left>
          mdi-pencil
        </v-icon>
        Edit Activity
      </v-card-title>
      <v-card-text>
        <v-form ref="form" lazy-validation>
          <v-text-field
            v-model="name"
            :rules="textRules"
            counter="55"
            maxlength="55"
            label="Activity Name"
            required
          />
          <v-text-field
            v-model="description"
            :rules="textRules"
            counter="230"
            maxlength="230"
            label="Activity Description"
            required
          />
          <v-text-field
            v-model="preamble"
            counter="20"
            maxlength="20"
            label="Preamble"
            required
          />
          <v-checkbox
            v-model="shuffleActivityOrder"
            label="Shuffle item order"
          />
          <v-checkbox v-model="isSkippable" label="Allow user to skip all items" />
          <v-tabs centered>
            <v-tab>
              Items
            </v-tab>
            <v-tab v-if="conditionalItems.length">
              Conditional logic items
            </v-tab>
            <v-tab>
              Sub-Scales
            </v-tab>

            <v-tab-item>
              <v-card flat>
                <v-card-text>
                  <v-list>
                    <v-list-item v-for="(item, index) in items" :key="item.id">
                      <v-list-item-content>
                        <v-list-item-title v-text="item.name" />
                        <v-list-item-title v-text="item.inputType" />
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-btn icon @click="duplicateItem(index)">
                          <v-icon color="grey lighten-1">
                            content_copy
                          </v-icon>
                        </v-btn>
                      </v-list-item-action>
                      <v-list-item-action>
                        <v-btn icon @click="editItem(index)">
                          <v-icon
                            v-if="item.allowEdit"
                            color="grey lighten-1"
                          >
                            edit
                          </v-icon>
                          <v-icon v-else color="grey lighten-1">
                            mdi-eye
                          </v-icon>
                        </v-btn>
                      </v-list-item-action>
                      <v-list-item-action
                        v-if="item.allowEdit"
                      >
                        <v-btn icon @click="deleteItem(index)">
                          <v-icon color="grey lighten-1">
                            mdi-delete
                          </v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </v-list-item>

                    <v-list-item v-if="compute.length" :key="'cumulatives'">
                      <v-list-item-content>
                        <v-list-item-title v-text="'cumulatives'" />
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-btn icon @click="editCumulatives()">
                          <v-icon color="grey lighten-1">
                            edit
                          </v-icon>
                        </v-btn>
                      </v-list-item-action>
                      <v-list-item-action>
                        <v-btn icon @click="deleteCumulatives()">
                          <v-icon color="grey lighten-1">
                            mdi-delete
                          </v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-tab-item>
            <v-tab-item v-if="conditionalItems.length">
              <v-card flat>
                <v-card-text>
                  <conditional-item-list
                    :options="conditionalItems"
                    :deleteConditionalCallback="onDeleteConditionalCallback"
                    @editConditionalItem="onEditConditionalItem"
                    @dragConditionalItem="onDragConditionalItem"
                  />
                </v-card-text>
              </v-card>
            </v-tab-item>

            <v-tab-item>
              <v-card flat>
                <v-card-text>
                  <v-list>
                    <v-list-item v-for="(subScale, index) in subScales" :key="subScale.variableName">
                      <v-list-item-content>
                        <v-list-item-title>
                          (<v-icon
                            :color="!subScale.lookupTable ? 'grey' : 'primary'"
                          >
                            mdi-table-search
                          </v-icon>)

                          {{ subScale.variableName }}
                        </v-list-item-title>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-btn icon @click="editSubScaleScoring(index)">
                          <v-icon color="grey lighten-1">
                            edit
                          </v-icon>
                        </v-btn>
                      </v-list-item-action>
                      <v-list-item-action>
                        <v-menu bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn icon v-bind="attrs" v-on="on">
                              <v-icon color="grey lighten-1">
                                mdi-table-search
                              </v-icon>
                            </v-btn>
                          </template>

                          <v-list>
                            <v-list-item
                              @click="onCreateLookupTable(index)"
                            >
                              <v-list-item-title>
                                {{ !!subScale.lookupTable ? 'Replace Lookup Table' : 'Set Lookup Table' }}
                              </v-list-item-title>
                            </v-list-item>

                            <v-list-item
                              :disabled="!subScale.lookupTable"
                              @click="onDeleteLookupTable(index)"
                            >
                              <v-list-item-title>Delete Lookup Table</v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </v-list-item-action>
                      <v-list-item-action>
                        <v-btn icon @click="deleteSubScaleScoring(index)">
                          <v-icon color="grey lighten-1">
                            mdi-delete
                          </v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-tab-item>
          </v-tabs>

          <v-row justify="space-around">
            <v-menu bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="primary" v-bind="attrs" v-on="on">
                  Add item
                </v-btn>
              </template>

              <v-list>
                <v-list-item @click="createItem">
                  <v-list-item-title>Blank item</v-list-item-title>
                </v-list-item>
                <v-list-item @click="importItem">
                  <v-list-item-title>Upload from GitHub</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <v-menu :disabled="!ifConditionalAvailable" bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn color="primary" v-bind="attrs" v-on="on">
                  Add conditional logic
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  :disabled="!conditionalRadioItems.length || items.length < 2"
                  @click="createConditionalItem('radio')"
                >
                  <v-list-item-title>Radio/Checkbox</v-list-item-title>
                </v-list-item>
                <v-list-item
                  :disabled="!conditionalSliderItems.length || items.length < 2"
                  @click="createConditionalItem('slider')"
                >
                  <v-list-item-title>Slider</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <v-btn color="primary" @click="onAddSubScale">
              Add Sub-Scale
            </v-btn>
          </v-row>
        </v-form>
        <v-alert v-if="error !== ''" type="error">
          {{ error }}
        </v-alert>
      </v-card-text>
      <v-divider />

      <v-card-actions>
        <v-btn outlined color="primary" @click="onDiscardActivity">
          Discard Changes
        </v-btn>
        <v-spacer />
        <v-btn color="primary" @click="onClickSaveActivity">
          Save Activity
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-dialog v-model="editItemDialog" persistent>
      <ItemBuilder
        :key="componentKey"
        :initial-item-data="initialItemData"
        :is-item-editable="allowEdit"
        :templates="itemTemplates"
        :items="items"
        @removeTemplate="onRemoveTemplate"
        @updateTemplates="onUpdateTemplates"
        @closeItemModal="onCloseItemModal"
      />
    </v-dialog>

    <v-dialog v-model="subScaleDialog" persistent width="800">
      <SubScaleBuilder
        :key="`subScale-${subScaleDlgKey}`"
        :items="items"
        :sub-scales="subScales"
        :edit-index="subScaleEditIndex"
        @closeSubScaleModal="onCloseSubScaleModal"
      />
    </v-dialog>

    <v-dialog v-model="editConditionalItemDialog" persistent>
      <ConditionalItemBuilder
        :key="componentKey"
        :initial-conditional-item-data="initialConditionalItemData"
        :items="conditionalItemsForBuilder"
        :showItems="items"
        :editMode="isConditionalEditMode"
        :editConditionalItemIndex="editConditionalItemIndex"
        :editConditionalCallback="onEditConditionalCallback"
        :type="conditionalBuilderType"
        @closeConditionalItemModal="onCloseConditionalItemModal"
      />
    </v-dialog>

    <v-dialog v-model="urlDialog">
      <UrlItemUploader :key="componentKey" @uploadItem="onUploadItem" />
    </v-dialog>

    <v-dialog v-model="subScaleAlert" width="350">
      <v-card>
        <v-card-title class="grey lighten-2">Sub Scale Alert</v-card-title>
        <v-card-text class="pa-4">Please insert two or more items with scoring option to add sub-scale.</v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="lookupTableDialog" persistent>
      <LookUpTableUploader
        :sub-scale="subScales[subScaleEditIndex]"
        :key="`lookup-table-${lookupTableUploadDlgKey}`"
        @closeLookupTableModal="onCloseLookUpTableModal"
      />
    </v-dialog>
  </div>
</template>

<script>
import ItemBuilder from './ItemBuilder.vue';
import ConditionalItemBuilder from './ConditionalItemBuilder.vue';
import UrlItemUploader from './UrlItemUploader.vue';
import ConditionalItemList from './ConditionalItemList.vue';
import SubScaleBuilder from './SubScaleBuilder.vue';
import LookUpTableUploader from './LookUpTableUploader';
import { string } from 'prop-types';
import Activity from '../../models/Activity';
import Item from '../../models/Item';
import { ageScreen, genderScreen } from './lookupTable';

export default {
  components: {
    ItemBuilder,
    ConditionalItemBuilder,
    UrlItemUploader,
    ConditionalItemList,
    SubScaleBuilder,
    LookUpTableUploader,
  },
  props: {
    initialActivityData: {
      type: Object,
      required: true
    },
    templates: {
      type: Array,
      required: false,
      default: null,
    }
  },
  data: function() {
    const model = new Activity();
    model.updateReferenceObject(this);

    return {
      model,
      ...model.getActivityBuilderData(this.initialActivityData),
      itemTemplates: [],

      subScaleAlert: false,
      subScaleDialog: false,
      subScaleDlgKey: 0,
      subScaleEditIndex: -1,
      lookupTableDialog: false,
      lookupTableUploadDlgKey: 0,
    };
  },
  watch: {
    items() {
      this.conditionalRadioItems = this.collectConditionals('radio');
      this.conditionalSliderItems = this.collectConditionals('slider');

      this.checkIfConditionalAvailable();
    },
  },
  created() {
    this.conditionalRadioItems = this.collectConditionals('radio');
    this.conditionalSliderItems = this.collectConditionals('slider');

    this.checkIfConditionalAvailable();
  },
  beforeMount() {
    this.itemTemplates = this.templates
  },
  methods: {
    checkIfConditionalAvailable() {
      this.ifConditionalAvailable =
        (this.conditionalRadioItems.length && this.items.length >= 2) ||
        (this.conditionalSliderItems.length && this.items.length >= 2) ||
        this.conditionalItems.length;
    },
    collectConditionals(type) {
      return this.items.filter((item) => {
        return item.ui.inputType === type;
      });
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.snackbar = true;
      }
    },
    forceUpdate() {
      this.componentKey += 1;
    },
    createItem() {
      this.allowEdit = true;
      this.editIndex = -1;
      this.initialItemData = {
        options: {},
      };
      this.forceUpdate();
      this.editItemDialog = true;
    },
    createConditionalItem(type) {
      this.isConditionalEditMode = false;
      this.conditionalBuilderType = type;
      this.conditionalItemsForBuilder =
        type === 'radio'
          ? this.conditionalRadioItems
          : this.conditionalSliderItems;
      this.editConditionalItemIndex = -1;
      this.editConditionalItemDialog = true;
    },
    importItem() {
      this.editIndex = -1;
      this.initialItemData = {
        options: {},
      };
      this.forceUpdate();
      this.urlDialog = true;
    },
    onUpdateTemplates(option) {
      this.$emit('updateTemplates', option);
    },
    onRemoveTemplate(option) {
      this.$emit('removeTemplate', option);
    },
    onCloseItemModal(response) {
      this.editItemDialog = false;
      if (response) {
        this.onNewItem(response);
      }
    },
    onDragConditionalItem(items) {
      this.conditionalItems = items;
    },
    onCloseConditionalItemModal(response) {
      this.editConditionalItemDialog = false;
    },
    onEditConditionalCallback(payload, isForEdit) {
      this.editConditionalItemDialog = false;
      if (isForEdit) {
        this.$set(this.conditionalItems, payload.index, payload.item);
      } else {
        let condItems = this.conditionalItems.concat(payload);
        this.conditionalItems = condItems;
      }

      this.forceUpdate();
    },
    onDeleteConditionalCallback(index) {
      this.conditionalItems.splice(index, 1);
    },
    onEditConditionalItem(index) {
      this.editConditionalItemIndex = index;
      this.initialConditionalItemData = this.conditionalItems[index];
      this.conditionalBuilderType = this.initialConditionalItemData.ifValue.ui.inputType;
      this.conditionalItemsForBuilder =
        this.conditionalBuilderType === 'radio'
          ? this.conditionalRadioItems
          : this.conditionalSliderItems;
      this.forceUpdate();
      this.isConditionalEditMode = true;
      this.editConditionalItemDialog = true;
    },
    onUploadItem(response) {
      this.urlDialog = false;
      if (response) {
        this.onNewItem(response);
        const editIndex = this.items.length - 1;
        this.editItem(editIndex);
      }
    },
    onNewItem(item) {
      if (item.ui && item.ui.inputType == 'cumulativeScore') {
        let compute = [], messages = [];

        item.cumulativeScores.forEach(cumulative => {
          compute.push(cumulative.compute);
          messages.push(...cumulative.messages);
        })

        this.compute = compute;
        this.messages = messages;

        return ;
      }

      if (this.editIndex >= 0 && this.editIndex < this.items.length) {
        if (this.items[this.editIndex].name != item.name) {
          /** update associated sub-scale names when item name is updated */
          this.subScales.forEach(subScale => {
            let itemNames = subScale.jsExpression.split(' + ');

            subScale.jsExpression = itemNames.map(name => 
              name === this.items[this.editIndex].name ? item.name : name
            ).join(' + ');
          })

          this.conditionalItems.forEach(condition => {
            if (condition.ifValue.name === this.items[this.editIndex].name) {
              condition.ifValue.name = item.name;
              condition.ifValue["@id"] = item.name;
            }
            if (condition.showValue === this.items[this.editIndex].name) {
              condition.showValue = item.name;
            }
          })
        }
        this.items[this.editIndex] = item;
      } else {
        let ageItemIndex = this.items.findIndex(item => !item.allowEdit);

        if (ageItemIndex >= 0) {
          this.items.splice(ageItemIndex, 0, item);
        } else {
          this.items.push(item);
        }
      }
    },
    duplicateItem(index) {
      const itemModel = new Item();
      const names = this.items.map((item) => item.name);

      let suffix = 1;
      while (names.includes(`${this.items[index].name} (${suffix})`)) {
        suffix++;
      }

      itemModel.updateReferenceObject(
        itemModel.getItemBuilderData({
          ...this.items[index],
          _id: null,
          name: `${this.items[index].name} (${suffix})`,
        })
      ); 
      const pureItem = JSON.parse(JSON.stringify(itemModel.getItemData()));
      this.items.push(pureItem);
    },
    editItem(index) {
      this.editIndex = index;
      this.initialItemData = this.items[index];
      this.allowEdit = this.initialItemData.allowEdit;
      this.forceUpdate();
      this.editItemDialog = true;
    },
    deleteItem(index) {
      /** delete associated sub-scales */
      this.subScales = this.subScales.filter(subScale => !subScale.jsExpression.split(' + ').includes(this.items[index].name));
      this.items.splice(index, 1);
    },
    onClickSaveActivity() {
      if (this.isActivityValid()) {
        this.saveActivity();
      }
    },
    isActivityValid() {
      if (!this.name) {
        this.error = 'Activity Name is required';
        return false;
      } else if (!this.description) {
        this.error = 'Activity Description is required';
        return false;
      } else if (this.items.length == 0) {
        this.error = 'Activities must contain at least one item';
        return false;
      } else {
        this.error = '';
      }
      return true;
    },
    saveActivity() {
      this.$emit('closeModal', this.model.getActivityData());
    },
    onDiscardActivity() {
      this.$emit('closeModal', null);
    },
    editSubScaleScoring(index) {
      this.subScaleEditIndex = index;
      this.subScaleDlgKey++;
      this.subScaleDialog = true;
    },
    deleteSubScaleScoring(index) {
      this.subScales.splice(index, 1);

      if (!this.subScales.find((subScale) => !!subScale['lookupTable'])) {
        // delete items asking gender and age
        this.items = this.items.filter(item => item.allowEdit);
      }
    },
    onAddSubScale() {
      if (!this.subScaleAvailable()) {
        this.subScaleAlert = true;
        return ;
      }

      this.subScaleEditIndex = -1;
      this.subScaleDlgKey++;
      this.subScaleDialog = true;
    },
    subScaleAvailable() {
      let itemsWithScoring = 0;

      for (let item of this.items) {
        if (item.ui.inputType == 'radio' || item.ui.inputType == 'slider') {
          if (item.responseOptions.scoring) {
            itemsWithScoring++;
          }
        }
      }
      return itemsWithScoring >= 2;
    },
    onCloseSubScaleModal(subScale) {
      this.subScaleDialog = false;

      if (subScale) {
        if (this.subScaleEditIndex >= 0) {
          this.$set(this.subScales, this.subScaleEditIndex, subScale);
        } else {
          this.subScales.push(subScale);
        }
      }
    },

    onCloseLookUpTableModal(lookupTable) {
      this.lookupTableDialog = false;

      if (lookupTable) {
        if (!this.subScales.find((subScale) => !!subScale['lookupTable'])) {
          for (let screen of [ageScreen, genderScreen]) {
            const itemModel = new Item();
            itemModel.updateReferenceObject(
              itemModel.getItemBuilderData(screen)
            );

            this.items.push(
              itemModel.getItemData()
            );
          }
        }

        this.$set(this.subScales[this.subScaleEditIndex], 'lookupTable', lookupTable);
      }
    },

    onCreateLookupTable(index) {
      this.subScaleEditIndex = index;
      this.lookupTableDialog = true;
      this.lookupTableUploadDlgKey++;
    },

    onDeleteLookupTable(index) {
      let updatedSubScale = {...this.subScales[index]};

      delete updatedSubScale['lookupTable'];

      this.$set(this.subScales, index, updatedSubScale);

      if (!this.subScales.find((subScale) => !!subScale['lookupTable'])) {
        // delete items asking gender and age
        this.items = this.items.filter(item => item.allowEdit);
      }
    },

    editCumulatives() {
      this.editIndex = this.items.length;
      this.initialItemData = {
        name: 'cumulatives',
        ui: {
          inputType: 'cumulativeScore'
        },
        cumulativeScores: this.compute.map(compute => {
          return {
            compute,
            messages: this.messages.filter(message => message.jsExpression.split(/[<>]=*\s/g)[0].trim() == compute.variableName.trim()),
          }
        }).filter(cumulative => cumulative.messages.length === 2)
      };
      this.allowEdit = true;

      this.forceUpdate();
      this.editItemDialog = true;
    },

    deleteCumulatives() {
      this.compute = [];
      this.messages = [];
    }
  },
};
</script>
