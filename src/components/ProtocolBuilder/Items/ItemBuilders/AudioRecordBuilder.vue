<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <!-- <v-text-field
      v-model="minValue"
      label="Minimum response length (milliseconds)"
      type="number"
      :rules="minValueRules"
      @change="update"
    />  -->
    <!-- min response length not functional for now  -->
    <v-text-field
      v-model="maxValue"
      label="Maximum response length (milliseconds)"
      type="number"
      :rules="maxValueRules"
      @change="update"
    />
    <v-checkbox
      v-model="isSkippable"
      label="Skippable Item"
      :disabled="isSkippableItem == 2 || isOptionalText && responseOptions.isOptionalTextRequired"
    />

    <OptionalItemText
      :colClasses="'d-flex align-center'"
      :cols="12"
      :md="3"
      :sm="6"
      :text="isOptionalText"
      :required="responseOptions.isOptionalTextRequired"
      @text="isOptionalText = $event; $emit('updateOptionalText', isOptionalText)"
      @required="updateRequired"
    />
  </v-form>
</template>

<script>
import OptionalItemText from '../../Partial/OptionalItemText.vue';

export default {
  components: {
    OptionalItemText,
  },
  props: {
    initialItemData: {
      type: Object,
      required: true
    },
    isSkippableItem: {
      type: Number,
      default: 0,
    },
    initialItemResponseOptions: {
      type: Object,
      required: true,
    },
    initialIsOptionalText: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return {
      minValue: this.initialItemData['schema:minValue'] || 0,
      maxValue: this.initialItemData['schema:maxValue'] || 3000,
      valid: true,
      minValueRules: [
        v => (v > 0 && v % 1 === 0) || 'Min response length must be a positive integer',
      ],
      maxValueRules: [
        v => (v > 0 && v % 1 === 0) || 'Max response length must be a positive integer',
      ],
      responseOptions: this.initialItemResponseOptions,
      isOptionalText: this.initialIsOptionalText,
    };
  },
  computed: {
    isSkippable: {
      get() {
        return this.isSkippableItem === 1 || false;
      },
      set(value) {
        this.$emit('updateAllow', value);
      }
    }
  },
  methods: {
    updateRequired(event) {
      // disable the skippable button if item is required 
      if (event) {
        this.isSkippable = false
        this.isSkippableItem=2
      } else {
        this.isSkippableItem=0
      }

      this.responseOptions.isOptionalTextRequired = event;
      this.onUpdateResponseOptions();
    },
    update () {
      const responseOptions = {
        'schema:minValue': this.minValue,
        'schema:maxValue': this.maxValue,
      };
      this.$emit('updateOptions', responseOptions);
    },
    onUpdateResponseOptions() {
      if (this.responseOptions.isOptionalTextRequired)
        this.$emit('updateAllow', false);
      else if (this.responseOptions.isOptionalTextRequired === false)
        this.$emit('updateAllow', undefined);
      this.$emit('updateResponseOptions', this.responseOptions);
    },
  }
}
</script>