<template>
  <div>
    <p>Users will be prompted to take a date.</p>
    <v-row>
      <v-col
        class="d-flex align-center"
        cols="12"
        md="3"
        sm="6"
      >
        <v-checkbox
          v-model="isSkippable"
          label="Skippable Item"
          :disabled="isSkippableItem == 2 || isOptionalText && responseOptions.isOptionalTextRequired"
        />
      </v-col>
      <v-col
        class="d-flex align-center"
        cols="12"
        md="3"
        sm="6"
      >
        <v-checkbox
          v-model="removeBackOption"
          label="Remove ability to go back to the previous item"
          @change="update"
        />
      </v-col>
      <v-col
        class="d-flex align-center"
        cols="12"
      > 
        <ItemTimerOption
          colClasses="d-flex align-center py-0 px-3"
          @update="updateTimerOption"
          :responseTimeLimit="timer"
        />
      </v-col>
    </v-row>
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
import ItemTimerOption from '../../Partial/ItemTimerOption';

export default {
  components: {
    OptionalItemText,
    ItemTimerOption,
  },
  props: {
    initialItemData: {
      type: Object,
      required: true
    },
    initialItemResponseOptions: {
      type: Object,
      required: true,
    },
    initialIsOptionalText: {
      type: Boolean,
      default: false,
    },
    isSkippableItem: {
      type: Number,
      default: 0,
    },
    timer: {
      type: Number,
      required: false
    },
  },
  data() {
    return {
      responseOptions: this.initialItemResponseOptions,
      isOptionalText: this.initialIsOptionalText,
      removeBackOption: this.initialItemData.removeBackOption,
    }
  },
  computed: {
    isSkippable: {
      get() {
        return this.isSkippableItem === 1 || false;
      },
      set(value) {
        this.$emit('updateAllow', value);
      }
    }
  },
  methods: {
    updateTimerOption(option) {
      this.$emit('updateTimer', option.responseTimeLimit)
    },

    update() {
      const responseOptions = {
        removeBackOption: this.removeBackOption,
      };
      this.$emit('updateOptions', responseOptions);
    },

    onUpdateResponseOptions() {
      if (this.responseOptions.isOptionalTextRequired)
        this.$emit('updateAllow', false);
      this.$emit('updateResponseOptions', this.responseOptions);
    },
  },
}
</script>
