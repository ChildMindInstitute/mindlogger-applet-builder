<template>
  <div>
    <p>Users will be prompted to draw an image.</p>
    <ImageUploader
      class="mt-7 mb-4"
      style="max-width: 300px"
      :uploadFor="'drawing-item-bg'"
      :itemImg="inputBackgroundOption['schema:value']"
      @onAddImg="onUploadImg"
      @onRemoveImg="onRemoveImg"
    />
  </div>
</template>

<script>
import ImageUpldr from '../../../models/ImageUploader';
import ImageUploader from './../ImageUploader.vue';

export default {
  components: {
    ImageUploader
  },
  props: {
    initialItemInputOptions: {
      type: Array,
      required: true
    },
  },
  data: function () {

    const inputBackgroundOption = this.getInputBackgroundOption(this.initialItemInputOptions) || {
      '@type': 'schema:URL',
      'schema:name': 'backgroundImage',
      'schema:value': ''
    };
    inputBackgroundOption['@type'] = 'schema:URL';

    const inputOptions = this.initialItemInputOptions;

    return {
      imgUpldr: new ImageUpldr(),
      inputBackgroundOption,
      inputOptions,
    }
  },
  methods: {

    getInputBackgroundOption(options) {
      if(!options || !options.length) return null;
      return options.find(option => option['schema:name'] === 'backgroundImage');
    },

    async onUploadImg(data) {
      try {
        this.$emit('error', '');
        setTimeout(() => { this.$emit('uploading', true); }, 2000);

        if(typeof data === 'string') {
          this.onRemoveImg();
          this.inputBackgroundOption['schema:value'] = data;
        } else {
          const response = await this.imgUpldr.uploadImage(data);
          this.onRemoveImg();
          this.inputBackgroundOption['schema:value'] = response.location;
        }

        this.inputOptions.push(this.inputBackgroundOption);

        setTimeout(() => { 
          this.$emit('uploading', false);
          this.$emit('updateInputOptions', this.inputOptions);
        }, 2100);

      } catch(e) {
        setTimeout(() => {
          this.$emit('uploading', false);
          this.$emit('error', 'Something went wrong with uploading image for "Canvas Background". Please try to upload image again...');
        }, 2000);
      }
    },

    onRemoveImg() {
      this.$emit('error', '');

      const removingOptionImgUrl = this.inputBackgroundOption['schema:value'];
      const removingOptionIndex = this.inputOptions.indexOf(option => option['schema:value'] === removingOptionImgUrl);

      this.inputOptions.splice(removingOptionIndex, 1);

      this.inputBackgroundOption['schema:value'] = '';

      this.$emit('updateInputOptions', this.inputOptions);
    }

  }
}
</script>