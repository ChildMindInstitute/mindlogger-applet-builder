<template>
  <v-card>
    <v-card-title
      class="px-2 py-0"
      :class="name ? '' : 'invalid'"
    >
      <span class="activity-name">{{ name }}</span>
      <v-spacer />
      <v-card-actions>
        <v-btn
          icon
          @click="editActivtiy"
        >
          <v-icon
            v-if="!isExpanded"
            color="grey lighten-1"
          >
            edit
          </v-icon>
          <v-icon
            v-else
            color="grey lighten-1"
          >
            mdi-chevron-up
          </v-icon>
        </v-btn>
      </v-card-actions>
    </v-card-title>
    <div v-if="isExpanded">
      <v-text-field
        v-model="name"
        :rules="textRules"
        counter="55"
        maxlength="55"
        label="Activity Name"
        required
      />
      <v-text-field
        v-model="description"
        counter="230"
        maxlength="230"
        label="Activity Description"
      />

      <v-row
        v-if="pdfConfigured"
      >
        <v-col
        >
          <div class="report-config-title">Report(s) will be sent to:</div>
          <div class="d-flex align-center">
            <v-combobox
              class="email-list"
              :value="protocol.reportConfigs.emailRecipients"
              multiple
              outlined
              append-icon=""
              hide-details
              disabled
            >
              <template v-slot:selection="{ attrs, item, parent, selected }">
                <v-chip
                  v-bind="attrs"
                  :input-value="selected"
                  class="mx-2 my-0 py-0"
                  color="indigo lighten-5"
                  close
                  disabled
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

      <template
        v-if="currentActivity.activityType == 'NORMAL'"
      >
        <v-row
          class="align-center"
        >
          <v-tooltip bottom v-if="currentActivity.hasVariable">
            <template v-slot:activator="{ on, attrs }">
              <v-col
                class="py-0"
                cols="12"
                sm="4"
                v-bind="attrs"
                v-on="on"
              >
                <v-checkbox
                  @click="onSwitchSkipAllItems"
                  v-model="isSkippable"
                  :disabled="currentActivity.hasVariable"
                  label="Allow user to skip all items"
                />
              </v-col>
            </template>
            <span>This activity contains variables and cannot skip all items.</span>
          </v-tooltip>
          <v-col
            class="py-0"
            cols="12"
            sm="4"
            v-else
          >
            <v-checkbox
              @click="onSwitchSkipAllItems"
              v-model="isSkippable"
              :disabled="currentActivity.hasVariable"
              label="Allow user to skip all items"
            />
          </v-col>

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-col
                class="py-0"
                cols="12"
                sm="4"
                v-bind="attrs"
                v-on="on"
              >
                <v-checkbox
                  v-model="isReviewerActivity"
                  :disabled="!hasOnlyRadioCheckSlider"
                  label="This activity will only be available to review a user's data on the user's detail page"
                />
              </v-col>
            </template>

            <span>
              Reviewer dashboard assessment supports only radio/checkbox/slider items
            </span>
          </v-tooltip>


          <v-col
            class="py-0"
            cols="12"
            sm="4"
          >
            <v-checkbox
              v-model="isDisableResponseChanges"
              label="Disable the users's ability to change the response"
            />
          </v-col>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-col
                class="py-0"
                cols="12"
                sm="4"
                v-bind="attrs"
                v-on="on"
                @mouseover="show = true"
                @mouseleave="show = false"
              >
                <v-checkbox
                  @click="onSwitchAssessmentType"
                  v-model="isOnePageAssessment"
                  label="Show all questions at once"
                  :disabled="!hasOnlyWebSupported || currentActivity.hasVariable"
                />
              </v-col>
            </template>
            <span v-if="show">
              <span v-if="currentActivity.hasVariable">This activity contains variables and cannot be a one page assessment.</span>
              <span v-else>This feature is for webapp(radio, checkbox, slider, cumulative, text, and age) only.</span>
            </span>
          </v-tooltip>
        </v-row>

        <div
          class="d-flex justify-space-around"
        >
          <Uploader
            class="mt-3 mb-4"
            style="max-width: 300px"
            initialType="video_or_image"
            :initialData="splash"
            :aspectRatio="7/10"
            imageType="splash"
            initialTitle="Splash Screen"
            @onAddFromUrl="onAddMediaFromUrl($event, 'splash')"
            @onAddFromDevice="loading = true; onAddMediaFromDevice($event, 'splash');"
            @onRemove="onRemoveMedia('splash')"
            @onNotify="loading = false; notify = $event;"
          />

          <Uploader
            class="mt-3 mb-4"
            style="max-width: 300px"
            :initialType="'image'"
            :initialData="activityImage"
            :initialTitle="'Activity Image'"
            :aspectRatio="1/1"
            @onAddFromUrl="onAddMediaFromUrl($event, 'activityImage')"
            @onAddFromDevice="loading = true; onAddMediaFromDevice($event, 'activityImage');"
            @onRemove="onRemoveMedia('activityImage')"
            @onNotify="loading = false; notify = $event;"
          />
        </div>
      </template>

    </div>

    <v-dialog
      v-model="assessmentTypeConfirmationDlg"
      persistent
      width="500"
    >
      <v-card>
        <v-card-text class="pt-4">
          A one page assessment is not available with conditional logic.
          Are you sure you want to delete the conditional logic on this activity to have a one page assessment?
        </v-card-text>

        <v-card-actions
          class="justify-space-around"
        >
          <v-btn
            @click="deleteConditionals(); assessmentTypeConfirmationDlg = false; isOnePageAssessment = true;"
          >
            Yes
          </v-btn>

          <v-btn
            @click="isOnePageAssessment = false; assessmentTypeConfirmationDlg = false"
          >
            No
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="alertFlag"
      persistent
      width="500"
    >
      <v-card>
        <v-card-text class="pt-4">
          {{alertMsg}}
        </v-card-text>

        <v-card-actions
          class="justify-space-around"
        >
          <v-btn
            @click="alertFlag = false"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <Notify :notify="notify" />
    <Loading :loading="loading" />

    <ReportConfig
      v-model="reportConfigDialog"
      :current-activity="currentActivity"
      :reportConfigs="protocol.reportConfigs"
      @updateItemValue="updateItemValue"
    />
  </v-card>
