<template>
  <div>
    <p>Users will be prompted to enter time.</p>

    <v-container>
      <v-row>
        <v-col
          cols="12"
          sm="6"
        >
          <v-row>
            <v-checkbox
              v-model="isSkippable"
              label="Skippable Item"
              :disabled="isSkippableItem == 2 || isOptionalText && responseOptions.isOptionalTextRequired"
            />
          </v-row>
          <v-row>
            <OptionalItemText
              :colClasses="'d-flex align-center'"
              :cols="12"
              :md="6"
              :sm="6"
              :text="isOptionalText"
              :required="responseOptions.isOptionalTextRequired"
              @text="isOptionalText = $event; $emit('updateOptionalText', isOptionalText)"
              @required="updateRequired"
            />
          </v-row>
        </v-col>
        <v-col
          cols="12"
          sm="3"
        >
          <v-radio-group v-model="durationType">
            <v-radio
              label="Time"
              value="time"
            ></v-radio>

            <v-checkbox
              class="ml-6"
              v-if="durationType === 'time'"
              v-model="hours"
              label="Hours"
            />
            <v-checkbox
              class="ml-6"
              v-if="durationType === 'time'"
              v-model="mins"
              label="Minutes"
            />
            <v-checkbox
              class="ml-6"
              v-if="durationType === 'time'"
              v-model="secs"
              label="Seconds"
            />

            <v-radio
              label="Days"
              value="days"
            ></v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
    </v-container>

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
    isSkippableItem: {
      type: Number,
      default: 0,
    },
  },
  data() {
    let durationType = "";
    let hours = false;
    let mins = false;
    let secs = false;

    return {
      responseOptions: this.initialItemResponseOptions,
      isOptionalText: this.initialIsOptionalText,
      durationType,
      hours,
      mins,
      secs,
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
  },
}
</script>