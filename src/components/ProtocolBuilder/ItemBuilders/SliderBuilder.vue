<template>
  <v-form
    ref="form"
    v-model="valid"
  >
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
      valid: true,
      textRules: [
        v => !!v || 'Radio options cannot be empty',
      ]
    };
  },
  methods: {
    update () {
      const responseOptions = {
        'numOptions': this.numOptions,
        'minValue': this.minValue,
        'maxValue': this.maxValue
      };
      this.$emit('updateOptions', responseOptions);
    }
  }
}
</script>