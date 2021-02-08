<template>
  <div>
    <v-card>
      <v-card-title
        class="headline grey lighten-2"
        primary-title
      >
        Change History
      </v-card-title>
      <v-card-text>
        <v-select
          :items="allVersions"
          label="Versions"
          v-model="selectedVersion"
          @change="change"
        ></v-select>

        <v-treeview
          :items="history"
          :color="accent"
          v-if="history.length"
          activatable
          hoverable
        ></v-treeview>
        <div v-else>
          No Changes
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>


export default {
  props: {
    history: {
      type: Array,
      required: true,
      default: null,
    },
    versions: {
      type: Array,
      required: false,
      default: null
    },
    currentVersion: {
      type: String,
      required: false,
      default: null
    },
    defaultVersion: {
      type: String,
      required: false,
      default: ''
    }
  },
  computed: {
    allVersions: function () {
      return [
        `current (${this.currentVersion})`,
        ...this.versions.slice(0, -1)
      ]
    }
  },
  data: function () {
    return {
      selectedVersion: this.defaultVersion || `current (${ this.currentVersion})`
    };
  },
  methods: {
    change($ev) {
      this.$emit('updateHistoryView', this.selectedVersion);
    }
  }
};
</script>
