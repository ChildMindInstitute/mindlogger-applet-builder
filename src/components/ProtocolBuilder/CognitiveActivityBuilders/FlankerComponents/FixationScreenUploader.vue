<template>
  <v-dialog
    max-width="500"
    :value="value"
    @input="$emit('input', $event)"
    persistent
  >
    <v-card class="uploader pa-4">
      <div
        class="d-flex justify-center my-4"
        v-if="imageURL || file"
      >
        <img
          v-if="imageURL"
          :src="imageURL"
        />
        <span v-else>{{ file.name }}</span>
      </div>

      <div class="d-flex justify-center align-center">
        <v-btn
          v-if="!file"
          @click="$refs.fileInput.click()"
        >
          Upload Fixation Screen
        </v-btn>

        <template
          v-else
        >
          <v-btn
            @click="$refs.fileInput.click()"
          >
            Replace Fixation Screen
          </v-btn>

          <v-btn class="mx-4" x-large icon @click="deleteImage">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </div>

      <input
        :key="inputKey"
        ref="fileInput"
        type="file"
        class="file-input"
        accept="image/jpeg, image/png, image/bmp"
        @change="setFixationScreen($event)"
      >

      <div class="d-flex align-center justify-center mt-4">
        <div class="mx-2">
          Show fixation for:
        </div>

        <v-text-field
          class="fixation-time mx-2"
          type="number"
          min="1"
          v-model="duration"
          :disabled="file === null"
        />

        milliseconds
      </div>

      <div
        v-if="errorMessage"
        class="error-message my-4"
      >
        {{ errorMessage }}
      </div>

      <v-dialog width="400" v-model="uploading">
        <v-card class="pt-5 pb-6">
          <v-progress-circular
            class="d-block mx-auto mt-2"
            color="primary"
            indeterminate
            :size="50"
          />
        </v-card>
      </v-dialog>

      <v-card-actions>
        <v-spacer />

        <v-btn class="mx-4" color="primary" :disabled="(duration <= 0 || duration % 1 != 0) && file !== null" @click="onSave">
          Save
        </v-btn>

        <v-btn @click="$emit('input', false)">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.file-input {
  display: none;
}

.uploader {
  text-align: center;
}

.fixation-time {
  max-width: 60px;
}
</style>

<script>
import { Uploader as S3Uploader } from '../../../../models/Uploader';

export default {
  props: {
    value: {
      type: Boolean,
      required: true
    },
    fixationDuration: {
      type: Number,
      required: false
    },
    screen: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      file: !this.screen.name ? null : this.screen,
      imageURL: this.screen.image || '',
      duration: this.fixationDuration || '',
      inputKey: 0,
      s3Uploader: new S3Uploader('image'),
      uploading: false,
      errorMessage: '',
    }
  },

  methods: {
    setFixationScreen (e) {
      if (e.target.files.length > 0) {
        this.file = e.target.files[0];
        this.imageURL = URL.createObjectURL(this.file);
        this.inputKey++;
      }
    },

    async onSave () {
      this.uploading = true;

      try {
        if (this.file && !this.file.image && this.file !== this.screen) {
          const response = await this.s3Uploader.upload(this.file);
          this.file = {
            name: this.file.name,
            image: response.location
          };
        }

        this.$emit('save', {
          screen: this.file,
          duration: Number(this.duration)
        });
      } catch (e) {
        this.errorMessage = `Sorry, we were not able to upload screen. Please upload different file or try again later.`;
      }

      this.uploading = false;
    },

    deleteImage () {
      this.file = null;
      this.imageURL = '';
      this.duration = '';
    }
  }
}
</script>
