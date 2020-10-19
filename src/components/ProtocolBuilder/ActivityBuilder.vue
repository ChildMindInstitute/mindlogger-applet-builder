<template>
  <div>
    <v-card>
      <v-card-title
        class="headline grey lighten-2"
        primary-title
      >
        <v-icon left>
          mdi-pencil
        </v-icon>
        Edit Activity
      </v-card-title>
      <v-card-text>
        <v-form
          ref="form"
          lazy-validation
        >
          <v-text-field
            v-model="name"
            :rules="textRules"
            counter="50"
            maxlength="50"
            label="Activity Name"
            required
          />
          <v-text-field
            v-model="description"
            :rules="textRules"
            counter="100"
            maxlength="100"
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
          <v-checkbox
            v-model="isSkippable"
            label="Allow items to be skipped"
          />
          <v-subheader>
            Items
          </v-subheader>
          <v-list>
            <v-list-item
              v-for="(item, index) in items"
              :key="item.id"
            >
              <v-list-item-content>
                <v-list-item-title v-text="item.name" />
                <v-list-item-title v-text="item.inputType" />
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  icon
                  @click="duplicateItem(index)"
                >
                  <v-icon
                    color="grey lighten-1"
                  >
                    content_copy
                  </v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action>
                <v-btn
                  icon
                  @click="editItem(index)"
                >
                  <v-icon 
                    v-if="item.isItemEditable"
                    color="grey lighten-1"
                  >
                    edit
                  </v-icon>
                  <v-icon
                    v-else
                    color="grey lighten-1"
                  >
                    mdi-eye
                  </v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action>
                <v-btn
                  icon
                  @click="deleteItem(index)"
                >
                  <v-icon
                    color="grey lighten-1"
                  >
                    mdi-delete
                  </v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-menu>
              <template v-slot:activator="{ on }">
                <v-list-item
                  v-on="on"
                >
                  <v-icon color="grey lighten-1">
                    add
                  </v-icon>
                </v-list-item>
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
          </v-list>
        </v-form>
        <v-alert
          v-if="error !== ''"
          type="error"
        >
          {{ error }}
        </v-alert>
      </v-card-text>
      <v-divider />

      <v-card-actions>
        <v-btn
          outlined
          color="primary"
          @click="onDiscardActivity"
        >
          Discard Changes
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          @click="onClickSaveActivity"
        >
          Save Activity
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog
      v-model="editItemDialog"
      persistent
    >
      <ItemBuilder
        :key="componentKey"
        :initial-item-data="initialItemData"
        :is-item-editable="isItemEditable"
        :templates="itemTemplates"
        @removeTemplate="onRemoveTemplate"
        @updateTemplates="onUpdateTemplates"
        @closeItemModal="onCloseItemModal"
      />
    </v-dialog>
    <v-dialog
      v-model="urlDialog"
      persistent
    >
      <UrlItemUploader
        :key="componentKey"
        @uploadItem="onUploadItem"
      />
    </v-dialog>
  </div>
</template>

<script>

import ItemBuilder from './ItemBuilder.vue';
import UrlItemUploader from './UrlItemUploader.vue';
import { string } from 'prop-types';
import Activity from '../../models/Activity';
import Item from '../../models/Item';

export default {
  components: {
    ItemBuilder,
    UrlItemUploader,
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
  data: function () {
    const model = new Activity();
    model.updateReferenceObject(this);

    return {
      model,
      ...model.getActivityBuilderData(this.initialActivityData),
      itemTemplates: []
    }
  },
  beforeMount() {
    this.itemTemplates = this.templates
  },
  methods: {
    validate () {
      if (this.$refs.form.validate()) {
        this.snackbar = true
      }
    },
    forceUpdate() {
      this.componentKey += 1;
    },
    createItem() {
      this.isItemEditable = true;
      this.editIndex = -1;
      this.initialItemData = {
        options: {},
      };
      this.forceUpdate();
      this.editItemDialog = true;
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
    onUploadItem(response) {
      this.urlDialog = false;
      if (response) {
        this.onNewItem(response);
        const editIndex = this.items.length - 1;
        this.editItem(editIndex);
      }
    },
    onNewItem(item) {
      if (this.editIndex >= 0 && this.editIndex < this.items.length) {
        this.items[this.editIndex] = item;
      } else {
        this.items.push(item);
      }
    },
    duplicateItem(index) {
      const itemModel = new Item();
      const names = this.items.map(item => item.name);

      let suffix = 1;
      while( names.includes(`${this.items[index].name} (${suffix})`) ) {
        suffix++;
      }

      itemModel.updateReferenceObject(itemModel.getItemBuilderData({
        ...this.items[index],
        _id: null,
        name: `${this.items[index].name} (${suffix})`
      }));

      this.items.push(itemModel.getItemData());
    },
    editItem(index) {
      this.editIndex = index;
      this.initialItemData = this.items[index];
      this.isItemEditable = this.initialItemData.isItemEditable;
      this.forceUpdate();
      this.editItemDialog = true;
    },
    deleteItem(index) {
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
    }
  },
};
</script>
