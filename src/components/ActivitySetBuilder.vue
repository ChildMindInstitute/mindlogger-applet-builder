<template>
  <v-container>
    <v-layout
      wrap
      column
    >
      <v-form
        ref="form"
        :lazy-validation="lazy"
      >
        <v-text-field
          v-model="name"
          :rules="textRules"
          label="Activity Set Name"
          required
        ></v-text-field>
        <v-text-field
          v-model="description"
          :rules="textRules"
          label="Activity Set Description"
          required
        ></v-text-field>
        <v-list>
          <v-subheader>
            Activities
          </v-subheader>
          <v-list-item v-for="(activity, index) in activities" v-bind:key="activity.id">
            <v-list-item-content>
              <v-list-item-title v-text="activity.name"></v-list-item-title>
              <v-list-item-subtitle v-text="activity.description"></v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon @click="editActivity(index)">
                <v-icon color="grey lighten-1">mdi-pencil</v-icon>
              </v-btn>
            </v-list-item-action>
            <v-list-item-action>
              <v-btn icon @click="duplicateActivity(index)">
                <v-icon color="grey lighten-1">mdi-content-copy</v-icon>
              </v-btn>
            </v-list-item-action>
            <v-list-item-action>
              <v-btn icon @click="deleteActivity(index)">
                <v-icon color="grey lighten-1">mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-list-item @click="addActivity">
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
      <v-btn style="margin-top: 18px;" color="primary" @click="onClickSaveActivitySet">Download Activity Set</v-btn>
    </v-layout>
    <v-dialog
      v-model="dialog"
      width="800"
    >
      <ActivityBuilder v-on:closeModal="onCloseActivityModal"/>
      
    </v-dialog>
  </v-container>
</template>

<script>

import ActivityBuilder from './ActivityBuilder.vue';
import { saveAs } from 'file-saver';


export default {
  name: 'activity-set-builder',
  components: {
    ActivityBuilder
  },
  data: () => ({
      name: '',
      description: '',
      activities: [],
      textRules: [
        v => !!v || 'This field is required',
      ],
      lazy: false,
      dialog: false,
      error: ''
    }),

  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        this.snackbar = true
      }
    },
    addActivity() {
      this.dialog = true;
    },
    onCloseActivityModal(response) {
      this.dialog = false;
      if (response) {
        this.onNewActivity(response)
      }
    },
    onNewActivity(activity) {
      this.activities.push(activity)
    },
    editActivity(index) {
      // todo
      return index;
    },
    duplicateActivity(index) {
      this.activities.push(this.activities[index]);
    },
    deleteActivity(index) {
      this.activities.splice(index, 1);
    },
    onClickSaveActivitySet() {
      if (this.isActivitySetValid()) {
        this.downloadSchema();
      }
    },
    isActivitySetValid() {
      if (!this.name) {
        this.error = 'Activity Set Name is required';
        return false;
      } else if (!this.description) {
        this.error = 'Activity Set Description is required';
        return false;
      } else if (this.activities.length == 0) {
        this.error = 'Activity Set must contain at least one activity';
        return false;
      } else {
        this.error = '';
      }
      return true;
    },
    getVariableMap() {
      const variableMap = this.activities.map(activity => ({
        'variableName': activity.name,
        'isAbout': activity.name
      }));
      return variableMap;
    },
    getActivityOrder() {
      const activityNamesArray = this.activities.map(activity => activity.name)
      return activityNamesArray;
    },
    getActivityDisplayNames() {
      const displayNamesObj = {};
      this.activities.forEach(function(activity) {
        displayNamesObj[activity.name] = activity.name;
      });
      return displayNamesObj;
    },
    getActivityVisibility() {
      const visibilityObj = {}
      this.activities.forEach(function(activity) {
        visibilityObj[activity.name] = true;
      });
      return visibilityObj;
    },
    getSchema() {
      const variableMap = this.getVariableMap();
      const activityDisplayNames = this.getActivityDisplayNames();
      const activityOrder = this.getActivityOrder();
      const activityVisibility = this.getActivityVisibility();
      const schema = {
        "@context": [ "https://raw.githubusercontent.com/ReproNim/reproschema/master/contexts/generic",
            "https://raw.githubusercontent.com/ReproNim/reproschema/master/protocols/ema-hbn/ema-hbn_context"
        ],
        "@type": "reproschema:ActivitySet",
        "@id": `${this.name}_schema`,
        "skos:prefLabel": this.name,
        "skos:altLabel": this.name,
        "schema:description": this.description,
        "schema:schemaVersion": "0.0.1",
        "schema:version": "0.0.1",
        "schema:about": this.description,
        "variableMap": variableMap,
        "ui": {
            "order": activityOrder,
            "shuffle": false,
            "activity_display_name": activityDisplayNames,
            "visibility": activityVisibility
        }
      };
      return schema;
    },
    getContext() {
      const contextObj = {
        '@version': 1.1,
        'activity_path': 'https://raw.githubusercontent.com/ReproNim/reproschema/master/activities/',
      };
      this.activities.forEach(function(activity) {
        contextObj[activity.name] = {
          '@id': `activity_path:${activity.name}/${activity.name}_schema`,
          '@type': '@id'
        };
      });
      return {
        "@context": contextObj
      };
    },
    getActivitySchemaArray() {
      const activitySchemaArray = this.activities.map(activity => activity.name);
      return activitySchemaArray;
    },
    getActivityContextArray() {
      const activityContextArray = this.activities.map(activity => activity.context);
      return activityContextArray;
    },
    downloadSchema() {
      const schemaObj = this.getSchema();
      const contextObj = this.getContext();

      var JSZip = require("jszip");
      var zip = new JSZip();

      zip.folder("protocols").file("schema", JSON.stringify(schemaObj, null, 2));
      zip.folder("protocols").file("context", JSON.stringify(contextObj, null, 2));

      this.activities.forEach(function(activity) {
        zip.folder(`activities/${activity.name}`).file(`${activity.name}_schema`, JSON.stringify(activity.schema, null, 2));
        zip.folder(`activities/${activity.name}`).file(`${activity.name}_context`, JSON.stringify(activity.context, null, 2));
        activity.itemArray.forEach(function(item) {
          zip.folder(`activities/${activity.name}/items`).file(`${item.name}`, JSON.stringify(item.schema, null, 2));
        })
      });

      zip.generateAsync({type:"blob"})
      .then(function (blob) {
          saveAs(blob, 'schema.zip');
      });
    }
  }
}

</script>
