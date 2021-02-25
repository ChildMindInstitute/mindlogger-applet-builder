<template>
  <v-card>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">
              Token Prizes
            </th>
            <th class="text-left">
              Token Prizes Description
            </th>
            <th class="text-left">
              Add an image
            </th>
            <th class="text-left">
              Update Prize
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(item, index) in localOptions"
            :key="item.id"
          >
            <td>
              <v-text-field 
                v-if="editState[index]"
                v-model="item.price"
                placeholder="Price"
                type="number"
                counter="5"
                maxlength="5"
                min="0"
              />
              <span
                v-else
                class="content"
              >{{ item.price }}</span>
            </td>
            <td>
              <v-text-field
                v-if="editState[index]"
                v-model="item.name"
                placeholder="Name"
              />
              <span
                v-else
                class="content"
              >{{ item.name }}</span>
            </td>
            <td class="d-flex">
              <template v-if="editState[index]">
                <ImageUploader
                  :uploadFor="'item-radio-option-pc'"
                  :itemImg="item.imageFile"
                  @onAddImg="onAddImg(index, $event)"
                  @onRemoveImg="onRemoveImg(index)"
                />
                <template v-if="!item.imageFile">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <div v-on="on">
                        <v-text-field
                          v-model="item.image"
                          label="Option Image URL"
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
                </template>
              </template>
              <v-img
                v-else
                :src="item.image"
                max-width="50"
              />
            </td>
            <td>
              <v-btn
                icon
                @click="editOption(index)"
              >
                <v-icon
                  v-if="editState[index]"
                  dark
                >
                  mdi-file-check
                </v-icon>
                <v-icon
                  v-else
                  dark
                >
                  mdi-file-edit
                </v-icon>
              </v-btn>
              <v-btn
                icon
                class="ml-1"
                @click="deleteOption(index)"
              >
                <v-icon dark>
                  mdi-file-remove
                </v-icon>
              </v-btn>
            </td>
            <td>
              <PrizeItemConfirmBuilder
                :option="item"
                :updateItem="updateItem"
                @onConfrimItemCreate="confirmItems[index] = $event"
              />
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>

    <v-btn
      class="d-flex mx-auto my-5"
      outlined
      fab
      small
      color="indigo"
      @click="addOption"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <v-alert
      v-if="isError"
      type="error"
      class="mx-2"
    >
      {{ isError }}
    </v-alert>

    <v-card-actions>
      <v-btn
        outlined
        color="primary"
        @click="discardUpdateOptions"
      >
        Discard Changes
      </v-btn>
      <v-spacer />
      <v-btn
        color="primary"
        @click="updateOptions"
      >
        Save Prizes
      </v-btn>
    </v-card-actions>

    <v-dialog
      v-model="isUploadingState"
      persistent
      width="400"
    >
      <v-card class="pt-5 pb-6">
        <v-progress-circular
          class="d-block mx-auto mt-2"
          color="primary"
          indeterminate
          :size="50"
        />
      </v-card>
    </v-dialog>
  </v-card>
</template>


<script>
import PrizeItemConfirmBuilder from './PrizeItemConfirmBuilder.vue';
import ImageUploader from '../ImageUploader.vue';
import ImageUpldr from '../../../models/ImageUploader';

export default {
  components: {
    PrizeItemConfirmBuilder,
    ImageUploader
  },
  props: {
    options: {
      type: Object,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    updateItem: {
      type: Function,
      default: null
    }
  },
  data() {
    const imgUpldr = new ImageUpldr();

    const localOptions = this.options && this.options.options && this.options.options.length ? this.avoidObjectsReference(this.options.options) : [];
    localOptions.map((option, index) => {
      option.question = this.items[index + 1].question.text;
      option.image = this.items[index + 1].question.image;
    });

    const discardLocalOptions = this.avoidObjectsReference(localOptions);

    const responseOptions = {
      hasScoreValue: false,
      isTokenValue: false,
      hasPriceValue: true,
      isMultipleChoice: false,
      isSkippableItem: false,
      options: []
    }

    return {
      editState: [],
      localOptions,
      discardLocalOptions,
      isUploadingState: false,
      isError: '',
      confirmItems: [],
      discardConfirmItems: [],
      responseOptions,
      imgUpldr
    }
  },
  created() {
    this.discardConfirmItems = this.avoidObjectsReference(this.confirmItems);
  },
  methods: {

    avoidObjectsReference(arr) {
      const arrWithNewObjects = [];
      arr.forEach(item => {
        const newObj = Object.assign({}, item);
        arrWithNewObjects.push(newObj);
      });
      return arrWithNewObjects;
    },

    nextOptionValue() {
      const length = this.localOptions.length;
      if(length < 1) return 0
      else return (this.localOptions[length - 1]['value'] + 1);
    },

    addOption() {
      this.isError = '';
      /** option { name: string, price: number, value: number, image: string } */
      this.localOptions.push({
        value: this.nextOptionValue(),
        name: '',
        price: null,
        image: '',
        imageFile: null
      });
      this.editState[this.localOptions.length - 1] = true;
    },

    async editOption(index) {
      this.isError = '';
      if (this.editState[index]) {
        const option = this.localOptions[index];
        if (option.imageFile) {
          this.isUploadingState = true;
          const response = await this.imgUpldr.uploadImage(option.imageFile);
          option.image = response.location;
          option.imageFile = null;
          this.isUploadingState = false;
        } else if(option.image) {
          const isImgInvalid = await this.imgUpldr.isImageValid(option.image);
          if(isImgInvalid) {
            this.isError = isImgInvalid;
            return;
          }
        }
      }
      this.editState[index] = this.editState[index] ? false : true;
      this.editState = [...this.editState];
    },

    deleteOption(index) {
      this.isError = '';
      this.localOptions.splice(index, 1);
      this.editState.splice(index, 1);
      this.confirmItems.splice(index, 1);
    },

    validateOptions() {
      let err = '';

      this.localOptions.forEach(item => {
        if(item.price < 1 || !item.name) err = 'Please fill options with correct info';
      });

      if(!this.localOptions.length && this.discardLocalOptions.length) {
        err = 'Prize Activity was deleted';
        this.discardLocalOptions = [];
        setTimeout(() => {
          this.$emit('deleteOptions');
          this.isError = '';
        }, 1000);
      } else if(!this.localOptions.length) {
        err = 'Please add at least one option';
      }

      return err;
    },

    updateOptions() {
      this.isError = this.validateOptions();
      if(this.isError) return;

      this.localOptions.forEach((option, index) => option.value = index);
      const options = this.localOptions.map((option) => {
        const {question, imageFile, ...opt} = option;
        return opt;
      })

      this.responseOptions.options = this.avoidObjectsReference(options);
      this.discardLocalOptions = this.avoidObjectsReference(this.localOptions);
      this.discardConfirmItems = this.avoidObjectsReference(this.confirmItems);
      this.editState = [];
      this.$emit('updateOptions', this.responseOptions, this.confirmItems);
    },

    discardUpdateOptions() {
      this.localOptions = this.avoidObjectsReference(this.discardLocalOptions);
      this.confirmItems = this.avoidObjectsReference(this.discardConfirmItems);
      this.$emit('closeOptions');
      this.editState = [];
      this.isError = '';
    },

    onAddImg(index, file) {
      this.isError = '';
      const option = this.localOptions[index];
      option.imageFile = file;
      option.image = file.name;
    },
    onRemoveImg(index) {
      this.isError = '';
      const option = this.localOptions[index];
      option.imageFile = null;
      option.image = '';
    },

  }

}
</script>

<style lang="scss" scoped>
</style>