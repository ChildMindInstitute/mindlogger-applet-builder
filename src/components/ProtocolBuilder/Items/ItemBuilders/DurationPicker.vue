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
              class="mt-0"
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
              @required="updateRequired($event)"
            />
          </v-row>
        </v-col>
        <v-col
          cols="12"
          sm="3"
        >
          <v-checkbox
            class="ml-6 mt-0"
            v-model="timeDuration.days"
            @change="update('days')"
            label="Days"
          />
          <v-checkbox
            class="ml-6 mt-0"
            v-model="timeDuration.weeks"
            @change="update('weeks')"
            label="Weeks"
          />
          <v-checkbox
            class="ml-6 mt-0"
            v-model="timeDuration.months"
            @change="update('months')"
            label="Months"
          />
          <v-checkbox
            class="ml-6 mt-0"
            v-model="timeDuration.years"
            @change="update('years')"
            label="Years"
          />
        </v-col>
        <v-col
          cols="12"
          sm="3"
        >
          <v-checkbox
            class="ml-6 mt-0"
            v-model="timeDuration.secs"
            @change="update('secs')"
            label="Seconds"
          />
          <v-checkbox
            class="ml-6 mt-0"
            v-model="timeDuration.mins"
            @change="update('mins')"
            label="Minutes"
          />
          <v-checkbox
            class="ml-6 mt-0"
            v-model="timeDuration.hours"
            @change="update('hours')"
            label="Hours"
          />
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
    initialItemData: {
      type: Object,
      required: true
    },
    initialResponseOptions: {
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
    const timeDuration = {};
    const values = this.initialItemData.timeDuration ? this.initialItemData.timeDuration.split(' ') : [];

    if (values.includes('hours')) {
      timeDuration.hours = true;
    } else {
      timeDuration.hours = false;
    }

    if (values.includes('mins')) {
      timeDuration.mins = true;
    } else {
      timeDuration.mins = false;
    }

    if (values.includes('secs')) {
      timeDuration.secs = true;
    } else {
      timeDuration.secs = false;
    }

    if (values.includes('years')) {
      timeDuration.years = true;
    } else {
      timeDuration.years = false;
    }

    if (values.includes('months')) {
      timeDuration.months = true;
    } else {
      timeDuration.months = false;
    }

    if (values.includes('weeks')) {
      timeDuration.weeks = true;
    } else {
      timeDuration.weeks = false;
    }

    if (values.includes('days')) {
      timeDuration.days = true;
    } else {
      timeDuration.days = false;
    }

    if (values.length === 0) {
      timeDuration.days = true;
    }

    return {
      responseOptions: this.initialResponseOptions,
      isOptionalText: this.initialIsOptionalText,
      timeDuration,
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
    update(key) {
      let timeDuration = "";
      Object.keys(this.timeDuration).forEach(key => {
        timeDuration += this.timeDuration[key] ? key + ' ' : '';
      })

      const responseOptions = {
        timeDuration,
      };

      if (!timeDuration) {
        this.$nextTick(() => {
          this.timeDuration[key] = true;
        })
      } else {
        this.$emit('updateOptions', responseOptions);
      }
    },
    onUpdateResponseOptions() {
      if (this.responseOptions.isOptionalTextRequired)
        this.$emit('updateAllow', false);
      this.$emit('updateResponseOptions', this.responseOptions);
    },
  },
}
</script>