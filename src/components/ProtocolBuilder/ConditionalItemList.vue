<template>
  <div>
    <draggable v-model="items" @end="onDragEnd">
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
            <span v-if="item.answerValue">{{ item.answerValue }} </span>
            <template v-else>
              <span>{{ item.minValue }} </span>
              <span v-if="item.maxValue">AND {{ item.maxValue }} </span>
            </template>
            <span>{{ item.showValue }} </span>
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action v-if="!noActions">
          <v-btn icon @click="editItem(index)">
            <v-icon color="grey lighten-1">
              edit
            </v-icon>
          </v-btn>
        </v-list-item-action>
        <v-list-item-action v-if="!noActions">
          <v-btn icon @click="deleteConditionalCallback(index)">
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
    deleteConditionalCallback: {
      type: Function,
      required: false,
      default: () => {},
    },
    options: {
      type: Array,
      required: true,
    },
    noActions: {
      type: Boolean,
      default: false,
    },
  },
  data: function() {
    return {
      items: this.options,
    };
  },
  created() {
    this.$watch("$props", this.watchHandler, { deep: true });
  },
  methods: {
    watchHandler() {
      this.items = this.options;
    },
    onDragEnd(item) {
      this.$emit("dragConditionalItem", this.items);
    },
    editItem(index) {
      this.$emit("editConditionalItem", index);
    },
  },
};
</script>

<style lang="scss" scoped>
.draggable-item {
  cursor: pointer;
}
</style>
