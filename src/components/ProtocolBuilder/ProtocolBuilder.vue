<template>
  <div>
    <v-form
      ref="form"
      lazy-validation
    >
      <v-card class="pa-4 my-4">
        <v-row class="mx-2">
          <v-text-field
            v-model="name"
            :rules="textRules"
            counter="55"
            maxlength="55"
            label="Applet Name"
            required
          />
        </v-row>
        <v-row class="mx-2">
          <v-text-field
            v-model="description"
            :rules="textRules"
            counter="230"
            maxlength="230"
            label="Applet Description"
            required
          />
        </v-row>
        <v-row>
          <v-col class="d-flex">
            <v-subheader class="ml-2">
              About Page
            </v-subheader>

            <v-menu
              bottom
              :close-on-content-click="false"
              offset-y
            >
              <template
                v-slot:activator="{ on, attrs }"
              >
                <v-btn
                  class="ml-2"
                  fab
                  small
                  v-on="on"
                  v-bind="attrs"
                >
                  <v-icon color="grey darken-1">
                    mdi-pencil
                  </v-icon>
                </v-btn>
              </template>

              <v-list>
                <v-list-item @click="openLandingPageEditor('markdown')">
                  <v-list-item-action>
                    <v-radio-group
                      :value="markdownData && landingPageType == 'markdown' ? 'checked' : 'unchecked'"
                    >
                      <v-radio
                        disabled
                        value="checked"
                      />
                    </v-radio-group>
                  </v-list-item-action>
                  <v-list-item-title>Add Text</v-list-item-title>
                </v-list-item>

                <Uploader
                  :initialType="'image'"
                  :initialData="landingPageType == 'image' ? markdownData : ''"
                  :initialAdditionalType="'list'"
                  @onAddFromUrl="onAddLandingImageFromUrl($event)"
                  @onAddFromDevice="onAddLandingImageFromDevice($event)"
                  @onRemove="onRemoveLandingImage()"
                  @onNotify="onLandingImageNotify($event)"
                />
              </v-list>
            </v-menu>
          </v-col>

          <v-col class="d-flex">
            <v-subheader class="ml-10">
              Applet Image
            </v-subheader>

            <Uploader
              :initialType="'image'"
              :initialData="appletImage"
              :initialAdditionalType="'small-circle'"
              :initialTitle="'Applet Image'"
              :aspectRatio="1/1"
              @onAddFromUrl="onAddImageFromUrl($event)"
              @onAddFromDevice="onAddImageFromDevice($event)"
              @onRemove="onRemoveImage()"
              @onNotify="onEventNotify($event)"
            />
          </v-col>

          <v-col class="d-flex">
            <v-subheader class="ml-10">
              Applet Watermark
            </v-subheader>
            <Uploader
              :initialType="'image'"
              :initialData="appletWatermark"
              :imageType="'watermark'"
              :initialAdditionalType="'small-circle'"
              :initialTitle="'Watermark'"
              @onAddFromUrl="onAddWatermarkFromUrl($event)"
              @onAddFromDevice="onAddWatermarkFromDevice($event)"
              @onRemove="onRemoveWatermark()"
              @onNotify="onWatermarkNotify($event)"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col
            v-if="!protocol.reportConfigs.emailRecipients.length"
            class="d-flex align-center"
          >
            <v-btn
              class="configure-reports"
              @click="reportConfigDialog=true"
            >
              <img
                height="25"
                alt=""
                :src="baseImageURL + 'report_icon.png'"
              >

              Generate, encrypt, and email report(s)
            </v-btn>

            <div
              v-if="!protocol.reportConfigs.serverIp || !protocol.reportConfigs.publicEncryptionKey"
              class="server-unconfigured mx-4"
            >
              Server status: Not configured
            </div>
          </v-col>

          <v-col
            v-else
          >
            <div class="report-config-title">Report(s) will be sent to:</div>
            <div class="d-flex align-center">
              <v-combobox
                class="email-list"
                v-model="emailRecipients"
                multiple
                outlined
                required
                append-icon=""
                hide-details
              >
                <template v-slot:selection="{ attrs, item, parent, selected }">
                  <v-chip
                    v-bind="attrs"
                    :input-value="selected"
                    class="mx-2 my-0 py-0"
                    color="indigo lighten-5"
                    close
                    @click:close="parent.selectItem(item)"
                  >
                    {{ item }}
                  </v-chip>
                </template>
              </v-combobox>

              <div>
                <v-btn icon @click="reportConfigDialog=true">
                  <v-icon>mdi-settings</v-icon>
                </v-btn>

                Configure Email
              </div>
            </div>
          </v-col>
        </v-row>

        <v-row class="mx-2">
          <v-col sm="4">
            <v-checkbox
              v-model="streamEnabled"
              label="Enable streaming of response data"
            />
          </v-col>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-col sm="4"
                v-bind="attrs"
                v-on="on"
              >
                <v-checkbox
                  v-model="combineReports"
                  label="Combine reports on last activity"
                />
              </v-col>
            </template>
            <span>This feature only impacts mobile and the web-app. The admin report will remain unchanged.</span>
          </v-tooltip>
        </v-row>

        <div v-if="themes && themes.length">
          <v-subheader class="ml-10">
            Theme
          </v-subheader>

          <v-select
              v-model="selectedTheme"
              :items="themes"
              :label="'Select theme'"
              item-text="name"
              item-value="_id"
              hide-details
              single-line
              outlined
              dense
          />
        </div>
      </v-card>
      <ActivityFlow v-if="currentScreen === config.ACTIVITY_FLOW_SCREEN" />
      <v-card v-else class="pb-2">
        <v-card-title>
          Activities
          <v-spacer />
          <v-menu
            left
            ref="mainMenu"
            :close-on-content-click="false"
          >
            <template
              v-slot:activator="{ on, attrs }"
            >
              <v-btn
                v-bind="attrs"
                color="primary"
                class="mt-2"
                rounded
                v-on="on"
              >
                <v-icon>
                  add
                </v-icon>
                Add Activity
              </v-btn>
            </template>

            <v-list>
              <v-list-item
                @click="newActivity(-1)"
              >
                <v-list-item-title>Blank Activity</v-list-item-title>
              </v-list-item>

              <v-list-group>
                <template v-slot:activator>
                  <v-list-item-title>Cognitive Activity</v-list-item-title>
                </template>

                <v-list-item
                  class="ml-4"
                  @click="newActivity(-1, 'TRAILS_IPAD')"
                >
                  <v-list-item-title>A/B Trails iPad</v-list-item-title>
                </v-list-item>

                <v-list-item
                  class="ml-4"
                  @click="newActivity(-1, 'TRAILS_MOBILE')"
                >
                  <v-list-item-title>A/B Trails Mobile</v-list-item-title>
                </v-list-item>

                <v-list-item
                  class="ml-4"
                  @click="newActivity(-1, 'FLANKER')"
                >
                  <v-list-item-title>Simple & Choice Reaction Time Task Builder</v-list-item-title>
                </v-list-item>

                <v-list-item
                  class="ml-4"
                  @click="newActivity(-1, 'CST_GYRO')"
                >
                  <v-list-item-title>CST Gyroscope</v-list-item-title>
                </v-list-item>

                <v-list-item
                  class="ml-4"
                  @click="newActivity(-1, 'CST_TOUCH')"
                >
                  <v-list-item-title>CST Touch</v-list-item-title>
                </v-list-item>
              </v-list-group>
            </v-list>
          </v-menu>
        </v-card-title>
        <draggable
          v-model="withoutPrize"
          handle=".dragging-handle"
          :scroll-sensitivity="100"
          :force-fallback="true"
        >
          <transition-group>
            <v-card
              v-for="(activity, index) in withoutPrize"
              :key="`${activity.timestamp}-${activity.id || 0}`"
              class="ma-4"
            >
              <v-card-title
                class="py-0"
                :class="activityStatus[index] ? '' : 'invalid'"
              >
                {{ activity.name }}
                <v-spacer />
                <v-card-actions>
                  <v-menu
                    top
                    ref="menu"
                    :close-on-content-click="false"
                  >
                    <template
                      v-slot:activator="{ on: menu }"
                    >
                      <v-tooltip
                        top
                      >
                        <template v-slot:activator="{ on: tooltip }">
                          <v-btn
                            class="ml-4"
                            icon
                            v-on="{ ...menu, ...tooltip }"
                          >
                            <v-icon color="grey lighten-1">
                              mdi-plus-circle-outline
                            </v-icon>
                          </v-btn>
                        </template>

                        <span>Add Activity</span>
                      </v-tooltip>
                    </template>

                    <v-list>
                      <v-list-item
                        @click="newActivity(index+1)"
                      >
                        <v-list-item-title>Blank Activity</v-list-item-title>
                      </v-list-item>

                      <v-list-group>
                        <template v-slot:activator>
                          <v-list-item-title>Cognitive Activity</v-list-item-title>
                        </template>

                        <v-list-item
                          class="ml-4"
                          @click="newActivity(index+1, 'TRAILS_IPAD')"
                        >
                          <v-list-item-title>A/B Trails iPad</v-list-item-title>
                        </v-list-item>

                        <v-list-item
                          class="ml-4"
                          @click="newActivity(index+1, 'TRAILS_MOBILE')"
                        >
                          <v-list-item-title>A/B Trails Mobile</v-list-item-title>
                        </v-list-item>

                        <v-list-item
                          class="ml-4"
                          @click="newActivity(index+1, 'FLANKER')"
                        >
                          <v-list-item-title>Flanker</v-list-item-title>
                        </v-list-item>

                        <v-list-item
                          class="ml-4"
                          @click="newActivity(index+1, 'CST_GYRO')"
                        >
                          <v-list-item-title>CST Gyroscope</v-list-item-title>
                        </v-list-item>

                        <v-list-item
                          class="ml-4"
                          @click="newActivity(index+1, 'CST_TOUCH')"
                        >
                          <v-list-item-title>CST Touch</v-list-item-title>
                        </v-list-item>
                      </v-list-group>
                    </v-list>
                  </v-menu>

                  <v-tooltip
                    top
                  >
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        v-on="on"
                        @click="duplicateActivity(activities.findIndex(act => act == activity))"
                      >
                        <v-icon color="grey lighten-1">
                          content_copy
                        </v-icon>
                      </v-btn>
                    </template>

                    <span>Duplicate Activity</span>
                  </v-tooltip>

                  <v-tooltip
                    v-if="activity.activityType === 'NORMAL' || activity.activityType == 'CST_GYRO' || activity.activityType == 'CST_TOUCH' || activity.activityType == 'FLANKER'"
                    top
                  >
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        v-on="on"
                        @click="editActivity(index)"
                      >
                        <v-icon color="grey lighten-1">
                          edit
                        </v-icon>
                      </v-btn>
                    </template>

                    <span>Edit Activity</span>
                  </v-tooltip>

                  <v-tooltip
                    top
                  >
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        v-on="on"
                        @click="deleteActivity(activities.findIndex(act => act == activity))"
                      >
                        <v-icon color="grey lighten-1">
                          delete
                        </v-icon>
                      </v-btn>
                    </template>

                    <span>Delete Activity</span>
                  </v-tooltip>

                  <v-btn
                    class="ml-4 move-icon dragging-handle"
                    icon
                  >
                    <img class="px-2 pt-2 drag-indicator" :src="baseImageURL + 'drag_indicator.png'" />
                  </v-btn>
                </v-card-actions>
              </v-card-title>

              <v-text-field
                :value="activity.description"
                label="Description"
                class="px-4"
                disabled
              />
            </v-card>
          </transition-group>
        </draggable>
      </v-card>
    </v-form>

    <LandingPageEditor
      :visibility="markdownDialog"
      :markdownText="markdownData"
      :inputType="landingPageInputType"
      headText="About Page"
      @close="onCloseEditor"
      @submit="onSubmitEditor"
    />

    <ReportConfig
      v-model="reportConfigDialog"
      :reportConfigs="protocol.reportConfigs"
      @updateConfig="updateReportConfig"
    />

    <v-dialog
      v-model="validFileDlg"
      width="400"
    >
      <v-alert type="success">
        <span>{{ fileSuccessMsg }}</span>
      </v-alert>
    </v-dialog>

    <v-dialog
      v-model="inValidFileDlg"
      width="400"
    >
      <v-alert type="error">
        <span>{{ fileErrorMsg }}</span>
      </v-alert>
    </v-dialog>
    <Notify :notify="notify" />
  </div>
