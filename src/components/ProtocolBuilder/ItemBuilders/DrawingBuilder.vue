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
    initialItemMedia: {
      type: Object,
      required: true
    }
  },
  data: function () {

    const inputBackgroundOption = this.getInputBackgroundOption(this.initialItemInputOptions) || {
      '@type': 'schema:URL',
      'schema:name': 'backgroundImage',
      'schema:value': ''
    };
    inputBackgroundOption['@type'] = 'schema:URL';

    const inputOptions = this.initialItemInputOptions;

    const mediaBackgroundObjData = this.getMediaBackgroundObjData(this.initialItemMedia, inputBackgroundOption) || {
      "@type": "schema:ImageObject",
      "schema:encodingFormat": '',
      "schema:name": '',
      "schema:contentUrl": ''
    };
    mediaBackgroundObjData['@type'] = 'schema:ImageObject';

    const media = this.initialItemMedia;

    return {
      imgUpldr: new ImageUpldr(),
      inputBackgroundOption,
      inputOptions,
      mediaBackgroundObjData,
      media
    }
  },
  methods: {

    getInputBackgroundOption(options) {
      if(!options || !options.length) return null;
      return options.find(option => option['schema:name'] === 'backgroundImage');
    },

    getMediaBackgroundObjData(media, inputBgOption) {
      if(!media || !media[inputBgOption['schema:value']]) return null;
      return media[inputBgOption['schema:value']];
    },

    getMediaDataFromURL(url) {
      const splitValuesFromURL = url.split('/');
      const name = splitValuesFromURL[splitValuesFromURL.length - 1];
      const splitNameValues = name.split('.');
      const encodingFormat = 'image/' + splitNameValues[splitNameValues.length - 1];
      return {
        "schema:encodingFormat": encodingFormat,
        "schema:name": name,
        "schema:contentUrl": url
      }
    },

    async onUploadImg(data) {
      try {
        this.$emit('error', '');
        setTimeout(() => { this.$emit('uploading', true); }, 2000);

        const media = {};

        if(typeof data === 'string') {
          this.onRemoveImg();
          this.inputBackgroundOption['schema:value'] = data;
        } else {
          const response = await this.imgUpldr.uploadImage(data);
          this.onRemoveImg();
          this.inputBackgroundOption['schema:value'] = response.location;
        }

        this.inputOptions.push(this.inputBackgroundOption);

        this.mediaBackgroundObjData = Object.assign(this.mediaBackgroundObjData, this.getMediaDataFromURL(this.inputBackgroundOption['schema:value']));
        this.media[this.inputBackgroundOption['schema:value']] = this.mediaBackgroundObjData;

        setTimeout(() => { 
          this.$emit('uploading', false);
          this.$emit('updateInputOptions', this.inputOptions);
          this.$emit('updateMedia', this.media);
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
      delete this.media[removingOptionImgUrl];

      this.inputBackgroundOption['schema:value'] = '';

      this.$emit('updateInputOptions', this.inputOptions);
      this.$emit('updateMedia', this.media);
    }

  }
}
</script>