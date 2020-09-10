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
          <conditional-item-list :options="options" />

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
          Save
        </v-btn>
      </v-card-actions>
    </v-container>
  </div>
</template>

<script>
import { without } from "lodash";
import ConditionalItemList from "./ConditionalItemList.vue";

export default {
  components: {
    ConditionalItemList,
  },
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
      items2: [
        {
          id: 1,
          avatar: "https://s3.amazonaws.com/vuetify-docs/images/lists/1.jpg",
          title: "Brunch this life?",
          subtitle: "Subtitle 1",
        },
        {
          id: 2,
          avatar: "https://s3.amazonaws.com/vuetify-docs/images/lists/2.jpg",
          title: "Winter Lunch",
          subtitle: "Subtitle 2",
        },
        {
          id: 3,
          avatar: "https://s3.amazonaws.com/vuetify-docs/images/lists/3.jpg",
          title: "Oui oui",
          subtitle: "Subtitle 3",
        },
      ],
      items: this.$route.params.items,
      ifValue: "",
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
      if (this.ifValue === "") return;
      let answerItemsObj = this.items.find((item) => {
        return item.question === this.ifValue;
      });

      this.answerItems = answerItemsObj.options.options;

      this.showItems = this.items.filter((item) => {
        return item.question !== this.ifValue;
      });
    },
  },
  created() {},
  methods: {
    onSaveItem() {
      this.$store.commit("setConditionalItems", this.options);

      this.$router.push({
        name: "Builder",
      });
    },
    onDiscardItem() {
      this.$router.go(-1);
    },
    addOption() {
      this.options.push({
        ifValue: this.ifValue,
        stateValue: this.stateValue,
        showValue: this.showValue,
        answerValue: this.answerValue,
        value: {}, // To store for backend
      });

      this.ifValue = "";
      this.stateValue = "";
      this.answerValue = "";
      this.showValue = {};
    },
  },
};
</script>
