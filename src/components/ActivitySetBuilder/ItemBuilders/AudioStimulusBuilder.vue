<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <v-text-field
      v-model="url"
      label="Media URL"
      type="text"
      :rules="urlRules"
      @change="update"
    />
    <v-text-field
      v-model="transcript"
      label="Media transcript"
      type="text"
      @change="update"
    />
    <v-switch
      v-model="allowReplay"
      label="Media Replay Allowed"
      @change="update"
    />
  </v-form>
</template>

<script>
export default {
  data: () => ({
    url: '',
    allowReplay: true,
    transcript: '',
    valid: true,
    urlRules: [
      v => !!v || 'Media URL cannot be empty',
    ],
  }),
  methods: {
    update () {
      const inputOptions =  [
        {
          "@type": "schema:URL",
          "schema:name": "stimulus",
          "schema:value": this.url,
          "schema:contentUrl": this.url,
        },
        {
          "@type": "schema:Boolean",
          "schema:name": "allowReplay",
          "schema:value": this.allowReplay
        },
      ];
      this.$emit('updateInputOptions', inputOptions);

      const media = {};
      media[this.url] = {
        "@type": "schema:AudioObject",
        "schema:name": "stimulus",
        "schema:contentUrl": this.url,
        "schema:transcript": this.transcript,
      };
      this.$emit('updateMedia', media);
    },
  }
}
</script>