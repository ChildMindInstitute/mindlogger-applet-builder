<template>
  <div>
    <v-card>
      <v-card-title
        class="headline grey lighten-2"
        primary-title
      >
        New Activity
      </v-card-title>
      <v-card-text>
        <v-form
          ref="form"
          :lazy-validation="lazy"
        >
          <v-text-field
            v-model="name"
            :rules="textRules"
            label="Activity Name"
            required
          ></v-text-field>
          <v-text-field
            v-model="description"
            :rules="textRules"
            label="Activity Description"
            required
          ></v-text-field>
          <v-subheader>
            Items
          </v-subheader>
          <v-list>
            <v-list-item v-for="(item, index) in items" v-bind:key="item.id">
              <v-list-item-content>
                <v-list-item-title v-text="item.name"></v-list-item-title>
                <v-list-item-subtitle v-text="item.inputType"></v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon @click="editItem(index)">
                  <v-icon color="grey lighten-1">mdi-pencil</v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action>
                <v-btn icon @click="duplicateItem(index)">
                  <v-icon color="grey lighten-1">mdi-content-copy</v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action>
                <v-btn icon @click="deleteItem(index)">
                  <v-icon color="grey lighten-1">mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-list-item @click="addItem">
              <v-icon color="grey lighten-1">mdi-plus</v-icon>
            </v-list-item>
          </v-list>
        </v-form>
        <v-alert
          style="margin-top: 12px;"
          v-if="this.error"
          type="error"
        >
          {{this.error}}
        </v-alert>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-btn
          color="danger"
          text
          @click="onDiscardActivity"
        >
          Discard
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="onClickSaveActivity"
        >
          Save Activity
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog
      v-model="dialog"
    >
      <ItemBuilder v-on:closeItemModal="onCloseItemModal"/>
      
    </v-dialog>
    <v-dialog
      v-model="editDialog"
    >
      <ItemBuilder v-on:closeItemModal="onCloseItemModal" />
      
    </v-dialog>
  </div>
</template>

<script>

import ItemBuilder from './ItemBuilder.vue';

export default {
  components: {
    ItemBuilder
  },
  data: () => ({
      name: '',
      description: '',
      items: [],
      textRules: [
        v => !!v || 'This field is required',
      ],
      lazy: false,
      dialog: false,
      editDialog: false,
      error: '',
      editIndex: 0,
    }),

    methods: {
      validate () {
        if (this.$refs.form.validate()) {
          this.snackbar = true
        }
      },
      addItem () {
        this.dialog = true;
      },
      onCloseItemModal(response) {
        this.dialog = false;
        if (response) {
          this.onNewItem(response);
        }
      },
      onNewItem(item) {
        console.log(item);
        this.items.push(item);
      },
      editItem(index) {
        this.editIndex = index;
        this.editDialog = true;
        return index;
      },
      duplicateItem(index) {
        this.items.push(this.items[index]);
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
              "https://raw.githubusercontent.com/ReproNim/reproschema/master/activities/EmaHBNMorning/ema_morning_context"
          ],
          "@type": "reproschema:Activity",
          "@id": this.name,
          "skos:prefLabel": this.name,
          "skos:altLabel": this.name,
          "schema:description": this.description,
          "schema:schemaVersion": "0.0.1",
          "schema:version": "0.0.1",
          "preamble": "",
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
        contextObj[activityName] = `https://raw.githubusercontent.com/ReproNim/reproschema/master/activities/${activityName}/items/`;
        this.items.forEach(function(item) {
          contextObj[item.name] = {
            '@id': `morning:${item.name}`,
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
        const itemSchemaArray = this.items.map(item => item.schema);
        this.$emit('closeModal', {
          'name': this.name,
          'description': this.description,
          'schema': schema,
          'context': context,
          'itemSchemaArray': itemSchemaArray
        });
      },
      onDiscardActivity() {
        this.$emit('closeModal', null);
      }
    },
};
</script>

