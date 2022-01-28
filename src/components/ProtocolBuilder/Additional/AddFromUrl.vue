<template>
  <v-dialog
    :value="value"
    @input="$emit('input', $event)"
    persistent
    width="800"
  >
    <v-card>
      <v-card-title
        class="headline grey lighten-2"
        primary-title
      >
        <v-icon
          left
          large
        >
          mdi-link-variant-plus
        </v-icon>
        Add from URL
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="url"
          label="URL"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn
          outlined
          color="primary"
          @click="$emit('cancel')"
        >
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          :disabled="!url"
          @click="$emit('add', url)"
        >
          Add
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    }
  },
  data: () => {
    return {
      url: '',
    }
  }
}
</script>