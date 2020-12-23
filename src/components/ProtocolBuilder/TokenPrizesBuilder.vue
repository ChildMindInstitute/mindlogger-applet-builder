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
                icon
                v-bind:class="{ 'v-btn--outlined': editState[index] }"
                @click="editPrizesState(index)"
              >
                <v-icon dark >mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon class="ml-1" @click="deletePrizeItem(index)">
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

    <v-alert v-if="isError" type="error" class="mx-2">{{isError}}</v-alert>

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
import Activity from '../../models/Activity';
import Item from '../../models/Item';

export default {
  props: {
    prizeActivity: {
      type: Function
    }
  },
  data() {
    let initialActivityData = {
      items: [ 
        {
          name: "PrizeSelection",
          options: {
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
        }
      ]
    };

    const getPrizeActivity = this.prizeActivity('searching');
    const activityState = getPrizeActivity ? 'editing' : 'creating';
    initialActivityData = getPrizeActivity == undefined ? initialActivityData : getPrizeActivity;

    const initialItemData = initialActivityData['items'][0];

    const activityBuilder = new Activity();
    activityBuilder.updateReferenceObject(this);

    const itemBuilder = new Item();
    itemBuilder.updateReferenceObject(this);

    return {
      activityState,

      activityBuilder,
      ...activityBuilder.getActivityBuilderData(initialActivityData),

      itemBuilder,
      ...itemBuilder.getItemBuilderData(initialItemData),

      prizesItems: initialItemData['options']['options'],
      discardPrizesItems: [...initialItemData['options']['options']],
      editState: [],
      isError: ''
    }
  },
  methods: {
    nextPrizeItemValue() {
      const length = this.prizesItems.length;
      if(length < 1) return 0
      else return (this.prizesItems[length - 1]['value'] + 1)
    },
    addPrizeItem() {
      /** option { name: string, price: number } */
      this.prizesItems.push({ value: this.nextPrizeItemValue(), name: '', price: null });
      this.editState[this.prizesItems.length - 1] = true;
    },
    editPrizesState(index) {
      this.editState[index] = this.editState[index] ? false : true;
      this.editState = [...this.editState];
    },
    deletePrizeItem(index) {
      this.prizesItems.splice(index, 1);
      this.editState.splice(index, 1);
    },
    validatePrizesItems() {
      let err = '';
      this.prizesItems.forEach(item => {
        if(item.price < 1 || !item.name) err = 'Please fill options with correct info';
      });
      return err;
    },
    onClickSavePrizes() {
      this.isError = this.validatePrizesItems();
      if(!this.isError) {
        this.discardPrizesItems = [...this.prizesItems];
        if(this.prizesItems.length < 1) this.activityState = 'deleting';
        const activityData = this.activityBuilder.getActivityData();
        activityData['isPrize'] = true;
        this.prizeActivity(this.activityState, activityData);
        this.$emit('closeTokenPrizes');
        this.editState = [];
      }
    },
    onClickDiscardPrizes() {
      this.prizesItems = [...this.discardPrizesItems];
      this.$emit('closeTokenPrizes');
      this.editState = [];
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