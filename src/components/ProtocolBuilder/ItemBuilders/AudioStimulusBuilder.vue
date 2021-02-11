<template>
  <v-form ref="form" v-model="valid">

    <v-text-field
      v-if="isItemEditable"
      v-model="transcript"
      label="Media transcript"
      type="text"
      @change="update"
    />

    <AudioPlayer
      v-if="url"
      class="audio-player mt-4 mb-5"
      style="max-width: 370px"
      :src="url"
    />

    <Uploader
      class="mt-4 mb-10"
      style="max-width: 300px"
      :initialType="'audio'"
      :initialData="audio"
      :initialTitle="'Stimulus Audio'"
      @onAddFromUrl="onAddAudioFromUrl($event)"
      @onAddFromDevice="$emit('loading', true); onAddAudioFromDevice($event);"
      @onRecordAudio="onOpenRecorder"
      @onRemove="onRemoveAudio()"
      @onNotify="$emit('loading', false); $emit('notify', $event);"
    />
    <!-- Audio Uploader -->

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

    <v-dialog
      v-model="isRecordProcess"
      persistent
      width="420"
    >
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
          <v-icon left large>mdi-record-circle-outline</v-icon>
          Record Audio
        </v-card-title>
        <v-card-text :style="{ 'opacity': isRecordProcessVisible ? '1' : '0' }">
          <AudioRecorder
            class="audio-recorder"
            :show-download-button="false"
            :show-upload-button="false"
            :after-recording="onRecordedAudio"
          />
          <AudioPlayer
            v-if="recordedAudioData"
            class="audio-player"
            :src="recordedAudioData.url" 
          />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-btn 
            outlined
            color="primary"
            @click="isRecordProcess = false"
          >
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn 
            color="primary"
            :disabled="!recordedAudioData"
            @click="isRecordProcess = false; onUploadRecordedAudio();"
          >
            Upload
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Audio Record Popup -->
    
  </v-form>
</template>

<script>
import Vue from 'vue';
import Uploader from '../Uploader.vue';
import AudioRecorder from 'vue-audio-recorder';

Vue.use(AudioRecorder);

export default {
  components: {
    Uploader,
    AudioRecorder: AudioRecorder.AudioRecorder,
    AudioPlayer: AudioRecorder.AudioPlayer,
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
      type: Array,
      required: true,
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
      allowReplay: this.initialItemInputOptions[1]
        ? this.initialItemInputOptions[1]["schema:value"]
        : true,
      isSkippable: this.isSkippableItem || false,
      valid: true,
      urlRules: [v => !!v || "Media URL cannot be empty"],

      isRecordProcess: false,
      isRecordProcessVisible: false,
      recordedAudioData: null,
      audio: this.url,
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

    onAddAudioFromUrl(url) {
      this.url = url;
      this.audio = this.url;
      this.$emit('notify', {
        type: 'success',
        message: 'Audio from URL successfully added to AudioStimulus Item.',
        duration: 3000,
      });
      this.update();
    },

    async onAddAudioFromDevice(uploadFunction) {
      try {
        this.url = await uploadFunction();
        this.audio = this.url;
        this.recordedAudioData = null;
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'success',
          message: 'Audio successfully added to AudioStimulus Item.',
          duration: 3000,
        });
        this.update();
      } catch (error) {
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'error',
          message: 'Something went wrong with uploading audio for AudioStimulus Item. Please try to upload again or just save AudioStimulus Item without changes for audio.',
        });
      }
    },

    onOpenRecorder() {
      // this function for plugin customization
      this.isRecordProcess = true;

      setTimeout(() => { 
        this.isRecordProcessVisible = true;

        const audioRecorderEl = document.querySelector('.audio-recorder');
        if(!audioRecorderEl) return;

        const arRecordsEl = audioRecorderEl.querySelector('.ar-records');
        if(arRecordsEl) arRecordsEl.style.display = 'none';

        const arPlayerEl = audioRecorderEl.querySelector('.ar-player');
        if(arPlayerEl) arPlayerEl.style.display = 'none';
      }, 100);
    },

    onRecordedAudio(data) {
      this.recordedAudioData = data;
    },

    onUploadRecordedAudio() {
      const audioFile = new File([this.recordedAudioData.blob], 'audio' + Date.now(), { type: this.recordedAudioData.blob.type });
      this.audio = audioFile;
    },

    onRemoveAudio() {
      this.url = '';
      this.audio = this.url;
      this.$emit('notify', {
        type: 'warning',
        message: 'Audio successfully removed from AudioStimulus Item.',
        duration: 3000,
      });
      this.update();
    }

  }
};
</script>

<style lang="scss" scoped>

.audio-recorder,
.audio-player {
  width: 100%;
}

.audio-recorder {
  height: 150px;
  padding-top: 30px;
  box-shadow: none;
  background-color: transparent;
  overflow-y: hidden;
}

</style>