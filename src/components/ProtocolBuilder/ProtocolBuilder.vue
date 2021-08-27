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
            <v-btn
              class="ml-2"
              fab
              small
              @click="onEditAboutPage"
            >
              <v-icon color="grey darken-1">
                mdi-pencil
              </v-icon>
            </v-btn>
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
              :initialAdditionalType="'small-circle'"
              :initialTitle="'Applet Image'"
              @onAddFromUrl="onAddWatermarkFromUrl($event)"
              @onAddFromDevice="onAddWatermarkFromDevice($event)"
              @onRemove="onRemoveWatermark()"
              @onNotify="onWatermarkNotify($event)"
            />
          </v-col>
        </v-row>
        <div>
          <v-subheader class="ml-10" v-if="themes && themes.length">
            Theme
          </v-subheader>

          <v-select v-if="themes && themes.length"
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

      <v-card class="pb-2">
        <v-card-title>
          Activities
          <v-spacer />
          <v-btn
            color="primary"
            class="mt-2"
            rounded
            @click="newActivity"
          >
            <v-icon>
              add
            </v-icon>
            Add Activity
          </v-btn>
        </v-card-title>

        <v-card
          v-for="(activity, index) in withoutPrize"
          :key="`${activity._id}-${index}`"
          class="ma-4"
        >
          <v-card-title
            class="py-0"
            :class="activityStatus[index] ? '' : 'invalid'"
          >
            {{ activity.name }}
            <v-spacer />
            <v-card-actions>
              <v-btn
                icon
                @click="duplicateActivity(activities.findIndex(act => act == activity))"
              >
                <v-icon color="grey lighten-1">
                  content_copy
                </v-icon>
              </v-btn>

              <v-btn
                icon
                @click="hideActivity(activities.findIndex(act => act == activity))"
              >
                <v-icon v-if="isHidden" color="grey lighten-1">
                  mdi-eye-off-outline
                </v-icon>
                <v-icon v-else color="grey lighten-1">
                  mdi-eye-outline
                </v-icon>
              </v-btn>

              <v-btn
                icon
                @click="editActivity(index)"
              >
                <v-icon color="grey lighten-1">
                  edit
                </v-icon>
              </v-btn>

              <v-btn
                icon
                @click="deleteActivity(activities.findIndex(act => act == activity))"
              >
                <v-icon color="grey lighten-1">
                  delete
                </v-icon>
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
      </v-card>
    </v-form>

    <LandingPageEditor
      :visibility="markdownDialog"
      :markdownText="markdownData"
      headText="About Page"
      @close="onCloseEditor"
      @submit="onSubmitEditor"
    />
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

  .invalid {
    background-color: #d44c4c;
  }
</style>

<script>
import LandingPageEditor from './LandingPageEditor';
import Uploader from './Uploader.vue';
import Protocol from '../../models/Protocol';
import Activity from '../../models/Protocol';
import Item from '../../models/Protocol';
import config from '../../config';

import { mapMutations, mapGetters } from 'vuex';

export default {
  components: {
    LandingPageEditor,
    Uploader,
  },
  data () {
    return {
      markdownDialog: false,
      isHidden: false,
      textRules: [(v) => !!v.trim() || "This field is required"],
    }
  },
  computed: {
    ...mapGetters(config.MODULE_NAME, ['protocol', 'activities', 'themes', 'themeId']),
    config() {
      return config;
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

    selectedTheme: {
      get: function () {
        return this.themeId
      },
      set: function (themeId) {
        this.updateThemeId(themeId)
      }
    },

    withoutPrize () {
      return this.activities.filter(activity => Boolean(activity['isPrize']) === false);
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
        'addActivity',
        'setCurrentActivity',
        'setCurrentScreen',
        'updateThemeId'
      ]
    ),
    onAddImageFromUrl (event) {
      this.appletImage = event;
      this.$emit('notify', {
        type: 'success',
        message: `Applet image from URL is successfully added.`,
        duration: 3000,
      });
    },
    onAddWatermarkFromUrl (event) {
      this.appletWatermark = event;
      this.$emit('notify', {
        type: 'success',
        message: `Applet watermark from URL is successfully added.`,
        duration: 3000,
      });
    },
    async onAddWatermarkFromDevice (uploadFunction) {
      console.log('0000');
      this.$emit('loading', true); 
      console.log('1111', uploadFunction);
      try {
        this.appletWatermark = await uploadFunction();
        console.log('222222');
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'success',
          message: `Applet watermark is successfully added.`,
          duration: 3000,
        });
      } catch (error) {
        console.log('5555error', error);
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'error',
          message: `Something went wrong with uploading applet watermark.`,
        });
        console.log('6666');
      }
    },
    onRemoveWatermark () {
      this.appletWatermark = '';
      // this.update();
      this.$emit('notify', {
        type: 'warning',
        message: `Applet watermark is successfully removed.`,
        duration: 3000,
      });
    },
    onWatermarkNotify (event) {
      this.$emit('loading', false); 
      this.$emit('notify', event);
    },
    async onAddImageFromDevice (uploadFunction) {
      this.$emit('loading', true);

      try {
        this.appletImage = await uploadFunction();
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'success',
          message: `Applet image is successfully added.`,
          duration: 3000,
        });
      } catch (error) {
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'error',
          message: `Something went wrong with uploading applet image.`,
        });
      }
    },
    onRemoveImage () {
      this.appletImage = '';
      // this.update();
      this.$emit('notify', {
        type: 'warning',
        message: `Applet image is successfully removed.`,
        duration: 3000,
      });
    },
    onEventNotify (event) {
      this.$emit('loading', false);
      this.$emit('notify', event);
    },
    onSubmitEditor (markdownData) {
      this.markdownData = markdownData;
      this.onCloseEditor();
    },
    onCloseEditor () {
      this.markdownDialog = false;
    },
    onEditAboutPage () {
      this.markdownDialog = true;
    },

    editActivity (index, isNew = false) {
      const activity = this.withoutPrize[index];
      const currentIndex = isNew ? index : this.activities.findIndex(({name}) => name === activity.name);
      this.setCurrentActivity(currentIndex);
      this.setCurrentScreen(config.ITEM_SCREEN);
    },

    hideActivity (index) {
      this.isHidden = !this.isHidden;
      this.showOrHideActivity(index);
    },

    newActivity () {
      const activityCount = this.activities.length;

      this.addActivity();
      this.editActivity(activityCount, true);
    },
  }
}
</script>
