<template>
  <div></div>
</template>

<script>
import Item from '../../../models/Item';

export default {
  props: {
    option: {
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
      ...model.getItemBuilderData({ question: this.option.question }),
      name: 'Confirmation' + (this.option.value + 1),
      inputType: 'radio',
      options: {
        hasScoreValue: false,
        isTokenValue: false,
        hasPriceValue: false,
        isMultipleChoice: false,
        isSkippableItem: false,
        nextOptionName: "",
        nextOptionValue: "",
        nextOptionImage: "",
        options: [
          { name: "Yes", value: 0, score: 0 }
        ]
      }
    }
  },
  computed: {
    optionName() {
      return this.option.name;
    },
    optionPrice() {
      return this.option.price;
    }
  },
  watch: {
    optionName() {
      this.createQuestion();
      this.$emit('onConfrimItemCreate', this.model.getItemData());
    },
    optionPrice() {
      this.createQuestion();    
      this.$emit('onConfrimItemCreate', this.model.getItemData());
    }
  },
  created() {
    this.responseOptions = this.model.getResponseOptions();
    this.$emit('onConfrimItemCreate', this.model.getItemData());
  },
  methods: {
    createQuestion() {
      this.question.text = `Do you want \"${this.option.name}\" for ${this.option.price} token${this.option.price >= 2 ? 's' : ''}?`;
    }
  }

}
</script>

<style lang="scss" scoped>

</style>