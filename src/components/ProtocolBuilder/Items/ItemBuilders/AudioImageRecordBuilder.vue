<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <!-- <v-text-field
      v-model="responseOptions['schema:minValue']"
      label="Minimum response length (milliseconds)"
      type="number"
      :rules="minValueRules"
      @click="onUpdateResponseOptions"
      @keyup="onUpdateResponseOptions"
    /> -->
    <!-- min response length not functional for now  -->
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
      :initialTitle="'Audio Record Image'"
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
      :disabled="isSkippableItem == 2"
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
    initialItemData: {
      type: Object,
      required: true
    },
    initialItemResponseOptions: {
      type: Object,
      required: true,
    },
    isSkippableItem: {
      type: Number,
      default: 0,
    },
  },
  data: function () {
    let responseOptions = { ...this.initialItemResponseOptions };

    responseOptions['schema:minValue'] = this.initialItemData['schema:minValue'] || 1;
    responseOptions['schema:maxValue'] = this.initialItemData['schema:maxValue'] || 3000;
    responseOptions['schema:image'] = this.initialItemData['schema:image'] || '';
    responseOptions['valueType'] = 'audioImageRecord';
    responseOptions['multipleChoice'] = false;

    this.$emit('checkValidation', true);

    return {
      responseOptions,
      valid: true,
      minValueRules: [
        v => (v > 0 && v % 1 === 0) || 'Min response length must be a positive integer',
      ],
      maxValueRules: [
        v => (v > 0 && v % 1 === 0) || 'Max response length must be a positive integer',
      ],
    };
  },
  computed: {
    isSkippable: {
      get() {
        return this.isSkippableItem === 1 || false;
      },
      set(value) {
        this.$emit('updateAllow', value);
      }
    }
  },
  methods: {
    onUpdateResponseOptions() {
      this.$emit('checkValidation', this.valid);
      this.$emit('updateResponseOptions', this.responseOptions);
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