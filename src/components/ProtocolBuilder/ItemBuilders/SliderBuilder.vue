<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <v-row>
      <v-col 
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="isSkippable"
          label="Skippable Item"
          :disabled="!isItemEditable"
          @change="updateAllow"
        />
      </v-col>

      <v-col 
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="hasScoreValue"
          label="Option Score"
          :disabled="!isItemEditable"
          @change="update"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col 
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-text-field
          v-model="numOptions"
          label="On a scale of 1 to "
          :disabled="!isItemEditable"
          type="number"
          @change="update"
        />
      </v-col>

      <v-col 
        v-if="hasScoreValue"
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-btn
          class="deep-orange"
          color="primary"
          dark
          @click="scoreDialog = true"
        >
          Edit Score
        </v-btn>
      </v-col>
    </v-row>

    <v-dialog max-width="250" v-model="scoreDialog">
      <v-card class="pa-2" v-if="scores">
        <v-card>
          <div class="d-flex">
            <div class="option-value">Value</div>
            <div class="option-score">Score</div>
          </div>
        </v-card>
        <v-card class="options">
          <div
            v-for="(score, i) in scores"
            :key="i"
            class="d-flex"
          >
            <div class="option-value pt-2">{{i+1}}</div>
            <v-text-field
              v-model="scores[i]"
              class="option-score mt-0 pt-0"
              type="number"
              :disabled="!isItemEditable"
              @change="update"
            />
          </div>
        </v-card>
      </v-card>
    </v-dialog>

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

<style scoped>
  .option-score, .option-value {
    width: 50%;
  }
  .option-value {
    text-align: center;
    line-height: 20px;
  }

  .options {
    max-height: 400px;
    overflow-y: scroll;
  }
</style>

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
      ],
      hasScoreValue: this.initialItemData.hasScoreValue || false,
      scoreDialog: false,
      scores: this.initialItemData.scores || null,
    };
  },
  mounted() {
    this.update();
  },
  methods: {
    update () {
      if (this.hasScoreValue) {
        this.scores = this.scores || [];
      }

      if (this.scores) {
        while(this.scores.length < this.numOptions) {
          this.scores.push(this.scores.length + 1);
        }

        while(this.scores.length > this.numOptions) {
          this.scores.pop();
        }
      }

      const responseOptions = {
        'numOptions': this.numOptions,
        'minValue': this.minValue || "Min",
        'maxValue': this.maxValue || "Max",
        'hasScoreValue': this.hasScoreValue,
        'scores': this.hasScoreValue ? this.scores : null
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