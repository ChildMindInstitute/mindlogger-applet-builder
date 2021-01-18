<template>
  <div>
  <v-card>
    <v-card-title class="headline grey lighten-2" primary-title>
      <v-icon left>{{ isItemEditable ? "mdi-pencil" : "mdi-eye" }}</v-icon>
      {{ isItemEditable ? "Edit Item" : "View Item" }}
    </v-card-title>
    <v-card-text>
      <v-form ref="form" lazy-validation>
        <v-text-field
          v-model="name"
          label="Item Name"
          :rules="nameRules"
          :disabled="!isItemEditable || inputType == 'cumulativeScore'"
          required
          @keydown="nameKeydown($event)"
        />
        <v-textarea
          v-model="questionBuilder.text"
          label="Question"
          v-if="inputType !== 'cumulativeScore'"
          :disabled="!isItemEditable"
          counter="320"
          maxlength="320"
          auto-grow
          rows="1"
        />
        <ImageUploader
          class="mt-3 mb-4"
          style="max-width: 300px"
          :uploadFor="'activity-item'"
          :itemImg="questionBuilder.imgURL"
          @onAddImg="onAddImg"
          @onRemoveImg="onRemoveImg"
        />
        <v-select
          class="mt-6"
          v-model="inputType"
          :items="inputTypes"
          label="Input Type"
          :disabled="!isItemEditable"
          @change="onUpdateInputType"
        >
          <template v-slot:item="{ item, attrs, on }">
            <v-list-item v-on="on" v-bind="attrs">
              <v-tooltip
                v-if="!hasScoringItem && item == 'cumulativeScore'"
                top
              >
                <template v-slot:activator="{ on }">
                  <div
                    class="disabled-option"
                    v-on="on"
                    @click.stop=""
                  >
                    <span>{{ item }}</span>
                  </div>
                </template>
                <span>Please create an item with scores before creating this page</span>
              </v-tooltip>
              <div
                v-else
              >
                {{item}}
              </div>
            </v-list-item>
          </template>
        </v-select>
        <RadioBuilder
          v-if="inputType === 'radio'"
          :is-skippable-item="allow"
          :response-options="responseOptions"
          :initial-item-data="options"
          :is-item-editable="isItemEditable"
          :item-templates="itemTemplates"
          @removeTemplate="onRemoveTemplate"
          @updateTemplates="onUpdateTemplates"
          @updateOptions="updateOptions"
          @updateAllow="updateAllow"
          @uploading="isUploadingState = $event"
          @error="isError = $event"
        />
        <TextBuilder
          v-if="inputType === 'text'"
          :is-skippable-item="allow"
          :initial-item-data="options"
          :initial-answer="correctAnswer"
          :is-item-editable="isItemEditable"
          @updateAnswer="updateAnswer"
          @updateOptions="updateOptions"
          @updateAllow="updateAllow"
        />
        <SliderBuilder
          v-if="inputType === 'slider'"
          :is-skippable-item="allow"
          :initial-item-data="options"
          :is-item-editable="isItemEditable"
          @updateOptions="updateOptions"
          @updateAllow="updateAllow"
          @uploading="isUploadingState = $event"
          @error="isError = $event"
        />
        <VideoBuilder v-if="inputType === 'video'" />
        <PhotoBuilder v-if="inputType === 'photo'" />
        <TimeRangeBuilder v-if="inputType === 'timeRange'" />
        <DateBuilder v-if="inputType === 'date'" />

        <DrawingBuilder
          v-if="inputType === 'drawing'"
          :initial-item-input-options="inputOptions"
          @uploading="isUploadingState = $event"
          @error="isError = $event"
          @updateInputOptions="updateInputOptions"
        />

        <AudioRecordBuilder
          v-if="inputType === 'audioRecord'"
          :is-skippable-item="allow"
          :initial-item-data="options"
          @updateOptions="updateOptions"
          @updateAllow="updateAllow"
        />
        <AudioImageRecordBuilder
          v-if="inputType === 'audioImageRecord'"
          :is-skippable-item="allow"
          :initial-item-data="options"
          @updateOptions="updateOptions"
          @updateAllow="updateAllow"
        />
        <GeolocationBuilder v-if="inputType === 'geolocation'" @update="updateResponseOptions" />
        <AudioStimulusBuilder
          v-if="inputType === 'audioStimulus'"
          :is-skippable-item="allow"
          :initial-item-input-options="inputOptions"
          :initial-item-media="media"
          :initial-item-data="options"
          :is-item-editable="isItemEditable"
          @updateAllow="updateAllow"
          @updateInputOptions="updateInputOptions"
          @updateMedia="updateMedia"
        />
        <CumulativeScoreBuilder
          v-if="inputType === 'cumulativeScore'"
          :items="items"
          :is-item-editable="isItemEditable"
          :initial-item-data="initialItemData"
          @updateCumulativeScore="updateCumulativeScore"
        />
      </v-form>
    </v-card-text>
    <v-alert v-if="isError" type="error" class="mx-2">{{ isError }}</v-alert>
    <v-divider />
    <v-card-actions>
      <v-btn
        outlined
        color="primary"
        @click="onDiscardItem"
      >{{ isItemEditable ? "Discard Changes" : "Close" }}</v-btn>
      <v-spacer />
      <v-btn
        :disabled="!valid && inputType === 'cumulativeScore' || !name"
        color="primary"
        @click="onSaveItem"
      >
        Save Item
      </v-btn>
    </v-card-actions>
  </v-card>
  <v-dialog v-model="isUploadingState" persistent width="400">
    <v-card class="pt-5 pb-6">
      <v-progress-circular class="d-block mx-auto mt-2" color="primary" indeterminate :size="50">
      </v-progress-circular>
    </v-card>
  </v-dialog>
  </div>
