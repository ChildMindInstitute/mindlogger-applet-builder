<template>
  <div>
    <v-card>
      <v-card-title
        class="headline grey lighten-2"
        primary-title
      >
        Edit Activity
      </v-card-title>
      <v-card-text>
        <v-form
          ref="form"
          :lazy-validation="false"
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
          <v-switch
            v-model="shuffleActivityOrder"
            label="Shuffle"
          />
          <v-subheader>
            Items
          </v-subheader>
          <v-list>
            <v-col>
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
                    <v-icon color="grey lighten-1">
                      content_copy
                    </v-icon>
                  </v-btn>
                </v-list-item-action>
                <v-list-item-action>
                  <v-btn
                    icon
                    @click="editItem(index)"
                  >
                    <v-icon color="grey lighten-1">
                      edit
                    </v-icon>
                  </v-btn>
                </v-list-item-action>
                <v-list-item-action>
                  <v-btn
                    icon
                    @click="deleteItem(index)"
                  >
                    <v-icon color="grey lighten-1">
                      delete
                    </v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
              <v-list-item @click="addItem">
                <v-icon color="grey lighten-1">
                  add
                </v-icon>
              </v-list-item>
            </v-col>
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
          Discard
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
      v-model="dialog"
    >
      <ItemBuilder
        :key="componentKey"
        :initial-item-data="initialItemData"
        @closeItemModal="onCloseItemModal"
      />
    </v-dialog>
  </div>
</template>

<style scoped>
.v-input--switch__track {
    border-radius: 8px;
    width: 36px;
    height: 14px;
    left: 2px;
    position: absolute;
    opacity: 0.6;
    right: 2px;
    top: calc(50% - 7px);
}

.v-input--switch__thumb {
    border-radius: 50%;
    top: calc(50% - 10px);
    height: 20px;
    position: relative;
    width: 20px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
    transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
</style>

<script>

import ItemBuilder from './ItemBuilder.vue';
import { string } from 'prop-types';

export default {
  components: {
    ItemBuilder
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
      items: this.initialActivityData.items || [],
      textRules: [
        v => !!v || 'This field is required',
      ],
      dialog: false,
      error: '',
      componentKey: 0,
      initialItemData: {
        options: {},
      },
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
    addItem () {
      this.editIndex = -1;
      this.initialItemData = {};
      this.forceUpdate();
      this.dialog = true;
    },
    onCloseItemModal(response) {
      this.dialog = false;
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
      this.forceUpdate();
      this.dialog = true;
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
    getSchema() {
      const visibility = this.getItemVisibility();
      const itemOrder = this.getItemOrder();
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
            "shuffle": false,
            "visibility": visibility
        }
      };
    },
    getContext() {
      const activityName = this.name;
      const contextObj = {
        "@version": 1.1
      };
      contextObj[activityName] = `https://raw.githubusercontent.com/YOUR-PATH-TO-ITEM-FOLDER`;
      this.items.forEach(function(item) {
        contextObj[item.name] = {
          '@id': `${activityName}:${item.name}`,
          '@type': '@id'
        };
      });
      return {
        "@context": contextObj
      };
    },
    saveActivity() {
      const schema = this.getSchema();
      const context = this.getContext();
      const items = this.items;
      this.$emit('closeModal', {
        'name': this.name,
        'description': this.description,
        'preamble': this.preamble,
        'shuffle': this.shuffleActivityOrder,
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

