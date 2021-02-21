<template>
  <v-card>
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
      :rules="textRules"
      counter="230"
      maxlength="230"
      label="Activity Description"
      required
    />

    <v-text-field
      v-model="preamble"
      :rules="textRules"
      counter="230"
      maxlength="230"
      label="Preamble"
      required
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
  </v-card>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import config from '../../config';

export default {
  data() {
    return {
      textRules: [(v) => !!v || 'This field is required'],
    }
  },
  mounted() {
  },
  methods: {
    ...mapMutations(config.MODULE_NAME, [
      'updateActivityMetaInfo',
    ])
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
  }
}
</script>
