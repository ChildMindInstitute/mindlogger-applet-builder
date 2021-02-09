<template>
  <div>
    <v-form>
      <v-list>
        <v-subheader>
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
                  <v-list-item-title @click="addTemplateOption(item)">
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
        </v-subheader>
        <v-list-item
          v-for="(option, index) in options"
          :key="index"
        >
          <div
            class="radio-option"
            :class="{ 'selected-option': index == editingOptionIndex }"
          >
            <img
              width="40"
              :src="option.image"
            />
            <span>
              {{ option.name }}
            </span>
          </div>
          <v-spacer/>
          <v-btn
            icon
            :disabled="!isItemEditable"
            @click="editOption(index)"
          >
            <v-icon
              color="grey lighten-1"
            >
              edit
            </v-icon>
          </v-btn>

          <v-btn
            icon
            :disabled="!isItemEditable"
            @click="deleteOption(index)"
          >
            <v-icon color="grey lighten-1">
              delete
            </v-icon>
          </v-btn>
        </v-list-item>
        <v-list-item class="d-block">
          <v-form
            ref="form"
            v-model="valid"
          >
            <v-row>
              <v-col 
                cols="12"
                sm="5"
                md="4"
              >
                <v-text-field
                  v-model="nextOptionName"
                  :rules="textRules"
                  label="Option Text"
                  counter="75"
                  maxlength="75"
                  :disabled="!isItemEditable"
                  @change="update"
                />
              </v-col>
              <v-col 
                v-if="isTokenValue"
                cols="12"
                sm="5"
                md="4"
              >
                <v-text-field
                  v-model="nextOptionValue"
                  :rules="textRules"
                  type="number"
                  label="Option Value"
                  counter="5"
                  maxlength="5"
                  :disabled="!isItemEditable"
                  @change="update"
                />
              </v-col>
              <v-col 
                v-if="isTokenValue"
                cols="auto"
              >
                <v-checkbox
                  v-model="isTemplate"
                  label="Set as a template"
                  :disabled="!isItemEditable"
                  @change="update"
                />
              </v-col>
              <v-col
                v-if="hasScoreValue"
                cols="12"
                sm="5"
                md="4"
              >
                <v-text-field
                  v-model="nextOptionScore"
                  :rules="numberRules"
                  type="number"
                  label="Score Value"
                  counter="5"
                  maxlength="5"
                  :disabled="!isItemEditable"
                  @change="update"
                />
              </v-col>
            </v-row>

            <v-row v-if="!nextOptionImageFile">
              <v-col 
                cols="auto"
              >
                <ImageUploader
                  :uploadFor="'item-radio-option-pc'"
                  :itemImg="nextOptionImageFile"
                  @onAddImg="onAddImg"
                  @onRemoveImg="onRemoveImg"
                  :disabled="!isItemEditable"
                />
              </v-col>

              <v-col 
                cols="9"
              >
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <div v-on="on">
                      <v-text-field
                        v-model="nextOptionImage"
                        label="Option Image URL"
                        :disabled="!isItemEditable"
                      />
                    </div>
                  </template>
                  <span>
                    <p>Image Requirements</p>
                    <ul>
                      <li>Size: less than 8MB</li>
                      <li>Width: between 100px and 1920px</li>
                      <li>Height: between 100px and 1920px</li>
                    </ul>
                  </span>
                </v-tooltip>
              </v-col>
            </v-row>
            <v-row>
              <v-col 
                cols="12"
                sm="12"
              >
                <v-text-field
                  v-model="nextOptionDescription"
                  label="Option Description"
                  @change="update"
                />
              </v-col>
            </v-row>

            <v-btn
              class="mx-2"
              :disabled="!valid || !isItemEditable"
              v-if="editingOptionIndex >= 0"
              @click="addOption(true)"
            >
              Update Option
            </v-btn>

            <v-btn
              :disabled="!valid || !isItemEditable"
              @click="addOption(false)"
            >
              Add Option
            </v-btn>
          </v-form>
        </v-list-item>
      </v-list>

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
            label="Response Alert"
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
  </div>
</template>

<style scoped>
  .selected-option {
    border-bottom: 1px solid black;
    padding-bottom: 5px;
  }

  .radio-option {
    display: flex;
    align-items: center;
  }

  .radio-option > * {
    margin-left: 10px;
  }
</style>

<script>
import ClickOutside from 'vue-click-outside';
import ImageUploader from '../ImageUploader.vue';
import ImageUpldr from '../../../models/ImageUploader';

