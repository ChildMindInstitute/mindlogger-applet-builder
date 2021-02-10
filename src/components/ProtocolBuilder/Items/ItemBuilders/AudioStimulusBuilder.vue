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
  </v-form>
</template>

<script>
export default {
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
      urlRules: [v => !!v || "Media URL cannot be empty"]
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
    }
  }
};
</script>