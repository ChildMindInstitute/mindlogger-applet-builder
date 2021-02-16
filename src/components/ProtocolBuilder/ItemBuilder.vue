<template>
<div>

  <v-card
    :class="{ 'item-not-editable': !isItemEditable }"
  >
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
        <template
          v-if="inputType !== 'markdownMessage'"
        >
          <v-textarea
            v-model="questionText"
            label="Question"
            v-if="inputType !== 'cumulativeScore'"
            :disabled="!isItemEditable"
            auto-grow
            rows="1"
          />
          <Uploader
            class="mt-3 mb-4"
            style="max-width: 300px"
            :initialType="'image'"
            :initialData="headerImage"
            :initialTitle="'Header Item Image'"
            @onAddFromUrl="onAddHeaderImageFromUrl($event)"
            @onAddFromDevice="loading = true; onAddHeaderImageFromDevice($event);"
            @onRemove="onRemoveHeaderImage()"
            @onNotify="loading = false; notify = $event;"
          />
          <!-- /Item Header Image Uploader -->
        </template>
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

        <div v-if="inputType === 'markdownMessage'">
          Message:
          <MarkDownEditor v-model="markdownText" />
        </div>

        <RadioBuilder
          v-if="inputType === 'radio'"
          :is-skippable-item="allow"
          :response-options="responseOptions"
          :initial-item-data="options"
          :is-item-editable="isItemEditable"
          :item-templates="itemTemplates"
          :isPrizeActivity="isPrizeActivity"
          @openPrize="$emit('openPrize')"
          @removeTemplate="onRemoveTemplate"
          @updateTemplates="onUpdateTemplates"
          @updateOptions="updateOptions"
          @updateAllow="updateAllow"
          @loading="loading = $event"
          @notify="notify = $event"
        />

        <TextBuilder
          v-if="inputType === 'text'"
          :is-skippable-item="allow"
          :initial-item-data="options"
          :response-option="responseOptions"
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
          @loading="loading = $event"
          @notify="notify = $event"
        />
        
        <VideoBuilder v-if="inputType === 'video'" />
        <PhotoBuilder v-if="inputType === 'photo'" />
        <TimeRangeBuilder v-if="inputType === 'timeRange'" />
        <DateBuilder v-if="inputType === 'date'" />

        <DrawingBuilder
          v-if="inputType === 'drawing'"
          :initial-item-response-options="responseOptions"
          :initial-item-input-options="inputOptions"
          @updateResponseOptions="updateResponseOptions"
          @updateInputOptions="updateInputOptions"
          @loading="loading = $event"
          @notify="notify = $event"
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
          :initial-item-response-options="responseOptions"
          :is-skippable-item="allow"
          @checkValidation="valid = $event"
          @updateResponseOptions="updateResponseOptions"
          @updateAllow="updateAllow"
          @loading="loading = $event"
          @notify="notify = $event"
        />

        <GeolocationBuilder
          v-if="inputType === 'geolocation'"
          :initial-item-response-options="responseOptions"
          @updateResponseOptions="updateResponseOptions"
          @loading="loading = $event"
          @notify="notify = $event"
        />

        <AudioStimulusBuilder
          v-if="inputType === 'audioStimulus'"
          :is-item-skippable="allow"
          :initial-item-input-options="inputOptions"
          :initial-item-media="media"
          @updateAllow="updateAllow"
          @updateInputOptions="updateInputOptions"
          @updateMedia="updateMedia"
          @validation="isItemValid = $event"
          @loading="loading = $event"
          @notify="notify = $event"
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
    <v-card-actions
      v-if="isItemEditable"
    >
      <v-btn
        outlined
        color="primary"
        @click="onDiscardItem"
      >Discard Changes</v-btn>
      <v-spacer />
      <v-btn
        :disabled="!name || !inputType || (!valid && inputType === 'cumulativeScore') || (!valid && inputType === 'audioImageRecord') || !isItemValid"
        color="primary"
        @click="onSaveItem"
      >
        Save Item
      </v-btn>
    </v-card-actions>
    <v-card-actions 
      v-if="!isItemEditable"
    >
      <v-btn 
        outlined 
        color="primary"
        @click="onDiscardItem"
      >Close</v-btn>
    </v-card-actions>
  </v-card>

  <Notify :notify="notify" />
  <Loading :loading="loading" />

</div>
</template>

<script>
import Item from '../../models/Item';

import Uploader from './Uploader.vue';
import Notify from './Additional/Notify.vue';
import Loading from './Additional/Loading.vue';

import MarkDownEditor from "./ItemBuilders/MarkDownEditor";
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

export default {
  components: {
    Uploader,
    Notify,
    Loading,
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
    MarkDownEditor,
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
    isPrizeActivity: {
      type: Object,
      default: null
    },
  },
  data: function() {

    const model = new Item();
    model.updateReferenceObject(this);

    return {
      model,
      ...model.getItemBuilderData(this.initialItemData),
      hasScoringItem: this.items.some((item) => item.options.hasScoreValue),
      valid: (this.name && this.name.length > 0),
      isError: '',
      questionText: '',
      headerImage: '',
      isItemValid: true,
      loading: false,
      notify: {},
    };
  },
  beforeMount() {
    this.itemTemplates = this.templates;
    this.questionText = this.question.text;
    this.headerImage = this.question.image;
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

    onAddHeaderImageFromUrl(url) {
      this.headerImage = url;
      this.notify = {
        type: 'success',
        message: 'Header image from URL successfully added to Item.',
        duration: 3000,
      };
    },

    async onAddHeaderImageFromDevice(uploadFunction) {
      try {
        this.headerImage = await uploadFunction();
        this.loading = false;
        this.notify = {
          type: 'success',
          message: 'Header image successfully added to Item.',
          duration: 3000,
        };
      } catch (error) {
        this.loading = false;
        this.notify = {
          type: 'error',
          message: 'Something went wrong with uploading header image for Item. Please try to upload again or just save Item without changes for header image.',
        };
      }
    },

    onRemoveHeaderImage() {
      this.headerImage = '';
      this.notify = {
        type: 'warning',
        message: 'Header image successfully removed from Item.',
        duration: 3000,
      };
    },

    async onSaveItem() {
      if (!this.isItemEditable) {
        this.$emit("closeItemModal", null);
        return;
      }

      this.question.text = this.questionText;
      this.question.image = this.headerImage;

      this.$emit("closeItemModal", this.model.getItemData());
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
    },

  }
};
</script>

<style lang="scss" scoped>

.item-not-editable {
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    z-index: 1000;
  }

  .v-card__actions {
    position: relative;
    z-index: 1001;
  }

}

.disabled-option {
  color: grey;
}

</style>