<template>
  <v-container>
    <v-layout
      wrap
      column
    >
      <v-form
        ref="form"
        lazy-validation
      >
        <v-text-field
          v-model="name"
          :rules="textRules"
          label="Protocol Name"
          required
        />
        <v-text-field
          v-model="description"
          :rules="textRules"
          label="Protocol Description"
          required
        />
        <v-list>
          <v-col>
            <v-subheader>
              Activities
            </v-subheader>
            <v-list-item
              v-for="(activity, index) in activities"
              :key="activity.id"
            >
              <v-list-item-content>
                <v-list-item-title v-text="activity.name" />
                <v-list-item-title v-text="activity.description" />
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  icon
                  @click="duplicateActivity(index)"
                >
                  <v-icon color="grey lighten-1">
                    content_copy
                  </v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action>
                <v-btn
                  icon
                  @click="editActivity(index)"
                >
                  <v-icon color="grey lighten-1">
                    edit
                  </v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action>
                <v-btn
                  icon
                  @click="deleteActivity(index)"
                >
                  <v-icon color="grey lighten-1">
                    delete
                  </v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-list-item @click="addActivity">
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
      <div>
        <v-btn
          v-if="exportButton"
          class="mx-2 my-2"
          color="primary"
          @click="onClickExport"
        >
          Export Schema
        </v-btn>
        <v-btn
          class="mx-2 my-2"
          color="primary"
          @click="onClickSaveProtocol"
        >
          Download Schema
        </v-btn>
        <v-btn
          class="mx-2 my-2"
          color="primary"
          outlined
          @click="resetBuilder"
        >
          Reset Builder
        </v-btn>
      </div>
    </v-layout>
    <v-dialog
      v-model="dialog"
      width="800"
      persistent
    >
      <ActivityBuilder
        :key="componentKey"
        :initial-activity-data="initialActivityData"
        @closeModal="onCloseActivityModal"
      />
    </v-dialog>
  </v-container>
</template>

<script>
function initialData() {
  return {
    name: "",
    description: "",
    activities: [],
    textRules: [(v) => !!v || "This field is required"],
    dialog: false,
    error: "",
    initialActivityData: {},
    componentKey: 0,
    editIndex: -1,
  };
}

import api from "../../utilities/api";
import ActivityBuilder from "./ActivityBuilder.vue";
import { saveAs } from "file-saver";
import { cloneDeep } from "lodash";

