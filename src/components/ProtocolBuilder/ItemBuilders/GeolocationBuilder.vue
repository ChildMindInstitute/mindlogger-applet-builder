<template>
  <div>
  <p>
    Users will be prompted to grant access to their location. Latitude and longitude will be recorded.
  </p>
  <ImageUploader
    class="my-5"
    style="max-width: 300px"
    :uploadFor="'default-item'"
    :itemImg="responseOptions['schema:image']"
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
    ImageUploader,
  },
  props: {
    initialItemResponseOptions: {
      type: Object,
      required: true,
    },
  },
  data() {

    let responseOptions = {
      "schema:image": '',
    };
    responseOptions = Object.assign(responseOptions, this.initialItemResponseOptions);
    responseOptions['valueType'] = 'geolocation';

    return {
      imgUpldr: new ImageUpldr(),
      responseOptions
    }
  },
  methods: {

    onUpdateResponseOptions() {
      this.$emit('updateResponseOptions', this.responseOptions);
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
          this.$emit('error', 'Something went wrong with uploading image for "Geolocation" item. Please try to upload image again...');
        }, 2000);
      }
    },

    onRemoveImg() {
      this.$emit('error', '');
      this.responseOptions['schema:image'] = '';
      this.onUpdateResponseOptions();
    },

  },
}
</script>