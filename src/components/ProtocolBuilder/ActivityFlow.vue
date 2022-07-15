<template>
  <v-card class="pb-2">
    <v-card-title>
      Activity Flows
      <v-spacer />
      <v-btn
        color="primary"
        class="mt-2"
        rounded
        @click="createActivityFlow()"
      >
        <v-icon>
          add
        </v-icon>
        Add Activity Flow
      </v-btn>
    </v-card-title>
    <draggable
      v-model="activityFlowList"
      handle=".dragging-handle"
      :scroll-sensitivity="100"
      :force-fallback="true"
    >
      <transition-group>
        <v-card
          v-for="(activityFlow, index) in activityFlowList"
          :key="`${activityFlow.timestamp}-${activityFlow.id || 0}`"
          class="ma-4"
        >
          <v-card-title
            class="py-0"
            :class="activityFlow.valid ? '' : 'invalid'"
          >
            <img
              class="mr-2"
              width="18"
              height="15"
              :src="baseImageURL + 'activity-flow.svg'"
            />
            {{ activityFlow.name }}
            <v-spacer />
            <v-card-actions>
              <v-tooltip
                top
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    v-on="on"
                    @click="duplicateActivityFlow(activityFlows.findIndex(act => act == activityFlow))"
                  >
                    <v-icon color="grey lighten-1">
                      content_copy
                    </v-icon>
                  </v-btn>
                </template>

                <span>Duplicate activityFlow</span>
              </v-tooltip>

              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    v-on="on"
                    @click="showOrHideActivityFlow(activityFlows.findIndex(act => act == activityFlow))"
                  >
                    <v-icon v-if="!activityFlow.isVis" color="grey lighten-1">
                      mdi-eye-off-outline
                    </v-icon>
                    <v-icon v-else color="grey lighten-1">
                      mdi-eye-outline
                    </v-icon>
                  </v-btn>
                </template>

                <span>{{ activityFlow.isVis ? 'Click to Hide activityFlow' : 'Click to Show activityFlow' }}</span>
              </v-tooltip>

              <v-tooltip
                top
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    v-on="on"
                    @click="editActivityFlow(index)"
                  >
                    <v-icon color="grey lighten-1">
                      edit
                    </v-icon>
                  </v-btn>
                </template>

                <span>Edit Activity Flow</span>
              </v-tooltip>

              <v-tooltip
                top
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    v-on="on"
                    @click="deleteActivityFlow(activityFlows.findIndex(act => act == activityFlow))"
                  >
                    <v-icon color="grey lighten-1">
                      delete
                    </v-icon>
                  </v-btn>
                </template>

                <span>Delete activityFlow</span>
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
            :value="activityFlow.description"
            label="Description"
            class="px-4"
            disabled
          />
        </v-card>
      </transition-group>
    </draggable>
  </v-card>
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
</style>

<script>
import Protocol from '../../models/Protocol';
import Activity from '../../models/Protocol';
import Item from '../../models/Protocol';
import draggable from 'vuedraggable'
import config from '../../config';

import { mapMutations, mapGetters } from 'vuex';

export default {
  components: {
    draggable,
  },
  data () {
    return {
      isVis: [],
    }
  },
  computed: {
    ...mapGetters(config.MODULE_NAME,
    [
      'protocol',
      'activities',
      'activityFlows',
      'currentScreen',
      'themes',
      'themeId',
      'baseImageURL'
    ]),
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

    activityFlowList: {
      get () {
        return this.activityFlows;
      },
      set (value) {
        this.updateActivityFlowList([...value]);
      }
    },
  },
  methods: {
    ...mapMutations(config.MODULE_NAME,
      [
        'updateProtocolMetaInfo',
        'duplicateActivityFlow',
        'deleteActivityFlow',
        'addActivityFlow',
        'setCurrentScreen',
        'updateThemeId',
        'updateActivityList',
        'showOrHideActivityFlow',
        'updateActivityFlowList',
        'setCurrentActivityFlow',
      ]
    ),
    editActivityFlow (index, isNew = false) {
      this.setCurrentActivityFlow(index);
      this.setCurrentScreen(config.FLOW_BUILDER_SCREEN);
    },

    createActivityFlow () {
      const newIndex = this.activityFlows.length;

      this.addActivityFlow(newIndex);
      this.editActivityFlow(newIndex, true);
    },
  }
}
</script>
