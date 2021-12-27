<template>
  <div>
    <v-alert
      v-if="!structureTypes.includes(initialType)"
      dense
      type="info"
    >
      <p>Please choose what type of uploader you need.</p>
      <h5>Uploader types:</h5>
      <ul>
        <li
          v-for="structureType in structureTypes"
          :key="structureType"
        >
          {{ structureType }}
        </li>
      </ul>
      <p class="mt-3">
        Use :initialType=" 'type of uploader' " property to spicify what uploader to show
      </p>
    </v-alert>
    <!-- Showing when user did not specify what type of uploader to show -->

    <div v-else>
      <v-tooltip
        right
        v-if="initialAdditionalType === 'list'"
      >
        <template v-slot:activator="{ on }">
          <v-list-group v-on="on">
            <template v-slot:activator>
              <v-list-item-action>
                <v-checkbox
                  disabled
                  :input-value="initialData.length > 0"
                />
              </v-list-item-action>
              <v-list-item-title>Add Image</v-list-item-title>
            </template>

            <v-list-item
              class="v-file-input-list-item"
            >
              <div class="input-file-container">
                <input
                  ref="fileInput"
                  class="file-input"
                  type="file"
                  accept="image/jpeg, image/png, image/gif, image/bmp"
                  @change="onAddFromDevice($event, null)"
                >
                <v-list-item-title
                  class="v-list-item-title d-flex align-center px-4"
                >
                  Your computer
                  <v-icon right>
                    mdi-monitor
                  </v-icon>
                </v-list-item-title>
              </div>
            </v-list-item>


            <v-list-item>
              <v-list-item-title
                class="px-4"
                @click="isAddingFromUrl = true"
              >
                From URL
                <v-icon right>
                  mdi-link-variant-plus
                </v-icon>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="uploadData"
              @click="removeConfirm = true"
            >
              <v-list-item-title
                class="px-4"
                style="color: #ff5252"
              >
                Remove
              </v-list-item-title>
            </v-list-item>
          </v-list-group>
        </template>

        <span>
          <p>Image Requirements</p>
          <ul>
            <li>Size: less than 8MB</li>
            <li>Format: JPEG and PNG</li>
            <li>Width: between 100px and 1920px</li>
            <li>Height: between 100px and 1920px</li>
          </ul>
        </span>
      </v-tooltip>

      <v-expansion-panels
        v-else-if="initialAdditionalType !== 'small-circle'"
      >
        <v-expansion-panel>
          <v-expansion-panel-header>
            {{ uploadData ? 'Change' : 'Add' }} {{ initialTitle }}
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="input-file-container">
              <input
                ref="fileInput"
                class="file-input"
                type="file"
                :accept="getFileFormats(initialType)"
                @change="onAddFromDevice($event, null)"
              >

              <v-btn @click="$refs.fileInput.click()">
                Your computer
                <v-icon right>
                  mdi-monitor
                </v-icon>
              </v-btn>
            </div>
            <v-btn
              class="mt-4"
              @click="isAddingFromUrl = true"
            >
              From URL
              <v-icon right>
                mdi-link-variant-plus
              </v-icon>
            </v-btn>

            <v-btn
              v-if="initialType === 'audio'"
              class="mt-4"
              @click="$emit('onRecordAudio')"
            >
              Record
              <v-icon right>
                mdi-record-circle-outline
              </v-icon>
            </v-btn>
            <!-- /if initialType === 'audio' -->

            <v-btn
              v-if="uploadData && initialAdditionalType !== 'stimulus'"
              class="mt-4"
              color="error"
              @click="removeConfirm = true"
            >
              Remove
            </v-btn>

            <div
              v-if="initialType === 'image'"
              class="mt-4 text-right"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    color="primary"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  >
                    mdi-information-outline
                  </v-icon>
                </template>
                <span>
                  <p>Image Requirements</p>
                  <ul>
                    <li>Size: less than 8MB</li>
                    <li>Format: JPEG and PNG</li>
                    <li>Width: between 100px and 1920px</li>
                    <li>Height: between 100px and 1920px</li>
                  </ul>
                </span>
              </v-tooltip>
            </div>
            <div
              v-else-if="initialType === 'video_or_image'"
              class="mt-4 text-right"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    color="primary"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  >
                    mdi-information-outline
                  </v-icon>
                </template>
                <span>
                  <p>Image Requirements</p>
                  <ul>
                    <li>Size: less than 8MB</li>
                    <li>700px * 1000px size is required</li>
                  </ul>
                </span>
              </v-tooltip>
            </div>
            <div
              v-else-if="initialType === 'video'"
              class="mt-4 text-right"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    color="primary"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  >
                    mdi-information-outline
                  </v-icon>
                </template>
                <span>
                  <p>Requirements</p>
                  <ul>
                    <li>Size: less than 100MB</li>
                    <li>Format: MP4 and GIF</li>
                  </ul>
                </span>
              </v-tooltip>
            </div>
            <div
              v-else-if="initialType === 'audio'"
              class="mt-4 text-right"
            >
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    color="primary"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  >
                    mdi-information-outline
                  </v-icon>
                </template>
                <span>
                  <p>Requirements</p>
                  <ul>
                    <li>Format: MP3 and WAV</li>
                  </ul>
                </span>
              </v-tooltip>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <!-- default structure -->

      <v-menu
        v-if="initialType === 'image' && initialAdditionalType === 'small-circle'"
        offset-y
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            icon
            v-on="on"
          >
            <v-icon
              :color="uploadData ? 'primary' : ''"
            >
              mdi-image-search
            </v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            class="v-file-input-list-item"
          >
            <div class="input-file-container">
              <input
                ref="fileInput"
                class="file-input"
                type="file"
                accept="image/jpeg, image/png, image/gif, image/bmp"
                @change="onAddFromDevice($event, null)"
              >
              <v-list-item-title
                class="v-list-item-title d-flex align-center"
              >
                Your computer
                <v-icon right>
                  mdi-monitor
                </v-icon>
              </v-list-item-title>
            </div>
          </v-list-item>

          <v-list-item
            @click="isAddingFromUrl = true"
          >
            <v-list-item-title
              class="d-flex align-center"
            >
              From URL
              <v-icon right>
                mdi-link-variant-plus
              </v-icon>
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            v-if="uploadData"
            @click="removeConfirm = true"
          >
            <v-list-item-title
              style="color: #ff5252"
            >
              Remove
            </v-list-item-title>
          </v-list-item>

          <div
            class="text-right px-2"
          >
            <v-tooltip right>
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  color="primary"
                  dark
                  v-bind="attrs"
                  v-on="on"
                >
                  mdi-information-outline
                </v-icon>
              </template>
              <span>
                <p>Image Requirements</p>
                <ul style="max-width: 248px">
                  <li>Size: less than 8MB</li>
                  <li>Format: JPEG and PNG</li>
                  <li>Width: between 100px and 1920px</li>
                  <li>Height: between 100px and 1920px</li>
                  <li v-if="imageType === 'watermark'">
                    Translucency of the image should already be completed prior to upload
                  </li>
                </ul>
              </span>
            </v-tooltip>
          </div>
        </v-list>
      </v-menu>
      <!-- small-circle structure -->
    </div>
    <!-- Image/Audio Uploader Structure -->

    <AddFromUrl
      :show="isAddingFromUrl"
      @add="onAddFromUrl"
      @cancel="isAddingFromUrl = false"
    />
    <!-- Add From Url Popup -->

    <v-dialog
      v-model="removeConfirm"
      persistent
      width="400"
    >
      <v-alert
        border="left"
        colored-border
        type="error"
        elevation="2"
      >
        <v-row class="flex-column">
          <v-col class="grow">
            <h3>Are you sure you want to remove {{ initialTitle }}?</h3>
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
import { Uploader, isSplashImageValid, isAudioUrlValid, isImageValid, isVideoUrlValid } from '../../models/Uploader';
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
    imageType: {
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
    initialTitle: {
      type: String,
      default: '',
    }
  },
  data() {
    const structureTypes = ['image', 'audio', 'video', 'video_or_image'];
    const uploader = new Uploader(this.initialType);

    return {
      structureTypes,
      uploader,
      uploadData: this.initialData,
      isAddingFromUrl: false,
      removeConfirm: false,
    };
  },
  watch: {
    initialData() {
      if(!this.initialData) {
        this.uploadData = this.initialData;
        return;
      };

      const type = typeof this.initialData;

      if(type === 'string' && this.initialData !== this.uploadData) {
        this.onAddFromUrl(this.initialData);
      } else if(type === 'object' && this.initialData.name !== this.uploadData.name) {
        this.onAddFromDevice(null, this.initialData);
      }
    }
  },
  methods: {
    async onAddFromUrl(url) {
      try {
        if(this.initialType === 'audio') await isAudioUrlValid(url);
        else if(url.match(/\.(jpeg|jpg|gif|png)$/) != null) await isImageValid(url);
        else await isVideoUrlValid(url);

        this.uploadData = url;
        this.isAddingFromUrl = false;
        this.$emit('onAddFromUrl', this.uploadData);
      } catch (error) {
        this.$emit('onNotify', {
          type: 'error',
          message: error,
        });
      }
    },

    async onAddFromDevice(event, externalFile) {
      const file = event ? event.target.files[0] : externalFile;
      if(!file) return;
      if(event) event.target.value = '';

      try {
        if (this.initialType === 'image') await isImageValid(file);
        if (this.imageType === 'splash' && file.type.match(/(jpeg|jpg|png)$/) != null) await isSplashImageValid(file);

        this.uploadData = file;
        this.$emit('onAddFromDevice', this.upload);
      } catch (error) {
        this.$emit('onNotify', {
          type: 'error',
          message: error,
        });
      }
    },

    async upload() {
      return new Promise((resolve, reject) => {
        this.uploader.upload(this.uploadData)
          .then(response => {
            this.uploadData = response.location;
            resolve(this.uploadData);
          })
          .catch(err => {
            this.uploadData = this.initialData;
            setTimeout(() => reject('Something went wrong with uploading.'), 1000);
          });
      });
    },

    getFileFormats (type) {
      if (type === 'audio') {
        return "audio/mpeg, audio/ogg, audio/wav";
      }
      if (type === 'image') {
        return "image/jpeg, image/png, image/bmp"
      }
      if (type === 'video') {
        return "video/*, image/gif"
      }
      if (type === 'video_or_image') {
        return "video/*, image/gif, image/jpeg, image/png, image/bmp";
      }
      return "";
    },

    onClickRemove() {
      const inputRef = this.$refs['fileInput'];
      if(inputRef) inputRef.value = '';
      this.$emit('onRemove');
      this.uploadData = '';
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

.v-file-input-list-item {
  padding: 0px;
  min-height: auto;
}

.v-file-input-list-item .input-file-container {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 16px;
  padding-right: 16px;
  min-height: 48px;
  background-color: transparent;
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.v-file-input-list-item .input-file-container:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

</style>