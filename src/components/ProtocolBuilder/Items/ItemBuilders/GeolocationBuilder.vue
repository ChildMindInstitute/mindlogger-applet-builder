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

    <v-checkbox
      v-model="isSkippable"
      label="Skippable Item"
      :disabled="isSkippableItem == 2 || isOptionalText && responseOptions.isOptionalTextRequired"
    />
    <OptionalItemText
      :colClasses="'d-flex align-center'"
      :cols="12"
      :md="3"
      :sm="6"
      :text="isOptionalText"
      :required="responseOptions.isOptionalTextRequired"
      @text="isOptionalText = $event; $emit('updateOptionalText', isOptionalText)"
      @required="responseOptions.isOptionalTextRequired = $event; onUpdateResponseOptions();"
    />
  </div>
</template>

<script>
import Uploader from '../../Uploader.vue';
import OptionalItemText from '../../Partial/OptionalItemText.vue';

export default {
  components: {
    Uploader,
    OptionalItemText,
  },
  props: {
    initialItemResponseOptions: {
      type: Object,
      required: true,
    },
    initialIsOptionalText: {
      type: Boolean,
      default: false,
    },
    isSkippableItem: {
      type: Number,
      default: 0,
    },
  },
  data() {

    let responseOptions = {
      "schema:image": '',
      "isOptionalTextRequired": false,
    };
    responseOptions = Object.assign(responseOptions, this.initialItemResponseOptions);
    responseOptions['valueType'] = 'geolocation';

    return {
      isOptionalText: this.initialIsOptionalText,
      responseOptions,
    }
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