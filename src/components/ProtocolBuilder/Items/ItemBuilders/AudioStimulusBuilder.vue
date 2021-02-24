<template>
  <v-form ref="form">

    <v-text-field
      v-model="mediaObj['schema:transcript']"
      label="Media transcript"
      type="text"
      @change="onUpdateMedia"
    />

    <AudioPlayer
      v-if="asInputOption['schema:value']"
      class="audio-player mt-4 mb-5"
      style="max-width: 370px"
      :src="asInputOption['schema:value']"
    />

    <Uploader
      class="mt-4 mb-10"
      style="max-width: 300px"
      :initialType="'audio'"
      :initialAdditionalType="'stimulus'"
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
      @change="onUpdateAllow"
    />

    <v-checkbox
      v-model="replayInputOption['schema:value']"
      label="Media Replay Allowed"
      @change="onUpdateInputOptions"
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
import Uploader from '../../Uploader.vue';
import AudioRecorder from 'vue-audio-recorder';

Vue.use(AudioRecorder);

export default {
  components: {
    Uploader,
    AudioRecorder: AudioRecorder.AudioRecorder,
    AudioPlayer: AudioRecorder.AudioPlayer,
  },
  props: {
    initialItemInputOptions: {
      type: Array,
      default: new Array(),
    },
    initialItemMedia: {
      type: Object,
      default: new Object(),
    },
    isItemSkippable: {
      type: Boolean,
      default: false,
    },
  },
  data: function() {

    const inputOptions = this.initialItemInputOptions;
    const media = this.initialItemMedia;
    
    let asInputOption = {
      '@type': "schema:URL",
      'schema:name': 'stimulus',
      'schema:contentUrl': '',
      'schema:value': '',
    };

    asInputOption = this.getInputOption(inputOptions, asInputOption);

    let replayInputOption = {
      '@type': 'schema:Boolean',
      'schema:name': 'allowReplay',
      'schema:value': true,
    };

    replayInputOption = this.getInputOption(inputOptions, replayInputOption);

    let mediaObj = {
      '@type': 'schema:AudioObject',
      'schema:name': 'stimulus',
      'schema:contentUrl': '',
      'schema:transcript': '',
    };

    mediaObj = this.getMediaObject(asInputOption['schema:value'], media, mediaObj);

    return {
      inputOptions,
      media,

      asInputOption,
      replayInputOption,

      mediaObj,
      
      audio: asInputOption['schema:value'],

      isRecordProcess: false,
      isRecordProcessVisible: false,
      recordedAudioData: null,

      isSkippable: this.isSkippableItem,

      loading: false,
      notify: {},
    };
  },
  mounted() {
    this.onValidate();
  },
  methods: {

    getInputOption(options, inputOptionSchema) {
      const internalInputOption = options.find(option => option['schema:name'] === inputOptionSchema['schema:name']);

      if(internalInputOption) {
        return internalInputOption;
      } else {
        options.push(inputOptionSchema);
        return inputOptionSchema;
      }
    },

    getMediaObject(mediaUrl, media, mediaSchema) {
      const internalMedia = media[mediaUrl];

      if(internalMedia) return internalMedia;
      else return mediaSchema;
    },

    onUpdateAllow() {
      this.$emit('updateAllow', this.isSkippable);
    },

    onUpdateInputOptions() {
      this.$emit('updateInputOptions', this.inputOptions);
    },

    onUpdateMedia() {
      this.media = {};
      const audioUrl = this.asInputOption['schema:value'];
      if(audioUrl) {
        this.mediaObj['schema:contentUrl'] = audioUrl;
        this.media[audioUrl] = this.mediaObj;
      }
      this.$emit('updateMedia', this.media);
    },

    onValidate() {
      this.$emit('validation', this.asInputOption['schema:value'] ? true : false);
    },

    onAddAudioFromUrl(url) {
      this.asInputOption['schema:value'] = url;
      this.asInputOption['schema:contentUrl'] = url;
      this.audio = url;
      
      this.$emit('notify', {
        type: 'success',
        message: 'Audio from URL successfully added to AudioStimulus Item.',
        duration: 3000,
      });

      this.onUpdateInputOptions();
      this.onUpdateMedia();
      this.onValidate();
    },

    async onAddAudioFromDevice(uploadFunction) {
      try {
        this.asInputOption['schema:value'] = await uploadFunction();
        this.asInputOption['schema:contentUrl'] = this.asInputOption['schema:value'];
        this.audio = this.asInputOption['schema:value'];
        this.recordedAudioData = null;

        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'success',
          message: 'Audio successfully added to AudioStimulus Item.',
          duration: 3000,
        });
        
        this.onUpdateInputOptions();
        this.onUpdateMedia();
        this.onValidate();
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
      this.asInputOption['schema:value'] = '';
      this.asInputOption['schema:contentUrl'] = '';
      this.audio = '';

      this.$emit('notify', {
        type: 'warning',
        message: 'Audio successfully removed from AudioStimulus Item.',
        duration: 3000,
      });

      this.onUpdateInputOptions();
      this.onUpdateMedia();
      this.onValidate();
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