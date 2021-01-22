<template>
  <div>
    <ImageUploader
      class="mt-5 mb-7"
      style="max-width: 300px"
      :uploadFor="'default-item'"
      :itemImg="responseOptions['schema:image']"
      @onAddImg="onUploadImg"
      @onRemoveImg="onRemoveImg"
    />
    <p>Users will be prompted to draw an image.</p>
    <ImageUploader
      class="my-4"
      style="max-width: 300px"
      :uploadFor="'drawing-item-bg'"
      :itemImg="inputBackgroundOption['schema:value']"
      @onAddImg="onUploadBgImg"
      @onRemoveImg="onRemoveBgImg"
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
    initialItemResponseOptions: {
      type: Object,
      required: true,
    },
    initialItemInputOptions: {
      type: Array,
      required: true
    },
  },
  data: function () {

    let responseOptions = {
      "schema:image": '',
    };
    responseOptions = Object.assign(responseOptions, this.initialItemResponseOptions);
    responseOptions['valueType'] = 'drawing';

    let inputBackgroundOption = { 'schema:value': '' };
    inputBackgroundOption = Object.assign(inputBackgroundOption, this.getInputBackgroundOption(this.initialItemInputOptions));
    inputBackgroundOption['@type'] = 'schema:URL';
    inputBackgroundOption['schema:name'] = 'backgroundImage';

    const inputOptions = this.initialItemInputOptions;

    return {
      imgUpldr: new ImageUpldr(),
      responseOptions,
      inputBackgroundOption,
      inputOptions,
    }
  },
  methods: {

    onUpdateResponseOptions() {
      this.$emit('updateResponseOptions', this.responseOptions);
    },

    getInputBackgroundOption(options) {
      if(!options || !options.length) return null;
      return options.find(option => option['schema:name'] === 'backgroundImage');
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
          this.$emit('error', 'Something went wrong with uploading image for "Drawing" item. Please try to upload image again...');
        }, 2000);
      }
    },

    async onUploadBgImg(data) {
      try {
        this.$emit('error', '');
        setTimeout(() => { this.$emit('uploading', true); }, 2000);

        if(typeof data === 'string') {
          this.onRemoveBgImg();
          this.inputBackgroundOption['schema:value'] = data;
        } else {
          const response = await this.imgUpldr.uploadImage(data);
          this.onRemoveBgImg();
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
      this.responseOptions['schema:image'] = '';
      this.onUpdateResponseOptions();
    },

    onRemoveBgImg() {
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