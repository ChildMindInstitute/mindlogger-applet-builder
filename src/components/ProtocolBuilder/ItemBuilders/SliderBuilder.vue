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
          min="1"
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
              <div class="option-value pt-2">{{i+1}}</div>
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
import ImageUploader from '../ImageUploader.vue';
import ImageUpldr from '../../../models/ImageUploader';

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
      numOptions: this.initialItemData.numOptions || 5,
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
      hasScoreValue: this.initialItemData.hasScoreValue || false,
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
      for (let i = 0; i < this.scores.length; i++) {
        this.$set(this.scores, i, i+1);
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
      if (this.numOptions > 12) {
        this.numOptions = 12;
      } else if (this.numOptions < 1) {
        this.numOptions = 1;
      }

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
        'minValueImg': this.imgFirstName,
        'maxValue': this.maxValue || "Max",
        'maxValueImg': this.imgLastName,
        'hasScoreValue': this.hasScoreValue,
        'scores': this.hasScoreValue ? this.scores : false
      };
      this.$emit('updateOptions', responseOptions);
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