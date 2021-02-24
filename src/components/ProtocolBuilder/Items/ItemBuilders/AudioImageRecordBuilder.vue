<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <v-text-field
      v-model="responseOptions['schema:minValue']"
      label="Minimum response length (milliseconds)"
      type="number"
      :rules="minValueRules"
      @click="onUpdateResponseOptions"
      @keyup="onUpdateResponseOptions"
    />
    <v-text-field
      v-model="responseOptions['schema:maxValue']"
      label="Maximum response length (milliseconds)"
      type="number"
      :rules="maxValueRules"
      @click="onUpdateResponseOptions"
      @keyup="onUpdateResponseOptions"
    />
    <Uploader
      class="my-3"
      style="max-width: 300px"
      :initialType="'image'"
      :initialData="responseOptions['schema:image']"
      :initialTitle="'Geolocation Image'"
      @onAddFromUrl="onAddAudioImageFromUrl($event)"
      @onAddFromDevice="$emit('loading', true); onAddAudioImageFromDevice($event);"
      @onRemove="onRemoveAudioImage()"
      @onNotify="$emit('loading', false); $emit('notify', $event);"
    />
    <p class="mb-8">
      For this type of item will be added default image if you are not going use your own image.
    </p>
    <v-checkbox
      v-model="isSkippable"
      label="Skippable Item"
      @change="onUpdateSkipOption"
    />
    <v-checkbox
      v-model="responseOptions['requiredValue']"
      label="Response required"
      @change="onUpdateResponseOptions"
    />
  </v-form>
</template>

<script>
import Uploader from '../../Uploader.vue';

export default {
  components: {
    Uploader,
  },
  props: {
    initialItemResponseOptions: {
      type: Object,
      required: true,
    },
    isSkippableItem: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    
    let responseOptions = {
      "schema:minValue": 1,
      "schema:maxValue": 3000,
      "requiredValue": false,
      "schema:image": '',
    };
    responseOptions = Object.assign(responseOptions, this.initialItemResponseOptions);
    responseOptions['valueType'] = 'audioImageRecord';
    responseOptions['multipleChoice'] = false;

    this.$emit('checkValidation', true);

    return {
      responseOptions,
      isSkippable: this.isSkippableItem || false,
      valid: true,
      minValueRules: [
        v => (v > 0 && v % 1 === 0) || 'Min response length must be a positive integer',
      ],
      maxValueRules: [
        v => (v > 0 && v % 1 === 0) || 'Max response length must be a positive integer',
      ],
    };
  },
  methods: {

    onUpdateResponseOptions() {
      this.$emit('checkValidation', this.valid);
      this.$emit('updateResponseOptions', this.responseOptions);
    },

    onUpdateSkipOption() {
      this.$emit('updateAllow', this.isSkippable);
    },

    onAddAudioImageFromUrl(url) {
      this.responseOptions['schema:image'] = url;
      this.onUpdateResponseOptions();
      this.$emit('notify', {
        type: 'success',
        message: 'Image from URL successfully added to AudioImageRecord Item.',
        duration: 3000,
      });
    },

    async onAddAudioImageFromDevice(uploadFunction) {
      try {
        this.responseOptions['schema:image'] = await uploadFunction();
        this.onUpdateResponseOptions();
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'success',
          message: 'Image successfully added to AudioImageRecord Item.',
          duration: 3000,
        });
      } catch (error) {
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'error',
          message: 'Something went wrong with uploading image for Item > AudioImageRecord. Please try to upload again or just save AudioImageRecord without image changes.',
        });
      }
    },

    onRemoveAudioImage() {
      this.responseOptions['schema:image'] = '';
      this.onUpdateResponseOptions();
      this.$emit('notify', {
        type: 'warning',
        message: 'Image successfully removed from AudioImageRecord Item.',
        duration: 3000,
      });
    },

  }
}
</script>