<template>
  <div>
    <ActivityFlowHeader
      :headerExpanded="isExpanded"
      class="pa-4 my-4"
      @onExpand="handleExpansion()"
    />

    <div class="activity-flow-list">
      <v-card>
        <v-card-title class="d-flex">
          <span>Edit Flow</span>
          <div class="flex-grow-1" />
          <v-btn
            rounded
            @click="confirmResetDlg"
          >
            <v-icon color="lighten-1">
              mdi-cached
            </v-icon>
            Clear Flow
          </v-btn>
        </v-card-title>

        <div class="pb-2">
          <draggable
            v-model="draggableFlowItems"
            handle=".dragging-handle"
            @change="handleChange($event)"
            :scroll-sensitivity="100"
            :force-fallback="true"
          >
            <transition-group>
              <template
                v-for="(flowItem, index) in draggableFlowItems"
              >
                <div
                  :key="`${flowItem.name + index}`"
                >
                  <v-card class="ma-4 activity-card-br">
                    <p class="flow-card-description">
                      {{ index + 1 }} out of {{draggableFlowItems.length}}
                    </p>
                    <v-card-title class="flow-card-title">
                      {{ flowItem.name }}

                      <v-spacer />
                      <v-card-actions class="pa-0">
                        <v-menu
                          top
                        >
                          <template
                            v-slot:activator="{ on: menu }"
                          >
                            <v-tooltip
                              top
                            >
                              <template v-slot:activator="{ on: tooltip }">
                                <v-btn
                                  icon
                                  v-on="{ ...menu, ...tooltip }"
                                >
                                  <v-icon color="grey lighten-1">
                                    edit
                                  </v-icon>
                                </v-btn>
                              </template>

                              <span>Edit Activity</span>
                            </v-tooltip>
                          </template>

                          <v-list>
                            <template
                              v-for="(activity, i) in activities"
                            >
                              <v-list-item
                                v-if="activity.name != flowItem.name"
                                @click="updateActivity(index, activity)"
                                :key="i"
                              >
                                <v-list-item-title>{{ activity.name }}</v-list-item-title>
                              </v-list-item>
                            </template>
                          </v-list>
                        </v-menu>

                        <v-menu
                          top
                        >
                          <template
                            v-slot:activator="{ on: menu }"
                          >
                            <v-tooltip
                              top
                            >
                              <template v-slot:activator="{ on: tooltip }">
                                <v-btn
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
                              v-for="(activity, i) in activities"
                              @click="addActivity(index+1, activity)"
                              :key="i"
                            >
                              <v-list-item-title>{{ activity.name }}</v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>

                        <v-tooltip
                          top
                        >
                          <template v-slot:activator="{ on: tooltip }">
                            <v-btn
                              icon
                              v-on="{ ...menu, ...tooltip }"
                              @click="duplicateActivity(index)"
                            >
                              <v-icon color="grey lighten-1">
                                content_copy
                              </v-icon>
                            </v-btn>
                          </template>

                          <span>Duplicate Activity</span>
                        </v-tooltip>

                        <v-tooltip
                          top
                        >
                          <template v-slot:activator="{ on }">
                            <v-btn
                              icon
                              v-on="on"
                              @click="openActivityRemoveDlg(index)"
                            >
                              <v-icon color="grey lighten-1">
                                mdi-delete
                              </v-icon>
                            </v-btn>
                          </template>

                          <span>
                            Remove Activity
                          </span>
                        </v-tooltip>

                        <v-btn
                          class="ml-2 move-icon dragging-handle"
                          icon
                        >
                          <img
                            class="px-2 pt-2 drag-indicator"
                            :src="baseImageURL + 'drag_indicator.png'"
                          />
                        </v-btn>
                      </v-card-actions>
                    </v-card-title>
                    <v-text-field
                      :value="flowItem.description"
                      label=""
                      class="px-4"
                      disabled
                    />
                  </v-card>
                </div>
              </template>
            </transition-group>
          </draggable>
          <div class="d-flex justify-center">
            <v-menu
              top
            >
              <template
                v-slot:activator="{ on, attrs }"
              >
                <v-btn
                  v-bind="attrs"
                  color="primary"
                  class="mr-2"
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
                  v-for="(activity, index) in activities"
                  @click="addActivity(-1, activity)"
                  :key="index"
                >
                  <v-list-item-title>{{ activity.name }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>

        <v-dialog
          v-model="dialogFlag"
          persistent
          width="500"
        >
          <v-card>
            <v-card-text class="pt-4">
              {{dialogMsg}}
            </v-card-text>

            <v-card-actions
              class="justify-space-around"
            >
              <v-btn
                @click="applyChanges"
              >
                Yes
              </v-btn>

              <v-btn
                @click="dialogFlag = false;"
              >
                No
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card>
    </div>

  </div>
</template>

<style scoped>

.flow-card-title {
  padding-top: 0;
  padding-bottom: 0;
}

.activity-card-br{
  border-radius: 24px;
}

.flow-card-description {
  font-size: 14px;
  color: #676767;
  margin: 0;
  padding: 16px 16px 4px 16px;
}

.drag-indicator {
    height: 25px;
    margin-bottom: 8px;
  }
</style>

<script>
import { mapGetters, mapMutations } from 'vuex';
import config from '../../config';
import ActivityFlowHeader from './ActivityFlowHeader';
import draggable from 'vuedraggable'

export default {
  components: {
    ActivityFlowHeader,
    draggable
  },
  data() {
    return {
      isExpanded: true,
      dialogFlag: false,
      dialogMsg: '',
      flowItemIndex: -1,
      menu: {}
    }
  },
  computed: {
    config () {
      return config;
    },
    ...mapGetters(config.MODULE_NAME, [
      'currentScreen',
      'activities',
      'currentActivityFlow',
      'baseImageURL',
    ]),

    flowActivities() {
      return [];
    },

    draggableFlowItems: {
      get () {
        const flowItems = [];

        this.currentActivityFlow.order.forEach(actName => {
          const currentAct = this.activities.find(act => act.name === actName);

          if (currentAct) {
            flowItems.push({
              name: actName,
              description: currentAct.description,
            })
          }
        })
        return flowItems;
      },
      set (newFlowItems) {
        this.updateActivityFlowInfo({ order: newFlowItems.map(act => act.name) });
      }
    },
  },
  methods: {
      ...mapMutations(config.MODULE_NAME,
      [
        'updateActivityFlowInfo',
        'addActivityToFlow',
      ]
    ),

    duplicateActivity (index) {
      this.addActivityToFlow({
        name: this.draggableFlowItems[index].name,
        index: index+1
      })
    },

    handleExpansion() {
      this.isExpanded = true;
    },

    handleChange(evt) {
      console.log('updated!');
    },

    openActivityRemoveDlg(index) {
      this.dialogFlag = true;
      this.flowItemIndex = index;
      this.dialogMsg = 'Are you sure you want to delete ' + this.draggableFlowItems[index].name + '?';
    },

    confirmResetDlg() {
      this.dialogFlag = true;
      this.flowItemIndex = -1;
      this.dialogMsg = 'Are you sure you want to reset?';
    },

    addActivity(index, activity) {
      this.addActivityToFlow({ name: activity.name, index });
    },

    updateActivity(index, activity) {
      const order = this.draggableFlowItems.map(act => act.name);
      order[index] = activity.name;

      this.updateActivityFlowInfo({ order });
    },

    applyChanges() {
      if (this.flowItemIndex === -1) {
        this.updateActivityFlowInfo({ order: [] })
      } else {
        const activities = this.draggableFlowItems.filter((act, index) => {
          return index !== this.flowItemIndex;
        }).map((act) => {
          return act.name;
        });
        this.updateActivityFlowInfo({ order: activities })
      }
      this.dialogFlag = false;
    }
  }
}
</script>
