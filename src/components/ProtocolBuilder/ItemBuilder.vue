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
          counter="50"
          maxlength="50"
          :rules="nameRules"
          :disabled="!isItemEditable"
          required
          @keydown="nameKeydown($event)"
        />
        <v-text-field
          v-model="description"
          label="Description"
          counter="100"
          maxlength="100"
          :disabled="!isItemEditable"
          required
        />
        <v-textarea
          v-model="question"
          label="Question"
          :disabled="!isItemEditable"
          counter="100"
          maxlength="100"
          auto-grow
          rows="1"
        />
        <v-select
          v-model="inputType"
          :items="inputTypes"
          label="Input Type"
          :disabled="!isItemEditable"
        />
        <RadioBuilder
          v-if="inputType === 'radio'"
          :initial-item-data="options"
          :is-item-editable="isItemEditable"
          @updateOptions="updateOptions"
        />
        <TextBuilder
          v-if="inputType === 'text'"
          :initial-item-data="options"
          :is-item-editable="isItemEditable"
          @updateOptions="updateOptions"
        />
        <SliderBuilder
          v-if="inputType === 'slider'"
          :initial-item-data="options"
          :is-item-editable="isItemEditable"
          @updateOptions="updateOptions"
        />
        <VideoBuilder v-if="inputType === 'video'" />
        <PhotoBuilder v-if="inputType === 'photo'" />
        <TimeRangeBuilder v-if="inputType === 'timeRange'" />
        <DateBuilder v-if="inputType === 'date'" />
        <DrawingBuilder v-if="inputType === 'drawing'" />
        <AudioRecordBuilder
          v-if="inputType === 'audioRecord'"
          :initial-item-data="options"
          @updateOptions="updateOptions"
        />
        <AudioImageRecordBuilder
          v-if="inputType === 'audioImageRecord'"
          :initial-item-data="options"
          @updateOptions="updateOptions"
        />
        <GeolocationBuilder v-if="inputType === 'geolocation'" @update="updateResponseOptions" />
        <AudioStimulusBuilder
          v-if="inputType === 'audioStimulus'"
          :initial-item-input-options="inputOptions"
          :initial-item-media="media"
          :initial-item-data="options"
          :is-item-editable="isItemEditable"
          @updateInputOptions="updateInputOptions"
          @updateMedia="updateMedia"
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
      <v-btn color="primary" @click="onSaveItem">Save Item</v-btn>
    </v-card-actions>
  </v-card>
</template>

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
    AudioStimulusBuilder
  },
  props: {
    initialItemData: {
      type: Object,
      required: true
    },
    isItemEditable: {
      type: Boolean,
      default: true
    }
  },
  data: function() {
    const model = new Item();
    model.updateReferenceObject(this);

    return {
      model,
      ...model.getItemBuilderData(this.initialItemData)
    };
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
    updateMedia(newMedia) {
      this.media = newMedia;
    },
    updateOptions(newOptions) {
      this.options = newOptions;
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
    }
  }
};
</script>
