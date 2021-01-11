<template>
  <v-card>
    <v-simple-table>
      <template v-slot:default>

        <thead>
          <tr>
            <th class="text-left">Token Prizes</th>
            <th class="text-left">Token Prizes Description</th>
            <th class="text-left">Add an image</th>
            <th class="text-left">Update Prize</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(item, index) in localOptions"
            :key="item.id"
            v-bind:class="{ editing: editState[index], 'prize-item': true }"
          >
            <td>
              <v-text-field 
                v-model="item.price"
                placeholder="Price"
                type="number"
                counter="5"
                maxlength="5"
                min="0"
              >
              </v-text-field>
              <span class="content">{{item.price}}</span>
            </td>
            <td>
              <v-text-field v-model="item.name" placeholder="Name"></v-text-field>
              <span class="content">{{item.name}}</span>
            </td>
            <td>
              <!-- <v-text-field v-model="item.imgURL" placeholder="Image URL"></v-text-field> -->
              <!-- <span class="content">{{'Image URL'}}</span> -->
              Image URL
            </td>
            <td>
              <v-btn
                @click="editOption(index)"
                icon
              >
                <v-icon v-if="!editState[index]" dark >mdi-file-edit</v-icon>
                <v-icon v-if="editState[index]" dark >mdi-file-check</v-icon>
              </v-btn>
              <v-btn icon class="ml-1"
                @click="deleteOption(index)">
                <v-icon dark>mdi-file-remove</v-icon>
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

    <v-btn class="d-flex mx-auto my-5" outlined fab small color="indigo"
      @click="addOption">
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <v-alert v-if="isError" type="error" class="mx-2">{{isError}}</v-alert>

    <v-card-actions>
      <v-btn outlined color="primary" @click="discardUpdateOptions">
        Discard Changes
      </v-btn>
      <v-spacer />
      <v-btn color="primary" @click="updateOptions">
        Save Prizes
      </v-btn>
    </v-card-actions>

  </v-card>
</template>


<script>
import PrizeItemConfirmBuilder from './PrizeItemConfirmBuilder.vue';

export default {
  components: {
    PrizeItemConfirmBuilder
  },
  props: {
    options: {
      type: Object,
      required: true
    },
    updateItem: {
      type: Function,
      default: null
    }
  },
  data() {

    const localOptions = this.options && this.options.options && this.options.options.length ? this.avoidObjectsReference(this.options.options) : [];
    const discardLocalOptions = this.options && this.options.options && this.options.options.length ? this.avoidObjectsReference(this.options.options) : [];
    
    const responseOptions = {
      hasScoreValue: false,
      isTokenValue: false,
      hasPriceValue: true,
      isMultipleChoice: false,
      isSkippableItem: false,
      nextOptionName: "",
      nextOptionValue: "",
      nextOptionImage: "",
      options: []
    }

    return {
      editState: [],
      localOptions,
      discardLocalOptions,
      isError: '',
      confirmItems: [],
      discardConfirmItems: [],
      responseOptions
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
      /** option { name: string, price: number, value: number } */
      this.localOptions.push({ value: this.nextOptionValue(), name: '', price: null });
      this.editState[this.localOptions.length - 1] = true;
    },

    editOption(index) {
      this.isError = '';
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

      this.responseOptions.options = this.avoidObjectsReference(this.localOptions);
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

  }

}
</script>

<style lang="scss" scoped>
.prize-item:not(.editing) .v-input {
  display: none;
}
.prize-item.editing .content {
  display: none;
}
</style>