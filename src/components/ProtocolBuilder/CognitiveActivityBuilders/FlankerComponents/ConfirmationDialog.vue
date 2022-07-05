<template>
  <v-dialog
    :value="value"
    width="500"
    persistent
  >
    <v-card>
      <v-card-text class="pt-4">
        Are you sure you want to close without saving? All changes will be lost.
      </v-card-text>

      <v-card-actions>
        <v-spacer />

        <v-btn
          class="mx-2"
          color="primary"
          @click="$emit('close')"
        >
          Yes
        </v-btn>

        <v-btn @click="$emit('input', false)">
          No
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
      required: true
    }
  }
}
</script>
