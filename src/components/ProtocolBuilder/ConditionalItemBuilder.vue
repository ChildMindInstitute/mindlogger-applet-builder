<template>
  <div>
    <v-card-title class="headline grey lighten-2" primary-title>
      <v-icon left>
        {{ isItemEditable ? "mdi-pencil" : "mdi-eye" }}
      </v-icon>
      {{ isItemEditable ? "Edit Item" : "View Item" }}
    </v-card-title>
    <v-container>
      <v-row no-gutters>
        <v-col md="6" offset-md="3">
          <v-list-item v-for="(option, index) in options" :key="index">
            <v-list-item-content>
              <v-list-item-title>
                <span class="blue--text">IF </span>
                <span>{{ option.ifValue }} </span>
                <span class="blue--text">{{ option.stateValue }} </span>
                <span>{{ option.answerValue }} </span>
                <span>{{ option.showValue }} </span>
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon @click="deleteOption(index)">
                <v-icon color="grey lighten-1">
                  delete
                </v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>

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

          <v-btn @click="addOption">
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
          Save Item
        </v-btn>
      </v-card-actions>
    </v-container>
  </div>
</template>

<script>
import { without } from "lodash";

export default {
  components: {},
  props: {
    // initialItemData: {
    //   type: Object,
    //   required: true,
    // },
    isItemEditable: {
      type: Boolean,
      default: true,
    },
  },
  data: function() {
    return {
      items: this.$route.params.items,
      ifValue: {},
      stateValue: "",
      stateItems: ["IS EQUAL TO", "IS NOT EQUAL TO"],
      showValue: {},
      showItems: [],
      options: [],
      answerItems: [],
      answerValue: "",
    };
  },
  watch: {
    ifValue() {
      let answerItemsObj = this.items.find((item) => {
        return item.question === this.ifValue;
      });

      this.answerItems = answerItemsObj.options.options;
      console.log("answerItems: ", this.answerItems);
      this.showItems = this.items.filter((item) => {
        return item.question !== this.ifValue;
      });
    },
  },
  created() {},
  methods: {
    onSaveItem() {},
    onDiscardItem() {
      this.$emit("closeItemModal", null);
    },
    addOption() {
      this.options.push({
        ifValue: this.ifValue,
        stateValue: this.stateValue,
        showValue: this.showValue,
        answerValue: this.answerValue,
        value: {}, // To store for backend
      });

      this.ifValue = {};
      this.stateValue = "";
      this.showValue = {};

      console.log("options: ", this.options);
    },
  },
};
</script>
