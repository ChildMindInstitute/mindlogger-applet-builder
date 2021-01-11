<template>
  <PrizeBuilder
    :options="options"
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
    updateItem: {
      type: Function,
      default: null
    }
  },
  data: function() {

    const model = new Item();
    model.updateReferenceObject(this);

    return {
      model,
      ...model.getItemBuilderData(this.initialItemData),
      inputType: 'prize'
    }
  },
  methods: {

    onUpdateOptions(newOptions, confirmItems) {
      this.name = 'PrizeSelection';
      this.options = newOptions;
      this.responseOptions = this.model.getResponseOptions();
      this.$emit('updateItem', [this.model.getItemData(), ...confirmItems]);
    }

  }
}
</script>

<style lang="scss" scoped>

</style>