<template>
  <PrizeBuilder
    :options="item.options"
    :items="items"
    :updateItem="updateItem"
    @updateOptions="onUpdateOptions"
    @closeOptions="$emit('closeOptions')"
    @deleteOptions="$emit('deleteOptions')"
  />
</template>

<script>
import Item from '../../../models/Item';
import PrizeBuilder from './PrizeBuilder.vue';

export default {
  components: {
    PrizeBuilder
  },
  props: {
    initialItemData: {
      type: Object,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    updateItem: {
      type: Function,
      default: null
    }
  },
  data: function() {

    const model = new Item();

    let initialData = this.initialItemData;

    if (!Object.keys(this.initialItemData).length) {
      initialData = model.getItemBuilderData({
        options: {}
      });
    }
    initialData.inputType = 'prize';

    model.updateReferenceObject(initialData);

    return {
      model,
      item: initialData
    }
  },
  methods: {

    onUpdateOptions(newOptions, confirmItems) {
      this.item.name = 'PrizeSelection';
      this.item.options = newOptions;
      this.item.responseOptions = this.model.getResponseOptions();

      this.$emit('updateItem', [this.item, ...confirmItems]);
    }

  }
}
</script>

<style lang="scss" scoped>

</style>