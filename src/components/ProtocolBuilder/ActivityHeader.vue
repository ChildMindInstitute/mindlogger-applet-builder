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
        class="align-center"
      >
        <v-col
          class="py-0"
          cols="12"
          sm="4"
        >
          <v-checkbox
            v-model="isSkippable"
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
            >
              <v-checkbox
                @click="onSwitchAssessmentType"
                v-model="isOnePageAssessment"
                label="Show all questions at once"
                :disabled="!hasOnlyWebSupported"
              />
            </v-col>
          </template>
          <span>This feature is for webapp only</span>
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
          @onAddFromUrl="onAddMediaFromUrl($event, 'activityImage')"
          @onAddFromDevice="loading = true; onAddMediaFromDevice($event, 'activityImage');"
          @onRemove="onRemoveMedia('activityImage')"
          @onNotify="loading = false; notify = $event;"
        />
      </div>

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
              @click="assessmentTypeConfirmationDlg = false"
            >
              No
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    <Notify :notify="notify" />
    <Loading :loading="loading" />
  </v-card>
</template>

<style scoped>
.activity-name {
  font-weight: 600;
}

.invalid {
  background-color: #d44c4c;
}
</style>
¸
<script>
import { mapGetters, mapMutations } from 'vuex';
import config from '../../config';
import Uploader from './Uploader.vue';
import Notify from './Additional/Notify.vue';
import Loading from './Additional/Loading.vue';

export default {
  components: {
    Uploader,
    Notify,
    Loading,
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
      assessmentTypeConfirmationDlg: false
    }
  },
  mounted() {
  },
  methods: {
    ...mapMutations(config.MODULE_NAME, [
      'updateActivityMetaInfo',
      'deleteConditionals'
    ]),
    onSwitchAssessmentType () {
      if (!this.isOnePageAssessment) {
        if (this.conditionals.length) {
          this.assessmentTypeConfirmationDlg = true;
        } else {
          this.isOnePageAssessment = true;
        }
      } else {
        this.isOnePageAssessment = false;
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
      'currentActivity'
    ]),

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
        if (!['radio', 'checkbox', 'slider', 'text', 'ageSelector', 'cumulativeScore'].includes(inputType)) {
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
