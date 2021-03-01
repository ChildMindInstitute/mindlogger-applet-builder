<template>
  <div>
    <p>Users will be prompted to take a date.</p>
    <OptionalItemText
      :colClasses="'d-flex align-center'"
      :cols="12"
      :md="3"
      :sm="6"
      :text="isOptionalText"
      :required="responseOptions.isOptionalTextRequired"
      @text="isOptionalText = $event; $emit('updateOptionalText', isOptionalText)"
      @required="responseOptions.isOptionalTextRequired = $event; onUpdateResponseOptions();"
    />
  </div>
</template>

<script>
import OptionalItemText from '../../Partial/OptionalItemText.vue';

export default {
  components: {
    OptionalItemText,
  },
  props: {
    initialItemResponseOptions: {
      type: Object,
      required: true,
    },
    initialIsOptionalText: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      responseOptions: this.initialItemResponseOptions,
      isOptionalText: this.initialIsOptionalText,
    }
  },
  methods: {
    onUpdateResponseOptions() {
      this.$emit('updateResponseOptions', this.responseOptions);
    },
  },
}
</script>
