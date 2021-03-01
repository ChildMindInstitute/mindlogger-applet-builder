<template>
  <div>
    <p>
      Users will be prompted to grant access to their location. Latitude and longitude will be recorded.
    </p>
    <Uploader
      class="my-5"
      style="max-width: 300px"
      :initialType="'image'"
      :initialData="responseOptions['schema:image']"
      :initialTitle="'Geolocation Image'"
      @onAddFromUrl="onAddGeoImageFromUrl($event)"
      @onAddFromDevice="$emit('loading', true); onAddGeoImageFromDevice($event);"
      @onRemove="onRemoveGeoImage()"
      @onNotify="$emit('loading', false); $emit('notify', $event);"
    />
  </div>
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
  },
  data() {

    let responseOptions = {
      "schema:image": '',
    };
    responseOptions = Object.assign(responseOptions, this.initialItemResponseOptions);
    responseOptions['valueType'] = 'geolocation';

    return {
      responseOptions
    }
  },
  methods: {

    onUpdateResponseOptions() {
      this.$emit('updateResponseOptions', this.responseOptions);
    },

    onAddGeoImageFromUrl(url) {
      this.responseOptions['schema:image'] = url;
      this.onUpdateResponseOptions();
      this.$emit('notify', {
        type: 'success',
        message: 'Image from URL successfully added to Geolocation Item.',
        duration: 3000,
      });
    },
    
    async onAddGeoImageFromDevice(uploadFunction) {
      try {
        this.responseOptions['schema:image'] = await uploadFunction();
        this.onUpdateResponseOptions();
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'success',
          message: 'Image successfully added to Geolocation Item.',
          duration: 3000,
        });
      } catch (error) {
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'error',
          message: 'Something went wrong with uploading image for Item > Geolocation. Please try to upload again or just save Geolocation without image changes.',
        });
      }
    },

    onRemoveGeoImage() {
      this.responseOptions['schema:image'] = '';
      this.onUpdateResponseOptions();
      this.$emit('notify', {
        type: 'warning',
        message: 'Image successfully removed from Geolocation Item.',
        duration: 3000,
      });
    },

  },
}
</script>