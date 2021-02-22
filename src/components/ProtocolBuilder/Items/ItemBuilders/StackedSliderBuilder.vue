<template>
  <v-form>
    <div class="slider-list">
      <div class="py-4">
        Sliders
      </div>

      <div
        v-for="(slider, index) in sliders"
        :key="index"
        class="px-8"
      >
        <v-row>
          <v-col>
            <span>
              {{ slider.sliderLabel }}
            </span>
          </v-col>

          <v-spacer />

          <div class="d-flex align-center justify-end">
            <v-btn
              icon
              :disabled="!isItemEditable"
              @click="slider.expanded = !slider.expanded"
              large
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
              :disabled="!isItemEditable"
              @click="deleteSlider(index)"
              large
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
                :rules="textRules"
                :disabled="!isItemEditable"
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
                :disabled="!isItemEditable"
                type="number"
                @input="sliderRangeUpdate($event, 'min', slider)"
                min="1"
                :max="slider.maxSliderTick"
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
                :disabled="!isItemEditable"
                @input="update"
              />
            </v-col>

            <v-col cols="auto">
              <ImageUploader
                :uploadFor="'item-radio-option-pc'"
                :itemImg="slider.imgFirstName"
                @onAddImg="onUploadImg('first', $event, slider)"
                @onRemoveImg="onRemoveImg('first', slider)"
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
                :disabled="!isItemEditable"
                type="number"
                @input="sliderRangeUpdate($event, 'max', slider)"
                :min="slider.minSliderTick"
                max="12"
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
                :disabled="!isItemEditable"
                @input="update"
              />
            </v-col>

            <v-col cols="auto">
              <ImageUploader
                :uploadFor="'item-radio-option-pc'"
                :itemImg="slider.imgLastName"
                @onAddImg="onUploadImg('last', $event, slider)"
                @onRemoveImg="onRemoveImg('last', slider)"
              />
            </v-col>
          </v-row>

          <v-row
            v-if="hasScoreValue"
          >
            <v-col 
              class="d-flex align-center"
              cols="12"
              sm="12"
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
          </v-row>
        </div>
      </div>

      <div class="pa-2">
        <v-btn
          :disabled="!isItemEditable"
          @click="addNewSlider"
          fab
          x-small
          color="deep-purple"
        >
          <v-icon color="white">
            mdi-plus
          </v-icon>
        </v-btn>
      </div>
    </div>

    <v-row
      v-if="hasResponseAlert"
    >
      <v-col 
        class="d-flex align-center"
        cols="12"
        sm="12"
      >
        <v-text-field
          v-model="responseAlertMessage"
          label="Alert Message"
          :rules="alertTextRules"
          :disabled="!isItemEditable"
          required
          @input="update"
        />
      </v-col>
    </v-row>
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

      <v-col
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="hasResponseAlert"
          label="Set Alert"
          :disabled="!isItemEditable"
          @change="update"
        />
      </v-col>
    </v-row>

    <v-dialog max-width="350" v-model="scoreDialog.visible" persistent>
      <v-card class="pa-4" v-if="scoreDialog.slider.scores">
        <v-form
          ref="form"
          v-model="valid"
        >
          <v-card>
            <div class="d-flex">
              <div class="option-value">Value</div>
              <div class="option-score">Score</div>
            </div>
          </v-card>
          <v-card class="options">
            <div
              v-for="(score, i) in scoreDialog.slider.scores"
              :key="i"
              class="d-flex"
            >
              <div class="option-value pt-2">{{i + Number(scoreDialog.slider.minSliderTick)}}</div>
              <v-text-field
                v-model="scoreDialog.slider.scores[i]"
                class="option-score mt-0 pt-0"
                type="number"
                :disabled="!isItemEditable"
                :rules="numberRules"
              />
            </div>
          </v-card>

          <v-card-actions class="d-flex justify-space-around">
            <v-btn
              :disabled="!valid || !isItemEditable"
              @click="saveScores"
              color="primary"
            >
              Save
            </v-btn>
            <v-btn
              :disabled="!isItemEditable"
              @click="resetScores"
            >
              Reset
            </v-btn>
          </v-card-actions>
        </v-form>
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

  .options {
    max-height: 400px;
    overflow-y: scroll;
  }

  .slider-list {
    width: 60%;
  }
</style>

<script>
import ImageUploader from '../../ImageUploader.vue';
import ImageUpldr from '../../../../models/ImageUploader';

export default {
  components: {
    ImageUploader
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
    isItemEditable: {
      type: Boolean,
      default: true,
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
      responseAlertMessage: this.initialItemData.responseAlertMessage || '',
      scoreDialog: {
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
      for (let i = slider.minSliderTick; i < slider.maxSliderTick; i++) {
        slider.scores[i] = i - slider.minSliderTick;
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
        'responseAlertMessage': this.responseAlertMessage,
        'sliderOptions': this.sliders.map(slider => ({
          'minSliderTick': slider.minSliderTick,
          'maxSliderTick': slider.maxSliderTick,
          'minValue': slider.minValue || "Min",
          'minValueImg': slider.imgFirstName,
          'maxValue': slider.maxValue || "Max",
          'maxValueImg': slider.imgLastName,
          'sliderLabel': slider.sliderLabel,
          'scores': this.hasScoreValue ? slider.scores : false
        }))
      };

      this.$emit('updateOptions', responseOptions);
    },

    sliderRangeUpdate(ev, type, slider) {
      slider.scores = slider.scores || [];

      const tickCount = slider.maxSliderTick - slider.minSliderTick + 1;

      if (type == 'max') {
        while (slider.scores.length < tickCount) {
          slider.scores.push(Number(slider.minSliderTick) + slider.scores.length);
        }

        while (slider.scores.length > tickCount) {
          slider.scores.pop();
        }
      } else {
        while (slider.scores.length < tickCount) {
          slider.scores.unshift(Number(slider.minSliderTick) + (tickCount - slider.scores.length - 1));
        }

        while (slider.scores.length > tickCount) {
          slider.scores.shift();
        }
      }

      while (slider.scores.length < (slider.maxSliderTick - slider.minSliderTick + 1)) {
        slider.scores.push(slider.scores.length + 1);
      }

      while (slider.scores.length > (slider.maxSliderTick - slider.minSliderTick + 1)) {
        slider.scores.pop();
      }

      this.update();
    },

    updateAllow() {
      const allow = this.isSkippable
      this.$emit('updateAllow', allow);
    },

    async onUploadImg(option, data, slider) {
      try {
        this.$emit('error', '');
        setTimeout(() => { this.$emit('uploading', true); }, 2000);
        const response = await this.imgUpldr.uploadImage(data);
        if(option === 'first') slider.imgFirstName = response.location;
        else if(option === 'last') slider.imgLastName = response.location;
        setTimeout(() => { this.$emit('uploading', false); }, 2100);
        this.update();
      } catch(e) {
        setTimeout(() => {
          this.$emit('uploading', false);
          this.$emit('error', 'Something went wrong with uploading image for "Score Option". Please try to upload image again...');
        }, 2000);
      }
    },
    onRemoveImg(option, slider) {
      if(option === 'first') slider.imgFirstName = '';
      else if(option === 'last') slider.imgLastName = '';

      this.update();
    },

    onEditScore(slider) {
      this.scoreDialog.slider = slider;
      this.scoreDialog.visible = true;
      this.scoreDialog.key++;
    }
  }
}
</script>
