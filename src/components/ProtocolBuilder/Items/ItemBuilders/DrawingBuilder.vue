<template>
  <div>
    <Uploader
      class="my-5"
      style="max-width: 300px"
      :initialType="'image'"
      :initialData="responseOptions['schema:image']"
      :initialTitle="'Draw Image'"
      @onAddFromUrl="onAddDrawImageFromUrl($event, '')"
      @onAddFromDevice="$emit('loading', true); onAddDrawImageFromDevice($event, '');"
      @onRemove="onRemoveDrawImage('')"
      @onNotify="$emit('loading', false); $emit('notify', $event);"
    />
    <p>Users will be prompted to draw an image.</p>
    <Uploader
      class="my-5"
      style="max-width: 300px"
      :initialType="'image'"
      :initialData="inputBackgroundOption['schema:value']"
      :initialTitle="'Draw Background Image'"
      @onAddFromUrl="onAddDrawImageFromUrl($event, 'Background')"
      @onAddFromDevice="$emit('loading', true); onAddDrawImageFromDevice($event, 'Background');"
      @onRemove="onRemoveDrawImage('Background')"
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
    initialItemInputOptions: {
      type: Array,
      required: true
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
  data: function () {

    let responseOptions = {
      "schema:image": '',
      "isOptionalTextRequired": false,
    };
    responseOptions = Object.assign(responseOptions, this.initialItemResponseOptions);
    responseOptions['valueType'] = 'drawing';

    let inputBackgroundOption = { 'schema:value': '' };
    inputBackgroundOption = Object.assign(inputBackgroundOption, this.getInputBackgroundOption(this.initialItemInputOptions));
    inputBackgroundOption['@type'] = 'schema:URL';
    inputBackgroundOption['schema:name'] = 'backgroundImage';

    const inputOptions = this.initialItemInputOptions;

    return {
      responseOptions,
      inputBackgroundOption,
      inputOptions,
      isOptionalText: this.initialIsOptionalText,
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

    onUpdateInputOptions() {
      this.$emit('updateInputOptions', this.inputOptions);
    },

    getInputBackgroundOption(options) {
      if(!options || !options.length) return null;
      return options.find(option => option['schema:name'] === 'backgroundImage');
    },

    updateImage(url) {
      this.responseOptions['schema:image'] = url;
      this.onUpdateResponseOptions();
    },

    updateBackgroundImage(url) {
      const removingOptionImgUrl = this.inputBackgroundOption['schema:value'];
      const removingOptionIndex = this.inputOptions.indexOf(option => option['schema:value'] === removingOptionImgUrl);
      this.inputOptions.splice(removingOptionIndex, 1);
      this.inputBackgroundOption['schema:value'] = url;
      if(url) this.inputOptions.push(this.inputBackgroundOption);
      this.onUpdateInputOptions();
    },

    onAddDrawImageFromUrl(url, type) {
      if(type === 'Background') this.updateBackgroundImage(url);
      else this.updateImage(url);
      this.$emit('notify', {
        type: 'success',
        message: `${type} Image from URL successfully added to Geolocation Item.`,
        duration: 3000,
      });
    },

    async onAddDrawImageFromDevice(uploadFunction, type) {
      try {
        const uploadedImageUrl = await uploadFunction();
        if(type === 'Background') this.updateBackgroundImage(uploadedImageUrl);
        else this.updateImage(uploadedImageUrl);
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'success',
          message: `${type} Image successfully added to Draw Item.`,
          duration: 3000,
        });
      } catch (error) {
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'error',
          message: `Something went wrong with uploading image for Item > ${type} Draw image. Please try to upload again or just save Draw without image changes.`,
        });
      }
    },

    onRemoveDrawImage(type) {
      if(type === 'Background') this.updateBackgroundImage('');
      else this.updateImage('');
      this.$emit('notify', {
        type: 'warning',
        message: `${type} Image successfully removed from Geolocation Item.`,
        duration: 3000,
      });
    },

  }
}
</script>