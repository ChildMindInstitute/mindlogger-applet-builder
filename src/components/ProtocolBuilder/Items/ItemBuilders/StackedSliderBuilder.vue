<template>
  <v-form>
    <div class="slider-list">
      <div class="py-4">
        Sliders
      </div>

      <div
        v-for="(slider, index) in sliders"
        :key="index"
        class="mx-8"
      >
        <v-row>
          <v-col sm="8">
            <span>
              {{ slider.sliderLabel }}
            </span>
          </v-col>

          <div class="d-flex align-center justify-end">
            <v-btn
              icon
              large
              @click="slider.expanded = !slider.expanded"
            >
              <v-icon
                v-if="!slider.expanded"
                color="grey lighten-1"
              >
                edit
              </v-icon>
              <v-icon
                v-if="slider.expanded"
              >
                mdi-chevron-double-up
              </v-icon>
            </v-btn>

            <v-btn
              icon
              large
              @click="deleteSlider(index)"
            >
              <v-icon color="grey lighten-1">
                delete
              </v-icon>
            </v-btn>
          </div>
        </v-row>

        <div
          v-if="slider.expanded"
          class="mx-4"
        >
          <v-row>
            <v-col cols="auto">
              <v-text-field
                v-model="slider.sliderLabel"
                label="Slider Label"
                :counter="11"
                :maxlength="11"
                :rules="textRules"
                @input="update"
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
                v-model="slider.minSliderTick"
                label="Min Value"
                type="number"
                min="1"
                :max="slider.maxSliderTick"
                :rules="numberRules"
                @input="sliderRangeUpdate($event, 'min', slider)"
              />
            </v-col>

            <v-col
              sm="3"
            >
              <v-text-field
                v-model="slider.minValue"
                label="Min Label"
                counter="20"
                maxlength="20"
                @input="update"
              />
            </v-col>

            <v-col cols="auto">
              <Uploader
                :initialType="'image'"
                :initialData="slider.imgFirstName"
                :initialAdditionalType="'small-circle'"
                :initialTitle="'Slider Min Image'"
                @onAddFromUrl="onAddSliderImageFromUrl(slider, $event, 'Min');"
                @onAddFromDevice="onAddSliderImageFromDevice(slider, $event, 'Min');"
                @onRemove="onRemoveSliderImage(slider, 'Min');"
                @onNotify="$emit('loading', false); $emit('notify', $event);"
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
                v-model="slider.maxSliderTick"
                label="Max Value"
                type="number"
                :min="slider.minSliderTick"
                max="12"
                :rules="numberRules"
                @input="sliderRangeUpdate($event, 'max', slider)"
              />
            </v-col>

            <v-col
              sm="3"
            >
              <v-text-field
                v-model="slider.maxValue"
                label="Max Label"
                counter="20"
                maxlength="20"
                @input="update"
              />
            </v-col>

            <v-col cols="auto">
              <Uploader
                :initialType="'image'"
                :initialData="slider.imgLastName"
                :initialAdditionalType="'small-circle'"
                :initialTitle="'Slider Max Image'"
                @onAddFromUrl="onAddSliderImageFromUrl(slider, $event, 'Max');"
                @onAddFromDevice="onAddSliderImageFromDevice(slider, $event, 'Max');"
                @onRemove="onRemoveSliderImage(slider, 'Max');"
                @onNotify="$emit('loading', false); $emit('notify', $event);"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col 
              v-if="hasScoreValue"
              class="d-flex align-center"
              cols="auto"
            >
              <v-btn
                class="deep-orange"
                color="primary"
                dark
                @click="onEditScore(slider)"
              >
                Edit Score
              </v-btn>
            </v-col>

            <v-col 
              v-if="hasResponseAlert"
              class="d-flex align-center"
              cols="auto"
            >
              <v-btn
                class="deep-orange"
                color="primary"
                dark
                @click="onEditAlerts(slider)"
              >
                Edit Alerts
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </div>

      <div class="pa-2">
        <v-btn
          fab
          x-small
          color="primary"
          @click="addNewSlider"
        >
          <v-icon color="white">
            mdi-plus
          </v-icon>
        </v-btn>
      </div>
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
          @change="update"
        />
      </v-col>

      <v-col
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="hasResponseAlert"
          label="Set Alert"
          @change="update"
        />
      </v-col>
    </v-row>

    <v-dialog
      v-model="scoreDialog.visible"
      max-width="350"
      persistent
    >
      <v-card
        v-if="scoreDialog.slider.scores"
        class="pa-4"
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
              v-for="(score, i) in scoreDialog.slider.scores"
              :key="i"
              class="d-flex"
            >
              <div class="option-value pt-2">
                {{ i + Number(scoreDialog.slider.minSliderTick) }}
              </div>
              <v-text-field
                v-model="scoreDialog.slider.scores[i]"
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
      v-model="alertDialog.visible"
      max-width="600"
      persistent
    >
      <v-card
        v-if="alertDialog.slider.alerts"
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
            v-for="(alert, i) in alertDialog.slider.alerts"
            :key="i"
            class="d-flex"
          >
            <div class="option-value pt-2">
              {{ i + Number(alertDialog.slider.minSliderTick) }}
            </div>
            <v-text-field
              v-model="alertDialog.slider.alerts[i]"
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
    </v-dialog>
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

  .alert-dialog .option-alert {
    width: 80%;
  }
  .alert-dialog .option-value {
    width: 20%;
  }

  .options {
    max-height: 400px;
    overflow-y: scroll;
  }

  .slider-list {
    width: 90%;
  }
