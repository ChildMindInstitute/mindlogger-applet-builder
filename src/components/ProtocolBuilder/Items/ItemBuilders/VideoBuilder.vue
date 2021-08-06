<template>
  <div>
    <p>Users will be prompted to take a video.</p>

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
          @change="update"
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
          label="Remove back button"
          @change="update"
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
      @required="updateRequired"
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
    initialItemData: {
      type: Object,
      required: true
    },
    initialIsOptionalText: {
      type: Boolean,
      default: false,
    },
    isSkippableItem: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      responseOptions: this.initialItemResponseOptions,
      removeBackOption: this.initialItemData.removeBackOption,
      isOptionalText: this.initialIsOptionalText,
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
    updateRequired(event) {
      // disable the skippable button if item is required 
      if (event) {
        this.isSkippable = false
        this.isSkippableItem=2
      } else {
        this.isSkippableItem=0
      }

      this.responseOptions.isOptionalTextRequired = event;
      this.onUpdateResponseOptions();
    },
    onUpdateResponseOptions() {
      if (this.responseOptions.isOptionalTextRequired)
        this.$emit('updateAllow', false);
      else if (this.responseOptions.isOptionalTextRequired === false)
        this.$emit('updateAllow', undefined);
      this.$emit('updateResponseOptions', this.responseOptions);
    },
    update() {
      const responseOptions = {
        'isSkippableItem': this.isSkippable,
        'removeBackOption': this.removeBackOption,
      };
      this.$emit('updateOptions', responseOptions);
    },
  },
}
</script>
