<template>
  <v-card>
    <v-card-title class="headline grey lighten-2" primary-title>
      <v-icon left>
        {{ isItemEditable ? "mdi-pencil" : "mdi-eye" }}
      </v-icon>
      {{ isItemEditable ? "Edit Item" : "View Item" }}
    </v-card-title>
    <v-container>
      <v-row no-gutters>
        <v-col md="6" offset-md="3">
          <conditional-item-list
            v-if="!editMode"
            :options="options"
            noActions
          />

          <v-form ref="form" lazy-validation>
            <v-select
              v-model="ifValue"
              item-text="question"
              :items="items"
              label="If"
            />
            <v-select v-model="stateValue" :items="stateItems" label="State" />

            <template v-if="type === 'slider'">
              <v-text-field
                v-model="minValue"
                label="Min value"
                min="1"
                :max="sliderNumOptions"
                type="number"
              />

              <v-text-field
                v-if="stateValue === 'WITHIN' || stateValue === 'OUTSIDE OF'"
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
              />
            </template>
            <v-select
              v-model="showValue"
              item-text="question"
              :items="showItems"
              label="Show"
            />
          </v-form>

          <v-btn v-if="!editMode" @click="addOption">
            Add more conditions
          </v-btn>
        </v-col>
      </v-row>

      <v-card-actions>
        <v-btn outlined color="primary" @click="onDiscardItem">
          {{ isItemEditable ? "Discard Changes" : "Close" }}
        </v-btn>
        <v-spacer />
        <v-btn color="primary" @click="onSaveItem">
          Save
        </v-btn>
      </v-card-actions>
    </v-container>
  </v-card>
</template>

<script>
import ConditionalItemList from "./ConditionalItemList.vue";

export default {
  components: {
    ConditionalItemList,
  },
  props: {
    editConditionalCallback: {
      type: Function,
      required: true,
    },
    initialConditionalItemData: {
      type: Object,
      required: true,
    },
    editConditionalItemIndex: {
      type: Number,
      default: -1,
    },
    items: {
      type: Array,
      required: true,
    },
    isItemEditable: {
      type: Boolean,
      default: true,
    },
    editMode: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: "radio",
    },
  },
  data: function() {
    return {
      minValue: this.initialConditionalItemData.minValue || 1,
      maxValue: this.initialConditionalItemData.maxValue || 0,
      ifValue: this.initialConditionalItemData.ifValue || "",
      stateValue: this.initialConditionalItemData.stateValue || "",
      stateItems: [],
      showValue: this.initialConditionalItemData.showValue || "",
      showItems: [],
      options: [],
      answerItems: [],
      answerValue: this.initialConditionalItemData.answerValue || "",
      sliderNumOptions: 0,
    };
  },
  watch: {
    ifValue() {
      this.fillAnswerAndShowItems();
    },
  },
  created() {
    this.$watch("$props", this.setStateItems, { deep: true });

    this.setStateItems();
    this.fillAnswerAndShowItems();
  },
  methods: {
    setStateItems() {
      this.stateItems =
        this.type === "radio"
          ? ["IS EQUAL TO", "IS NOT EQUAL TO"]
          : ["GREATER THEN", "LESS THEN", "EQUAL TO", "WITHIN", "OUTSIDE OF"];
    },
    fillAnswerAndShowItems() {
      if (this.ifValue === "") return;
      let answerItemsObj = this.items.find((item) => {
        return item.question === this.ifValue;
      });

      if (this.type === "radio") {
        this.answerItems = answerItemsObj.options.options;
      } else {
        this.sliderNumOptions = answerItemsObj.options.numOptions;
      }

      this.showItems = this.items.filter((item) => {
        return item.question !== this.ifValue;
      });
    },
    onSaveItem() {
      if (this.editConditionalItemIndex !== -1) {
        const payload = {
          index: this.editConditionalItemIndex,
          item: {
            ifValue: this.ifValue,
            stateValue: this.stateValue,
            showValue: this.showValue,
            answerValue: this.answerValue,
          },
        };

        this.editConditionalCallback(payload, true);
      } else {
        this.editConditionalCallback(this.options, false);
      }
    },
    onDiscardItem() {
      this.$emit("closeConditionalItemModal", null);
    },
    addOption() {
      const obj = {
        ifValue: this.ifValue,
        stateValue: this.stateValue,
        showValue: this.showValue,
      };

      if (this.type === "radio") obj.answerValue = this.answerValue;
      else {
        obj.minValue = this.minValue;
        obj.maxValue = this.maxValue;
      }

      this.options.push(obj);

      this.ifValue = "";
      this.stateValue = "";
      this.answerValue = "";
      this.showValue = {};
      this.minValue = "";
      this.maxValue = "";
    },
  },
};
</script>
