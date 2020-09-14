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
            <v-select
              v-model="answerValue"
              item-text="name"
              :items="answerItems"
              label="Answer"
            />
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
      ifValue: this.initialConditionalItemData.ifValue || "",
      stateValue: this.initialConditionalItemData.stateValue || "",
      stateItems: [],
      showValue: this.initialConditionalItemData.showValue || "",
      showItems: [],
      options: [],
      answerItems: [],
      answerValue: this.initialConditionalItemData.answerValue || "",
    };
  },
  watch: {
    ifValue() {
      this.fillAnswerAndShowItems();
    },
  },
  created() {
    this.stateItems =
      this.type === "radio"
        ? ["IS EQUAL TO", "IS NOT EQUAL TO"]
        : ["GREATER THEN", "LESS THEN", "EQUAL TO", "WITHIN", "OUTSIDE OF"];

    this.fillAnswerAndShowItems();
  },
  methods: {
    fillAnswerAndShowItems() {
      if (this.ifValue === "") return;
      let answerItemsObj = this.items.find((item) => {
        return item.question === this.ifValue;
      });

      this.answerItems = answerItemsObj.options.options;

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
      this.options.push({
        ifValue: this.ifValue,
        stateValue: this.stateValue,
        showValue: this.showValue,
        answerValue: this.answerValue,
      });

      this.ifValue = "";
      this.stateValue = "";
      this.answerValue = "";
      this.showValue = {};
    },
  },
};
</script>
