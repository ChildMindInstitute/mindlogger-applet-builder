<template>
  <v-card class="token-prizes-builder">
    <v-simple-table class="mb-8">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="table-heading">
              Token Price
            </th>
            <th class="table-heading">
              Token Prizes Description
            </th>
            <th class="table-heading">
              Upload Image
            </th>
            <th class="table-heading">
              Update Prize
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in tokenPrizes"
            :key="item.name"
          >
            <td>
              <v-text-field
                v-model="item.price"
                type="number"
                placeholder="eg, 10"
                :rules="priceRules"
                required
                :disabled="!item.edit"
                @input="val => handlePrice(val, item)"
              />
            </td>
            <td>
              <v-text-field
                v-model="item.prizesDescription"
                placeholder="eg, See a movie"
                :rules="descriptionRules"
                :counter="150"
                required
                :disabled="!item.edit"
                @input="val => handlePrizesDescription(val, item)"
              />
            </td>
            <td>
              <v-file-input
                accept="image/png, image/jpeg, image/bmp"
                placeholder="Upload an Image"
                prepend-icon="mdi-camera"
                :disabled="!item.edit"
                @change="val => handleImage(val, item.id)"
              />
            </td>
            <td>
              <v-icon
                medium
                class="mr-2"
                @click="editItem(item)"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                medium
                @click="deleteItem(item)"
              >
                mdi-delete
              </v-icon>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
    <div class="text-center mb-5">
      <v-btn
        fab
        small
        @click="addItems"
      >
        <v-icon color="grey darken-1">
          add
        </v-icon>
      </v-btn>
    </div>
    <v-card-actions>
      <v-btn
        outlined
        color="primary"
        @click="handleCloseModal"
      >
        {{ isEditable ? "Discard Changes" : "Close" }}
      </v-btn>
      <v-spacer />
      <v-btn
        color="primary"
        @click="handleSave"
      >
        Save Item
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    initialItemData: {
      type: Array,
      required: true,
    },
    templates: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      isEditable: false,
      descriptionRules: [
        (v) => !!v || "Description is required",
        (v) => v.length <= 150 || "Description must be less than 150 characters",
      ],
      priceRules: [
        (v) => !!v || "Price is required",
        (v) => v >= 0 || "Price must be greater than 0"
      ],
      tokenPrizes: this.initialItemData.tokenPrizes || [
        {
          id: 1,
          price: "",
          prizesDescription: "",
          edit: false
        },
      ],
    };
  },
  methods: {
    handlePrizesDescription(val, item) {
      const rowsState = [...this.tokenPrizes];
      const index = rowsState.findIndex((i) => i.id === item.id);
      if (index > -1) {
        rowsState[index].prizesDescription = val
        this.tokenPrizes = rowsState;
      }
    },
    handlePrice(val, item) {
      const rowsState = [...this.tokenPrizes];
      const index = rowsState.findIndex((i) => i.id === item.id);
      if (index > -1) {
        rowsState[index].price = val
        this.tokenPrizes = rowsState;
      }
    },
    addItems() {
      this.tokenPrizes.push({
        id: this.tokenPrizes[0].id++,
        price: '',
        prizesDescription: "",
        edit: false
      });
    },
    deleteItem(val) {
      for (var i = 0; i < this.tokenPrizes.length; i++)
        if (this.tokenPrizes[i].id && this.tokenPrizes[i].id === val.id) {
          if (this.tokenPrizes.length > 1) {
            this.tokenPrizes.splice(i, 1);
          }
          break;
        }
    },
    editItem(val) {
      const rowsState = [...this.tokenPrizes];
      const index = rowsState.findIndex((i) => i.id === val.id);
      if (index > -1) {
        rowsState[index].edit = rowsState[index].edit ? false : true;
        this.tokenPrizes = rowsState;
      }
    },
    handleImage(val, id) {
      const rowsState = [...this.tokenPrizes];
      const index = rowsState.findIndex((i) => i.id === id);
      if (index > -1) {
        rowsState[index].image = val;
        this.tokenPrizes = rowsState;
      }
    },
    handleCloseModal() {
      this.closeItemModal();
    },
    handleSave() {
      const token = this.tokenPrizes.map(item => ({
        price: item.price,
        description: item.prizesDescription
      }))
      this.$emit("tokenPrizesBuilder", token)
      this.closeItemModal()
    },
    closeItemModal() {
      this.$emit("closeItemModal", null);
    },
  },
};
</script>

<style>
.table-heading {
  font-size: 0.9rem !important;
}
.token-prizes-builder {
  padding: 0.9rem;
}
</style>