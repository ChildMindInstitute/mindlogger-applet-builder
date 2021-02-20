<template>
  <div>
    <v-form>
      <v-row
        class="ma-2"
      >
        Options

        <v-spacer />

        <template
          v-if="isTokenValue"
        >
          <v-btn
            class="mx-2"
            outlined
            color="primary"
            @click="$emit('openPrize')"
          >
            {{ hasPrizeActivity ? 'Edit' : 'Create' }} Token Prizes
          </v-btn>

          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                class="deep-orange"
                color="primary"
                dark
                v-bind="attrs"
                v-on="on"
              >
                Saved Templates
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(item, i) in items"
                :key="i"
              >
                <v-list-item-title @click="addFromTemplate(item)">
                  {{ item.text }} | {{ item.value }}
                </v-list-item-title>
                <v-btn
                  icon
                  color="grey darken-1 ml-2"
                  @click="removeTemplate(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-row>

      <div
        class="option-list"
      >
        <div
          v-for="(option, index) in options"
          :key="index"
          class="px-2"
        >
          <v-row>
            <div class="radio-option">
              <input
                v-if="isMultipleChoice"
                class="mx-2"
                type="checkbox"
                value="false"
                disabled
              >

              <input
                v-else
                class="mx-2"
                type="radio"
                value="false"
                disabled
              >
              <span>
                {{ option.name }}
              </span>

              <span
                v-if="option.description"
                x-large
              >
                ( {{ option.description }} )
              </span>

            </div>

            <v-spacer />

            <div class="d-flex align-center justify-end">
              <v-btn
                icon
                :disabled="!isItemEditable"
                @click="option.expanded = !option.expanded"
                large
              >
                <v-icon
                  v-if="!option.expanded"
                  color="grey lighten-1"
                >
                  edit
                </v-icon>
                <v-icon
                  v-if="option.expanded"
                >
                  mdi-chevron-double-up
                </v-icon>
              </v-btn>

              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-on="on"
                    v-bind="attrs"
                    icon
                  >
                    <v-icon
                      :color="option.image ? 'primary' : ''"
                    >
                      mdi-image-search
                    </v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="onAddImageUrl(option)">
                    <v-list-item-title>{{ option.image ? 'Edit Image Url' : 'Add Image Url' }} </v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-title>
                      <div
                        class="upload-from-pc"
                      >
                        <input 
                          class="file-input" 
                          type="file" 
                          accept="image/jpeg, image/png, image/bmp" 
                          @change="onChangeFile($event, option)"
                        >
                        Upload From Your computer
                      </div>
                    </v-list-item-title>
                  </v-list-item>

                  <v-list-item
                    :disabled="!option.image"
                    @click="onRemoveImage(option)"
                  >
                    <v-list-item-title>
                      Remove Image
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <v-btn
                icon
                :disabled="!isItemEditable"
                @click="deleteOption(index)"
                large
              >
                <v-icon color="grey lighten-1">
                  delete
                </v-icon>
              </v-btn>
            </div>
          </v-row>

          <div
            v-if="option.expanded"
            class="px-8"
          >
            <v-row>
              <v-col 
                cols="12"
                sm="5"
                md="4"
              >
                <v-text-field
                  v-model="option.name"
                  :rules="textRules"
                  label="Option Text"
                  counter="75"
                  maxlength="75"
                  :disabled="!isItemEditable"
                  @change="updateOption(option)"
                />
              </v-col>
              <v-col 
                v-if="isTokenValue"
                cols="12"
                sm="5"
                md="4"
              >
                <v-text-field
                  v-model="option.value"
                  :rules="numberRules"
                  type="number"
                  label="Option Value"
                  counter="5"
                  maxlength="5"
                  :disabled="!isItemEditable"
                  @change="updateOption(option)"
                />
              </v-col>

              <v-col
                v-if="hasScoreValue"
                cols="12"
                sm="5"
                md="4"
              >
                <v-text-field
                  v-model="option.score"
                  :rules="numberRules"
                  type="number"
                  label="Score Value"
                  counter="5"
                  maxlength="5"
                  :disabled="!isItemEditable"
                  @change="updateOption(option)"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col 
                cols="12"
                sm="12"
              >
                <v-text-field
                  v-model="option.description"
                  label="Option Tooltip"
                  @change="updateOption(option)"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col 
                v-if="isTokenValue"
                cols="auto"
              >
                <v-btn
                  color="primary"
                  @click="appendTemplate(option)"
                >
                  Save As Template
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </div>
      </div>

      <div class="pa-2">
        <v-btn
          :disabled="!isItemEditable"
          @click="addOption"
          fab
          x-small
          color="deep-purple"
        >
          <v-icon color="white">
            mdi-plus
          </v-icon>
        </v-btn>
      </div>

      <v-divider
        class="mt-4"
      />
      <v-row>
        <v-col 
          class="d-flex align-center"
          cols="12"
          md="3"
          sm="6"
        >
          <v-checkbox
            v-model="isTokenValue"
            label="Token Value"
            :disabled="!isItemEditable"
            @change="update"
          />
        </v-col>
        <v-col 
          class="d-flex align-center"
          cols="12"
          md="3"
          sm="6"
        >
          <v-checkbox
            v-model="isSkippable"
            label="Skippable Item"
            :disabled="!isItemEditable"
            @change="updateAllow"
          />
        </v-col>
        <v-col 
          class="d-flex align-center"
          cols="12"
          md="3"
          sm="6"
        >
          <v-checkbox
            v-model="hasResponseAlert"
            label="Set Alert"
            :disabled="!isItemEditable"
            @change="update"
          />
        </v-col>
        <v-col
          class="d-flex align-center"
          cols="12"
          md="3"
          sm="6"
        >
          <v-checkbox
            v-model="hasScoreValue"
            label="Option Score"
            :disabled="!isItemEditable"
            @change="update"
          />
        </v-col>
      </v-row>
      <v-row
        v-if="hasResponseAlert"
      >
        <v-col
          class="d-flex align-center"
          cols="12"
          sm="12"
        >
          <v-text-field
            v-model="responseAlertMessage"
            label="Alert Message"
            :rules="alertTextRules"
            :disabled="!isItemEditable"
            required
            @change="update"
          />
        </v-col>
      </v-row>
    </v-form>

    <v-dialog v-model="imageUrlDialog.visible" persistent width="800">
      <v-card>
        <v-card-title class="headline grey lighten-2" primary-title>
          <v-icon left>mdi-pencil</v-icon>
          Upload from URL
        </v-card-title>
        <v-card-text>
          <v-text-field label="URL" v-model="imageUrlDialog.url" />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-btn outlined color="primary" @click="imageUrlDialog.visible = false;">
            Close
          </v-btn>
          <v-spacer />
          <v-btn color="primary" @click="onAddImageFromUrl">
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="inValidFileDlg" width="400">
      <v-alert type="error">
        <span>{{ fileErrorMsg }}</span>
      </v-alert>
    </v-dialog>
  </div>
