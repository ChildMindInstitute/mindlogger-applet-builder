<template>
  <v-container>
    <v-layout wrap column>
      <v-form ref="form" lazy-validation>
        <v-text-field
          v-model="name"
          :rules="textRules"
          counter="55"
          maxlength="55"
          label="Applet Name"
          required
        />
        <v-text-field
          v-model="description"
          :rules="textRules"
          counter="230"
          maxlength="230"
          label="Protocol Applet"
          required
        />
        <div class="d-flex flex-row mt-6">
          <v-subheader class="ml-2"> Edit About Page </v-subheader>
          <v-btn
            class="ml-10"
            fab
            small
            @click="onEditAboutPage"
          >
            <v-icon color="grey darken-1">
              mdi-pencil
            </v-icon>
          </v-btn>
        </div>
        <v-list>
          <v-col>
            <v-subheader>Activities</v-subheader>
            <v-list-item
              v-for="(activity, index) in withoutPrize(activities)"
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

        <v-btn
          class="mx-2 my-2"
          color="primary"
          :disabled="!isEditing"
          outlined
          @click="viewHistory"
        >
          View History
        </v-btn>
      </div>
    </v-layout>
    <v-dialog v-model="dialog" width="800" persistent>
      <ActivityBuilder
        :key="componentKey"
        :templates="itemTemplates"
        :initial-activity-data="initialActivityData"
        :isPrizeActivity="prizeActivity"
        @openPrize="tokenPrizes = true"
        @removeTemplate="onRemoveTemplate"
        @updateTemplates="onUpdateTemplates"
        @closeModal="onCloseActivityModal"
      />
    </v-dialog>

    <v-dialog
      v-model="changeHistoryDialog.visibility"
      width="800"
      class="historyDialog"
    >
      <ChangeHistoryComponent
        :key="componentKey + historyComponentKey"
        :history="changeHistoryDialog.data"
        :currentVersion="changeHistoryDialog.currentVersion"
        :defaultVersion="changeHistoryDialog.defaultVersion"
        :versions="versions"
        @updateHistoryView="updateHistoryView"
      />
    </v-dialog>
    <LandingPageEditor 
      :visibility="markdownDialog" 
      :markdownText="markdownData"
      @close="onCloseEditor"
      @submit="onSubmitEditor"
    />


    <v-dialog v-model="tokenPrizes" persistent width="800">
      <PrizeActivityBuilder
        :initial-activity-data="prizeActivity || {}"
        @closeModal="onClosePrizeActivityModal"
        @deleteOptions="onClosePrizeActivityModal"
      />
    </v-dialog>

  </v-container>
</template>

<script>
import Protocol from '../../models/Protocol';
import Activity from '../../models/Activity';
import Item from '../../models/Item';
import ChangeHistoryComponent from './ChangeHistoryComponent.vue';
import LandingPageEditor from "./LandingPageEditor"
import util from '../../utilities/util';
import api from '../../utilities/api';
import ActivityBuilder from './ActivityBuilder.vue';
import { saveAs } from 'file-saver';
import axios from 'axios';
import _ from 'lodash';

import PrizeActivityBuilder from './PrizeActivity/PrizeActivityBuilder.vue';

const getInitialData = (model) => {
  return {
    name: '',
    description: '',
    activities: [],
    itemTemplates: [],
    textRules: [(v) => !!v || "This field is required"],
    dialog: false,
    error: '',
    initialActivityData: {},
    componentKey: 0,
    historyComponentKey: 0,
    editIndex: -1,
    applet: null,
    isEditing: false,
    id: null,
    protocolVersion: '1.0.0',
    model,
    markdownDialog: false,
    markdownData: "",
    original: null,
    changeHistoryDialog: {
      visibility: false,
      defaultVersion: null,
      data: [],
    },
  };
};

