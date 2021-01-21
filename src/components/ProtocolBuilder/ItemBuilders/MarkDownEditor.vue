<template>
  <div>
    <pmd
      :value="value"
      @input="$emit('input', $event)"
      :showToolbar="true"
      :showTextarea="true"
      :uploadFileFn="uploadFn"
      :uploadImgFn="uploadFn"
      :imgWidthHeightAttr="{width: true, height: false}"
    ></pmd>

    <v-dialog
      v-model="isUploading"
      persistent
      width="400"
    >
    <v-card class="pt-5 pb-6 text-center">
      <v-progress-circular class="d-block mx-auto mt-2" color="primary" indeterminate :size="50">
      </v-progress-circular>
      <span> Uploading ... </span>
    </v-card>
    </v-dialog>
  </div>
</template>

<script>
import ImageUploader from '../../../models/ImageUploader';

export default {
  props: {
    value: {
      type: String,
      required: true,
    }
  },
  data() {
    const imageUploader = new ImageUploader();
    return {
      imageUploader,
      isUploading: false,
    }
  },
  methods: {
    async uploadFn(payload) {
      this.isUploading = true;
      const ret = await this.imageUploader.uploadImage(payload); // the payload has the file(File) param from pmd

      this.isUploading = false;
      return {
          upload: true,
          url: ret.location
      };
    },
  }
}
</script>