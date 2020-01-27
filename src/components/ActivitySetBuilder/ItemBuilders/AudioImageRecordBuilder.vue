<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <v-text-field
      v-model="minValue"
      label="Minimum response length (milliseconds)"
      type="number"
      :rules="minValueRules"
      @change="update"
    />
    <v-text-field
      v-model="maxValue"
      label="Maximum response length (milliseconds)"
      type="number"
      :rules="maxValueRules"
      @change="update"
    />
    <v-switch
      v-model="isResponseRequired"
      label="Response required"
      @change="update"
    />
  </v-form>
</template>

<script>
export default {
  data: () => ({
    minValue: 0,
    maxValue: 3000,
    isResponseRequired: true,
    valid: true,
    minValueRules: [
      v => (v > 0 && v % 1 === 0) || 'Min response length must be a positive integer',
    ],
    maxValueRules: [
      v => (v > 0 && v % 1 === 0) || 'Max response length must be a positive integer',
    ]
  }),
  methods: {
    update () {
      const responseOptions = {
        'schema:minValue': this.minValue,
        'schema:maxValue': this.maxValue,
        'requiredValue': true,
      };
      this.$emit('update', responseOptions);
    },
  }
}
</script>