</template>

<style scoped>
  .add-activity /deep/ .v-btn__content {
    color: rgba(20,20,20);
    font-weight: 500;
    font-size: 18px;
    padding: 4px;
    text-transform: none;
  }

  .drag-indicator {
    height: 25px;
    margin-bottom: 8px;
  }

  .invalid {
    background-color: #d44c4c;
  }

  .sortable-chosen {
    border: 2px solid gray;
  }

  .move-icon {
    cursor: move;
  }

  .configure-reports /deep/ .v-btn__content {
    text-transform: none;
  }

  .email-list {
    width: 70%;
  }

  .email-list /deep/ .v-input__slot {
    min-height: 48px;
  }

  .report-config-title {
    color: #757575;
  }

  .server-unconfigured {
    color: #FF0000;
  }
</style>

<script>
import LandingPageEditor from './LandingPageEditor';
import ActivityFlow from './ActivityFlow';
import Uploader from './Uploader.vue';
import Protocol from '../../models/Protocol';
import Activity from '../../models/Protocol';
import Item from '../../models/Protocol';
import Notify from './Additional/Notify.vue';
import ReportConfig from './ReportConfig.vue';
import config from '../../config';
import draggable from 'vuedraggable'

import { mapMutations, mapGetters } from 'vuex';

export default {
  components: {
    LandingPageEditor,
    ActivityFlow,
    Notify,
    Uploader,
    draggable,
    ReportConfig,
  },
  data () {
    return {
      markdownDialog: false,
      landingPageInputType: 'markdown',
      isVis: [],
      inValidFileDlg: false,
      fileErrorMsg: '',
      validFileDlg: false,
      fileSuccessMsg: '',
      notify: {},
      textRules: [(v) => !!v.trim() || "This field is required"],
      reportConfigDialog: false,
    }
  },
  computed: {
    ...mapGetters(config.MODULE_NAME,
    [
      'protocol',
      'activities',
      'currentScreen',
      'themes',
      'themeId',
      'baseImageURL'
    ]),
    config() {
      return config;
    },
    emailRecipients: {
      get: function () {
        return this.protocol.reportConfigs.emailRecipients;
      },
      set: function(value) {
        this.updateProtocolMetaInfo({
          reportConfigs: {
            ...this.protocol.reportConfigs,
            emailRecipients: value
          }
        })
      }
    },
    name: {
      get: function () {
        return this.protocol.name
      },
      set: function (name) {
        this.updateProtocolMetaInfo({ name })
      }
    },
    description: {
      get: function () {
        return this.protocol.description
      },
      set: function (description) {
        this.updateProtocolMetaInfo({ description })
      }
    },
    markdownData: {
      get: function () {
        return this.protocol.markdownData
      },
      set: function (markdownData) {
        this.updateProtocolMetaInfo({ markdownData })
      }
    },

    landingPageType: {
      get: function () {
        return this.protocol.landingPageType;
      },
      set: function (landingPageType) {
        this.updateProtocolMetaInfo({ landingPageType });
      }
    },

    appletWatermark: {
      get: function () {
        return this.protocol.watermark
      },
      set: function (watermark) {
        this.updateProtocolMetaInfo({ watermark })
      }
    },

    appletImage: {
      get: function () {
        return this.protocol.image
      },
      set: function (appletImage) {
        this.updateProtocolMetaInfo({ image: appletImage })
      }
    },

    streamEnabled: {
      get: function () {
        return this.protocol.streamEnabled;
      },
      set: function (streamEnabled) {
        this.updateProtocolMetaInfo({ streamEnabled })
      }
    },

    combineReports: {
      get: function () {
        return this.protocol.combineReports;
      },
      set: function (combineReports) {
        this.updateProtocolMetaInfo({ combineReports })
      }
    },

    selectedTheme: {
      get: function () {
        return this.themeId
      },
      set: function (themeId) {
        this.updateThemeId(themeId)
      }
    },

    withoutPrize: {
      get () {
        return this.activities.filter(activity => Boolean(activity['isPrize']) === false);
      },
      set (value) {
        const prizeIndex = this.activities.findIndex(activity => Boolean(activity['isPrize']) == true);
        const newActivityList = [...value];

        if (prizeIndex >= 0) {
          newActivityList.splice(prizeIndex, 0, this.activities[prizeIndex]);
        }

        this.updateActivityList(newActivityList);
      }
    },

    activityStatus () {
      return this.withoutPrize.map(activity => !(
        !activity.valid
          || activity.items.some(item => !item.valid)
          || activity.items.length === 0
          || activity.subScales.some(subScale => !subScale.valid)
          || activity.conditionalItems.some(conditional => !conditional.valid)
      ))
    },
  },
  methods: {
    ...mapMutations(config.MODULE_NAME,
      [
        'updateProtocolMetaInfo',
        'duplicateActivity',
        'deleteActivity',
        'showOrHideActivity',
        'showActivity',
        'addActivity',
        'setCurrentActivity',
        'setCurrentScreen',
        'updateThemeId',
        'updateActivityList'
      ]
    ),
    updateReportConfig (configs) {
      this.updateProtocolMetaInfo({
        reportConfigs: configs
      })
    },
    openLandingPageEditor (pageType) {
      this.landingPageInputType = pageType;
      this.markdownDialog = true;
    },
    onAddImageFromUrl (event) {
      this.appletImage = event;
      this.validFileDlg = true;
      this.fileSuccessMsg = 'Applet image from URL is successfully added.';
    },
    onAddWatermarkFromUrl (event) {
      this.appletWatermark = event;
      this.validFileDlg = true;
      this.fileSuccessMsg = 'Applet watermark from URL is successfully added.';
    },
    onAddLandingImageFromUrl (event) {
      this.markdownData = event;
      this.validFileDlg = true;
      this.fileSuccessMsg = 'Applet About image is successfully added.';
      this.landingPageType = 'image';
    },
    async onAddWatermarkFromDevice (uploadFunction) {
      this.$emit('loading', true);
      try {
        this.appletWatermark = await uploadFunction();
        this.$emit('loading', false);
        this.validFileDlg = true;
        this.fileSuccessMsg = 'Applet watermark is successfully added.';
      } catch (error) {
        this.$emit('loading', false);
      }
    },
    async onAddLandingImageFromDevice (uploadFunction) {
      this.$emit('loading', true);
      try {
        this.markdownData = await uploadFunction();
        this.$emit('loading', false);
        this.validFileDlg = true;
        this.landingPageType = 'image';
        this.fileSuccessMsg = 'Applet About image is sucessfully added.';
      } catch (error) {
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'error',
          message: `Something went wrong with uploading applet watermark.`,
        });
      }
    },
    onRemoveWatermark () {
      this.appletWatermark = '';
      // this.update();
      this.notify = {
        type: 'warning',
        message: `Applet watermark is successfully removed.`,
        duration: 3000,
      };
    },
    onRemoveLandingImage () {
      this.markdownData = '';
      this.notify = {
        type: 'warning',
        message: 'Applet About images is successfully removed.',
        duration: 3000
      }
      this.landingPageType = 'markdown';
    },
    onWatermarkNotify (event) {
      this.$emit('loading', false);
      this.fileErrorMsg = event.message;
      this.inValidFileDlg = true;
    },
    onLandingImageNotify (event) {
      this.$emit('loading', false);
      this.fileErrorMsg = event.message;
      this.inValidFileDlg = true;
      this.$emit('notify', event);
    },
    async onAddImageFromDevice (uploadData) {
      this.$emit('loading', true);

      try {
        this.appletImage = await uploadData();
        this.$emit('loading', false);
        this.validFileDlg = true;
        this.fileSuccessMsg = 'Applet image is successfully added.';
      } catch (error) {
        this.$emit('loading', false);
      }
    },
    onRemoveImage () {
      this.appletImage = '';
      // this.update();
      this.notify = {
        type: 'warning',
        message: `Applet image is successfully removed.`,
        duration: 3000,
      };
    },
    onEventNotify (event) {
      this.$emit('loading', false);
      this.fileErrorMsg = event.message;
      this.inValidFileDlg = true;
    },
    onSubmitEditor (markdownData) {
      this.markdownData = markdownData;
      this.landingPageType = this.landingPageInputType;
      this.onCloseEditor();
    },
    onCloseEditor () {
      this.markdownDialog = false;
    },

    editActivity (index, isNew = false) {
      const activity = this.withoutPrize[index];
      const currentIndex = isNew ? index : this.activities.indexOf(activity);

      this.setCurrentActivity(currentIndex);
      this.setCurrentScreen(config.ITEM_SCREEN);
    },

    newActivity (index = -1, type = null) {
      if (Array.isArray(this.$refs.menu)) {
        for (const menu of this.$refs.menu) {
          menu.save();
        }
      }

      this.$refs.mainMenu.save();

      const activityCount = this.activities.length;

      this.addActivity({ index, type });
      if (!type) {
        this.editActivity(index >= 0 ? index : activityCount, true);
      }
    },
  }
}
</script>
