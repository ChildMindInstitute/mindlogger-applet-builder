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
    <v-checkbox
      v-model="requiredValue"
      label="Response required"
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
    }
  },
  data: function () {
    return {
      minValue: this.initialItemData['schema:minValue'] || 0,
      maxValue: this.initialItemData['schema:maxValue'] || 3000,
      requiredValue: this.initialItemData.requiredValue != null ? this.initialItemData.requiredValue : true,
      valid: true,
      minValueRules: [
        v => (v > 0 && v % 1 === 0) || 'Min response length must be a positive integer',
      ],
      maxValueRules: [
        v => (v > 0 && v % 1 === 0) || 'Max response length must be a positive integer',
      ]
    };
  },
  methods: {
    update () {
      const responseOptions = {
        'schema:minValue': this.minValue,
        'schema:maxValue': this.maxValue,
        'requiredValue': this.requiredValue,
      };
      this.$emit('updateOptions', responseOptions);
    },
  }
}
</script>