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
            min="1"
            :max="maxAge"
            @input="ageRangeUpdate($event, 'min')"
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
            type="number"
            :min="minAge"
            max="105"
            @input="ageRangeUpdate($event, 'max')"
          />
        </v-col>
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
        this.maxAge = 105;
      } else if (this.minAge < 1) {
        this.minAge = 1;
      }

      const responseOptions = {
        'minAge': this.minAge,
        'maxAge': this.maxAge,
      };

      this.$emit('updateOptions', responseOptions);
    },

    ageRangeUpdate(ev, type) {
      if (Number(this.maxAge) > 105) {
        return false;
      }
      if (Number(this.minAge) < 0) {
        return false;
      }
      if (this.minAge === '' || this.maxAge === '' || Number(this.minAge) > Number(this.maxAge)) {
        return ;
      }

      this.update();
    },

    onUpdateResponseOptions() {
      if (this.responseOptions.isOptionalTextRequired)
        this.$emit('updateAllow', false);
      this.$emit('updateResponseOptions', this.responseOptions);
    },
  }
}
</script>