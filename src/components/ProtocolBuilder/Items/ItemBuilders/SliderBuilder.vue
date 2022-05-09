<template>
  <v-form>
    <div class="slider-meta">
      <v-row>
        <v-col
          class="d-flex align-center"
          cols="12"
          sm="5"
        >
          <v-text-field
            v-model="minSliderTick"
            label="Min Value"
            type="number"
            min="0"
            :max="maxSliderTick"
            @input="sliderRangeUpdate($event, 'min')"
          />
        </v-col>

        <v-col
          sm="5"
        >
          <v-text-field
            v-model="minValue"
            :rules="minLabelRules"
            label="Min Label"
            counter="20"
            @change="update"
          />
        </v-col>

        <v-col cols="auto">
          <Uploader
            :initialType="'image'"
            :initialData="minValueImg"
            :initialAdditionalType="'small-circle'"
            :initialTitle="'Slider Min Image'"
            @onAddFromUrl="minValueImg = $event; onAddSliderImageFromUrl('Min');"
            @onAddFromDevice="$emit('loading', true); onAddSliderImageFromDevice($event, 'Min');"
            @onRemove="minValueImg = ''; onRemoveSliderImage('Min');"
            @onNotify="$emit('loading', false); $emit('notify', $event);"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          class="d-flex align-center"
          cols="12"
          sm="5"
        >
          <v-text-field
            v-model="maxSliderTick"
            label="Max Value"
            type="number"
            :min="minSliderTick"
            max="12"
            @input="sliderRangeUpdate($event, 'max')"
          />
        </v-col>

        <v-col
          sm="5"
        >
          <v-text-field
            v-model="maxValue"
            :rules="maxLabelRules"
            label="Max Label"
            counter="20"
            @change="update"
          />
        </v-col>

        <v-col cols="auto">
          <Uploader
            :initialType="'image'"
            :initialData="maxValueImg"
            :initialAdditionalType="'small-circle'"
            :initialTitle="'Slider Max Image'"
            @onAddFromUrl="maxValueImg = $event; onAddSliderImageFromUrl('Max');"
            @onAddFromDevice="$emit('loading', true); onAddSliderImageFromDevice($event, 'Max');"
            @onRemove="maxValueImg = ''; onRemoveSliderImage('Max');"
            @onNotify="$emit('loading', false); $emit('notify', $event);"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="4">
          <v-switch
            v-model="tickMark"
            label="Tick Marks"
            @change="update"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-switch
            v-model="tickLabel"
            label="Tick Mark Labels"
            @change="update"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-switch
            v-model="textAnchors"
            label="Text Anchors"
            @change="update"
          />
        </v-col>
      </v-row>

      <v-row
        v-if="hasScoreValue || hasResponseAlert"
      >
        <v-btn
          v-if="hasScoreValue"
          class="deep-orange mx-2"
          color="primary"
          dark
          @click="scoreDialog = true"
        >
          Edit Score
        </v-btn>

        <v-btn
          v-if="hasResponseAlert"
          class="deep-orange mx-2"
          color="primary"
          dark
          @click="alertDialog = true"
        >
          Edit Alert
        </v-btn>
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

      <v-col
        v-if="!isReviewerActivity"
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="hasScoreValue"
          label="Option Score"
          @change="sliderRangeUpdate($event, 'max')"
        />
      </v-col>

      <v-col
        v-if="!isReviewerActivity"
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="hasResponseAlert"
          label="Set Alert"
          @change="sliderRangeUpdate($event, 'max')"
        />
      </v-col>

      <v-col
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="continousSlider"
          label="Use Continuous Slider"
          @change="update"
        />
      </v-col>

      <v-col
        class="d-flex align-center"
        cols="12"
        md="3"
        sm="6"
      >
        <v-checkbox
          v-model="removeBackOption"
          label="Remove ability to go back to the previous item"
          @change="update"
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

    <ItemTimerOption
      colClasses="d-flex align-center py-0 px-3"
      @update="updateTimerOption"
      :responseTimeLimit="timer"
    />

    <v-dialog
      v-model="scoreDialog"
      max-width="350"
      persistent
    >
      <v-card
        v-if="scores"
        class="pa-4 score-dialog"
      >
        <v-form
          ref="form"
          v-model="valid"
        >
          <v-card>
            <div class="d-flex">
              <div class="option-value">
                Value
              </div>
              <div class="option-score">
                Score
              </div>
            </div>
          </v-card>
          <v-card class="options">
            <div
              v-for="(score, i) in scores"
              :key="i"
              class="d-flex"
            >
              <div class="option-value pt-2">
                {{ i + Number(minSliderTick) }}
              </div>
              <v-text-field
                v-model="scores[i]"
                class="option-score mt-0 pt-0"
                type="number"
                :rules="numberRules"
              />
            </div>
          </v-card>

          <v-card-actions class="d-flex justify-space-around">
            <v-btn
              :disabled="!valid"
              color="primary"
              @click="saveScores"
            >
              Save
            </v-btn>
            <v-btn
              @click="resetScores"
            >
              Reset
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="alertDialog"
      max-width="600"
      persistent
    >
      <v-card
        v-if="alerts && !continousSlider"
        class="pa-4 alert-dialog"
      >
        <v-card>
          <div class="d-flex">
            <div class="option-value">
              Value
            </div>
            <div class="option-alert">
              Alert
            </div>
          </div>
        </v-card>
        <v-card class="options">
          <div
            v-for="(alert, i) in alerts"
            :key="i"
            class="d-flex"
          >
            <div class="option-value pt-2">
              {{ i + Number(minSliderTick) }}
            </div>
            <v-text-field
              v-model="alerts[i]"
              class="option-alert mt-0 pt-0"
            />
          </div>
        </v-card>

        <v-card-actions class="d-flex justify-space-around">
          <v-btn
            color="primary"
            @click="saveAlerts"
          >
            Save
          </v-btn>
          <v-btn
            @click="resetAlerts"
          >
            Reset
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-card
        v-if="continousSlider"
        class="pa-4 alert-dialog"
      >
        <div class="dialog-title">
          Edit Alert
        </div>

        <v-text-field
          v-model="alertMinValue"
          type="number"
          label="Min Value"
          :min="minSliderTick"
          :rules="numberRules"
        />

        <v-text-field
          v-model="alertMaxValue"
          type="number"
          label="Max Value"
          :max="maxSliderTick"
          :rules="numberRules"
        />

        <v-text-field
          v-model="alertMessage"
          label="Alert Message"
          :rules="alertTextRules"
        />

        <v-card-actions class="d-flex justify-space-around">
          <v-btn
            color="primary"
            @click="saveAlerts"
          >
            Save
          </v-btn>
          <v-btn
            @click="resetAlerts"
          >
            Reset
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
import Uploader from '../../Uploader.vue';
import OptionalItemText from '../../Partial/OptionalItemText.vue';
import ItemTimerOption from '../../Partial/ItemTimerOption';

