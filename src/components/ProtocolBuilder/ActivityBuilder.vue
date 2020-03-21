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
            label="Activity Name"
            required
          />
          <v-text-field
            v-model="description"
            :rules="textRules"
            label="Activity Description"
            required
          />
          <v-text-field
            v-model="preamble"
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
                <v-list-item-sub-title v-text="item.inputType" />
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

export default {
  components: {
    ItemBuilder,
    UrlItemUploader,
  },
  props: {
    initialActivityData: {
      type: Object,
      required: true
    }
  },
  data: function () {
    return {
      name: this.initialActivityData.name || '',
      description: this.initialActivityData.description || '',
      preamble: this.initialActivityData.preamble || '',
      shuffleActivityOrder: this.initialActivityData.shuffle || false,
      isSkippable: this.initialActivityData.isSkippable || false,
      items: this.initialActivityData.items || [],
      textRules: [
        v => !!v || 'This field is required',
      ],
      editItemDialog: false,
      urlDialog: false,
      error: '',
      componentKey: 0,
      initialItemData: {
        options: {},
      },
      isItemEditable: true,
      editIndex: -1
    }
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
      this.items.push(this.items[index]);
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
    getItemVisibility() {
      const visibilityObj = {}
      this.items.forEach(function(item) {
        visibilityObj[item.name] = true;
      });
      return visibilityObj;
    },
    getItemOrder() {
      const itemNamesArray = this.items.map(item => item.name)
      return itemNamesArray;
    },
    getAllowed() {
      return this.isSkippable ? ["skipped"] : [];
    },
    getCompressedSchema() {
      const visibility = this.getItemVisibility();
      const itemOrder = this.getItemOrder();
      const allowed = this.getAllowed();
      return {
        "@context": [ "https://raw.githubusercontent.com/ReproNim/reproschema/master/contexts/generic",
            "https://raw.githubusercontent.com/YOUR-ACTIVITY-CONTEXT-FILE"
        ],
        "@type": "reproschema:Activity",
        "@id": this.name,
        "skos:prefLabel": this.name,
        "skos:altLabel": this.name,
        "schema:description": this.description,
        "schema:schemaVersion": "0.0.1",
        "schema:version": "0.0.1",
        "preamble": this.preamble,
        "scoringLogic": {
        },
        "repronim:timeUnit": "yearmonthdate",
        "ui": {
            "order": itemOrder,
            "shuffle": this.shuffleActivityOrder,
            "visibility": visibility,
            "allow": allowed
        }
      };
    },
    getContext() {
      const activityName = this.name;
      const contextObj = {
        "@version": 1.1
      };
      const isPrefixNeeded = false;
      this.items.forEach(function(item) {
        if ('iri' in item) {
          contextObj[item.name] = {
            '@id': item.iri,
            '@type': '@id',
          };
        } else {
          contextObj[item.name] = {
            '@id': `${activityName}:${item.name}`,
            '@type': '@id',
          };
          isPrefixNeeded = true;
        }
      });
      if (isPrefixNeeded) {
        contextObj[activityName] = `https://raw.githubusercontent.com/YOUR-PATH-TO-ITEM-FOLDER`;
      }

      return {
        "@context": contextObj
      };
    },
    saveActivity() {
      const schema = this.getCompressedSchema();
      const context = this.getContext();
      const items = this.items;
      this.$emit('closeModal', {
        'name': this.name,
        'description': this.description,
        'preamble': this.preamble,
        'shuffle': this.shuffleActivityOrder,
        'isSkippable': this.isSkippable,
        'schema': schema,
        'context': context,
        'items': items
      });
    },
    onDiscardActivity() {
      this.$emit('closeModal', null);
    }
  },
};
</script>

