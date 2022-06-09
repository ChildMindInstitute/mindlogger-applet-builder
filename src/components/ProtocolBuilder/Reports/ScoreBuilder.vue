<template>
  <v-card>
    <CardHeader
      :score-id="report.id"
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
        label="Score Title"
      />
    </div>
  </v-card>
</template>

<script>
import CardHeader from './CardHeader';

export default {
  components: {
    CardHeader
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