</template>

<style scoped>

.disabled-option {
  color: grey;
}

</style>

<script>
import ImageUploader from './ImageUploader.vue';
import RadioBuilder from "./ItemBuilders/RadioBuilder.vue";
import TextBuilder from "./ItemBuilders/TextBuilder.vue";
import SliderBuilder from "./ItemBuilders/SliderBuilder.vue";
import VideoBuilder from "./ItemBuilders/VideoBuilder.vue";
import PhotoBuilder from "./ItemBuilders/PhotoBuilder.vue";
import TimeRangeBuilder from "./ItemBuilders/TimeRangeBuilder.vue";
import DateBuilder from "./ItemBuilders/DateBuilder.vue";
import DrawingBuilder from "./ItemBuilders/DrawingBuilder.vue";
import AudioRecordBuilder from "./ItemBuilders/AudioRecordBuilder.vue";
import AudioImageRecordBuilder from "./ItemBuilders/AudioImageRecordBuilder.vue";
import GeolocationBuilder from "./ItemBuilders/GeolocationBuilder.vue";
import AudioStimulusBuilder from "./ItemBuilders/AudioStimulusBuilder.vue";
import CumulativeScoreBuilder from "./ItemBuilders/CumulativeScoreBuilder.vue";
import Item from '../../models/Item';
import ImageUpldr from '../../models/ImageUploader';

export default {
  components: {
    ImageUploader,
    RadioBuilder,
    TextBuilder,
    SliderBuilder,
    VideoBuilder,
    PhotoBuilder,
    TimeRangeBuilder,
    DateBuilder,
    DrawingBuilder,
    AudioRecordBuilder,
    AudioImageRecordBuilder,
    GeolocationBuilder,
    AudioStimulusBuilder,
    CumulativeScoreBuilder,
  },
  props: {
    initialItemData: {
      type: Object,
      required: true
    },
    isItemEditable: {
      type: Boolean,
      default: true
    },
    templates: {
      type: Array,
      default: null
    },
    items: {
      type: Array,
      required: true,
    },
  },
  data: function() {
    const model = new Item();
    model.updateReferenceObject(this);

    const imgUploader = new ImageUpldr();

    const questionBuilder = { text: '', imgURL: '', imgFile: null };

    let isUploadingState = false;
    let isError = '';

    return {
      model,
      ...model.getItemBuilderData(this.initialItemData),
      hasScoringItem: this.items.some((item) => item.options.hasScoreValue),
      valid: (this.name && this.name.length > 0),
      imgUploader,
      questionBuilder,
      isUploadingState,
      isError
    };
  },
  beforeMount() {
    this.itemTemplates = this.templates;
    this.questionBuilder.text = this.question.text;
    this.questionBuilder.imgURL = this.question.image;
  },
  methods: {
    nameKeydown(e) {
      if (!/^[a-zA-Z0-9-_]+$/.test(e.key)) {
        e.preventDefault();
      }
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.snackbar = true;
      }
    },
    updateResponseOptions(newResponseOptions) {
      this.responseOptions = newResponseOptions;
    },
    updateInputOptions(newInputOptions) {
      this.inputOptions = newInputOptions;
    },
    updateAnswer(correctAnswer) {
      this.correctAnswer = correctAnswer;
    },
    updateAllow(allowItem) {
      this.allow = allowItem;
    },
    updateMedia(newMedia) {
      this.media = newMedia;
    },
    onUpdateTemplates(option) {
      this.$emit('updateTemplates', option);
    },
    onRemoveTemplate(option) {
      this.$emit('removeTemplate', option);
    },
    updateOptions(newOptions) {
      this.options = newOptions;
      this.responseOptions = this.model.getResponseOptions();
    },
    onAddImg(data) {
      this.isError = '';
      if(typeof data !== 'string') {
        this.questionBuilder.imgFile = data;
        this.questionBuilder.imgURL = data.name;
      } else {
        this.questionBuilder.imgURL = data;
      }
    },
    onRemoveImg() {
      this.isError = '';
      this.questionBuilder.imgFile = null;
      this.questionBuilder.imgURL = '';
    },
    async onSaveItem() {
      try {

        if (!this.isItemEditable) {
          this.$emit("closeItemModal", null);
          return;
        }

        this.question.text = this.questionBuilder.text;
        if(!this.questionBuilder.imgFile) {
          this.question.image = this.questionBuilder.imgURL;
        } else {
          this.isError = '';
          this.isUploadingState = true;
          const response = await this.imgUploader.uploadImage(this.questionBuilder.imgFile);
          this.question.image = response.location;
          this.questionBuilder.imgFile = null;
          this.isUploadingState = false;
        }

        this.$emit("closeItemModal", this.model.getItemData());

      } catch(e) {
        this.isUploadingState = false;
        this.questionBuilder.imgURL = this.question.image;
        this.questionBuilder.imgFile = null;
        this.isError = 'Something went wrong with uploading "Header" image. Please try to upload image again...or save "Item" without image changes.';
      }
    },
    onDiscardItem() {
      this.$emit("closeItemModal", null);
    },

    updateCumulativeScore (scoreRules) {
      this.valid = !scoreRules.some(rule => !rule.valid) && scoreRules.length > 0;
      this.cumulativeScores = scoreRules;
    },

    onUpdateInputType() {
      if (this.inputType === 'cumulativeScore') {
        this.name = 'cumulatives';
      }
    }
  }
};
</script>
