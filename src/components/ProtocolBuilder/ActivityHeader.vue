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
      <Uploader
        class="mt-3 mb-4"
        style="max-width: 300px"
        initialType="video"
        :initialData="splash"
        initialTitle="Splash Screen"
        @onAddFromUrl="onAddSplashFromUrl($event)"
        @onAddFromDevice="loading = true; onAddSplashFromDevice($event);"
        @onRemove="onRemoveSplash()"
        @onNotify="loading = false; notify = $event;"
      />
      <v-row
        class="align-center"
      >
        <v-col
          class="py-0"
          cols="12"
          sm="6"
        >
          <v-checkbox
            v-model="isSkippable"
            label="Allow user to skip all items"
          />
        </v-col>
        <v-col
          class="py-0"
          cols="12"
          sm="6"
        >
          <v-checkbox
            v-model="isDisableResponseChanges"
            label="Disable the users's ability to change the response"
          />
        </v-col>
      </v-row>
    </div>
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
    }
  },
  mounted() {
  },
  methods: {
    ...mapMutations(config.MODULE_NAME, [
      'updateActivityMetaInfo',
    ]),
    editActivtiy () {
      this.isExpanded = !this.isExpanded;
      if (this.isExpanded) {
        this.$emit('onExpand');
      }
    },
    onAddSplashFromUrl(url) {
      this.splash = url;
      this.notify = {
        type: 'success',
        message: 'Splash screen from URL successfully added to Activity.',
        duration: 3000,
      };
    },
    async onAddSplashFromDevice(uploadFunction) {
      try {
        this.splash = await uploadFunction();
        this.loading = false;
        this.notify = {
          type: 'success',
          message: 'Splash screen successfully added to Activity.',
          duration: 3000,
        };
      } catch (error) {
        this.loading = false;
        this.notify = {
          type: 'error',
          message: 'Something went wrong with uploading Splash screen for Activity. Please try to upload again or just save Activity without changes for Splash screen.',
        };
      }
    },

    onRemoveSplash() {
      this.splash = '';
      this.notify = {
        type: 'warning',
        message: 'Splash screen successfully removed from Activity.',
        duration: 3000,
      };
    },
  },
  computed: {
    ...mapGetters(config.MODULE_NAME, [
      'currentActivity'
    ]),
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
    isDisableResponseChanges: {
      get: function () {
        return this.currentActivity && this.currentActivity.disableBack;
      },
      set: function (isDisableResponseChanges) {
        this.updateActivityMetaInfo({ disableBack: isDisableResponseChanges });
      }
    },
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
