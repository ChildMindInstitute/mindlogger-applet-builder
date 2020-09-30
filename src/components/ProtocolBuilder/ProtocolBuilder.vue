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

        <v-btn class="mx-2 my-2" color="primary" :disabled="!isEditing" outlined @click="viewHistory">
          View History
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

    <v-dialog
      v-model="changeHistoryDialog.visibility"
      width="800"
      class="historyDialog"
    >
      <ChangeHistoryComponent
        :history="changeHistoryDialog.data"
        :currentVersion="changeHistoryDialog.currentVersion"
        :defaultVersion="changeHistoryDialog.defaultVersion"
        :versions="versions"
        :key="componentKey + historyComponentKey"
        @updateHistoryView="updateHistoryView"
      />
    </v-dialog>
  </v-container>
</template>

<script>

import Protocol from '../../models/Protocol';
import Activity from '../../models/Activity';
import Item from '../../models/Item';
import ChangeHistoryComponent from './ChangeHistoryComponent.vue';
import util from '../../utilities/util';

import api from "../../utilities/api";
import ActivityBuilder from "./ActivityBuilder.vue";
import { saveAs } from "file-saver";
import _ from "lodash";

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
    historyComponentKey: 0,
    editIndex: -1,
    applet: null,
    isEditing: false,
    id: null,
    protocolVersion: '1.0.0',
    model,
    original: null,
    changeHistoryDialog: {
      visibility: false,
      defaultVersion: null,
      data: []
    },
  };
}

export default {
  components: {
    ActivityBuilder,
    ChangeHistoryComponent,
  },
  props: {
    exportButton: {
      type: Boolean,
      required: false,
      default: true,
    },
    initialData: {
      type: Object,
      required: false,
      default: null
    },
    versions: {
      type: Array,
      required: false,
      default: null
    },
    getProtocols: {
      type: Function,
      require: false,
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

    const protocolData = await this.model.getProtocolData();
    this.original = JSON.parse(JSON.stringify(protocolData));
    if (!this.versions.length) {
      /** upload first version */
      this.$emit("prepareApplet", this.original);
    }
  },
  methods: {
    // fillBuilderWithAppletData() {
    //   if (!this.$route || !this.$route.params || !this.$route.params.applet)
    //     return;

    //   const { applet, activities, items } = this.$route.params.applet;
    async fillBuilderWithAppletData() {
      if (!this.initialData) return;

      const { applet, activities, items, protocol } = this.initialData;

      this.isEditing = true;
      this.applet = applet;
      this.name = applet["@id"].replace("_schema", "");
      this.description = applet["schema:description"][0]["@value"];
      this.id = protocol._id.split('/')[1];
      this.protocolVersion = _.get(applet, 'schema:schemaVersion[0].@value', this.protocolVersion);

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
          const { upgrade } = Protocol.getChangeInfo(this.original, data);

          let newVersion = util.upgradeVersion(this.protocolVersion, upgrade);
          if (newVersion != this.protocolVersion) {
            data.protocol.data['schema:schemaVersion'] = data.protocol.data['schema:version'] = newVersion;

            this.$emit("updateProtocol", data);
          } else {
            this.$emit("onUploadError", 'Please make changes to update applet');
          }
        }
      }).catch(e => {
        console.log(e);
      });
    },
    resetBuilder() {
      Object.assign(this.$data, getInitialData(this.model));
      this.resetValidation();
    },
    viewHistory() {
      if (this.isEditing) {
        this.model.getProtocolData().then(current => {
          const { log, upgrade } = Protocol.getChangeInfo(this.original, current);
          this.changeHistoryDialog.visibility = true;
          this.changeHistoryDialog.data = log;
          this.changeHistoryDialog.currentVersion = util.upgradeVersion(this.protocolVersion, upgrade);

          this.historyComponentKey++;
        });
      }
    },
    updateHistoryView(version) {
      const index = this.versions.indexOf(version);

      /** viewing current changes */
      if (index < 0) {
        this.changeHistoryDialog.defaultVersion = version;

        this.viewHistory();
        return ;
      }

      /** viewing old changes */
      this.getProtocols([this.versions[index], this.versions[index + 1]]).then(resp => {
        const data = resp.data;

        const { log, upgrade } = Protocol.getChangeInfo(data[1].content, data[0].content);

        this.changeHistoryDialog.visibility = true;
        this.changeHistoryDialog.data = log;
        this.changeHistoryDialog.defaultVersion = version;

        this.historyComponentKey++;
      });
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    },
  },
};
</script>
