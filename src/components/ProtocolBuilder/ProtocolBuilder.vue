<template>
  <div>
    <v-form ref="form" lazy-validation>
      <v-card class="pa-4 my-4">
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
          label="Applet Description"
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
      </v-card>

      <v-card class="pb-2">
        <v-card-title>
          Activities
          <v-spacer />
          <v-btn
            @click="newActivity"
            color="primary"
            class="mt-2"
            rounded
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
            {{activity.name}}
            <v-spacer />
            <v-card-actions>
              <v-btn icon @click="duplicateActivity(index)">
                <v-icon color="grey lighten-1">
                  content_copy
                </v-icon>
              </v-btn>

              <v-btn icon @click="editActivity(index)">
                <v-icon color="grey lighten-1">
                  edit
                </v-icon>
              </v-btn>

              <v-btn icon @click="deleteActivity(index)">
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
          ></v-text-field>

        </v-card>
      </v-card>
    </v-form>

    <LandingPageEditor 
      :visibility="markdownDialog" 
      :markdownText="markdownData"
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
import Protocol from '../../models/Protocol';
import Activity from '../../models/Protocol';
import Item from '../../models/Protocol';
import config from '../../config';

import { mapMutations, mapGetters } from 'vuex';

export default {
  components: {
    LandingPageEditor,
  },
  data () {
    return {
      markdownDialog: false,
      textRules: [(v) => !!v || "This field is required"],
    }
  },
  computed: {
    ...mapGetters(config.MODULE_NAME, ['protocol', 'activities']),
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

    withoutPrize () {
      return this.activities.filter(activity => Boolean(activity['isPrize']) === false);
    },

    activityStatus () {
      return this.withoutPrize.map(activity => !(
        !activity.valid 
          || activity.items.some(item => !item.valid) 
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
        'addActivity', 
        'setCurrentActivity', 
        'setCurrentScreen',
      ]
    ),
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

    editActivity (index) {
      this.setCurrentActivity(index);
      this.setCurrentScreen(config.ITEM_SCREEN);
    },

    newActivity () {
      const activityCount = this.activities.length;

      this.addActivity();
      this.editActivity(activityCount);
    },
  }
}
</script>
