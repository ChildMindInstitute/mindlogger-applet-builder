<template>
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
          v-model="question.text"
          label="Question"
          v-if="inputType !== 'cumulativeScore'"
          :disabled="!isItemEditable"
          counter="320"
          maxlength="320"
          auto-grow
          rows="1"
        />
        <v-select
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
        />
        <VideoBuilder v-if="inputType === 'video'" />
        <PhotoBuilder v-if="inputType === 'photo'" />
        <TimeRangeBuilder v-if="inputType === 'timeRange'" />
        <DateBuilder v-if="inputType === 'date'" />
        <DrawingBuilder v-if="inputType === 'drawing'" />
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
</template>

<style scoped>

.disabled-option {
  color: grey;
}

</style>

<script>
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

export default {
  components: {
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

    let builderData = model.getItemBuilderData(this.initialItemData);
    return {
      model,
      ...builderData,

      hasScoringItem: this.items.some((item) => item.options.hasScoreValue),
      valid: (builderData.name.length > 0),
    };
  },
  beforeMount() {
    this.itemTemplates = this.templates
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
    onSaveItem() {
      if (this.isItemEditable) {
        this.$emit("closeItemModal", this.model.getItemData());
      } else {
        this.$emit("closeItemModal", null);
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
