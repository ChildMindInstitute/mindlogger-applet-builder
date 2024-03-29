<template>
  <v-card class="px-0">
    <CardHeader
      score-id=""
      :name="name"
      :valid="report.valid"
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
  width: 100%;
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
      expanded: this.report.message ? false : true
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
          prefLabel: value,
          id: `section_${value}`
        })
      }
    },

    nameErrorMsg () {
      if (!this.name) {
        return 'This is a required field';
      }
      
      if (this.currentActivity.reports.find(section => section.dataType == 'section' && section.prefLabel == this.name && section != this.report)) {
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
    },
  }
}
</script>
