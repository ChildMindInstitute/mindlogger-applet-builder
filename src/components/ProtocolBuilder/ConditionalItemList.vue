<template>
  <div>
    <draggable v-model="items" :options="{ group: 'people' }">
      <v-list-item
        v-for="(item, index) in items"
        :key="index"
        class="draggable-item"
      >
        <v-list-item-content>
          <v-list-item-title>
            <span class="blue--text">IF </span>
            <span>{{ item.ifValue }} </span>
            <span class="blue--text">{{ item.stateValue }} </span>
            <span>{{ item.answerValue }} </span>
            <span>{{ item.showValue }} </span>
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
    </draggable>
  </div>
</template>

<script>
import draggable from "vuedraggable";

export default {
  components: {
    draggable,
  },
  props: {
    options: {
      type: Array,
      required: true,
    },
  },
  data: function() {
    return {
      items: this.options,
    };
  },
  created() {
    console.log("options1: ", this.options);
  },
  methods: {
    deleteOption() {
      this.$emit("deleteOption", index);
    },
  },
};
</script>

<style lang="scss" scoped>
.draggable-item {
  cursor: pointer;
}
</style>
