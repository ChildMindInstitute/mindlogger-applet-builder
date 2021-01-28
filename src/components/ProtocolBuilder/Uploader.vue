<template>
  <div>
    
    <v-alert v-if="!structureTypes.includes(initialType)" dense type="info">
      <p>Please choose what type of uploader you need.</p>
      <h5>Uploader types:</h5>
      <ul>
        <li v-for="type in structureTypes" :key="type">{{type}}</li>
      </ul>
      <p class="mt-3">Use :initialType=" 'type of uploader' " property to spicify what uploader to show</p>
    </v-alert>
    <!-- Showing when user did not specify what type of uploader to show -->

    <div v-if="initialType === 'image'">
      Img Uploader
    </div>
    <!-- Images Uploader Structure -->

    <div v-if="initialType === 'audio'">
      
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-header>
            {{ data ? 'Change' : 'Add' }} Audio
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="input-file-container">
              <input 
                class="file-input"
                type="file"
                ref="fileInput"
                accept="audio/mpeg, audio/ogg, audio/wav"
                @change="onChangeAudioFile"
              >
              <v-btn>
                Your computer
                <v-icon right>mdi-monitor</v-icon>
              </v-btn>
            </div>
            <v-btn 
              class="mt-4"
              @click="$emit('onAddFromURL')"
            >
              From URL
              <v-icon right>mdi-link-variant-plus</v-icon>
            </v-btn>
            <v-btn 
              class="mt-4"
              @click="$emit('onRecordAudio')"
            >
              Record
              <v-icon right>mdi-record-circle-outline</v-icon>
            </v-btn>
            <v-btn
              v-if="data"
              class="mt-4"
              color="error"
              @click="removeConfirm = true"
            >
              Remove Audio
            </v-btn>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

    </div>
    <!-- Audio Uploader Structure -->

    <v-dialog v-model="removeConfirm" persistent width="400">
      <v-alert
        border="left"
        colored-border
        type="error"
        elevation="2"
      >
        <v-row class="flex-column">
          <v-col class="grow">
            <h3>Are you sure you want to remove "{{this.initialType}}" from Item?</h3>
          </v-col>
          <v-col class="shrink d-flex justify-end">
            <v-btn
              @click="removeConfirm = false"
            >
              Cancel
            </v-btn>
            <v-btn 
              class="ml-4" 
              color="error"
              @click="onClickRemove"
            >
              Remove
            </v-btn>
          </v-col>
        </v-row>
      </v-alert>
    </v-dialog>
    <!-- Delete Confirmation Popup -->

  </div>
</template>

<script>
import Uploader from '../../models/Uploader';

export default {
  props: {
    initialType: {
      type: String,
      default: '',
    },
    initialAdditionalType: {
      type: String,
      default: '',
    },
    initialData: {
      type: [String, File],
      default: '',
    },
  },
  data() {
    const structureTypes = ['image', 'audio'];
    const uploader = new Uploader(this.initialType);

    return {
      structureTypes,
      uploader,
      data: this.initialData,
      removeConfirm: false,
    };
  },
  watch: {
    initialData() {
      if(this.data !== this.initialData) {
        this.data = this.initialData;

        if(this.initialType === 'audio')
          this.onChangeAudioFile(null, this.data);
      }
    }
  },
  methods: {

    async onChangeAudioFile(event, audioFile) {
      const file = event ? event.target.files[0] : audioFile;

      if(file && typeof file !== 'string') {
        this.data = file;
        this.$emit('onAddAudio', this.uploadFile);
      }

      if(event) event.target.value = '';
    },

    async uploadFile() {
      try {
        const response = await this.uploader.upload(this.data);
        this.data = response.location;
        this.$emit('onUploaded', this.data);
      } catch(err) {
        this.data = this.initialData;
        setTimeout(() => {
          this.$emit('onError', { 
            type: 'error', 
            message: `Something went wrong with uploading "${this.initialType}${this.initialAdditionalType ? ': ' + this.initialAdditionalType : ''}". Please try to upload again or just save Item without adding ${this.initialType}.`,
          });
        }, 1000);
      }
    },

    onClickRemove() {
      const inputRef = this.$refs['fileInput'];
      if(inputRef) inputRef.value = '';
      this.$emit('onRemove');
      this.data = '';
      this.removeConfirm = false;
    },

  },
}
</script>

<style lang="scss" scoped>
.v-expansion-panel-content .v-btn { width: 100%; }

.input-file-container {
  position: relative;

  .file-input, .file-input:after {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    border-radius: 4px;
    z-index: 1;
    opacity: 0;
  }

  .file-input {
    &:after {
      content: '';
      cursor: pointer;
    }

    &:hover + .v-btn:before {
      opacity: 0.08;
    }
  }

}

.v-dialog .v-alert {
  margin-bottom: 0px;
}

</style>