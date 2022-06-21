<template>
  <v-card>
    <CardHeader
      score-id=""
      :name="name"
      :expanded="expanded"
      @setExpanded="expanded = $event"
      @deleteReport="$emit('deleteReport')"
    />

    <div
      v-if="expanded"
      class="pa-4 pt-0"
    >
      <v-text-field
        v-model="name"
        class="section-name"
        label="Section Name"
        :error-messages="nameErrorMsg"
      />

      <ConditionalComponent
        title=""
        :blank="true"
        :conditional-item="report.conditionalItem"
        :scores="allScores"
        :items="items"
        @update="onUpdateConditional($event)"
      />

      <ReportMessageBuilder
        class="py-4"
        score-id=""
        :container="report"
        :item-list="printItemList"
        @update="$emit('update', $event)"
      />
    </div>
  </v-card>
</template>

<style scoped>
.section-name {
  width: 50%;
}
</style>

<script>
import CardHeader from './CardHeader';
import ReportMessageBuilder from './ReportMessageBuilder';
import ConditionalComponent from './ConditionalComponent';
import { mapGetters, mapMutations } from 'vuex';
import config from '../../../config';

export default {
  components: {
    CardHeader,
    ReportMessageBuilder,
    ConditionalComponent,
  },

  props: {
    report: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      expanded: true
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

    printItemList () {
      return this.currentActivity.items.filter(item => ['radio', 'prize', 'checkbox', 'slider', 'text'].includes(item.inputType))
    },

    items () {
      return this.currentActivity.items.filter(item =>
        (item.inputType == 'radio' || item.inputType == 'prize' || item.inputType == 'slider' || item.inputType == 'checkbox')
      )
    },

    allScores () {
      return this.currentActivity.reports.filter(report => report.dataType == 'score')
    },

    name: {
      get () {
        return this.report.prefLabel
      },
      set (value) {
        this.$emit('update', {
          prefLabel: value
        })
      }
    },

    nameErrorMsg () {
      if (!this.name) {
        return 'This is a required field';
      }

      if (!this.name.match(/^[a-zA-Z_]+$/)) {
        return 'Letters and underscores are only allowed. Please fix.';
      }

      if (this.currentActivity.reports.find(score => score.dataType == this.report.dataType && score.prefLabel == name && score != this.report)) {
        return 'That section title is already in use. Please use a different title.';
      }

      return '';
    },
  },

  methods: {
    onUpdateConditional (conditional) {
      this.$emit('update', {
        conditionalItem: conditional
      })
    }
  }
}
</script>
