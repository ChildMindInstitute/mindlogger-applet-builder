<template>
  <v-form ref="form" v-model="valid">
    <v-text-field
      v-model="url"
      label="Media URL"
      type="text"
      :disabled="!isItemEditable"
      :rules="urlRules"
      @change="update"
    />
    <v-text-field
      v-if="isItemEditable"
      v-model="transcript"
      label="Media transcript"
      type="text"
      @change="update"
    />

    <Uploader
      class="mt-4 mb-10"
      style="max-width: 300px"
      :initialType="'audio'"
      :initialData="''"
      @onAdd="$event(); loading = true;"
      @onUploaded="loading = false; onUploadedAudio($event);"
      @onRemove="onRemoveAudio()"
      @onError="loading = false; notify = $event;"
    />

    <v-checkbox
      v-model="isSkippable"
      label="Skippable Item"
      :disabled="!isItemEditable"
      @change="updateAllow"
    />
    <v-checkbox
      v-model="allowReplay"
      label="Media Replay Allowed"
      :disabled="!isItemEditable"
      @change="update"
    />

    <Alert
      :loading="loading"
      :notify="notify"
    />
  </v-form>
</template>

<script>
import Uploader from '../Uploader.vue';
import Alert from '../Alert.vue';

export default {
  components: {
    Uploader,
    Alert,
  },
  props: {
    initialItemData: {
      type: Object,
      required: true
    },
    isItemEditable: {
      type: Boolean,
      default: true
    },
    initialItemInputOptions: {
      type: Object,
      required: true
    },
    isSkippableItem: {
      type: Boolean,
      default: false,
    },
    initialItemMedia: {
      type: Object,
      required: true
    }
  },
  data: function() {
    return {
      url:
        this.initialItemData.url || Object.keys(this.initialItemMedia)[0] || "",
      transcript: Object.keys(this.initialItemMedia)[0]
        ? this.initialItemMedia[Object.keys(this.initialItemMedia)[0]][
            "schema:transcript"
          ]
        : "",
      allowReplay: Array.isArray(this.initialItemInputOptions)
        ? this.initialItemInputOptions[1]["schema:value"]
        : true,
      isSkippable: this.isSkippableItem || false,
      valid: true,
      urlRules: [v => !!v || "Media URL cannot be empty"],
      loading: false,
      notify: {},
    };
  },
  methods: {
    update() {
      const inputOptions = [
        {
          "@type": "schema:URL",
          "schema:name": "stimulus",
          "schema:value": this.url,
          "schema:contentUrl": this.url
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "allowReplay",
          "schema:value": this.allowReplay
        }
      ];
      this.$emit("updateInputOptions", inputOptions);

      const media = {};
      media[this.url] = {
        "@type": "schema:AudioObject",
        "schema:name": "stimulus",
        "schema:contentUrl": this.url,
        "schema:transcript": this.transcript
      };
      this.$emit("updateMedia", media);
    },
    updateAllow() {
      const allow = this.isSkippable
      this.$emit('updateAllow', allow);
    },

    onUploadedAudio(audioURL) {
      console.log(audioURL);
      this.notify = {
        type: 'success',
        message: 'Audio successfully uploaded and added to "AudioStimulus" Item',
      };
    },

    onRemoveAudio() {
      this.notify = {
        type: 'warning',
        message: 'Audio successfully removed from "AudioStimulus" Item',
      };
    }

  }
};
</script>