export default {
  components: {
    ImageUploader
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
  },
  data: function () {
    const imgUpldr = new ImageUpldr();

    let nextOptionImageFile = null;
    let nextOptionScore = 1;

    if (
      this.initialItemData.hasScoreValue && 
      this.initialItemData.options.length > 0
    ) {
      const lastOption = this.initialItemData.options[this.initialItemData.options.length - 1];

      if (lastOption.score) {
        nextOptionScore = lastOption.score + 1;
      }
    }

    return {
      isTokenValue: (this.responseOptions.valueType && this.responseOptions.valueType.includes("token")) || false,
      isMultipleChoice: this.initialItemData.isMultipleChoice || false,
      isSkippable: this.isSkippableItem || false,
      isTemplate: false,
      nextOptionName: this.initialItemData.nextOptionName || '',
      nextOptionValue: this.initialItemData.nextOptionValue || '',
      nextOptionImage: this.initialItemData.nextOptionImage || '',
      nextOptionDescription: this.initialItemData.nextOptionDescription || '',
      options: this.initialItemData.options || [],
      valid: true,
      textRules: [
        v => !!v || 'Radio options cannot be empty',
      ],
      numberRules: [
        v => !isNaN(parseInt(v)) || 'Please enter a numerical value',
      ],
      alertTextRules: [
        v => !!v || 'Alert Text cannot be empty',
      ],
      items: [],
      nextOptionScore,
      hasScoreValue: this.initialItemData.hasScoreValue || false,
      nextOptionImageFile,
      hasResponseAlert: this.initialItemData.hasResponseAlert || false,
      responseAlertMessage: this.initialItemData.responseAlertMessage || '',
      imgUpldr,
      editingOptionIndex: -1,
    };
  },
  directives: {
    ClickOutside
  },
  async beforeMount() {
    this.items = this.itemTemplates
  },
  methods: {
    resetValidation () {
      this.$refs.form.resetValidation()
    },
    async addOption(isEditing) {
      try {
        if(this.nextOptionImageFile) {
          this.$emit('error', '');
          this.$emit('uploading', true);
          const response = await this.imgUpldr.uploadImage(this.nextOptionImageFile);
          this.nextOptionImage = response.location;
          this.nextOptionImageFile = null;
          this.$emit('uploading', false);
        } else if(this.nextOptionImage) {
          const isImgInvalid = await this.imgUpldr.isImageValid(this.nextOptionImage);
          if(isImgInvalid) {
            console.log('image invalid', isImgInvalid);
            this.$emit('error', isImgInvalid);
            return;
          }
        }

        const { isTokenValue, nextOptionName, nextOptionValue, hasScoreValue, nextOptionScore, nextOptionDescription } = this;

        const currentVal = this.options.length ? this.getMaxValue(this.options) + 1 : 0
        const nextOption = {
          'name': nextOptionName,
          'value': isTokenValue ? Number(nextOptionValue) : currentVal,
          'score': hasScoreValue ? Number(nextOptionScore) : 0,
          'description': nextOptionDescription,
        };
        if (this.nextOptionImage) {
          nextOption.image = this.nextOptionImage.toString();
        }

        if (this.isTemplate && !isEditing) {
          const newOption = {
            text: nextOptionName,
            value: nextOptionValue,
            description: nextOptionDescription,
          }
          this.items = [...this.items, newOption]
          this.$emit('updateTemplates', newOption);
          this.isTemplate = false;
        }

        if (isEditing) {
          this.options[this.editingOptionIndex] = nextOption;
        } else {
          this.options.push(nextOption);
        }

        this.$emit('error', '');
        this.nextOptionName = '';
        this.nextOptionValue = '';
        this.nextOptionImage = '';
        this.nextOptionScore = nextOption.score + 1;
        this.nextOptionDescription = '';
        this.resetValidation();
        this.update();
      } catch(e) {
        this.$emit('uploading', false);
        this.nextOptionImageFile = null;
        this.nextOptionImage = '';
        this.$emit('error', 'Something went wrong with uploading "Option" image. Please try to upload image again...or add "Option" without image.');
      }

      this.editingOptionIndex = -1;
    },
    removeTemplate(item) {
      const { items } = this;
      const updatedItems = items.filter(({ text, value, description }) => text !== item.text || value !== item.value || description !== item.description)
      this.items = [...updatedItems]
      this.$emit('removeTemplate', item);
    },
    addTemplateOption(item) {
      const nextOption = {
        'name': item.text,
        'value': Number(item.value),
        'image': '',
        'description': item.description,
      };
      this.options.push(nextOption);
      this.update();
    },
    deleteOption(index) {
      this.options.splice(index, 1);

      if (index == this.editingOptionIndex) {
        this.editingOptionIndex = -1;
      } else if (index < this.editingOptionIndex) {
        this.editingOptionIndex--;
      }

      this.update();
    },
    editOption(index) {
      const option = this.options[index];

      this.editingOptionIndex = index;

      this.nextOptionName = option.name;
      this.nextOptionValue= option.value;
      this.nextOptionScore= option.score;
      this.nextOptionDescription = option.description || '';
      this.nextOptionImage = option.image || '';
    },
    update() {
      const responseOptions = {
        'hasScoreValue': this.hasScoreValue,
        'hasResponseAlert': this.hasResponseAlert,
        'responseAlertMessage': this.responseAlertMessage,
        'isTokenValue': this.isTokenValue,
        'isMultipleChoice': this.isMultipleChoice,
        'isSkippableItem': this.isSkippableItem,
        'nextOptionName': this.nextOptionName,
        'nextOptionValue': this.nextOptionValue,
        'nextOptionImage': this.nextOptionImage,
        'nextOptionDescription': this.nextOptionDescription,
        'options': this.options,
      };
      this.$emit('updateOptions', responseOptions);
    },
    updateAllow() {
      const allow = this.isSkippable
      this.$emit('updateAllow', allow);
    },

    onAddImg(file) {
      this.$emit('error', '');
      this.nextOptionImageFile = file;
      this.nextOptionImage = file.name;
    },
    onRemoveImg() {
      this.$emit('error', '');
      this.nextOptionImageFile = null;
      this.nextOptionImage = '';
    },

    // Utils
    getMaxValue(array) {
      return Math.max.apply(Math, array.map(option => option.value))
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
</style>