export default {
  components: {
    ActivityBuilder,
    ChangeHistoryComponent,
    LandingPageEditor,
    PrizeActivityBuilder
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
      default: null,
    },
    templates: {
      type: Array,
      required: false,
      default: null,
    },
    versions: {
      type: Array,
      required: false,
      default: null,
    },
    getProtocols: {
      type: Function,
      required: false,
      default: null,
    },
  },
  data: function() {
    const model = new Protocol();
    model.updateReferenceObject(this);

    return {
      prizeActivity: null,
      tokenPrizes: false,
      ...getInitialData(model)
    }
  },
  async beforeMount() {
    if (this.initialData) {
      this.isEditing = true;
      if (!this.versions.length) {
        this.$emit('setLoading', true);
      }

      await this.fillBuilderWithAppletData();

      const protocolData = await this.model.getProtocolData();
      this.original = JSON.parse(JSON.stringify(protocolData));
      if (!this.versions.length) {
        /** upload first version */

        this.original.protocol.data[
          'schema:schemaVersion'
        ] = this.original.protocol.data['schema:version'] = util.upgradeVersion(
          this.protocolVersion,
          '0.0.1'
        );

        this.$emit('prepareApplet', this.original);
        return;
      }
    }
    this.itemTemplates = this.templates;
    this.getPrizeActivity();
    this.$emit("setLoading", false);
  },
  methods: {
    async fillBuilderWithAppletData() {
      const { applet, activities, items, protocol } = this.initialData;

      this.applet = applet;
      const prefLabel = applet['http://www.w3.org/2004/02/skos/core#prefLabel'];

      this.name = _.get(prefLabel, [0, '@value'], 'applet');

      this.description = applet['schema:description'][0]['@value'];
      this.id = protocol._id.split('/')[1];
      const markdownData = applet["reprolib:terms/landingPage"][0]["@value"];
      if (markdownData) {
        try {
          this.markdownData = (await axios.get(markdownData)).data;
        } catch (e) {
          this.markdownData = '';
        }
      } else {
        this.markdownData = _.get(applet, ["reprolib:terms/landingPageContent", 0, "@value"], "");
      }

      this.protocolVersion = _.get(applet, 'schema:schemaVersion[0].@value', this.protocolVersion);

      Object.values(activities).forEach((act) => {
        const activitiesObj = act;
        const {
          ['http://www.w3.org/2004/02/skos/core#prefLabel']: name,
          ['schema:description']: description,
          ['reprolib:terms/preamble']: activityPreamble,
          ['reprolib:terms/shuffle']: shuffle,
          ['reprolib:terms/allow']: allow,
          ['reprolib:terms/addProperties']: addProperties,
          ['reprolib:terms/subScales']: subScales,
          ['reprolib:terms/compute']: compute,
          ['reprolib:terms/messages']: messages,
          ['reprolib:terms/isPrize']: isPrize,
          ['_id']: id,
        } = activitiesObj;

        const visibilities = addProperties.map((property) => {
          const isAbout = _.get(
            property,
            'reprolib:terms/isAbout.0.@id',
            ""
          );
          const isVis = _.get(
            property,
            'reprolib:terms/isVis.0.@value',
            ""
          );
          const variableName = _.get(
            property,
            'reprolib:terms/variableName.0.@value',
            ""
          );
          return {
            isAbout,
            isVis,
            variableName,
          }
        });

        const activityInfo = {
          _id: id && id.split('/')[1],
          name:
            name && name[0] && name[0]['@value'],
          description:
            description && description[0] && description[0]['@value'],
          isPrize:
            isPrize && isPrize[0] && isPrize[0]['@value'],
          preamble:
            activityPreamble &&
            activityPreamble[0] &&
            activityPreamble[0]['@value'],
          shuffle: shuffle && shuffle[0] && shuffle[0]['@value'],
          visibilities,
          subScales: Array.isArray(subScales) && subScales.map((subScale, index) => {
            const jsExpression = subScale['reprolib:terms/jsExpression'];
            const variableName = subScale['reprolib:terms/variableName'];
            const lookupTable = subScale['reprolib:terms/lookupTable'];

            let subScaleData = {
              jsExpression: jsExpression[0] && jsExpression[0]['@value'],
              variableName: variableName[0] && variableName[0]['@value'],
              subScaleId: index + 1,
            };

            if (lookupTable && Array.isArray(lookupTable)) {
              subScaleData['lookupTable'] = lookupTable.map(row => {
                const age = row['reprolib:terms/age'];
                const rawScore = row['reprolib:terms/rawScore'];
                const sex = row['reprolib:terms/sex'];
                const tScore = row['reprolib:terms/tScore'];

                return {
                  age: age && age[0] && age[0]['@value'] || '',
                  rawScore: rawScore && rawScore[0] && rawScore[0]['@value'] || '',
                  sex: sex && sex[0] && sex[0]['@value'] || '',
                  tScore: tScore && tScore[0] && tScore[0]['@value'] || '',
                }
              })
            }

            return subScaleData;
          }),
          compute: Array.isArray(compute) && compute.map((exp) => {
            const jsExpression = exp['reprolib:terms/jsExpression'];
            const variableName = exp['reprolib:terms/variableName'];

            return {
              jsExpression: jsExpression && jsExpression[0] && jsExpression[0]['@value'],
              variableName: variableName && variableName[0] && variableName[0]['@value'],
            }
          }),
          messages: Array.isArray(messages) && messages.map((msg) => {
            const jsExpression = msg['reprolib:terms/jsExpression'];
            const message = msg['reprolib:terms/message'];
            const outputType = msg['reprolib:terms/outputType']

            return {
              jsExpression: _.get(jsExpression, [0, '@value']),
              message: _.get(message, [0, '@value']),
              outputType: _.get(outputType, [0, '@value'], 'cumulative'),
            }
          })
        };

        let allowList = _.get(allow, [0, '@list'], [])
          .map(item => item["@id"]);

        if (allowList.some((item) => item.includes('refused_to_answer'))) {
          activityInfo.isSkippable = true;
        }
        if (allowList.some((item) => item.includes('disable_back'))) {
          activityInfo.disableBack = true;
        }

        activityInfo.items = _.get(
          activitiesObj,
          'reprolib:terms/order.0.@list',
          []
        ).filter(key => items[key['@id']]).map((key) => {
          const item = items[key['@id']];
          let allow = _.get(item, ['reprolib:terms/allow', 0, '@list'], [])
            .map(item => item['@id'].substr(15));

          let itemContent = {
            _id: item['_id'] && item['_id'].split('/')[1],
            name: item['@id'],
            question: _.get(item, ['schema:question', 0, '@value']),
            description: _.get(item, ['schema:description', 0, '@value']),
            ui: {
              allow,
              inputType: _.get(item, ['reprolib:terms/inputType', 0, '@value']),
            },
            allowEdit: _.get(item, ['reprolib:terms/allowEdit', 0, '@value'], true),
          };

          if (itemContent.ui.inputType == 'markdown-message') {
            itemContent.ui.inputType = 'markdownMessage';
          }

          let responseOptions = item['reprolib:terms/responseOptions'];

          let itemType = itemContent.ui.inputType;

          if (responseOptions) {
            let multipleChoice = _.get(responseOptions, [0, 'reprolib:terms/multipleChoice']);
            let valueType = _.get(responseOptions, [0, 'reprolib:terms/valueType']);

            let scoring = _.get(responseOptions, [0, 'reprolib:terms/scoring']);

            let showTickMarks = _.get(responseOptions, [0, 'reprolib:terms/showTickMarks'])

            let responseAlert = _.get(responseOptions, [0, 'reprolib:terms/responseAlert']);

            let responseAlertMessage = _.get(responseOptions, [0, 'reprolib:terms/responseAlertMessage']);

            if (multipleChoice) {
              itemContent.multipleChoice = _.get(multipleChoice, [0, '@value']);
            }

            if (scoring) {
              itemContent.scoring = _.get(scoring, [0, '@value']);
            }

            if (showTickMarks) {
              itemContent.showTickMarks = 
                showTickMarks[0] && showTickMarks[0]['@value'];
            }

            if (responseAlert) {
              itemContent.responseAlert = _.get(responseAlert, [0, '@value']);
            }

            if (responseAlertMessage) {
              itemContent.responseAlertMessage = 
                responseAlertMessage[0] && responseAlertMessage[0]['@value'];
            }

            if (valueType) {
              itemContent.valueType =
                valueType[0] && valueType[0]['@id'];
            }

            if (itemType === 'radio') {
              itemContent.options = {
                isMultipleChoice: itemContent.multipleChoice || false,
                hasScoreValue: itemContent.scoring || false,
                hasResponseAlert: itemContent.responseAlert || false,
                responseAlertMessage: itemContent.responseAlertMessage || '',
                nextOptionImage: '',
                nextOptionName: '',
                options:
                  responseOptions[0] &&
                  responseOptions[0]['schema:itemListElement'] &&
                  responseOptions[0]['schema:itemListElement'].map(
                    (itemListElement) => {
                      const image = itemListElement['schema:image'];
                      const name = itemListElement["schema:name"];
                      const value = itemListElement["schema:value"];
                      const score = itemListElement["schema:score"];
                      const description = itemListElement["schema:description"];

                      return {
                        image: 
                          typeof image === 'string' && image ||
                          Array.isArray(image) && image[0] && image[0]['@value'].toString(),
                        name:
                          typeof name == "string" && name ||
                          Array.isArray(name) && name[0] && name[0]['@value'].toString(),
                        value:
                          Array.isArray(value) && value[0] && value[0]['@value'],
                        score:
                          Array.isArray(score) && score[0] && score[0]['@value'],
                        description:
                          typeof description == 'string' && description ||
                          Array.isArray(description) && description[0] && description[0]['@value'].toString(),
                      };
                    }
                  ),
              };
            }

            if (itemType === 'prize') {
              itemContent.options = {
                isMultipleChoice: itemContent.multipleChoice || false,
                hasScoreValue: itemContent.scoring || true,
                nextOptionImage: '',
                nextOptionName: '',
                options:
                  responseOptions[0] &&
                  responseOptions[0]['schema:itemListElement'] &&
                  responseOptions[0]['schema:itemListElement'].map(
                    (itemListElement) => {
                      const image = itemListElement['schema:image'];
                      const name = itemListElement["schema:name"];
                      const value = itemListElement["schema:value"];
                      const price = itemListElement["schema:price"];
                      const description = itemListElement["schema:description"];

                      return {
                        image: 
                          typeof image === 'string' && image ||
                          Array.isArray(image) && image[0] && image[0]['@value'].toString(),
                        name:
                          typeof name == "string" && name ||
                          Array.isArray(name) && name[0] && name[0]['@value'].toString(),
                        value:
                          Array.isArray(value) && value[0] && value[0]['@value'],
                        price:
                          Array.isArray(price) && price[0] && price[0]['@value'],
                        description:
                          typeof description == "string" && description ||
                          Array.isArray(description) && description[0] && description[0]['@value'].toString(),
                      };
                    }
                  ),
              };
            }

            if (itemType === 'text') {
              itemContent.options = {
                requiredValue: _.get(responseOptions, [0, 'reprolib:terms/requiredValue', 0, '@value']),
                // TODO: add 'maximum response length' value which is absent for now
              };
              if (item['schema:correctAnswer'] &&
                item['schema:correctAnswer'][0] &&
                item['schema:correctAnswer'][0]['@value']) {
                itemContent.correctAnswer = item['schema:correctAnswer'][0]['@value']
              }
            }
            if (itemType === 'slider') {
              itemContent.options = {
                hasScoreValue: itemContent.scoring || false,
                hasResponseAlert: itemContent.responseAlert || false,
                showTickMarks: itemContent.showTickMarks || false,
                responseAlertMessage: itemContent.responseAlertMessage || '',
                maxValue: _.get(responseOptions, [0, 'schema:maxValue', 0, '@value']),
                minValue: _.get(responseOptions, [0, 'schema:minValue', 0, '@value']),
                maxValueImg: _.get(responseOptions, [0, 'schema:maxValueImg', 0, '@value']),
                minValueImg: _.get(responseOptions, [0, 'schema:minValueImg', 0, '@value']),
                numOptions:
                  responseOptions[0] &&
                  responseOptions[0]['schema:itemListElement'] &&
                  responseOptions[0]['schema:itemListElement'].length,
                scores: itemContent.scoring && responseOptions[0] &&
                  responseOptions[0]['schema:itemListElement'] &&
                  responseOptions[0]['schema:itemListElement'].map(
                    (itemListElement) => {
                      const score = itemListElement["schema:score"];
                      return Array.isArray(score) && score[0] && score[0]['@value']
                    }
                  )
              };
            }
            if (itemType === 'audioRecord' || itemType === 'audioImageRecord') {
              itemContent.options = {
                requiredValue: _.get(responseOptions, [0, 'reprolib:terms/requiredValue', 0, '@value']),
                'schema:maxValue': _.get(responseOptions, [0, 'schema:maxValue', 0, '@value']),
                'schema:minValue': _.get(responseOptions, [0, 'schema:minValue', 0, '@value']),
              };
            }
          }

          // new block start
          const responseOptions2 = item['reprolib:terms/responseOptions'];
          if(responseOptions2 && responseOptions2.length > 0) {
            // delete "itemType === 'audioImageRecord' || itemType === 'drawing' || itemType === 'geolocation'" later !!!!!!! this should works for all items wich contains responseOptions, modification for specific values should be inside "responseOptionsModifier" function
            if(itemType === 'audioImageRecord' || itemType === 'drawing' || itemType === 'geolocation')
              itemContent.responseOptions = this.responseOptionsModifier(itemType, responseOptions2);
          }

          const inputOptions = item['reprolib:terms/inputs'];
          if(inputOptions && inputOptions.length > 0) {
            // delete "itemType === 'drawing'" later !!!!!!! this should works for all items wich contains inputOptions, modification for specific values should be inside "inputOptionsModifier" function
            if(itemType === 'drawing')
              itemContent.inputOptions = this.inputOptionsModifier(itemType, inputOptions);
          }
          // new block end

          if (itemType === 'audioStimulus') {
            let mediaObj = Object.entries(
              item['reprolib:terms/media'] && item['reprolib:terms/media'][0]
            );

            if (mediaObj) {
              let mediaUrl = mediaObj[0][0];
              let mediaData = mediaObj[0][1];

              itemContent.media = {
                [mediaUrl]: {
                  'schema:contentUrl': [mediaUrl],
                  'schema:name': _.get(mediaData, [0, 'schema:name', 0, '@value']),
                  'schema:transcript': _.get(mediaData, [0, 'schema:transcript', 0, '@value']),
                },
              };
            }
          }
          const itemModel = new Item();
          itemModel.updateReferenceObject(
            itemModel.getItemBuilderData(itemContent)
          );
          return itemModel.getItemData();
        });

        const activityModel = new Activity();
        activityModel.updateReferenceObject(
          activityModel.getActivityBuilderData(activityInfo)
        );

        this.activities.push(activityModel.getActivityData());
      });
    },
    // Modifiers for data from schema for using data inside app - Start
    // response options modifier
    responseOptionsModifier(itemType, options) {
      const responseOptions = options[0];
      const modifiedResponseOptions = {};

      const valueType = responseOptions['reprolib:terms/valueType'];
      if(valueType)
        modifiedResponseOptions['valueType'] = valueType[0]['@id'];

      const minValue = responseOptions['schema:minValue'];
      if(minValue)
        modifiedResponseOptions['schema:minValue'] = minValue[0]['@value'];

      const maxValue = responseOptions['schema:maxValue'];
      if(maxValue)
        modifiedResponseOptions['schema:maxValue'] = maxValue[0]['@value'];

      const image = responseOptions['schema:image'];
      if(image)
        modifiedResponseOptions['schema:image'] = image;

      const multipleChoice = responseOptions['reprolib:terms/multipleChoice'];
      if(multipleChoice)
        modifiedResponseOptions['multipleChoice'] = multipleChoice[0]['@value'];

      const requiredValue = responseOptions['reprolib:terms/requiredValue'];
      if(requiredValue)
        modifiedResponseOptions['requiredValue'] = requiredValue[0]['@value'];

      return modifiedResponseOptions;
    },
    // input options modifier
    inputOptionsModifier(itemType, options) {
      const modifiedInputOptions = [];

      options.forEach(option => {
        const modifiedOption = {};

        const type = option['@type'];
        if(type)
          modifiedOption['@type'] = 'schema:' + this.getTypeOfActionFromSchemaURL(type[0]);
        
        const name = option['schema:name'];
        if(name)
          modifiedOption['schema:name'] = name[0]['@value'];
        
        const value = option['schema:value'];
        if(value)
          modifiedOption['schema:value'] = value[0]['@value'];

        modifiedInputOptions.push(modifiedOption);
      });

      return modifiedInputOptions;
    },
    // helper functions for modifiers
    getTypeOfActionFromSchemaURL(url) {
      const index = url.lastIndexOf('/');
      if(index >= 0 && url.length - 1 > index) return url.slice(index + 1);
      else return '';
    },
    // Modifiers for data from schema for using data inside app - End
    onUpdateTemplates(option) {
      this.$emit("updateTemplates", option)
    },
    onRemoveTemplate(item) {
      const { itemTemplates } = this;
      const updatedItems = itemTemplates.filter(({ text, value }) => text !== item.text || value !== item.value)
      this.itemTemplates = [...updatedItems]
      this.$emit('removeTemplate', item);
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

    onClosePrizeActivityModal(response) {
      this.prizeActivity = response;
      this.tokenPrizes = false;
    },

    onNewActivity(activity) {
      if (this.editIndex >= 0 && this.editIndex < this.activities.length) {
        this.activities[this.editIndex] = activity;
      } else {
        this.activities.push(activity);
      }
    },
    onSubmitEditor(markdownData) {
      this.markdownData = markdownData;
      this.onCloseEditor();
    },
    onCloseEditor() {
      this.markdownDialog = false;
    },
    onEditAboutPage() {
      this.markdownDialog = true;
    },
    duplicateActivity(index) {
      const activityModel = new Activity();
      const names = this.activities.map((activity) => activity.name);

      let suffix = 1;
      while (names.includes(`${this.activities[index].name} (${suffix})`)) {
        suffix++;
      }

      activityModel.updateReferenceObject(
        activityModel.getActivityBuilderData({
          ...this.activities[index],
          _id: null,
          name: `${this.activities[index].name} (${suffix})`,
        })
      );

      this.activities.push(activityModel.getActivityData());
    },
    editActivity(index) { 
      this.editIndex = index;
      this.initialActivityData = this.activities[this.editIndex];
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
        this.error = 'Applet Name is required';
        return false;
      } else if (!this.description) {
        this.error = 'Applet Description is required';
        return false;
      } else if (this.activities.length == 0) {
        this.error = 'Applet must contain at least one activity';
        return false;
      } else {
        this.error = '';
      }
      return true;
    },
    downloadSchema() {
      const schemaObj = this.model.getCompressedSchema();
      const contextObj = this.model.getContext();

      var JSZip = require('jszip');
      var zip = new JSZip();

      zip
        .folder('protocols')
        .file('schema', JSON.stringify(schemaObj, null, 2));
      zip
        .folder('protocols')
        .file('context', JSON.stringify(contextObj, null, 2));

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

      zip.generateAsync({ type: 'blob' }).then((blob) => {
        saveAs(blob, `${this.name}.zip`);
      });
    },
    onClickExport() {
      if(this.prizeActivity)
        this.activities.push(this.prizeActivity);

      this.model.getProtocolData().then( data => {
        if (!this.isEditing) {
          this.$emit("uploadProtocol", data);
        } else {
          let { upgrade, updates, removed } = Protocol.getChangeInfo(this.original, data, true);

          let newVersion = util.upgradeVersion(this.protocolVersion, upgrade);
          if (newVersion != this.protocolVersion) {
            updates.data['schema:schemaVersion'] = updates.data['schema:version'] = newVersion;
            updates.data['landingPageContent'] = this.markdownData;
            updates.data['landingPage'] = "";

            data.protocol = updates;
            data.removed = removed;
            data.baseVersion = this.protocolVersion;
            this.$emit("updateProtocol", data);
          } else {
            this.$emit("onUploadError", 'Please make changes to update applet');
          }
        }
      }).catch(e => {
        if(this.prizeActivity)
          this.activities.pop();
        console.log(e);
      });
    },
    resetBuilder() {
      Object.assign(this.$data, getInitialData(this.model));
      this.resetValidation();
    },
    viewHistory() {
      if (this.isEditing) {
        this.model.getProtocolData().then((current) => {
          const { log, upgrade } = Protocol.getChangeInfo(
            this.original,
            current
          );
          this.changeHistoryDialog.visibility = true;
          this.changeHistoryDialog.data = log;
          this.changeHistoryDialog.currentVersion = util.upgradeVersion(
            this.protocolVersion,
            upgrade
          );
          this.changeHistoryDialog.defaultVersion = null;

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
        return;
      }

      /** viewing old changes */
      this.getProtocols([this.versions[index], this.versions[index + 1]]).then(
        (resp) => {
          const data = resp.data;

          const { log, upgrade } = Protocol.getChangeInfo(
            data[1].content,
            data[0].content
          );

          this.changeHistoryDialog.visibility = true;
          this.changeHistoryDialog.data = log;
          this.changeHistoryDialog.defaultVersion = version;

          this.historyComponentKey++;
        }
      );
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    },

    getPrizeActivity() {
      if(this.activities && this.activities.length) {
        for(let i = 0; i < this.activities.length; i++) {
          if(this.activities[i].isPrize === true) {
            this.prizeActivity = this.activities.splice(i, 1)[0];
            i--;
          }
        }
      }
    },

    withoutPrize(arr) {
      return arr.filter(activity => Boolean(activity['isPrize']) === false);
    }

  },
};
</script>
