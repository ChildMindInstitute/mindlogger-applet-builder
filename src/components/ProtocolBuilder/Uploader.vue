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
                <v-radio-group
                  :value="initialData.length > 0 ? 'checked' : 'unchecked'"
                >
                  <v-radio
                    disabled
                    value="checked"
                  />
                </v-radio-group>
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


            <v-list-item class="from-url">
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

            <v-tooltip v-if="uploadData" right>
              <template v-slot:activator="{ on, attrs }">
                <div
                  class="d-flex"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon
                    color="primary"
                    dark
                    class="mx-1 d-flex"
                  >
                    mdi-image
                  </v-icon>
                  <div @click="downloadImage" class="mr-4">{{ getFileName(fileName, false) }}</div>
                </div>
              </template>
              <span>
                <div>{{ getFileName(fileName) }}</div>
              </span>
            </v-tooltip>
          </v-list-group>
        </template>

        <span>
          <p>Image Requirements</p>
          <ul>
            <li>Size: less than 8MB</li>
            <li>Format: JPEG and PNG</li>
            <li>Portrait-oriented and have at least 800px width for mobile users</li>
            <li>At least 1000px width for tablet users</li>
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
              <v-tooltip v-if="uploadData" right>
                <template v-slot:activator="{ on, attrs }">
                  <div
                    class="d-flex"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon
                      color="primary"
                      dark
                      class="d-flex"
                    >
                      mdi-image
                    </v-icon>
                    <div @click="downloadImage" class="mr-4">{{ getFileName(fileName, false) }}</div>
                  </div>
                </template>
                <span>
                  <div>{{ getFileName(fileName) }}</div>
                </span>
              </v-tooltip>
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
              class="mt-4 text-right d-flex px-2"
              :class="uploadData ? 'justify-space-between' : 'justify-end'"
            >
              <v-tooltip v-if="uploadData" right>
                <template v-slot:activator="{ on, attrs }">
                  <div
                    class="d-flex"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon
                      color="primary"
                      dark
                      class="d-flex"
                    >
                      mdi-image
                    </v-icon>
                    <div @click="downloadImage" class="mr-4">{{ getFileName(fileName, false) }}</div>
                  </div>
                </template>
                <span>
                  <div>{{ getFileName(fileName) }}</div>
                </span>
              </v-tooltip>
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
            class="d-flex px-2"
            :class="uploadData ? 'justify-space-between' : 'justify-end'"
          >
            <v-tooltip v-if="uploadData" right>
              <template v-slot:activator="{ on, attrs }">
                <div
                  class="d-flex"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon
                    color="primary"
                    dark
                    class="d-flex"
                  >
                    mdi-image
                  </v-icon>
                  <div @click="downloadImage" class="mr-4">{{ getFileName(fileName, false) }}</div>
                </div>
              </template>
              <span>
                <div>{{ getFileName(fileName) }}</div>
              </span>
            </v-tooltip>

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
      v-model="isAddingFromUrl"
      @add="onAddFromUrl"
      @cancel="isAddingFromUrl = false"
    />
    <!-- Add From Url Popup -->
    <v-dialog
      v-model="closeConfirm"
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
            <h3>Are you sure you want to close without saving the image?</h3>
          </v-col>
          <v-col class="shrink d-flex justify-end">
            <v-btn
              @click="closeConfirm = false"
            >
              No
            </v-btn>
            <v-btn
              class="ml-4"
              color="error"
              @click="onCloseCropping"
            >
              Yes
            </v-btn>
          </v-col>
        </v-row>
      </v-alert>
    </v-dialog>

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

    <!-- Image cropping tool -->
    <v-dialog
      v-model="cropper.visible"
      max-width="500px"
      persistent
    >
      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
          Please select area to show users
          <v-spacer></v-spacer>
          <v-icon 
            @click="closeConfirm = true"
            class="close-icon"
          >mdi-close</v-icon>
        </v-card-title>

          <Cropper
            ref="cropper"
            class="cropper"
            :src="cropper.src"
            :stencil-props="{
              aspectRatio
            }"
          />

        <v-card-actions class="justify-space-around">
          <v-btn
            outlined
            color="primary"
            :disabled="aspectRatio === 7/10"
            @click="saveOriginalImage"
          >
            Save Original Image
          </v-btn>

          <v-btn
            color="primary"
            @click="saveCroppedImage"
          >
            Save Cropped Image
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Uploader, isSplashImageValid, isAudioUrlValid, isImageValid, isVideoUrlValid } from '../../models/Uploader';
import AddFromUrl from './Additional/AddFromUrl.vue';
import { Cropper } from 'vue-advanced-cropper';
import "vue-advanced-cropper/dist/style.css";

