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
    <ImageUploader
      class="my-3"
      style="max-width: 300px"
      :uploadFor="'default-item'"
      :itemImg="responseOptions['schema:image']"
      @onAddImg="onUploadImg"
      @onRemoveImg="onRemoveImg"
    />
    <p class="mb-8">For this type of item will be added default image if you are not going use your own image.</p>
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
import ImageUpldr from '../../../models/ImageUploader';
import ImageUploader from './../ImageUploader.vue';

export default {
  components: {
    ImageUploader
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

    async onUploadImg(data) {
      try {
        this.$emit('error', '');
        setTimeout(() => { this.$emit('uploading', true); }, 2000);

        if(typeof data === 'string') {
          this.responseOptions['schema:image'] = data;
        } else {
          const response = await this.imgUpldr.uploadImage(data);
          this.responseOptions['schema:image'] = response.location;
        }

        setTimeout(() => {
          this.onUpdateResponseOptions();
          this.$emit('uploading', false);
        }, 2100);

      } catch(e) {
        setTimeout(() => {
          this.$emit('uploading', false);
          this.$emit('error', 'Something went wrong with uploading image for "AudioImageRecord" item. Please try to upload image again...');
        }, 2000);
      }
    },

    onRemoveImg() {
      this.$emit('error', '');
      this.responseOptions['schema:image'] = '';
      this.onUpdateResponseOptions();
    },

  }
}
</script>