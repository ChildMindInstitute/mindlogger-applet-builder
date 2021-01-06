<template>
  <PrizeItemBuilder 
    :initial-item-data="initialItemData"
    :updateItem="onUpdateItem"
    @updateItem="onUpdateItem"
    @discardUpdateItem="onDiscardUpdateItem"
    @deleteOptions="$emit('deleteOptions', null)"
  />
</template>

<script>
import Activity from '../../../models/Activity';
import PrizeItemBuilder from './PrizeItemBuilder.vue';

export default {
  components: {
    PrizeItemBuilder
  },
  props: {
    initialActivityData: {
      type: Object,
      required: true
    }
  },
  data: function() {

    const model = new Activity();
    model.updateReferenceObject(this);

    return {
      model,
      ...model.getActivityBuilderData(this.initialActivityData),
      name: 'PrizeActivity',
      isPrize: true
    }
  },
  methods: {

    onUpdateItem(items) {
      this.items = [...items];

      const prizeItem = this.items[0];
      const propertiesArr = [{
          "variableName": prizeItem.name,
          "isAbout": prizeItem.name,
          "isVis": true
      }];
      const orderArr = [prizeItem.name];

      prizeItem.options.options.forEach((option, index) => {
        const confirmItem = this.items[index + 1];
        orderArr.push(confirmItem.name);
        propertiesArr.push({
          "variableName": confirmItem.name,
          "isAbout": confirmItem.name,
          "isVis": `${prizeItem.name} == ${option.value}`
        });
      });

      const schema = this.model.getCompressedSchema();
      schema.ui.order = orderArr;
      schema.ui.addProperties = propertiesArr;
      this.conditionalItems = this.model.getConditionalItems(schema, this.items);
      
      this.$emit('closeModal', this.model.getActivityData());
    },

    onDiscardUpdateItem() {
      this.$emit('closeModal', null);
    }

  }
}
</script>

<style lang="scss" scoped>

</style>