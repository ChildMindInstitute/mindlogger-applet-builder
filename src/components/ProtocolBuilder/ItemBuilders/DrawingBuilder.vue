<template>
  <div>
    <p>Users will be prompted to draw an image.</p>
    <ImageUploader
      class="mt-7 mb-4"
      style="max-width: 300px"
      :uploadFor="'drawing-item-bg'"
      :itemImg="inputBackgroundOption.value"
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
    }
  },
  data: function () {

    console.log(this.initialItemInputOptions);

    const inputBackgroundOption = this.getInputBackgroundOption(this.initialItemInputOptions) || {
      type: 'URL',
      name: 'backgroundImage',
      value: ''
    };

    inputBackgroundOption.type = 'URL';

    const inputOptions = this.initialItemInputOptions.length ? this.initialItemInputOptions : [ inputBackgroundOption ];

    return {
      imgUpldr: new ImageUpldr(),
      inputBackgroundOption,
      inputOptions
    }
  },
  methods: {

    getInputBackgroundOption(options) {
      if(!options || !options.length) return null;
      return options.find(option => option.name === 'backgroundImage');
    },

    createMediaObj(file, url) {
      const mediaObject = {
        "@type": "schema:ImageObject",
        "schema:encodingFormat": file.type,
        "schema:name": file.name,
        "schema:contentUrl": url
      };

      return mediaObject;
    },

    async onUploadImg(data) {
      try {
        this.$emit('error', '');
        setTimeout(() => { this.$emit('uploading', true); }, 2000);

        const media = {};

        if(typeof data === 'string') {
          this.inputBackgroundOption.value = data;
        } else {
          const response = await this.imgUpldr.uploadImage(data);
          this.inputBackgroundOption.value = response.location;
          media[`${response.location}`] = this.createMediaObj(data, response.location);
        }

        setTimeout(() => { 
          this.$emit('uploading', false);
          this.$emit('updateInputOptions', this.inputOptions);
          this.$emit('updateMedia', media);
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
      this.inputBackgroundOption.value = '';
    }

  }
}
</script>