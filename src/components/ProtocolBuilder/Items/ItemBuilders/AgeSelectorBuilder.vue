<template>
  <v-form>
    <div class="slider-meta">
      <v-row>
        <v-col
          class="d-flex align-center"
          cols="12"
          sm="3"
        >
          <v-text-field
            v-model="minAge"
            label="Min Value"
            type="number"
            @input="update"
          />
        </v-col>
        <v-col
          class="d-flex align-center"
          cols="12"
          sm="3"
        >
          <v-text-field
            v-model="maxAge"
            label="Max Value"
            min="0"
            max="105"
            type="number"
            @input="update"
          />
        </v-col>
      </v-row>
      <v-row v-if="!valid" class="ml-4 red--text">
        * Maximum value should be bigger than minimum value
      </v-row>
    </div>

    <v-divider
      class="mt-4"
    />

    <v-row>
      <v-col
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="isSkippable"
          label="Skippable Item"
          :disabled="isSkippableItem == 2 || isOptionalText && responseOptions.isOptionalTextRequired"
        />
      </v-col>
    </v-row>

    <OptionalItemText
      :colClasses="'d-flex align-center'"
      :cols="12"
      :md="3"
      :sm="6"
      :text="isOptionalText"
      :required="responseOptions.isOptionalTextRequired"
      @text="isOptionalText = $event; $emit('updateOptionalText', isOptionalText)"
      @required="responseOptions.isOptionalTextRequired = $event; onUpdateResponseOptions();"
    />
  </v-form>
</template>

<style scoped>
  .slider-meta {
    width: 80%;
  }
  .score-dialog .option-score, .score-dialog .option-value {
    width: 50%;
  }
  .alert-dialog .option-alert {
    width: 80%;
  }
  .alert-dialog .option-value {
    width: 20%;
  }

  .option-value {
    text-align: center;
    line-height: 20px;
  }

  .options {
    max-height: 400px;
    overflow-y: scroll;
  }


  .dialog-title {
    text-align: center;
    font-size: 25px;
  }
</style>

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
    initialResponseOptions: {
      type: Object,
      default: new Object(),
    },
    initialIsOptionalText: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return {
      minAge: this.initialItemData.minAge || 1,
      maxAge: this.initialItemData.maxAge || 30,
      valid: true,
      /** continuous slider */
      isOptionalText: this.initialIsOptionalText,
      responseOptions: this.initialResponseOptions,
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

  mounted() {
    this.update();
  },
  methods: {
    update () {
      if (this.maxAge > 105) {
        this.$nextTick(() => {
          this.maxAge = 105;
        });
      } else if (this.minAge < 1) {
        this.$nextTick(() => {
          this.minAge = 1;
        });
      }

      if (this.maxAge <= this.minAge) {
        this.valid = false;
      } else {
        this.valid = true;
      }

      const responseOptions = {
        'minAge': this.minAge,
        'maxAge': this.maxAge,
        'valid': this.valid,
      };

      this.$emit('updateOptions', responseOptions);
    },

    onUpdateResponseOptions() {
      if (this.responseOptions.isOptionalTextRequired)
        this.$emit('updateAllow', false);
      this.$emit('updateResponseOptions', this.responseOptions);
    },
  }
}
</script>