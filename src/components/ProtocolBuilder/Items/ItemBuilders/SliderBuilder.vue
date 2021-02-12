<template>
  <v-form>
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
    </v-row>

    <v-row>
      <v-col 
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-text-field
          v-model="minSliderTick"
          label="Minimum Slider Value"
          :disabled="!isItemEditable"
          type="number"
          @change="sliderRangeUpdate($event, 'min')"
          min="1"
          :max="maxSliderTick"
        />
      </v-col>

      <v-col 
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-text-field
          v-model="maxSliderTick"
          label="Maximum Slider Value"
          :disabled="!isItemEditable"
          type="number"
          @change="sliderRangeUpdate($event, 'max')"
          :min="minSliderTick"
          max="12"
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

    <v-dialog max-width="350" v-model="scoreDialog" persistent>
      <v-card class="pa-4" v-if="scores">
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
              v-for="(score, i) in scores"
              :key="i"
              class="d-flex"
            >
              <div class="option-value pt-2">{{i + Number(minSliderTick)}}</div>
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

    <v-row>
      <v-col cols="auto">
        <ImageUploader
          :uploadFor="'item-radio-option-pc'"
          :itemImg="imgFirstName"
          @onAddImg="onUploadImg('first', $event)"
          @onRemoveImg="onRemoveImg('first')"
        />
      </v-col>
      <v-col>
        <v-text-field
          v-model="minValue"
          label="First option"
          counter="20"
          maxlength="20"
          :disabled="!isItemEditable"
          @change="update"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="auto">
        <ImageUploader
          :uploadFor="'item-radio-option-pc'"
          :itemImg="imgLastName"
          @onAddImg="onUploadImg('last', $event)"
          @onRemoveImg="onRemoveImg('last')"
        />
      </v-col>
      <v-col>
        <v-text-field
          v-model="maxValue"
          label="Last option"
          counter="20"
          maxlength="20"
          :disabled="!isItemEditable"
          @change="update"
        />
      </v-col>
    </v-row>

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
      hasScoreValue: this.initialItemData.hasScoreValue || false,
      hasResponseAlert: this.initialItemData.hasResponseAlert || false,
      responseAlertMessage: this.initialItemData.responseAlertMessage || '',
      scoreDialog: false,
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
        'responseAlertMessage': this.responseAlertMessage,
        'scores': this.hasScoreValue ? this.scores : false
      };
      this.$emit('updateOptions', responseOptions);
    },

    sliderRangeUpdate(ev, type) {
      if (this.hasScoreValue) {
        this.scores = this.scores || [];

        const tickCount = this.maxSliderTick - this.minSliderTick + 1;

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

        if (type == 'min') {
            
        } else {

        }
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