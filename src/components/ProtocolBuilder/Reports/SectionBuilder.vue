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
      />

      <ReportMessageBuilder
        class="py-4"
        score-id=""
        :container="report"
        :item-list="items"
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

export default {
  components: {
    CardHeader,
    ReportMessageBuilder,
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
    name: {
      get () {
        return this.report.prefLabel
      },
      set (value) {
        this.$emit('update', {
          prefLabel: value
        })
      }
    }
  },

  methods: {

  }
}
</script>
