<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <v-text-field
      v-model="numOptions"
      label="On a scale of 1 to "
      type="number"
      @change="update"
    />
    <v-text-field
      v-model="minValue"
      label="First option"
      @change="update"
    />
    <v-text-field
      v-model="maxValue"
      label="Last option"
      @change="update"
    />
  </v-form>
</template>

<script>
export default {
  data: function () {
    return {
      numOptions: 5,
      minValue: '',
      maxValue: '',
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