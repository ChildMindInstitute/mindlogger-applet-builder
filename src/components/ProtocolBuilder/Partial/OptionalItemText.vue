<template>
  <v-row>  </v-row>
</template>

<script>
export default {
  props: {
    colClasses: {
      type: String,
      defeault: '',
    },
    cols: {
      type: Number,
      default: null,
    },
    md: {
      type: Number,
      default: null,
    },
    sm: {
      type: Number,
      default: null,
    },
    text: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isText: this.text,
      isRequired: this.required,
    }
  }
}
</script>