export default {
  components: {
    Uploader,
    OptionalItemText,
    ItemTimerOption,
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
    isReviewerActivity: {
      type: Boolean,
      default: false
    },
    timer: {
      type: Number,
      required: false
    },
  },
  data: function () {
    return {
      minSliderTick: this.initialItemData.minSliderTick || 0,
      maxSliderTick: this.initialItemData.maxSliderTick || 5,
      minValue: this.initialItemData.minValue || '',
      minValueImg: this.initialItemData.minValueImg || '',
      maxValue: this.initialItemData.maxValue || '',
      maxValueImg: this.initialItemData.maxValueImg || '',
      textAnchors: this.initialItemData.textAnchors || false,
      tickMark: this.initialItemData.tickMark || false,
      tickLabel: this.initialItemData.tickLabel || false,
      valid: true,
      minLabelRules: [
        v => !!v || 'Min label cannot be empty',
        v => v.length <= 20 || 'Visibility decreases over 20 characters',
      ],
      maxLabelRules: [
        v => !!v || 'Max label cannot be empty',
        v => v.length <= 20 || 'Visibility decreases over 20 characters',
      ],
      textRules: [
        v => !!v || 'Radio options cannot be empty',
      ],
      alertTextRules: [
        v => !!v || 'Alert message cannot be empty',
      ],
      numberRules: [
        v => !isNaN(parseInt(v)) || 'Please enter a numerical value',
      ],
      continousSlider: this.initialItemData.continousSlider || false,
      hasScoreValue: this.initialItemData.hasScoreValue || false,
      hasResponseAlert: this.initialItemData.hasResponseAlert || false,
      scoreDialog: false,
      alertDialog: false,

      /** continuous slider */
      alertMessage: this.initialItemData.responseAlertMessage || '',
      alertMinValue: Number(this.initialItemData.minAlertValue || this.initialItemData.minSliderTick || 0),
      alertMaxValue: Number(this.initialItemData.maxAlertValue || this.initialItemData.maxSliderTick || 0),
      removeBackOption: this.initialItemData.removeBackOption,
      scores: this.initialItemData.scores || [],
      alerts: this.initialItemData.alerts || [],
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
    updateTimerOption(option) {
      this.$emit('updateTimer', option.responseTimeLimit)
    },

    resetScores () {
      for (let i = Number(this.minSliderTick); i <= Number(this.maxSliderTick); i++) {
        this.$set(this.scores, i - this.minSliderTick, i - this.minSliderTick + 1);
      }
    },

    resetAlerts () {
      if (this.alerts) {
        for (let i = this.minSliderTick; i < this.maxSliderTick; i++) {
          this.$set(this.alerts, i - this.minSliderTick, '');
        }
      }

      this.alertMinValue = this.minSliderTick;
      this.alertMaxValue = this.maxSliderTick;
      this.alertMessage = '';
    },

    saveScores () {
      for (let i = 0; i < this.scores.length; i++) {
        this.scores[i] = Number(this.scores[i]);
      }

      this.scoreDialog = false;

      this.update();
    },

    saveAlerts () {
      this.alertDialog = false;
      this.update();
    },

    update () {
      if (this.maxSliderTick > 12) {
        this.maxSliderTick = 12;
      } else if (this.minSliderTick < 0) {
        this.minSliderTick = 0;
      }

      let responseOptions = {
        'minSliderTick': this.minSliderTick,
        'maxSliderTick': this.maxSliderTick,
        'minValue': this.minValue || "Min",
        'minValueImg': this.minValueImg,
        'maxValue': this.maxValue || "Max",
        'maxValueImg': this.maxValueImg,
        'tickLabel': this.tickLabel,
        'textAnchors': this.textAnchors,
        'tickMark': this.tickMark,
        'hasScoreValue': this.hasScoreValue,
        'hasResponseAlert': this.hasResponseAlert,
        'continousSlider': this.continousSlider,
        'removeBackOption': this.removeBackOption,
        'scores': this.hasScoreValue ? this.scores : false,
      };

      if (this.hasResponseAlert) {
        if (this.continousSlider) {
          Object.assign(responseOptions, {
            'minAlertValue': this.alertMinValue,
            'maxAlertValue': this.alertMaxValue,
            'responseAlertMessage': this.alertMessage,
          })
        } else {
          responseOptions.alerts = this.alerts;
        }
      }

      this.$emit('updateOptions', responseOptions);
    },

    sliderRangeUpdate(ev, type) {
      if (Number(this.maxSliderTick) > 12) {
        this.maxSliderTick = 12;
      }
      if (Number(this.minSliderTick) < 0) {
        this.minSliderTick = 0
      }
      if (this.minSliderTick === '' || this.maxSliderTick === '' || Number(this.minSliderTick) > Number(this.maxSliderTick)) {
        return ;
      }
      this.scores = this.scores || [];
      this.alerts = this.alerts || [];

      const tickCount = this.maxSliderTick - this.minSliderTick + 1;
      if (tickCount < 0) {
        return;
      }
      if (type == 'max') {
        while (this.scores.length < tickCount) {
          this.scores.push(Number(this.minSliderTick) + this.scores.length);
          this.alerts.push('');
        }

        while (this.scores.length > tickCount) {
          this.scores.pop();
          this.alerts.pop();
        }
      } else {
        while (this.scores.length < tickCount) {
          this.scores.unshift(Number(this.minSliderTick) + (tickCount - this.scores.length - 1));
          this.alerts.unshift('');
        }

        while (this.scores.length > tickCount) {
          this.scores.shift();
          this.alerts.shift();
        }
      }

      this.update();
    },

    onUpdateResponseOptions() {
      if (this.responseOptions.isOptionalTextRequired)
        this.$emit('updateAllow', false);
      this.$emit('updateResponseOptions', this.responseOptions);
    },

    onAddSliderImageFromUrl(type) {
      this.update();
      this.$emit('notify', {
        type: 'success',
        message: `${type} Image from URL successfully added to Slider.`,
        duration: 3000,
      });
    },

    async onAddSliderImageFromDevice(uploadFunction, type) {
      try {
        const uploadedImageUrl = await uploadFunction();
        if(type === 'Min') this.minValueImg = uploadedImageUrl;
        else this.maxValueImg = uploadedImageUrl;
        this.update();
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'success',
          message: `${type} Image successfully added to Slider.`,
          duration: 3000,
        });
      } catch (error) {
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'error',
          message: `Something went wrong with uploading image for Item > ${type} Slider. Please try to upload again or just save Slider without image changes.`,
        });
      }
    },

    onRemoveSliderImage(type) {
      this.update();
      this.$emit('notify', {
        type: 'warning',
        message: `${type} Image successfully removed from Slider.`,
        duration: 3000,
      });
    },

  }
}
</script>