</template>

<style scoped>
.activity-name {
  font-weight: 600;
}

.invalid {
  background-color: #d44c4c;
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
</style>
¸
<script>
import { mapGetters, mapMutations } from 'vuex';
import config from '../../config';
import Uploader from './Uploader.vue';
import Notify from './Additional/Notify.vue';
import Loading from './Additional/Loading.vue';
import ReportConfig from './ReportConfig.vue';
import { getTextBetweenBrackets } from '../../utilities/util';

export default {
  components: {
    Uploader,
    Notify,
    Loading,
    ReportConfig,
  },
  props: {
    headerExpanded: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      textRules: [(v) => !!v || 'This field is required'],
      isExpanded: true,
      loading: false,
      notify: {},
      assessmentTypeConfirmationDlg: false,
      alertFlag: false,
      alertMsg: '',
      show: false,
      reportConfigDialog: false,
    }
  },
  mounted() {
  },
  methods: {
    ...mapMutations(config.MODULE_NAME, [
      'updateActivityMetaInfo',
      'deleteConditionals'
    ]),
    updateItemValue (value) {
      this.updateActivityMetaInfo({
        reportIncludeItem: value
      });
    },
    onSwitchAssessmentType () {
      if (this.currentActivity.hasVariable && this.isOnePageAssessment) {
        this.alertMsg = `This activity contains variables and cannot be a one page assessment.`;
        this.alertFlag = true;
        setTimeout(() => {
          this.isOnePageAssessment = false;
          this.updateActivityMetaInfo({ isOnePageAssessment: false })
        }, 100)
        return;
      }
      setTimeout(() => {
        if (this.isOnePageAssessment) {
          if (this.conditionals.length) {
            this.assessmentTypeConfirmationDlg = true;
          } else {
            this.isOnePageAssessment = true;
            this.updateActivityMetaInfo({ isOnePageAssessment: true })
          }
        }
      }, 100)
    },
    onSwitchSkipAllItems () {
      if (this.isSkippable) {
        for (const item of this.currentActivity.items) {
          const variableNames = getTextBetweenBrackets(item.question.text);
          if ((variableNames && variableNames.length) || this.currentActivity.hasVariable) {
            this.alertMsg = `By skipping all the items it will cause some items to fail`;
            this.alertFlag = true;
            setTimeout(() => {
              this.isSkippable = false;
              this.updateActivityMetaInfo({ isSkippable: false, valid: false });
            }, 100)
            return false;
          }
        }
      }
    },
    editActivtiy () {
      this.isExpanded = !this.isExpanded;
      if (this.isExpanded) {
        this.$emit('onExpand');
      }
    },
    onAddMediaFromUrl(url, type) {
      if (type == 'splash') {
        this.splash = url;
      } else {
        this.activityImage = url;
      }

      this.notify = {
        type: 'success',
        message: (type == 'splash' ?
          'Splash screen from URL successfully added to Activity.' :
          'Activity image has been added successfully.'
        ),
        duration: 3000,
      };
    },
    async onAddMediaFromDevice(uploadFunction, type) {
      try {
        if (type == 'splash') {
          this.splash = await uploadFunction();
        } else {
          this.activityImage = await uploadFunction();
        }

        this.loading = false;
        this.notify = {
          type: 'success',
          message: ( type == 'splash' ?
            'Splash screen successfully added to Activity.' :
            'Activity image has been added successfully.'
          ),
          duration: 3000,
        };
      } catch (error) {
        this.loading = false;
        this.notify = {
          type: 'error',
          message: ( type == 'splash' ?
              'Something went wrong with uploading Splash screen for Activity. Please try to upload again or just save Activity without changes for Splash screen.' :
              'Something went wrong with uploading activity image. Please try to upload again or just save Activity without image.'
            ),
        };
      }
    },

    onRemoveMedia(type) {
      if (type == 'splash') {
        this.splash = '';
      } else {
        this.activityImage = '';
      }

      this.notify = {
        type: 'warning',
        message: (type == 'splash' ?
          'Splash screen successfully removed from Activity.' :
          'Activity image has been removed successfully.'
        ),
        duration: 3000,
      };
    },
  },
  computed: {
    ...mapGetters(config.MODULE_NAME, [
      'currentActivity',
      'protocol',
    ]),

    pdfConfigured () {
      return this.protocol.reportConfigs.emailRecipients.length &&
              this.protocol.reportConfigs.serverIp &&
              this.protocol.reportConfigs.publicEncryptionKey;
    },

    conditionals () {
      return this.currentActivity.conditionalItems;
    },

    name: {
      get: function () {
        return this.currentActivity && this.currentActivity.name;
      },
      set: function (name) {
        this.updateActivityMetaInfo({ name });
      }
    },
    description: {
      get: function () {
        return this.currentActivity && this.currentActivity.description;
      },
      set: function (description) {
        this.updateActivityMetaInfo({ description });
      }
    },
    activityImage: {
      get: function () {
        return this.currentActivity && this.currentActivity.image
      },
      set: function (activityImage) {
        this.updateActivityMetaInfo({ image: activityImage })
      }
    },
    splash: {
      get: function () {
        return this.currentActivity && this.currentActivity.splash;
      },
      set: function (splash) {
        this.updateActivityMetaInfo({ splash });
      }
    },
    preamble: {
      get: function () {
        return this.currentActivity && this.currentActivity.preamble;
      },
      set: function (preamble) {
        this.updateActivityMetaInfo({ preamble });
      }
    },
    isSkippable: {
      get: function () {
        return this.currentActivity && this.currentActivity.isSkippable;
      },
      set: function (isSkippable) {
        this.updateActivityMetaInfo({ isSkippable });
      }
    },
    isReviewerActivity: {
      get: function () {
        return this.currentActivity && this.currentActivity.isReviewerActivity;
      },
      set: function (isReviewerActivity) {
        this.updateActivityMetaInfo({ isReviewerActivity });
      }
    },
    isDisableResponseChanges: {
      get: function () {
        return this.currentActivity && this.currentActivity.disableBack;
      },
      set: function (isDisableResponseChanges) {
        this.updateActivityMetaInfo({ disableBack: isDisableResponseChanges });
      }
    },
    hasOnlyRadioCheckSlider() {
      for (let i = 0; i < this.currentActivity.items.length; i++) {
        const inputType = this.currentActivity.items[i].inputType;

        if (!['radio', 'checkbox', 'slider'].includes(inputType)) {
          return false;
        }
      }
      return true;
    },
    hasOnlyWebSupported() {
      for (let i = 0; i < this.currentActivity.items.length; i++) {
        const inputType = this.currentActivity.items[i].inputType;
        if (!['radio', 'checkbox', 'slider', 'text', 'ageSelector'].includes(inputType)) {
          this.updateActivityMetaInfo({ isOnePageAssessment: false })
          return false;
        }
      }
      return true;
    },
    isOnePageAssessment: {
      get: function () {
        return this.currentActivity && this.currentActivity.isOnePageAssessment;
      },

      set: function (value) {
        this.updateActivityMetaInfo({ isOnePageAssessment: value })
      }
    }
  },
  watch: {
    headerExpanded: {
      handler () {
        if (!this.headerExpanded) {
          this.isExpanded = false;
        }
      }
    }
  },
}
</script>
