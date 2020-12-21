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
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in prizesItems"
            :key="item.id"
            v-bind:class="{ editing: editState[index], 'prize-item': true }"
          >
            <td>
              <v-text-field v-model="item.prize" placeholder="Prize"></v-text-field>
              <span class="content">{{item.prize}}</span>
            </td>
            <td>
              <v-text-field v-model="item.description" placeholder="Description"></v-text-field>
              <span class="content">{{item.description}}</span>
            </td>
            <td>
              <v-text-field v-model="item.imgURL" placeholder="Image URL"></v-text-field>
              <span class="content">{{item.imgURL}}</span>
            </td>
            <td>
              <v-btn 
                icon
                v-bind:class="{ 'v-btn--outlined': editState[index] }"
                @click="editPrizesState(index)"
              >
                <v-icon dark >mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon class="ml-1" @click="deletePrizeItem(item)">
                <v-icon dark>mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>

    <v-btn class="d-flex mx-auto my-5" outlined fab small color="indigo" @click="addPrizeItem">
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <v-card-actions>
      <v-btn outlined color="primary" @click="onClickDiscardPrizes">
        Discard Changes
      </v-btn>
      <v-spacer />
      <v-btn color="primary" @click="onClickSavePrizes">
        Save Prizes
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    prizesItems: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      editState: []
    }
  },
  methods: {
    editPrizesState(index) {
      console.log('editPrizesState Func', index);
      this.editState[index] = this.editState[index] ? false : true;
      this.editState = [...this.editState];
      console.log(this.editState);
      console.log('------------------');
    },
    updatePrizesItems(prizesItems) {
      console.log('updatePrizesItems Func', prizesItems);
      this.$emit('updatePrizesItems', prizesItems);
      console.log('------------------');
    },
    addPrizeItem() {
      console.log('addPrizeItem Func');
      const withNewPrizesItems = this.prizesItems;
      withNewPrizesItems.push({ id: Number(Math.random() * 1000).toFixed(), prize: null, description: '', imgURL: '' });
      this.updatePrizesItems(withNewPrizesItems);
      this.editState[this.prizesItems.length - 1] = true;
      console.log('------------------');
    },
    deletePrizeItem(prizeItem) {
      console.log('deletePrizeItem Func', prizeItem);
      const withoutDeletedPrizesItems = this.prizesItems.filter(item => item.id !== prizeItem.id);
      this.updatePrizesItems(withoutDeletedPrizesItems);
      console.log('------------------');
    },
    onClickSavePrizes() {
      console.log('onClickSavePrizes Func');
      this.$emit('savePrizes');
      this.editState = [];
      console.log('------------------');
    },
    onClickDiscardPrizes() {
      console.log('onClickDiscardPrizes Func');
      this.$emit('discardPrizes');
      this.editState = [];
      console.log('------------------');
    }
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