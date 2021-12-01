<template>
  <v-row>
    <v-col
      :class="colClasses"
      :cols="12"
      :md="3"
      :sm="6"
    >
      <v-checkbox
        v-model="isText"
        label="Text Input Option"
        @change="onChangeTextOption"
      />
    </v-col>

    <v-col
      v-if="isText"
      :class="colClasses"
      :cols="12"
      :md="3"
      :sm="6"
    >
      <v-checkbox
        v-model="isRequired"
        label="Text Input Option Required"
        @change="$emit('required', isRequired)"
      />
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    colClasses: {
      type: String,
      default: '',
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
  },

  methods: {
    onChangeTextOption () {
      this.$emit('text', this.isText);

      if (!this.isText && this.isRequired) {
        this.isRequired = false;
        this.$emit('required', this.isRequired);
      }
    }
  }
}
</script>