export default {
  components: {
    ActivityBuilder,
  },
  props: {
    exportButton: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data: function() {
    return initialData();
  },
  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        this.snackbar = true;
      }
    },
    forceUpdate() {
      this.componentKey += 1;
    },
    addActivity() {
      this.editIndex = -1;
      this.initialActivityData = {};
      this.forceUpdate();
      this.dialog = true;
    },
    onCloseActivityModal(response) {
      this.dialog = false;
      if (response) {
        this.onNewActivity(response);
      }
    },
    onNewActivity(activity) {
      if (this.editIndex >= 0 && this.editIndex < this.activities.length) {
        this.activities[this.editIndex] = activity;
      } else {
        this.activities.push(activity);
      }
    },
    duplicateActivity(index) {
      this.activities.push(this.activities[index]);
    },
    editActivity(index) {
      this.editIndex = index;
      this.initialActivityData = this.activities[index];
      this.forceUpdate();
      this.dialog = true;
    },
    deleteActivity(index) {
      this.activities.splice(index, 1);
    },
    onClickSaveProtocol() {
      if (this.isProtocolValid()) {
        this.downloadSchema();
      }
    },
    isProtocolValid() {
      if (!this.name) {
        this.error = "Protocol Name is required";
        return false;
      } else if (!this.description) {
        this.error = "Protocol Description is required";
        return false;
      } else if (this.activities.length == 0) {
        this.error = "Protocol must contain at least one activity";
        return false;
      } else {
        this.error = "";
      }
      return true;
    },
    getVariableMap() {
      const variableMap = this.activities.map((activity) => ({
        variableName: `${activity.name}_schema`,
        isAbout: `${activity.name}_schema`,
        prefLabel: activity.name,
        isVis: true,
      }));
      return variableMap;
    },
    getActivityOrder() {
      const activityNamesArray = this.activities.map(
        (activity) => activity.name
      );
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
      const visibilityObj = {};
      this.activities.forEach(function(activity) {
        visibilityObj[activity.name] = true;
      });
      return visibilityObj;
    },
    getCompressedSchema() {
      const variableMap = this.getVariableMap();
      const activityDisplayNames = this.getActivityDisplayNames();
      const activityOrder = this.getActivityOrder();
      const activityVisibility = this.getActivityVisibility();
      const schema = {
        "@context": [
          "https://raw.githubusercontent.com/jj105/reproschema-context/master/context.json",
          "https://raw.githubusercontent.com/YOUR-PROTOCOL-CONTEXT-FILE",
        ],
        "@type": "reproschema:Protocol",
        "@id": `${this.name}_schema`,
        "skos:prefLabel": this.name,
        "schema:description": this.description,
        "schema:schemaVersion": "0.0.1",
        "schema:version": "0.0.1",
        "landingPage": this.description, //point to the readme of protocol
        // variableMap: variableMap,
        "ui": {
          "addProperties": variableMap,
          "order": activityOrder,
          "shuffle": false,
        },
      };
      return schema;
    },
    getContext() {
      const contextObj = {
        "@version": 1.1,
        activity_path:
          "https://raw.githubusercontent.com/ReproNim/reproschema/master/activities/",
      };
      this.activities.forEach(function(activity) {
        contextObj[activity.name] = {
          "@id": `activity_path:${activity.name}/${activity.name}_schema`,
          "@type": "@id",
        };
      });
      return {
        "@context": contextObj,
      };
    },
    downloadSchema() {
      const schemaObj = this.getCompressedSchema();
      const contextObj = this.getContext();

      var JSZip = require("jszip");
      var zip = new JSZip();

      zip
        .folder("protocols")
        .file("schema", JSON.stringify(schemaObj, null, 2));
      zip
        .folder("protocols")
        .file("context", JSON.stringify(contextObj, null, 2));

      this.activities.forEach(function(activity) {
        zip
          .folder(`activities/${activity.name}`)
          .file(
            `${activity.name}_schema`,
            JSON.stringify(activity.schema, null, 2)
          );
        zip
          .folder(`activities/${activity.name}`)
          .file(
            `${activity.name}_context`,
            JSON.stringify(activity.context, null, 2)
          );
        activity.items.forEach(function(item) {
          zip
            .folder(`activities/${activity.name}/items`)
            .file(`${item.name}`, JSON.stringify(item.schema, null, 2));
        });
      });

      zip.generateAsync({ type: "blob" }).then((blob) => {
        saveAs(blob, `${this.name}.zip`);
      });
    },
    onClickExport() {
      let contexts = {};
      const protocol = {
        data: this.getCompressedSchema(),
        activities: {},
      };

      this.activities.forEach((activity) => {
        protocol.activities[activity.name] = {
          data: activity.schema,
          items: {},
        };
        activity.items.forEach((item) => {
          protocol.activities[activity.name].items[item.name] = item;
        });
      });

      protocol.data["@context"].forEach((contextURL, index) => {
        if (index < protocol.data["@context"].length - 1) {
          api
            .getSchema(contextURL)
            .then((resp) => {
              contexts[contextURL] = resp.data["@context"];
              if (index === protocol.data["@context"].length - 2) {
                const contextObj = this.getContext();
                contexts[protocol.data["@context"][index + 1]] =
                  contextObj["@context"];
                this.$emit("uploadProtocol", {
                  contexts,
                  protocol,
                });
              }
            })
            .catch((e) => {
              console.log(e);
            });
        }
      });
    },
    resetBuilder() {
      Object.assign(this.$data, initialData());
      this.resetValidation();
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    },
  },
};
</script>