</template>

<style scoped>
  .radio-option {
    display: flex;
    align-items: center;
  }

  .radio-option > * {
    margin-left: 10px;
  }
</style>

<script>
import ImageUpldr from '../../../../models/ImageUploader';

export default {
  components: {
    
  },
  props: {
    initialItemData: {
      type: Object,
      required: true
    },
    isSkippableItem: {
      type: Boolean,
      default: false,
    },
    responseOptions: {
      type: Object,
    },
    isItemEditable: {
      type: Boolean,
      default: true,
    },
    itemTemplates: {
      type: Array,
      default: null
    },
    hasPrizeActivity: {
      type: Boolean,
      required: false,
      default: false,
    },
    isMultipleChoice: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data: function () {
    const imgUploader = new ImageUpldr();

    const isTokenValue = (this.responseOptions.valueType && this.responseOptions.valueType.includes("token")) || false;
    let nextOptionScore = 1, nextOptionValue = 1;

    if (this.initialItemData.options.length > 0) {
      const lastOption = this.initialItemData.options[this.initialItemData.options.length - 1];

      if (this.initialItemData.hasScoreValue && lastOption.score) {
        nextOptionScore = lastOption.score + 1
      }
      if (isTokenValue && lastOption.value) {
        nextOptionValue = lastOption.value + 1;
      }
    }

    return {
      inValidFileDlg: false,
      fileErrorMsg: '',
      options: (this.initialItemData.options || []).map(option => ({
        name: option.name,
        value: option.value || 0,
        score: option.score || 0,
        image: option.image || '',
        description: option.description || '',
        expanded: false,
        valid: true
      })),
      imageUrlDialog: {
        visible: false,
        option: null,
        url: ''
      },
      textRules: [
        v => !!v || 'Radio options cannot be empty',
      ],
      numberRules: [
        v => !isNaN(parseInt(v)) || 'Please enter a numerical value',
      ],
      alertTextRules: [
        v => !!v || 'Alert Text cannot be empty',
      ],
      nextOptionScore,
      nextOptionValue,
      items: [],

      isTokenValue,
      hasScoreValue: this.initialItemData.hasScoreValue || false,
      hasResponseAlert: this.initialItemData.hasResponseAlert || false,
      responseAlertMessage: this.initialItemData.responseAlertMessage || '',
      imgUploader,
      isSkippable: this.isSkippableItem || false,
    };
  },

  beforeMount() {
    this.items = this.itemTemplates || [];

    if (!this.options.length) {
      this.addOption();
      this.options[0].expanded = true;
    }
  },

  methods: {
    addOption() {
      const nextOption = {
        'name': `Option ${this.options.length + 1}`,
        'value': 0,
        'score': 0,
        'description': '',
        'expanded': false,
        'image': '',
        'valid': true,
      };

      if (this.isTokenValue) {
        nextOption.value = this.nextOptionValue;
        this.nextOptionValue++;
      }

      if (this.hasScoreValue) {
        nextOption.score = this.nextOptionScore;
        this.nextOptionScore++;
      }

      this.options.push(nextOption);
    },

    removeTemplate(item) {
      const { items } = this;
      const updatedItems = items.filter(({ text, value, description }) => text !== item.text || value !== item.value || description !== item.description)
      this.items = [...updatedItems]
      this.$emit('removeTemplate', item);
    },

    appendTemplate(option) {
      const newOption = {
        text: option.name,
        value: option.value,
        description: option.description,
      };

      this.items.push(newOption);
      this.$emit('updateTemplates', newOption);
    },

    addFromTemplate(item) {
      const nextOption = {
        'name': item.text,
        'value': Number(item.value),
        'image': '',
        'score': 0,
        'description': item.description,
        'expanded': false,
        'valid': false
      };

      if (this.hasScoreValue) {
        nextOption.score = this.nextOptionScore;
        this.nextOptionScore++;
      }
      nextOption.valid = this.isValidOption(nextOption);

      this.options.push(nextOption);
      this.update();
    },
    deleteOption(index) {
      this.options.splice(index, 1);
      this.update();
    },

    update() {
      const responseOptions = {
        'hasScoreValue': this.hasScoreValue,
        'hasResponseAlert': this.hasResponseAlert,
        'responseAlertMessage': this.responseAlertMessage,
        'isTokenValue': this.isTokenValue,
        'isMultipleChoice': this.isMultipleChoice,
        'isSkippableItem': this.isSkippable,
        'options': this.options,
      };
      this.$emit('updateOptions', responseOptions);
    },

    updateOption(option) {
      option.valid = this.isValidOption(option);

      this.update();
    },

    isValidOption(option) {
      if (option.name.length == 0) {
        return false;
      }
      if (this.isTokenValue && isNaN(option.value) || this.hasScoreValue && isNaN(option.score)) {
        return false;
      }

      return true;
    },

    updateAllow() {
      const allow = this.isSkippable
      this.$emit('updateAllow', allow);
    },

    onAddImageUrl(option) {
      this.imageUrlDialog.visible = true;
      this.imageUrlDialog.option = option;
      this.imageUrlDialog.url = option.image;
    },

    onRemoveImage(option) {
      option.image = '';
    },

    onAddImageFromUrl() {
      const { option } = this.imageUrlDialog;
      this.imageUrlDialog.visible = false;

      option.image = this.imageUrlDialog.url;
      option.valid = this.isValidOption(option);
      this.update();
    },

    async onChangeFile(event, option) {
      if (!event.target.files.length) {
        return ;
      }

      const file = event.target.files[0];

      this.fileErrorMsg = await this.imgUploader.isImageValid(file);
      if (this.fileErrorMsg) {
        this.inValidFileDlg = true;
      }

      this.$emit('uploading', true);

      const response = await this.imgUploader.uploadImage(file);
      option.image = response.location;
      option.valid = this.isValidOption(option);

      this.$emit('uploading', false);

      this.update();
    }
  }
}
</script>

<style lang="scss" scoped>
.mx-template-list {
  position: absolute;
  margin-top: 36px;
  z-index: 1;
}

.option-list {
  width: 65%;
}

.upload-from-pc {
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
  }
}
</style>
