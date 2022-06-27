<template>
  <v-card>
    <v-card-title
      class="px-2 py-0"
      :class="name ? '' : 'invalid'"
    >
      <span class="activity-flow-name">{{ name }}</span>
      <v-spacer />
      <v-card-actions>
        <v-btn
          icon
          @click="editActivtiyFlow"
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
        label="Activity Flow Name"
        required
      />
      <v-text-field
        v-model="description"
        counter="230"
        maxlength="230"
        label="Activity Flow Description"
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

      <template>
        <v-row
          class="align-center"
        >
          <v-col
            class="py-0"
            cols="12"
            sm="4"
          >
            <v-checkbox
              v-model="combineReports"
              label="Combine reports into a single file"
            />
          </v-col>
          <v-col
            class="py-0"
            cols="12"
            sm="4"
          >
            <v-checkbox
              v-model="showBadge"
              label="Hide badge"
            />
          </v-col>
        </v-row>
      </template>
    </div>
    <Notify :notify="notify" />
    <Loading :loading="loading" />

    <ReportConfig
      v-model="reportConfigDialog"
      :current-activity-flow="currentActivityFlow"
      :reportConfigs="protocol.reportConfigs"
      @updateItemValue="updateItemValue"
    />
  </v-card>
</template>

<style scoped>
.activity-flow-name {
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
import Notify from './Additional/Notify.vue';
import Loading from './Additional/Loading.vue';
import ReportConfig from './ReportConfig.vue';

export default {
  components: {
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
      reportConfigDialog: false
    }
  },
  mounted() {
  },
  methods: {
    ...mapMutations(config.MODULE_NAME, [
      'updateActivityFlowInfo',
    ]),
    editActivtiyFlow () {
      this.isExpanded = !this.isExpanded;
      if (this.isExpanded) {
        this.$emit('onExpand');
      }
    },
    updateItemValue (value) {
      this.updateActivityFlowInfo({
        reportIncludeItem: value
      })
    }
  },
  computed: {
    ...mapGetters(config.MODULE_NAME, [
      'currentActivityFlow',
      'protocol',
    ]),

    pdfConfigured () {
      return this.protocol.reportConfigs.emailRecipients.length &&
              this.protocol.reportConfigs.serverIp &&
              this.protocol.reportConfigs.publicEncryptionKey;
    },

    name: {
      get: function () {
        return this.currentActivityFlow && this.currentActivityFlow.name;
      },
      set: function (name) {
        this.updateActivityFlowInfo({ name });
      }
    },
    description: {
      get: function () {
        return this.currentActivityFlow && this.currentActivityFlow.description;
      },
      set: function (description) {
        this.updateActivityFlowInfo({ description });
      }
    },
    combineReports: {
      get: function () {
        return this.currentActivityFlow && this.currentActivityFlow.combineReports;
      },
      set: function (name) {
        this.updateActivityFlowInfo({ combineReports: name });
      }
    },
    showBadge: {
      get: function () {
        return this.currentActivityFlow && !this.currentActivityFlow.showBadge;
      },
      set: function (name) {
        this.updateActivityFlowInfo({ showBadge: !showBadge });
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
