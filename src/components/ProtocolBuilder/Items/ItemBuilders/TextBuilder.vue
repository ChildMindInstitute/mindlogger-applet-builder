<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <v-text-field
      v-model="maxLength"
      label="Maximum response length"
      type="number"
      :rules="maxLengthRules"
      @change="update"
    />
    <v-text-field
      v-if="requiredAnswer"
      v-model="correctAnswer"
      label="Correct answer"
      @change="updateAnswer"
    />
    <v-row>
      <v-col
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="requiredAnswer"
          label="Correct answer required"
          @change="updateAnswer"
        />
      </v-col>
      <v-col
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="isSkippable"
          label="Skippable Item"
          :disabled="isSkippableItem == 2 || requiredValue"
        />
      </v-col>
      <v-col
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="isNumerical"
          label="Numerical Response Required"
          @change="update"
        />
      </v-col>
      <v-col
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="requiredValue"
          label="Response required"
          @change="update"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  props: {
    initialItemData: {
      type: Object,
      required: true
    },
    responseOption: {
      type: Object,
      required: true,
    },
    isSkippableItem: {
      type: Number,
      default: 0,
    },
    initialAnswer: {
      type: String,
      default: "",
    },
  },
  data: function () {
    return {
      correctAnswer: this.initialAnswer || "",
      maxLength: this.initialItemData.maxLength || 50,
      requiredValue: this.initialItemData.requiredValue || false,
      requiredAnswer: this.initialAnswer ? true : false,
      isNumerical: ((this.responseOption.valueType && this.responseOption.valueType.includes('integer'))
        || (this.initialItemData.valueType && this.initialItemData.valueType.includes('integer')))
      || false,
      valid: true,
      textRules: [
        v => !!v || 'Radio options cannot be empty',
      ],
      maxLengthRules: [
        v => (v > 0 && v % 1 ===0) || 'Max response length must be a positive integer',
      ],
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
    update () {
      const responseOptions = {
        'maxLength': this.maxLength,
        'requiredValue': this.requiredValue,
        'valueType': this.isNumerical ? 'xsd:integer' : 'xsd:string',
      };
      this.$emit('updateOptions', responseOptions);
      if (this.requiredValue) 
        this.$emit('updateAllow', false);
    },
    updateAnswer() {
      const { correctAnswer, requiredAnswer } = this;
      if (!requiredAnswer) {
        this.$emit('updateAnswer', "");
      } else {
        this.$emit('updateAnswer', correctAnswer);
      }
    },
  }
}
</script>