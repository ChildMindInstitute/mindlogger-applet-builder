<template>
  <v-card>
    <v-card-title class="page-title">
      Scores and Report
    </v-card-title>

    <v-card-text class="mb-4">
      <div class="px-4 pb-6">
        <v-checkbox
          v-model="exportAvailable"
          label="Make Report available for Export"
          hide-details
          :disabled="this.currentActivity.reports.length < 1"
        />

        <v-checkbox
          v-model="allowSummary"
          label="Show report at the end of the activity"
          hide-details
          :disabled="this.currentActivity.reports.length < 1"
        />
      </div>

      <draggable
        v-model="draggableReports"
        handle=".dragging-handle"
        :scroll-sensitivity="100"
        :force-fallback="true"
      >
        <transition-group>
          <div
            v-for="(report, index) in draggableReports"
            :key="report.timestamp"
            class="my-6"
          >
            <ScoreBuilder
              v-if="report.dataType == 'score'"
              :report="report"
              @update="updateReport(index, $event)"
              @deleteReport="deleteReportSection(index)"
            />

            <SectionBuilder
              v-else
              :report="report"
              @update="updateReport(index, $event)"
              @deleteReport="deleteReportSection(index)"
            />
          </div>
        </transition-group>
      </draggable>
    </v-card-text>

    <v-card-actions>
      <v-btn class="mx-2" rounded @click="addReportSection('score')">
        Add Score
      </v-btn>

      <v-btn class="mx-2" rounded @click="addReportSection('section')">
        Add Section
      </v-btn>
    </v-card-actions>

    <v-card-actions class="mx-2">
      <v-spacer />

      <v-btn
        color="primary"
        rounded
        @click="onPreviewReport"
      >
        Preview Report
      </v-btn>
    </v-card-actions>

    <v-dialog
      v-model="reportInvalidDialog"
      width="400"
    >
      <v-card>
        <v-card-text class="pt-4 text-center">
          {{ errorMessage }}
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            @click="reportInvalidDialog = false"
            small
          >
            OK
          </v-btn>

          <v-spacer />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>
.page-title {
  color: #6F7070;
  font-size: 22px;
  font-weight: 400;
}
</style>

<script>
import { mapGetters, mapMutations } from 'vuex';
import ScoreBuilder from './ScoreBuilder';
import SectionBuilder from './SectionBuilder';
import config from '../../../config';
import api from '../../../utilities/api';
import draggable from 'vuedraggable';

export default {
  components: {
    ScoreBuilder,
    SectionBuilder,
    draggable,
  },

  data () {
    return {
      reportInvalidDialog: false,
      errorMessage: ''
    }
  },

  computed: {
    config () {
      return config;
    },
    ...mapGetters(config.MODULE_NAME,
      [
        'currentActivity',
        'protocol',
        'pdfToken',
      ]
    ),

    pdfServerConfigured () {
      return this.protocol.reportConfigs.serverIp && this.protocol.reportConfigs.publicEncryptionKey && true;
    },

    draggableReports: {
      get () {
        return this.currentActivity.reports
      },

      set (value) {
        this.updateReportList(value);
      }
    },

    exportAvailable: {
      get () {
        return this.currentActivity.exportAvailable;
      },
      set (value) {
        this.updateActivityMetaInfo({ exportAvailable: value });
      }
    },

    allowSummary: {
      get () {
        return this.currentActivity.allowSummary;
      },
      set (value) {
        this.updateActivityMetaInfo({ allowSummary: value });
      }
    },

    valid () {
      for (const report of this.currentActivity.reports) {
        if (!report.valid) {
          return false;
        }
      }

      return true;
    }
  },

  beforeMount() {
    this.updateActivityMetaInfo({ allowSummary: false });
  },

  methods: {
    ...mapMutations(config.MODULE_NAME, [
      'addReportSection',
      'deleteReportSection',
      'updateReportInfo',
      'updateActivityMetaInfo',
      'updateReportList',
    ]),

    updateReport (index, value) {
      this.updateReportInfo({
        index,
        obj: value
      });
    },

    onPreviewReport () {
      if (!this.pdfServerConfigured || !this.valid) {
        this.reportInvalidDialog = true;

        if (!this.pdfServerConfigured) {
          this.errorMessage = 'Please configure pdf server to preview pdf';
        } else {
          this.errorMessage = 'Please fix errors in reports to preview.';
        }

        return;
      }

      api.previewPDF(
        this.protocol.reportConfigs.serverIp,
        this.pdfToken,
        this.currentActivity.reports.map(report => {
          const data = { ...report };
          if (report.dataType == 'section') {
            delete data.conditionalItem;
          } else {
            data.conditionals = data.conditionals.map(({ conditionalItem, ...conditional }) => conditional);
          }

          return data;
        }),
        this.currentActivity.items
          .filter(item => ['radio', 'checkbox', 'slider'].includes(item.inputType) && item.options.hasScoreValue)
          .map(item => {
            const data = {
              name: item.name,
              question: item.question.text,
              inputType: item.inputType
            }

            if (item.options) {
              if (item.inputType == 'slider') {
                data.options = item.options.scores.map((score, index) => ({
                  name: index + item.options.minSliderTick,
                  score
                }));
              } else {
                data.options = item.options.options;
              }
              data.multipleChoice = item.options.multipleChoice;
              data.minValue = item.options.minValue;
              data.maxValue = item.options.maxValue;
            }

            return data;
          }),
        {
          splash: this.currentActivity.splash || '',
          applet: this.protocol.image || '',
        }
      ).then((resp) => {
        const blob = new Blob([resp.data], { type: 'application/pdf' });
        window.open(URL.createObjectURL(blob));
      })
    }
  },
}
</script>