</style>

<script>
import ImageUpldr from '../../../../models/ImageUploader';
import Uploader from '../../Uploader.vue';

export default {
  components: {
    Uploader
  },
  props: {
    initialItemData: {
      type: Object,
      required: true
    },
    isSkippableItem: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    const imgUpldr = new ImageUpldr();
    
    return {
      sliders: (this.initialItemData.sliderOptions || []).map(slider => ({
        sliderLabel: slider.sliderLabel || '',
        minSliderTick: slider.minSliderTick || 0,
        maxSliderTick: slider.maxSliderTick || 5,
        minValue: slider.minValue || '',
        maxValue: slider.maxValue || '',
        imgFirstName: slider.minValueImg || '',
        imgLastName: slider.maxValueImg || '',
        scores: slider.scores || [],
        alerts: slider.alerts || [],

        alertMessage: slider.responseAlertMessage || '',
        alertMinValue: Number(slider.minAlertValue || slider.minSliderTick || 0),
        alertMaxValue: Number(slider.maxAlertValue || slider.maxSliderTick || 0),

        expanded: false,
      })),
      isSkippable: this.isSkippableItem || false,
      valid: true,
      textRules: [
        v => !!v || 'Slider Label cannot be empty',
      ],
      numberRules: [
        v => !isNaN(parseInt(v)) || 'Please enter a numerical value',
      ],
      alertTextRules: [
        v => !!v || 'Alert Message cannot be empty',
      ],
      hasScoreValue: this.initialItemData.hasScoreValue || false,
      hasResponseAlert: this.initialItemData.hasResponseAlert || false,
      scoreDialog: {
        visible: false,
        key: 0,
        slider: {}
      },
      alertDialog: {
        visible: false,
        key: 0,
        slider: {}
      },
      imgUpldr,
    };
  },
  beforeMount() {
    if (!this.sliders.length) {
      this.addNewSlider();
      this.sliders[0].expanded = true;
    }
  },
  mounted() {
    this.update();
  },
  methods: {
    resetScores () {
      const slider = this.scoreDialog.slider;
      for (let i = Number(slider.minSliderTick); i <= Number(slider.maxSliderTick); i++) {
        this.$set(slider.scores, i - slider.minSliderTick, i - slider.minSliderTick + 1);
      }
    },

    resetAlerts () {
      const slider = this.alertDialog.slider;
      if (slider.alerts) {
        for (let i = slider.minSliderTick; i < slider.maxSliderTick; i++) {
          this.$set(slider.alerts, i - slider.minSliderTick, '');
        }
      }
    },

    saveScores () {
      const slider = this.scoreDialog.slider;

      for (let i = 0; i < slider.scores.length; i++) {
        slider.scores[i] = Number(slider.scores[i]);
      }

      this.scoreDialog.visible = false;

      this.update();
    },

    saveAlerts () {
      this.alertDialog.visible = false;
      this.update();
    },

    addNewSlider () {
      const newSlider = {
        sliderLabel: `Slider ${this.sliders.length + 1}`,
        minSliderTick: 0,
        maxSliderTick: 5,
        minValue: '',
        maxValue: '',
        imgFirstName: '',
        imgLastName: '',
        scores: [1,2,3,4,5],
        alerts: ['','','','',''],
        expanded: false,
        valid: true,
      };

      this.sliders.push(newSlider);

      this.update();
    },

    deleteSlider (index) {
      this.sliders.splice(index, 1);
      this.update();
    },

    update () {
      this.sliders.forEach(slider => {
        if (slider.maxSliderTick > 12) {
          slider.maxSliderTick = 12;
        } else if (slider.minSliderTick < 1) {
          slider.minSliderTick = 1;
        }
      })

      const responseOptions = {
        'hasScoreValue': this.hasScoreValue,
        'hasResponseAlert': this.hasResponseAlert,
        'sliderOptions': this.sliders.map(slider => ({
          'minSliderTick': slider.minSliderTick,
          'maxSliderTick': slider.maxSliderTick,
          'minValue': slider.minValue || "Min",
          'minValueImg': slider.imgFirstName,
          'maxValue': slider.maxValue || "Max",
          'maxValueImg': slider.imgLastName,
          'sliderLabel': slider.sliderLabel,
          'scores': this.hasScoreValue ? slider.scores : false,
          'alerts': this.hasResponseAlert ? slider.alerts : false,
        }))
      };

      this.$emit('updateOptions', responseOptions);
    },

    sliderRangeUpdate(ev, type, slider) {
      if (Number(slider.maxSliderTick) > 12) {
        return false;
      }

      if (Number(slider.minSliderTick) < 0) {
        return false;
      }

      if (slider.minSliderTick === '' || slider.maxSliderTick === '' || Number(slider.minSliderTick) > Number(slider.maxSliderTick)) {
        return ;
      }

      slider.scores = slider.scores || [];
      slider.alerts = slider.alerts || [];

      const tickCount = slider.maxSliderTick - slider.minSliderTick + 1;
      if (tickCount <= 0) {
        return ;
      }

      if (type == 'max') {
        while (slider.scores.length < tickCount) {
          slider.scores.push(Number(slider.minSliderTick) + slider.scores.length);
          slider.alerts.push('');
        }

        while (slider.scores.length > tickCount) {
          slider.scores.pop();
          slider.alerts.pop();
        }
      } else {
        while (slider.scores.length < tickCount) {
          slider.scores.unshift(Number(slider.minSliderTick) + (tickCount - slider.scores.length - 1));
          slider.alerts.unshift('');
        }

        while (slider.scores.length > tickCount) {
          slider.scores.shift();
          slider.alerts.shift();
        }
      }

      this.update();
    },

    updateAllow() {
      const allow = this.isSkippable
      this.$emit('updateAllow', allow);
    },

    onAddSliderImageFromUrl(slider, url, type) {
      this.$set(slider, (type == 'Min' ? 'imgFirstName' : 'imgLastName'), url );
      this.update();

      this.$emit('notify', {
        type: 'success',
        message: `${type} Image from URL successfully added to Slider.`,
        duration: 3000,
      });
    },

    async onAddSliderImageFromDevice(slider, uploadFunction, type) {
      this.$emit('loading', true);

      try {
        const uploadedImageUrl = await uploadFunction();
        this.$set(slider, (type == 'Min' ? 'imgFirstName' : 'imgLastName'), uploadedImageUrl);

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
          message: `Something went wrong with uploading image. Please try to upload again or just save Slider without image changes.`,
        });
      }
    },

    onRemoveSliderImage(slider, type) {
      this.$set(slider, (type == 'Min' ? 'imgFirstName' : 'imgLastName'), '');

      this.update();
      this.$emit('notify', {
        type: 'warning',
        message: `${type} Image successfully removed from Slider.`,
        duration: 3000,
      });
    },

    onEditScore(slider) {
      this.scoreDialog.slider = slider;
      this.scoreDialog.visible = true;
      this.scoreDialog.key++;
    },

    onEditAlerts(slider) {
      this.alertDialog.slider = slider;
      this.alertDialog.visible = true;
      this.alertDialog.key++;
    }
  }
}
</script>
