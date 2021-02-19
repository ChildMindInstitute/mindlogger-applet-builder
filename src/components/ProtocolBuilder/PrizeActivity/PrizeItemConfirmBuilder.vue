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

    let item = model.getItemBuilderData({});

    Object.assign(item, {
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
      },
      question: {
        text: this.option.question,
        image: this.option.image
      }
    })
    model.updateReferenceObject(item);
    return {
      item,
      model
    }
  },
  computed: {
    optionName() {
      return this.option.name;
    },
    optionPrice() {
      return this.option.price;
    },
    optionImage() {
      return this.option.image;
    }
  },
  watch: {
    optionName() {
      this.createQuestion();
      this.$emit('onConfrimItemCreate', this.item);
    },
    optionPrice() {
      this.createQuestion();    
      this.$emit('onConfrimItemCreate', this.item);
    },
    optionImage() {
      this.createQuestion();
      this.$emit('onConfrimItemCreate', this.item)
    }
  },
  created() {
    this.item.responseOptions = this.model.getResponseOptions();
  },
  mounted() {
    this.$emit('onConfrimItemCreate', this.item);
  },
  methods: {
    createQuestion() {
      this.item.question.text = `Do you want \"${this.option.name}\" for ${this.option.price} token${this.option.price >= 2 ? 's' : ''}?`;
      this.item.question.image = this.optionImage;
    }
  }

}
</script>

<style lang="scss" scoped>

</style>
