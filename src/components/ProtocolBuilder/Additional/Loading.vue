<template>
  <v-dialog
    v-model="loading"
    width="400"
    persistent
  >
    <v-card class="pt-5 pb-6">
      <v-progress-circular
        class="d-block mx-auto mt-2"
        color="primary"
        indeterminate
        :size="50"
      >
      </v-progress-circular>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
}
</script>