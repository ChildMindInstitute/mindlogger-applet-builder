<template>
  <v-card>
    <v-card-title class="headline grey lighten-2" primary-title>
      <v-icon left>{{ isItemEditable ? 'mdi-pencil' : 'mdi-eye' }}</v-icon>
      {{ isItemEditable ? 'Edit Item' : 'View Item' }}
    </v-card-title>
    <v-container>
      <v-row no-gutters>
        <v-col md="6" offset-md="3">
          <conditional-item-list v-if="!editMode" :options="options" noActions />

          <v-form ref="form" lazy-validation>
            <v-select
              v-model="ifValue"
              item-text="name"
              :items="filteredItems"
              return-object
              label="If"
            />
            <v-select
              v-model="stateValue"
              name="name"
              :items="stateItems"
              item-text="name"
              return-object
              label="State"
            />

            <template v-if="type === 'slider'">
              <v-text-field
                v-model="minValue"
                label="Min value"
                min="1"
                :max="sliderNumOptions"
                type="number"
              />

              <v-text-field
                v-if="
                  stateValue.name === 'WITHIN' ||
                    stateValue.name === 'OUTSIDE OF'
                "
                v-model="maxValue"
                label="Max value"
                min="1"
                :max="sliderNumOptions"
                type="number"
              />
            </template>
            <template v-else>
              <v-select
                v-model="answerValue"
                item-text="name"
                :items="answerItems"
                label="Answer"
                return-object
              />
            </template>
            <v-select
              v-model="showValue"
              item-text="name"
              :items="reflectedItems"
              label="Show"
            />
          </v-form>

          <v-btn v-if="!editMode" @click="addOption">Add more conditions</v-btn>
        </v-col>
      </v-row>

      <v-card-actions>
        <v-btn
          outlined
          color="primary"
          @click="onDiscardItem"
        >{{ isItemEditable ? 'Discard Changes' : 'Close' }}</v-btn>
        <v-spacer />
        <v-btn color="primary" @click="onSaveItem">Save</v-btn>
      </v-card-actions>
    </v-container>
  </v-card>
</template>

<script>
import ConditionalItemList from "./ConditionalItemList.vue";

export default {
  components: {
    ConditionalItemList
  },
  props: {
    editConditionalCallback: {
      type: Function,
      required: true
    },
    initialConditionalItemData: {
      type: Object,
      required: true
    },
    editConditionalItemIndex: {
      type: Number,
      default: -1
    },
    items: {
      type: Array,
      required: true
    },
    showItems: {
      type: Array,
      required: true
    },
    isItemEditable: {
      type: Boolean,
      default: true
    },
    editMode: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: "radio"
    }
  },
  data: function() {
    return {
      minValue: this.initialConditionalItemData.minValue || 1,
      maxValue: this.initialConditionalItemData.maxValue || 0,
      ifValue: this.initialConditionalItemData.ifValue || "",
      stateValue: this.initialConditionalItemData.stateValue || "",
      stateItems: [],
      showValue: this.initialConditionalItemData.showValue || "",
      showItemsFiltered: [],
      filteredItems: [],
      options: [],
      answerItems: [],
      answerValue: this.initialConditionalItemData.answerValue || "",
      sliderNumOptions: 0
    };
  },
  watch: {
    items() {
      this.setFilteredItems();
    },
    ifValue() {
      this.fillAnswerAndShowItems();
      this.setStateItems();
    }
  },
  created() {
    this.$watch("$props", this.setStateItems, { deep: true });
    this.setFilteredItems();
    this.fillAnswerAndShowItems();
    if (this.ifValue !== "") {
      this.setStateItems();
    }
  },
  computed: {
    reflectedItems() {
      const showItems = JSON.parse(JSON.stringify(this.showItems));
      return this.showItems;
    }
  },
  methods: {
    setStateItems() {
      const { type, ifValue } = this
      this.stateItems =
        type === "radio"
          ? ifValue.options && ifValue.options.isMultipleChoice
            ? [
                { name: "Includes", val: "includes" },
                { name: "Doesn't include", val: "!includes" }
              ]
            : [
                { name: "IS EQUAL TO", val: "==" },
                { name: "IS NOT EQUAL TO", val: "!=" }
              ]
          : [
              { name: "GREATER THEN", val: ">" },
              { name: "LESS THEN", val: "<" },
              { name: "EQUAL TO", val: "=" },
              { name: "WITHIN", val: "within" },
              { name: "OUTSIDE OF", val: "outsideof" }
            ];
    },
    fillAnswerAndShowItems() {
      if (this.ifValue === "") return;
      let answerItemsObj = this.items.find(item => {
        return item.question === this.ifValue.question;
      });
      if (this.type === "radio") {
        this.answerItems = answerItemsObj.responseOptions.choices.map(
          choice => {
            return {
              name: choice["schema:name"],
              value: choice["schema:value"]
            };
          }
        );
      } else if (this.type === "slider") {
        this.sliderNumOptions = answerItemsObj.options.numOptions;
      }

      const index = this.showItems.findIndex(item => {
        return item.question === this.ifValue.question;
      });

      const showItems = JSON.parse(JSON.stringify(this.showItems));

      this.showItemsFiltered = showItems.splice(index + 1);
    },
    setFilteredItems() {
      this.filteredItems = this.items.map(item => {
        const index = this.showItems.findIndex(showItem => item.name === showItem.name);
        return {
          ...item,
          index
        };
      })
    },
    onSaveItem() {
      this.addOption();
      if (this.editConditionalItemIndex !== -1) {
        const payload = {
          index: this.editConditionalItemIndex,
          item: {
            ifValue: this.ifValue,
            stateValue: this.stateValue,
            showValue: this.showValue,
            answerValue: this.answerValue,
            minValue: this.minValue,
            maxValue: this.maxValue
          }
        };

        this.editConditionalCallback(payload, true);
      } else {
        this.editConditionalCallback(this.options, false);
      }
      this.clearValues();
    },
    onDiscardItem() {
      this.clearValues();
      this.$emit("closeConditionalItemModal", null);
    },
    addOption() {
      const obj = {
        ifValue: this.ifValue,
        stateValue: this.stateValue,
        showValue: this.showValue
      };

      if (this.type === "radio") obj.answerValue = this.answerValue;
      else {
        obj.minValue = this.minValue;
        obj.maxValue = this.maxValue;
      }

      this.options.push(obj);
    },
    clearValues() {
      this.ifValue = "";
      this.stateValue = "";
      this.answerValue = "";
      this.showValue = {};
      this.minValue = "";
      this.maxValue = "";
    }
  }
};
</script>
