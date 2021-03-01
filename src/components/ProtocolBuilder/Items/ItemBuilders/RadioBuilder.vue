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
                large
                @click="option.expanded = !option.expanded"
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
              <Uploader
                :initialType="'image'"
                :initialTitle="'Option Image'"
                :initialAdditionalType="'small-circle'"
                :initialData="option.image"
                @onAddFromUrl="onAddOptionImageFromUrl(option, $event)"
                @onAddFromDevice="$emit('loading', true); onAddOptionImageFromDevice(option, $event);"
                @onRemove="onRemoveOptionImage(option)"
                @onNotify="$emit('loading', false); $emit('notify', $event);"
              />
              <v-btn
                icon
                large
                @click="deleteOption(index)"
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
                  label="Token Value"
                  counter="5"
                  maxlength="5"
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
          fab
          x-small
          color="primary"
          @click="addOption"
        >
          <v-icon color="white">
            mdi-plus
          </v-icon>
        </v-btn>
      </div>

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
            required
            @change="update"
          />
        </v-col>
      </v-row>

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
            @change="updateTokenOption"
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
            @change="update"
          />
        </v-col>
        <v-col>
          <v-checkbox
            v-if="isTokenValue"
            v-model="enableNegativeTokens"
            label="Reduce cumulation of tokens with negative token responses"
            @change="update"
          />
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<style lang="scss" scoped>
  .radio-option {
    display: flex;
    align-items: center;
  }

  .radio-option > * {
    margin-left: 10px;
  }

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



<script>
import Uploader from '../../Uploader.vue';

export default {
  components: {
    Uploader,
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
    const isTokenValue = (this.responseOptions.valueType && this.responseOptions.valueType.includes("token")) || false;
    let nextOptionScore = 1;

    if (this.initialItemData.options.length > 0) {
      const lastOption = this.initialItemData.options[this.initialItemData.options.length - 1];

      if (this.initialItemData.hasScoreValue && lastOption.score) {
        nextOptionScore = lastOption.score + 1
      }
    }

    return {
      options: (this.initialItemData.options || []).map(option => ({
        name: option.name,
        value: option.value || 0,
        score: option.score || 0,
        image: option.image || '',
        description: option.description || '',
        expanded: false,
        valid: true
      })),
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
      items: [],

      isTokenValue,
      hasScoreValue: this.initialItemData.hasScoreValue || false,
      hasResponseAlert: this.initialItemData.hasResponseAlert || false,
      responseAlertMessage: this.initialItemData.responseAlertMessage || '',
      isSkippable: this.isSkippableItem || false,
      enableNegativeTokens: this.initialItemData.enableNegativeTokens || false,
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

      if (this.hasScoreValue) {
        nextOption.score = this.nextOptionScore;
        this.nextOptionScore++;
      }

      if (!this.isTokenValue) {
        nextOption.value = this.options.length;
      }

      this.options.push(nextOption);

      this.update();
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
        'enableNegativeTokens': this.enableNegativeTokens,
        'isMultipleChoice': this.isMultipleChoice,
        'isSkippableItem': this.isSkippable,
        'options': this.options,
      };
      this.$emit('updateOptions', responseOptions);
    },

    updateTokenOption() {
      if (this.isTokenValue) {
        for (let i = 0; i < this.options.length; i++) {
          this.options[i].value = 0;
        }
      } else {
        for (let i = 0; i < this.options.length; i++) {
          this.options[i].value = i;
        }
      }

      this.update();
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

    onAddOptionImageFromUrl(option, url) {
      option.image = url;
      this.$emit('notify', {
        type: 'success',
        message: 'Image from URL successfully added to Option.',
        duration: 3000,
      });
    },

    async onAddOptionImageFromDevice(option, uploadFunction) {
      try {
        option.image = await uploadFunction();
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'success',
          message: 'Image successfully added to Option.',
          duration: 3000,
        });
      } catch (error) {
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'error',
          message: 'Something went wrong with uploading image for Item > Option. Please try to upload again or just save Option without image changes.',
        });
      }
    },

    onRemoveOptionImage(option) {
      option.image = '';
      this.$emit('notify', {
        type: 'warning',
        message: 'Image successfully removed from Option.',
        duration: 3000,
      });
    },

  }
}
</script>
