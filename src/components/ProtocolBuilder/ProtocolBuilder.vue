<template>
  <v-container>
    <v-layout wrap column>
      <v-form ref="form" lazy-validation>
        <v-text-field
          v-model="name"
          :rules="textRules"
          counter="50"
          maxlength="50"
          label="Protocol Name"
          required
        />
        <v-text-field
          v-model="description"
          :rules="textRules"
          counter="100"
          maxlength="100"
          label="Protocol Description"
          required
        />
        <v-list>
          <v-col>
            <v-subheader>Activities</v-subheader>
            <v-list-item
              v-for="(activity, index) in activities"
              :key="activity.id"
            >
              <v-list-item-content>
                <v-list-item-title v-text="activity.name" />
                <v-list-item-title v-text="activity.description" />
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon @click="duplicateActivity(index)">
                  <v-icon color="grey lighten-1">
                    content_copy
                  </v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action>
                <v-btn icon @click="editActivity(index)">
                  <v-icon color="grey lighten-1">
                    edit
                  </v-icon>
                </v-btn>
              </v-list-item-action>
              <v-list-item-action>
                <v-btn icon @click="deleteActivity(index)">
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
      <v-alert v-if="error !== ''" type="error">
        {{ error }}
      </v-alert>
      <div>
        <v-btn
          v-if="exportButton"
          class="mx-2 my-2"
          color="primary"
          @click="onClickExport"
        >
          Save to dashboard
        </v-btn>
        <v-btn class="mx-2 my-2" color="primary" @click="onClickSaveProtocol">
          Download Schema
        </v-btn>
        <v-btn class="mx-2 my-2" color="primary" outlined @click="resetBuilder">
          Reset Builder
        </v-btn>

      </div>
    </v-layout>
    <v-dialog v-model="dialog" width="800" persistent>
      <ActivityBuilder
        :key="componentKey"
        :initial-activity-data="initialActivityData"
        @closeModal="onCloseActivityModal"
      />
    </v-dialog>
  </v-container>
</template>

<script>

import Protocol from '../../models/Protocol';
import Activity from '../../models/Activity';
import Item from '../../models/Item';

import api from "../../utilities/api";
import ActivityBuilder from "./ActivityBuilder.vue";
import { saveAs } from "file-saver";
import { cloneDeep } from "lodash";

