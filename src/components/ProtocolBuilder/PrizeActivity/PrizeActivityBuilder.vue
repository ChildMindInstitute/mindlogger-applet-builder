<template>
  <PrizeItemBuilder 
    :initial-item-data="activity.initialItemData"
    :items="activity.items"
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

    let initialData = this.initialActivityData;

    if (!Object.keys(this.initialActivityData).length) {
      initialData = model.getActivityBuilderData({});
    }
    Object.assign(initialData, {
      name: 'PrizeActivity',
      isPrize: true
    })

    model.updateReferenceObject(initialData);

    return {
      model,
      activity: initialData,
    }
  },
  methods: {
    onUpdateItem(items) {
      this.activity.items = [...items];
      this.$emit('closeModal', this.activity);
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
