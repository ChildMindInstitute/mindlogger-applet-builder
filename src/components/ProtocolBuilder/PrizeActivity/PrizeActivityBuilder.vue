<template>
  <PrizeItemBuilder 
    :initial-item-data="initialItemData"
    :items="items"
    @updateItem="onUpdateItem"
    @closeOptions="$emit('closeModal', initialActivityData)"
    @deleteOptions="$emit('deleteOptions', null)"
  />
</template>

<script>
import Activity from '../../../models/Activity';
import Item from '../../../models/Item';
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

    let initialData = this.initialActivityData;

    if (!Object.keys(this.initialActivityData).length) {
      initialData = model.getActivityBuilderData({});
    }
    return {
      model,
      ...initialData,
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

      const itemModel = new Item();
      const activityData = this.model.getActivityData();

      this.$emit('closeModal', this.model.getActivityBuilderData({
        ...activityData,
        items: activityData.items.map(item => itemModel.getItemBuilderData(item))
      }));
    }

  }
}
</script>

<style lang="scss" scoped>

</style>
