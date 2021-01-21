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
    }
  },
  methods: {
    async uploadFn() {
      const ret = await this.imageUploader.uploadImage(payload); // the payload has the file(File) param from pmd
      return {
          upload: true,
          url: ret.location
      };
    },
  }
}
</script>