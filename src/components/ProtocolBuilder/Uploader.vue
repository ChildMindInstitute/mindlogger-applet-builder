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
                @change="onAddFromDevice($event, null)"
              >
              <v-btn>
                Your computer
                <v-icon right>mdi-monitor</v-icon>
              </v-btn>
            </div>
            <v-btn 
              class="mt-4"
              @click="isAddingFromUrl = true"
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

    <AddFromUrl
      :show="isAddingFromUrl"
      @add="onAddFromUrl"
      @cancel="isAddingFromUrl = false"
    />
    <!-- Add From Url Popup -->

    <v-dialog v-model="removeConfirm" persistent width="400">
      <v-alert
        border="left"
        colored-border
        type="error"
        elevation="2"
      >
        <v-row class="flex-column">
          <v-col class="grow">
            <h3>Are you sure you want to remove {{this.initialType}}?</h3>
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
import { Uploader, isAudioUrlValid } from '../../models/Uploader';
import AddFromUrl from './Additional/AddFromUrl.vue';

export default {
  components: {
    AddFromUrl,
  },
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
      isAddingFromUrl: false,
      removeConfirm: false,
    };
  },
  watch: {
    initialData() {
      const type = typeof this.initialData;
     
      if(type === 'string' && this.initialData !== this.data) {
        this.onAddFromUrl(this.initialData);
      } else if(type === 'object' && this.initialData.name !== this.data.name) {
        this.onAddFromDevice(null, this.initialData);
      }
    }
  },
  methods: {

    async onAddFromUrl(url) {
      try {
        if(this.initialType === 'audio') await isAudioUrlValid(url);

        this.data = url;
        this.isAddingFromUrl = false;
        this.$emit('onAddFromUrl', this.data);
      } catch (error) {
        this.$emit('onNotify', error);
      }
    },

    async onAddFromDevice(event, externalFile) {
      const file = event ? event.target.files[0] : externalFile;
      if(!file) return;
      if(event) event.target.value = '';

      this.data = file;
      this.$emit('onAddFromDevice', this.upload);
    },

    async upload() {
      return new Promise((resolve, reject) => {
        this.uploader.upload(this.data)
          .then(response => { 
            this.data = response.location;
            resolve(this.data);
          })
          .catch(err => {
            this.data = this.initialData;
            setTimeout(() => reject('Something went wrong with uploading.'), 1000);
          });
      });
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