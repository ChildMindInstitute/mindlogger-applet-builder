<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <v-checkbox
      v-model="isSkippable"
      label="Skippable Item"
      :disabled="!isItemEditable"
      @change="updateAllow"
    />
    <v-text-field
      v-model="numOptions"
      label="On a scale of 1 to "
      :disabled="!isItemEditable"
      type="number"
      @change="update"
    />
    <v-text-field
      v-model="minValue"
      label="First option"
      counter="20"
      maxlength="20"
      :disabled="!isItemEditable"
      @change="update"
    />
    <v-text-field
      v-model="maxValue"
      label="Last option"
      counter="20"
      maxlength="20"
      :disabled="!isItemEditable"
      @change="update"
    />
  </v-form>
</template>

<script>
export default {
  props: {
    initialItemData: {
      type: Object,
      required: true
    },
    isSkippableItem: {
      type: Boolean,
      default: false,
    },
    isItemEditable: {
      type: Boolean,
      default: true,
    },
  },
  data: function () {
    return {
      numOptions: this.initialItemData.numOptions || 5,
      minValue: this.initialItemData.minValue || '',
      maxValue: this.initialItemData.maxValue || '',
      isSkippable: this.isSkippableItem || false,
      valid: true,
      textRules: [
        v => !!v || 'Radio options cannot be empty',
      ]
    };
  },
  mounted() {
    this.update();
  },
  methods: {
    update () {
      const responseOptions = {
        'numOptions': this.numOptions,
        'minValue': this.minValue || "Min",
        'maxValue': this.maxValue || "Max"
      };
      this.$emit('updateOptions', responseOptions);
    },
    updateAllow() {
      const allow = this.isSkippable
      this.$emit('updateAllow', allow);
    }
  }
}
</script>