<template>
  <v-card
    class="conditional-container"
    :class="valid ? '' : 'invalid'"
  >
    <v-card-title
      v-if="!isBlankConditional"
      class="px-2 py-0 conditional-title"
    >
      <span v-if="!isExpanded">
        <span>IF </span>
        <span class="font-weight-bold">
          {{ conditionalItem.operation || 'XXX' }}
        </span>
        <span>OF "IF" RULES ARE TRUE</span>
      </span>

      <v-spacer />

      <v-card-actions>
        <v-btn
          icon
          @click="isExpanded = !isExpanded;"
        >
          <v-icon
            v-if="!isExpanded"
            class="header-icon"
            color="lighten-1"
          >
            mdi-chevron-down
          </v-icon>

          <v-icon
            v-else
            class="header-icon"
            color="lighten-1"
          >
            mdi-chevron-up
          </v-icon>
        </v-btn>

        <v-btn
          icon
          :disabled="!isExpanded"
          @click="$refs.form.onAddcondition()"
        >
          <v-icon
            class="header-icon"
            color="lighten-1"
          >
            mdi-plus
          </v-icon>
        </v-btn>

        <v-btn
          icon
          @click="onDeleteConditional()"
          :disabled="!blank"
        >
          <v-icon
            class="header-icon"
            color="lighten-1"
          >
            mdi-delete
          </v-icon>
        </v-btn>
      </v-card-actions>
    </v-card-title>

    <div
      v-if="isBlankConditional"
      class="text-center py-2 my-2"
    >
      <v-btn
        class="add-btn"
        color="primary"
        rounded
        small
        @click="isBlankConditional=false"
      >
        Add conditional logic
      </v-btn>
    </div>

    <div
      v-else-if="isExpanded"
    >
      <ConditionalForm
        ref="form"
        :preset-if-value="ifValue"
        :current="conditionalItem"
        :items="ifOptions"
        :activity="currentActivity"
        :show-value-required="false"
        @update="update"
      />
    </div>
  </v-card>
</template>

<style scoped>
.add-btn /deep/ .v-btn__content {
  width: 100%;
  white-space: break-spaces;
  text-align: center;
}

.conditional-title {
  font-size: 17px;
}

.conditional-container {
  background: #E8F1FF;
}
.conditional-container.invalid {
  background: #FFEDE9;
}

.conditional-container .header-icon {
  color: #00629D;
}

.conditional-container.invalid .header-icon {
  color: #BA1B1B;
}
</style>

<script>
import ConditionalForm from '../ConditionalForm';
import config from '../../../config';
import { mapGetters } from 'vuex';

export default {
  components: {
    ConditionalForm,
  },

  props: {
    title: {
      type: String,
      required: false,
      default: ''
    },
    blank: {
      type: Boolean,
      required: false,
      default: true
    },
    conditionalItem: {
      type: Object,
      required: true
    },
    items: {
      type: Array,
      required: false,
      default: () => []
    },
    scores: {
      type: Array,
      required: true
    },
    ifValue: {
      type: Object,
      required: false,
      default: () => null
    }
  },

  data () {
    return {
      isBlankConditional: this.blank && !this.conditionalItem.conditions.length,
      isExpanded: !this.conditionalItem.stateValue
    }
  },

  computed: {
    config () {
      return config;
    },
    ...mapGetters(config.MODULE_NAME,
      [
        'currentActivity',
      ]
    ),

    ifOptions () {
      return this.items.concat(this.scores);
    },

    valid () {
      return this.conditionalItem.valid;
    }
  },

  methods: {
    update ({ conditions, operation, showValue, valid }) {
      this.$emit('update', {
        conditions: conditions.map(({ ifValue, ...restValues }) => {
          if (this.ifValue == ifValue) {
            return restValues;
          }

          return { ifValue, ...restValues };
        }),
        operation,
        showValue,
        valid
      })
    },

    onDeleteConditional () {
      this.isBlankConditional = true;

      this.update({
        showValue: null,
        conditions: [],
        operation: "ALL",
        valid: true
      })
    }
  }
}
</script>