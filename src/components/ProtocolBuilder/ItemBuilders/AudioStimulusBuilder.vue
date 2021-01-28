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
      @onAddFromURL="isAddingFromURLProcess = true"
      @onRecordAudio="onOpenRecorder"
      @onAddAudio="loading = true; $event();"
      @onUploaded="loading = false; onUploadedAudio($event);"
      @onRemove="onRemoveAudio()"
      @onError="loading = false; notify = $event;"
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

    <v-dialog v-model="isAddingFromURLProcess" persistent width="800">
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
          <v-icon left large>mdi-link-variant-plus</v-icon>
          Add from URL
        </v-card-title>
        <v-card-text>
          <v-text-field label="URL" v-model="audioURL" />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-btn 
            outlined
            color="primary"
            @click="isAddingFromURLProcess = false"
          >
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn 
            color="primary"
            :disabled="!audioURL"
            @click="isAddingFromURLProcess = false; onAddFromURL();"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Audio URL Popup -->

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

    <Alert
      :loading="loading"
      :notify="notify"
    />
    <!-- Alert -->
    
  </v-form>
</template>

<script>
import Vue from 'vue';
import Uploader from '../Uploader.vue';
import AudioRecorder from 'vue-audio-recorder';
import Alert from '../Alert.vue';

Vue.use(AudioRecorder);

export default {
  components: {
    Uploader,
    AudioRecorder: AudioRecorder.AudioRecorder,
    AudioPlayer: AudioRecorder.AudioPlayer,
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

      isAddingFromURLProcess: false,
      audioURL: '',
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

    onAddFromURL() {
      const newAudio = new Audio(this.audioURL);

      newAudio.addEventListener('canplay', () => {
        this.url = this.audioURL;
        this.audio = this.url;
        this.audioURL = '';
        this.notify = {
          type: 'success',
          message: 'Audio successfully added to "AudioStimulus" Item',
        };
        this.update();
      });

      newAudio.addEventListener('error', () => {
        this.notify = {
          type: 'error',
          message: 'Please check if you use correct "audio" url.',
        };
      });
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

    onUploadedAudio(audioURL) {
      this.url = audioURL;
      this.audio = this.url;
      this.recordedAudioData = null;
      this.notify = {
        type: 'success',
        message: 'Audio successfully uploaded and added to "AudioStimulus" Item',
      };
      this.update();
    },

    onRemoveAudio() {
      this.url = '';
      this.audio = this.url;
      this.notify = {
        type: 'warning',
        message: 'Audio successfully removed from "AudioStimulus" Item',
      };
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