const getInitialData = (model) => {
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
    applet: null,
    isEditing: false,
    id: null,
    model,
    original: null,
  };
}

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
    initialData: {
      type: Object,
      required: false,
      default: null
    }
  },
  data: function() {
    const model = new Protocol();
    model.updateReferenceObject(this);

    return getInitialData(model);
  },
  async beforeMount() {
    await this.fillBuilderWithAppletData();
  },
  methods: {
    async fillBuilderWithAppletData() {
      if (!this.initialData) return;

      const { applet, activities, items, protocol } = this.initialData;

      this.isEditing = true;
      this.applet = applet;
      this.name = applet["@id"].replace("_schema", "");
      this.description = applet["schema:description"][0]["@value"];
      this.id = protocol._id.split('/')[1];

      Object.values(activities).forEach((act) => {
        const activitiesObj = act;
        const {
          ["@id"]: name,
          ["schema:description"]: description,
          ["reprolib:terms/preamble"]: activityPreamble,
          ["reprolib:terms/shuffle"]: shuffle,
          ["reprolib:terms/allow"]: isSkippable,
          ["_id"]: id,
        } = activitiesObj;

        const activityInfo = {
          _id: id && id.split("/")[1],
          name,
          description:
            description && description[0] && description[0]["@value"],
          preamble:
            activityPreamble &&
            activityPreamble[0] &&
            activityPreamble[0]["@value"],
          shuffle: shuffle && shuffle[0] && shuffle[0]["@value"],
        };

        let isSkippableList =
          (isSkippable && isSkippable[0] && isSkippable[0]["@list"]) || [];

        if (isSkippableList.length) {
          if (
            (isSkippableList[0] &&
              isSkippableList[0]["@id"] &&
              isSkippableList[0]["@id"].includes("refused_to_answer")) ||
            (isSkippableList[0] &&
              isSkippableList[0]["@id"] &&
              isSkippableList[0]["@id"].includes("dontKnow"))
          ) {
            activityInfo.isSkippable = true;
          }
        }

        activityInfo.items = Object.values(items).map((item) => {
          let itemContent = {
            _id: item["_id"] && item["_id"].split("/")[1],
            name: item["@id"],
            question:
              item["schema:question"] &&
              item["schema:question"][0] &&
              item["schema:question"][0]["@value"],
            description:
              item["schema:description"] &&
              item["schema:description"][0] &&
              item["schema:description"][0]["@value"],
            ui: {
              inputType:
                item["reprolib:terms/inputType"] &&
                item["reprolib:terms/inputType"][0] &&
                item["reprolib:terms/inputType"][0]["@value"],
            },
          };

          let responseOptions = item["reprolib:terms/responseOptions"];

          let itemType = itemContent.ui.inputType;

          if (responseOptions) {
            let multipleChoice =
              responseOptions[0] &&
              responseOptions[0]["reprolib:terms/multipleChoice"];

            if (multipleChoice) {
              itemContent.multipleChoice =
                multipleChoice[0] && multipleChoice[0]["@value"];
            }

            if (itemType === "radio") {
              itemContent.options = {
                isMultipleChoice: itemContent.multipleChoice || false,
                nextOptionImage: "",
                nextOptionName: "",
                options:
                  responseOptions[0] &&
                  responseOptions[0]["schema:itemListElement"].map(
                    (itemListElement) => {
                      return {
                        image:
                          itemListElement["schema:value"] &&
                          itemListElement["schema:value"][0] &&
                          itemListElement["schema:value"][0]["@value"],
                        name:
                          itemListElement["schema:name"] &&
                          itemListElement["schema:name"][0] &&
                          itemListElement["schema:name"][0]["@value"],
                      };
                    }
                  ),
              };
            }
            if (itemType === "text") {
              itemContent.options = {
                requiredValue:
                  responseOptions[0] &&
                  responseOptions[0]["reprolib:terms/requiredValue"] &&
                  responseOptions[0]["reprolib:terms/requiredValue"][0] &&
                  responseOptions[0]["reprolib:terms/requiredValue"][0][
                    "@value"
                  ],
                // TODO: add 'maximum response length' value which is absent for now
              };
            }
            if (itemType === "slider") {
              itemContent.options = {
                maxValue:
                  responseOptions[0] &&
                  responseOptions[0]["schema:maxValue"] &&
                  responseOptions[0]["schema:maxValue"][0] &&
                  responseOptions[0]["schema:maxValue"][0]["@value"],
                minValue:
                  responseOptions[0] &&
                  responseOptions[0]["schema:minValue"] &&
                  responseOptions[0]["schema:minValue"][0] &&
                  responseOptions[0]["schema:minValue"][0]["@value"],
                numOptions:
                  responseOptions[0] &&
                  responseOptions[0]["schema:itemListElement"].length,
              };
            }
            if (itemType === "audioRecord" || itemType === "audioImageRecord") {
              itemContent.options = {
                requiredValue:
                  responseOptions[0] &&
                  responseOptions[0]["reprolib:terms/requiredValue"] &&
                  responseOptions[0]["reprolib:terms/requiredValue"][0] &&
                  responseOptions[0]["reprolib:terms/requiredValue"][0][
                    "@value"
                  ],
                "schema:maxValue":
                  responseOptions[0] &&
                  responseOptions[0]["schema:maxValue"] &&
                  responseOptions[0]["schema:maxValue"][0] &&
                  responseOptions[0]["schema:maxValue"][0]["@value"],
                "schema:minValue":
                  responseOptions[0] &&
                  responseOptions[0]["schema:minValue"] &&
                  responseOptions[0]["schema:minValue"][0] &&
                  responseOptions[0]["schema:minValue"][0]["@value"],
              };
            }
          }

          if (itemType === "audioStimulus") {
            let mediaObj = Object.entries(
              item["reprolib:terms/media"] && item["reprolib:terms/media"][0]
            );

            if (mediaObj) {
              let mediaUrl = mediaObj[0][0];
              let mediaData = mediaObj[0][1];

              itemContent.media = {
                [mediaUrl]: {
                  "schema:contentUrl": [mediaUrl],
                  "schema:name":
                    mediaData[0] &&
                    mediaData[0]["schema:name"] &&
                    mediaData[0]["schema:name"][0] &&
                    mediaData[0]["schema:name"][0]["@value"],
                  "schema:transcript":
                    mediaData[0] &&
                    mediaData[0]["schema:transcript"] &&
                    mediaData[0]["schema:transcript"][0] &&
                    mediaData[0]["schema:transcript"][0]["@value"],
                },
              };
            }
          }

          const itemModel = new Item();
          itemModel.updateReferenceObject(itemModel.getItemBuilderData(itemContent));
          return itemModel.getItemData();
        });

        const activityModel = new Activity();
        activityModel.updateReferenceObject(activityModel.getActivityBuilderData(activityInfo));

        this.activities.push(activityModel.getActivityData());
      });

      const protocolData = await this.model.getProtocolData();
      this.original = JSON.parse(JSON.stringify(protocolData));
    },
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
    downloadSchema() {
      const schemaObj = this.model.getCompressedSchema();
      const contextObj = this.model.getContext();

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
      this.model.getProtocolData().then( data => {
        if (!this.isEditing) {
          this.$emit("uploadProtocol", data)
        } else {
          this.$emit("updateProtocol", data);
        }
      }).catch(e => {
        console.log(e);
      });
    },
    resetBuilder() {
      Object.assign(this.$data, getInitialData(this.model));
      this.resetValidation();
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    },
  },
};
</script>