export default {
  components: {
    AddFromUrl,
    Cropper,
  },
  props: {
    initialType: {
      type: String,
      default: '',
    },
    aspectRatio: {
      type: Number,
      default: 0
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
      tempData: '',
      fileName: this.initialData,
      isAddingFromUrl: false,
      removeConfirm: false,
      closeConfirm: false,
      cropper: {
        src: '',
        visible: false
      }
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
        this.onAddFromUrl(this.initialData, false);
      } else if(type === 'object' && this.initialData.name !== this.uploadData.name) {
        this.onAddFromDevice(null, this.initialData, false);
      }
    }
  },
  methods: {
    async onAddFromUrl(url, updateParent=true) {
      try {
        if (this.initialType === 'audio') {
          await isAudioUrlValid(url);
        } else if (url.match(/\.(jpeg|jpg|gif|png)$/) != null) {
          if (this.imageType === 'splash') {
            await isSplashImageValid(url);
          } else {
            await isImageValid(url);
          }
        } else {
          await isVideoUrlValid(url);
        }

        this.tempData = url;
        this.fileName = url;
        if (updateParent) {
          this.$set(this, 'cropper', {
            src: url + '?' + Date.now(),
            visible: true
          })
        }

        this.isAddingFromUrl = false;
      } catch (error) {
        if (updateParent) {
          this.$emit('onNotify', {
            type: 'error',
            message: error,
          });
        }
      }
    },

    onCloseCropping () {
      const inputRef = this.$refs['fileInput'];
      if(inputRef) inputRef.value = '';
      this.tempData = '';
      this.cropper.visible = false;
      this.closeConfirm = false;
    },

    async onAddFromDevice(event, externalFile, updateParent=true) {
      const file = event ? event.target.files[0] : externalFile;
      if(!file) return;
      if(event) event.target.value = '';

      try {
        if (this.initialType === 'image') await isImageValid(file);
        if (this.imageType === 'splash' && file.type.match(/(jpeg|jpg|png)$/) != null) await isSplashImageValid(file);

        this.tempData = file;
        this.fileName = file;

        if (updateParent) {
          this.$set(this, 'cropper', {
            src: URL.createObjectURL(file),
            visible: true
          })
        }
      } catch (error) {
        if (updateParent) {
          this.$emit('onNotify', {
            type: 'error',
            message: error,
          });
        }
      }
    },

    async upload() {
      return new Promise((resolve, reject) => {
        this.uploader.upload(this.uploadData)
          .then(response => {
            resolve(response.location);
          })
          .catch(err => {
            this.uploadData = this.initialData;
            setTimeout(() => reject('Something went wrong with uploading.'), 1000);
          });
      });
    },

    downloadImage () {
      const s3ImageURL = "https://mindlogger-applet-contents.s3.amazonaws.com/image/";
      let imageUrl = typeof this.uploadData === 'string' ? this.uploadData : this.uploadData.name;

      if (!imageUrl.includes('https://')) {
        imageUrl = s3ImageURL + imageUrl;
      }

      fetch(imageUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        referrer: 'no-referrer',
      })
        .then((response) => response.blob())
        .then((blob) => {
          saveAs(blob, this.getFileName(this.fileName));
        });

    },

    getFileName (uploadData, isFullName = true) {
      let fileName;
      if (typeof uploadData !== "string") {
        fileName = uploadData.name;
      } else {
        const values = uploadData.split('/');
        fileName = values[values.length - 1];
      }

      if (isFullName || fileName.length <= 15) {
        return fileName;
      } else {
        return fileName.substring(0, 10) + '....' + fileName.slice(-3);
      }
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

    saveOriginalImage() {
      this.uploadData = this.tempData;
      if (typeof this.fileName == 'string') {
        this.$emit('onAddFromUrl', this.uploadData);
      } else {
        this.$emit('onAddFromDevice', this.upload);
      }
      this.cropper.visible = false;
    },

    saveCroppedImage() {
      this.uploadData = this.tempData;
      const { coordinates, canvas, } = this.$refs.cropper.getResult();
      const image = canvas.toBlob(blob => {
        let fileName;
        if (typeof this.uploadData !== "string") {
          fileName = this.uploadData.name;
        } else {
          const values = this.uploadData.split('/');
          fileName = values[values.length - 1];
        }
        const file = new File([blob], fileName, { type: 'image/jpeg', lastModified: Date.now() });
        console.log('file', file)
        this.uploadData = file;

        this.$emit('onAddFromDevice', this.upload);
      }, 'image/jpeg');
      this.cropper.visible = false;
    }
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

.from-url {
  cursor: pointer;
}

.from-url:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.close-icon {
  cursor: pointer;
}

.cropper {
  width: 100%;
  height: 400px;
  background: black;
}
</style>
