<template>
  <v-card>
    <v-card-title class="page-title">
      Scores and Report
    </v-card-title>

    <v-card-text class="my-4">
      <div class="px-4">
        <v-checkbox
          v-model="exportAvailable"
          label="Make Report available for Export"
          hide-details
        />

        <v-checkbox
          v-model="allowSummary"
          label="Show report at the end of the activity"
          hide-details
        />
      </div>

      <div
        v-for="(report, index) in reports"
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
    </v-card-text>

    <v-card-actions>
      <v-btn class="mx-2" rounded @click="addReportSection('score')">
        Add Score
      </v-btn>

      <v-btn class="mx-2" rounded @click="addReportSection('section')">
        Add Section
      </v-btn>
    </v-card-actions>
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

export default {
  components: {
    ScoreBuilder,
    SectionBuilder
  },

  data () {
    return {

    }
  },

  computed: {
    config () {
      return config;
    },
    ...mapGetters(config.MODULE_NAME,
      [
        'currentActivity',
      ]
    ),

    reports () {
      return this.currentActivity.reports;
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
    }
  },

  methods: {
    ...mapMutations(config.MODULE_NAME, [
      'addReportSection',
      'deleteReportSection',
      'updateReportInfo',
      'updateActivityMetaInfo',
    ]),

    updateReport (index, value) {
      this.updateReportInfo({
        index,
        obj: value
      });
    },
  },
}
</script>
