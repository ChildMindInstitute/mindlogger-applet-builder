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
            v-model="minSliderTick"
            label="Min Value"
            :disabled="!isItemEditable"
            type="number"
            min="1"
            :max="maxSliderTick"
            @input="sliderRangeUpdate($event, 'min')"
          />
        </v-col>

        <v-col
          sm="3"
        >
          <v-text-field
            v-model="minValue"
            label="Min Label"
            counter="20"
            maxlength="20"
            :disabled="!isItemEditable"
            @change="update"
          />
        </v-col>

        <v-col cols="auto">
          <ImageUploader
            :uploadFor="'item-radio-option-pc'"
            :itemImg="imgFirstName"
            @onAddImg="onUploadImg('first', $event)"
            @onRemoveImg="onRemoveImg('first')"
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
            v-model="maxSliderTick"
            label="Max Value"
            :disabled="!isItemEditable"
            type="number"
            :min="minSliderTick"
            max="12"
            @input="sliderRangeUpdate($event, 'max')"
          />
        </v-col>

        <v-col
          sm="3"
        >
          <v-text-field
            v-model="maxValue"
            label="Max Label"
            counter="20"
            maxlength="20"
            :disabled="!isItemEditable"
            @change="update"
          />
        </v-col>

        <v-col cols="auto">
          <ImageUploader
            :uploadFor="'item-radio-option-pc'"
            :itemImg="imgLastName"
            @onAddImg="onUploadImg('last', $event)"
            @onRemoveImg="onRemoveImg('last')"
          />
        </v-col>
      </v-row>

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
            @change="update"
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
            @click="scoreDialog = true"
          >
            Edit Score
          </v-btn>
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
          @change="sliderRangeUpdate($event, 'max')"
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

      <v-col
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="continousSlider"
          label="Use Continuous Slider"
          :disabled="!isItemEditable"
        />
      </v-col>

      <v-col
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="showTickMarks"
          label="Turn off Tick Marks & Labels"
          @change="update"
        />
      </v-col>
    </v-row>

    <v-dialog
      v-model="scoreDialog"
      max-width="350"
      persistent
    >
      <v-card
        v-if="scores"
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
                :disabled="!isItemEditable"
                :rules="numberRules"
              />
            </div>
          </v-card>

          <v-card-actions class="d-flex justify-space-around">
            <v-btn
              :disabled="!valid || !isItemEditable"
              color="primary"
              @click="saveScores"
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
  .slider-meta {
    width: 80%;
  }
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
      minSliderTick: this.initialItemData.minSliderTick || 0,
      maxSliderTick: this.initialItemData.maxSliderTick || 5,
      minValue: this.initialItemData.minValue || '',
      maxValue: this.initialItemData.maxValue || '',
      isSkippable: this.isSkippableItem || false,
      valid: true,
      textRules: [
        v => !!v || 'Radio options cannot be empty',
      ],
      numberRules: [
        v => !isNaN(parseInt(v)) || 'Please enter a numerical value',
      ],
      alertTextRules: [
        v => !!v || 'Alert Message cannot be empty',
      ],
      continousSlider: this.initialItemData.continousSlider || false,
      hasScoreValue: this.initialItemData.hasScoreValue || false,
      hasResponseAlert: this.initialItemData.hasResponseAlert || false,
      responseAlertMessage: this.initialItemData.responseAlertMessage || '',
      scoreDialog: false,
      showTickMarks: this.initialItemData.showTickMarks || false,
      scores: this.initialItemData.scores || false,
      imgUpldr,
      imgFirstName: this.initialItemData.minValueImg || '',
      imgLastName: this.initialItemData.maxValueImg || ''
    };
  },
  mounted() {
    this.update();
  },
  methods: {
    resetScores () {
      for (let i = this.minSliderTick; i < this.maxSliderTick; i++) {
        this.$set(this.scores, i - this.minSliderTick, i);
      }
    },

    saveScores () {
      for (let i = 0; i < this.scores.length; i++) {
        this.scores[i] = Number(this.scores[i]);
      }

      this.scoreDialog = false;

      this.update();
    },

    update () {
      if (this.maxSliderTick > 12) {
        this.maxSliderTick = 12;
      } else if (this.minSliderTick < 1) {
        this.minSliderTick = 1;
      }

      const responseOptions = {
        'minSliderTick': this.minSliderTick,
        'maxSliderTick': this.maxSliderTick,
        'minValue': this.minValue || "Min",
        'minValueImg': this.imgFirstName,
        'maxValue': this.maxValue || "Max",
        'maxValueImg': this.imgLastName,
        'hasScoreValue': this.hasScoreValue,
        'hasResponseAlert': this.hasResponseAlert,
        'continousSlider': this.continousSlider,
        'responseAlertMessage': this.responseAlertMessage,
        'showTickMarks': this.showTickMarks,
        'scores': this.hasScoreValue ? this.scores : false
      };
      this.$emit('updateOptions', responseOptions);
    },

    sliderRangeUpdate(ev, type) {
      if (Number(this.maxSliderTick) > 12) {
        return false;
      }
      if (Number(this.minSliderTick) < 0) {
        return false;
      }
      if (this.minSliderTick === '' || this.maxSliderTick === '' || Number(this.minSliderTick) > Number(this.maxSliderTick)) {
        return ;
      }

      this.scores = this.scores || [];

      const tickCount = this.maxSliderTick - this.minSliderTick + 1;
      if (tickCount < 0) {
        return;
      }

      if (type == 'max') {
        while (this.scores.length < tickCount) {
          this.scores.push(Number(this.minSliderTick) + this.scores.length);
        }

        while (this.scores.length > tickCount) {
          this.scores.pop();
        }
      } else {
        while (this.scores.length < tickCount) {
          this.scores.unshift(Number(this.minSliderTick) + (tickCount - this.scores.length - 1));
        }

        while (this.scores.length > tickCount) {
          this.scores.shift();
        }
      }

      while (this.scores.length < (this.maxSliderTick - this.minSliderTick + 1)) {
        this.scores.push(this.scores.length + 1);
      }

      while (this.scores.length > (this.maxSliderTick - this.minSliderTick + 1)) {
        this.scores.pop();
      }
      this.update();
    },

    updateAllow() {
      const allow = this.isSkippable
      this.$emit('updateAllow', allow);
    },

    async onUploadImg(option, data) {
      try {
        this.$emit('error', '');
        setTimeout(() => { this.$emit('uploading', true); }, 2000);
        const response = await this.imgUpldr.uploadImage(data);
        if(option === 'first') this.imgFirstName = response.location;
        else if(option === 'last') this.imgLastName = response.location;
        setTimeout(() => { this.$emit('uploading', false); }, 2100);
        this.update();
      } catch(e) {
        setTimeout(() => {
          this.$emit('uploading', false);
          this.$emit('error', 'Something went wrong with uploading image for "Score Option". Please try to upload image again...');
        }, 2000);
      }
    },
    onRemoveImg(option) {
      if(option === 'first') this.imgFirstName = '';
      else if(option === 'last') this.imgLastName = '';
      this.update();
    }

  }
}
</script>