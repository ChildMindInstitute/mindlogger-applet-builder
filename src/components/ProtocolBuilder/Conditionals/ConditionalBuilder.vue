<template>
  <v-card
    class="pa-2"
  >
    <v-card-title
      class="px-2 py-0 conditional-title"
      :class="valid ? '' : 'invalid'"
    >
      <span v-if="!isExpanded">
        <span
          :class="current.valid ? 'blue--text' : 'yellow-text'"
        >IF </span>
        <span class="font-weight-bold">
          {{ operation || 'XXX' }}
        </span>
        <span
          :class="current.valid ? 'blue--text' : 'yellow-text'"
        >
          OF THE "IF" RULES ARE MATCHED, SHOW
        </span>
        <span class="font-weight-bold">{{ showValue && showValue.name || 'XXX' }} </span>
      </span>

      <v-spacer />

      <v-card-actions>
        <v-btn
          icon
          @click="isExpanded = !isExpanded;"
        >
          <v-icon
            v-if="!isExpanded"
            color="grey lighten-1"
          >
            mdi-chevron-down
          </v-icon>

          <v-icon
            v-else
            color="grey lighten-1"
          >
            mdi-chevron-up
          </v-icon>
        </v-btn>

        <v-btn
          icon
          :disabled="!isExpanded"
          @click="onAddcondition()"
        >
          <v-icon color="grey lighten-1">
            mdi-plus
          </v-icon>
        </v-btn>

        <v-btn
          icon
          @click="onDeleteConditional()"
        >
          <v-icon color="grey lighten-1">
            mdi-delete
          </v-icon>
        </v-btn>
      </v-card-actions>
    </v-card-title>

    <div
      v-if="isExpanded"
      class="mx-4"
    >
      <v-form
        ref="form"
        lazy-validation
      >
        <div
          v-for="(condition, index) in conditions"
          :key="index"
          class="d-flex align-baseline"
        >
          <v-select
            v-model="condition.ifValue"
            class="ds-select-box mb-3"
            item-text="name"
            :items="ifOptions"
            return-object
            label="If"
            @change="onUpdate"
          />
          <v-select
            v-model="condition.stateValue"
            class="ds-select-box"
            name="name"
            :items="stateItems(condition)"
            item-text="name"
            return-object
            label="State"
            @change="onUpdate"
          />

          <template v-if="!condition.ifValue || !condition.ifValue.isActivity">
            <template v-if="condition.ifValue && condition.ifValue.inputType === 'slider'">
              <v-text-field
                v-model="condition.minValue"
                class="ds-select-box"
                label="Min value"
                :min="minSliderTick(condition.ifValue)"
                :max="maxSliderTick(condition.ifValue)"
                type="number"
                @input="onUpdate"
              />

              <v-text-field
                v-if="
                  condition.stateValue && (condition.stateValue.name === 'BETWEEN' ||
                    condition.stateValue.name === 'OUTSIDE OF')
                "
                v-model="condition.maxValue"
                class="ds-select-box"
                label="Max value"
                :min="minSliderTick(condition.ifValue)"
                :max="maxSliderTick(condition.ifValue)"
                type="number"
                @input="onUpdate"
              />
            </template>

            <template v-else>
              <v-select
                v-model="condition.answerValue"
                class="ds-select-box"
                item-text="name"
                :items="answerItems(condition.ifValue)"
                label="Answer"
                return-object
                @input="onUpdate"
              />
            </template>
          </template>

          <v-btn
            v-if="conditions.length > 1"
            icon
            @click="onDeleteCondition(index)"
          >
            <v-icon color="grey lighten-1">
              mdi-close
            </v-icon>
          </v-btn>
        </div>
        <v-row no-gutters>
          <v-col class="d-flex ds-panel align-self-center align-baseline justify-center mt-3">
            <div class="text-uppercase h6">
              If
            </div>
            <v-select
              v-model="operation"
              class="ds-opers ds-select-box"
              :items="['ALL', 'ANY']"
              outlined
              dense
              @change="onUpdate"
            />
            <div class="text-uppercase h6">
              Of The "IF" Rules Are Matched, Show
            </div>

            <v-select
              v-model="showValue"
              class="ds-select-box ds-show-value"
              item-text="name"
              :items="items"
              return-object
              dense
              outlined
              @change="onUpdate"
            />
          </v-col>
        </v-row>
      </v-form>
    </div>
  </v-card>
</template>

<style scoped>
  .conditional-title {
    font-size: 17px;
  }

  .invalid {
    background-color: #d44c4c;
    color: white;
  }

  .ds-select-box {
    max-height: 40px;
    margin: 5px;
    background: white;
  }

  .ds-show-value {
    max-width: 200px;
  }

  .ds-opers {
    max-width: 120px;
  }

  .ds-panel {
    background: gray;
    border-radius: 0 0 10px 10px;
    color: white;
    letter-spacing: 1px;
  }

</style>

<script>
import { mapGetters, mapMutations } from 'vuex';
import config from '../../../config';

export default {
  props: {
    conditionalIndex: {
      type: Number,
      required: true,
    },
    current: {
      type: Object,
      required: true,
    }
  },
  data () {
    return {
      isExpanded: !this.current.stateValue,
      conditions: (this.current.conditions || []).map(condition => ({ ...condition })),
      valid: this.current.valid || false,
      ifValue: this.current.ifValue || null,
      stateValue: this.current.stateValue || null,
      minValue: this.current.minValue === undefined ? null : this.current.minValue,
      maxValue: this.current.maxValue === undefined ? null : this.current.maxValue,
      answerValue: this.current.answerValue === undefined ? null : this.current.answerValue,
      showValue: this.current.showValue || null,
      operation: this.current.operation || null,
      initialCondition: {
        ifValue: null,
        stateValue: null,
        minValue: null,
        maxValue: null,
        answerValue: null,
      }
    }
  },
  computed: {
    config () {
      return config;
    },
    ...mapGetters(config.MODULE_NAME,
      [
        'currentActivity',
        'activities'
      ]
    ),

    items () {
      return this.currentActivity.items;
    },

    filteredItems () {
      return this.items.filter(item =>
        (item.inputType == 'radio' || item.inputType == 'checkbox' || item.inputType == 'slider' || item.inputType == 'prize') && item.allowEdit
      )
    },

    ifOptions () {
      return this.filteredItems.concat({
        name: this.currentActivity.name,
        isActivity: true
      });
    },
  },
  beforeMount () {
    const activityOption = this.ifOptions.find(option => option.isActivity);

    for (const condition of this.conditions) {
      if (condition.activityCondition) {
        this.$set(
          condition,
          'ifValue',
          activityOption
        );
      }
    }

    if (!this.conditions.length) {
      this.conditions.push({ ...this.initialCondition });
    }
  },
  methods: {
    ...mapMutations(config.MODULE_NAME,
      [
        'deleteConditional',
        'updateConditionalData',
      ]
    ),

    stateItems (condition) {
      const { ifValue } = condition;
      if (!ifValue) return [];

      if ( ifValue.isActivity ) {
        return [
          {
            name: "is shown for the first time",
            val: "isActivityShownFirstTime"
          },
          {
            name: "is not shown for the first time",
            val: "!isActivityShownFirstTime"
          }
        ]
      }

      if ( ifValue.inputType === 'radio' || ifValue.inputType === 'checkbox' || ifValue.inputType === 'prize' ) {
        return ifValue.options && ifValue.options.isMultipleChoice
          ? [
              { name: "Includes", val: "includes" },
              { name: "Doesn't include", val: "!includes" }
            ]
          : [
              { name: "IS EQUAL TO", val: "==" },
              { name: "IS NOT EQUAL TO", val: "!=" }
            ]
      }

      return [
        { name: "GREATER THAN", val: ">" },
        { name: "LESS THAN", val: "<" },
        { name: "EQUAL TO", val: "==" },
        { name: "BETWEEN", val: "between" },
        { name: "OUTSIDE OF", val: "outsideof" }
      ];
    },

    minSliderTick (ifValue) {
      if (!ifValue || typeof ifValue != 'object') return 0;
      return ifValue.inputType === 'slider' && ifValue.options.minSliderTick || 0;
    },
    maxSliderTick (ifValue) {
      if (!ifValue || typeof ifValue != 'object') return 0;
      return ifValue.inputType === 'slider' && ifValue.options.maxSliderTick || 0;
    },

    answerItems (ifValue) {
      if (!ifValue || typeof ifValue != 'object') return [];

      return ifValue.inputType !== 'slider' && ifValue.options.options || [];
    },
    isValid () {
      if (!this.operation || !this.showValue) return false;

      for(const condition of this.conditions) {
        if (!condition.ifValue || !condition.stateValue) return false;
        if (condition.ifValue.inputType === 'slider') {
          if ( (condition.stateValue.name === 'BETWEEN'
            || condition.stateValue.name === 'OUTSIDE OF')
            && (!condition.maxValue && condition.maxValue !== 0) ) {
            return false;
          }
          if (!condition.minValue && condition.minValue !== 0) return false;
        } else if (!condition.ifValue.isActivity) {
          if (!condition.answerValue && condition.answerValue !== 0) return false;
        }
      }
      return true;
    },
    onDeleteCondition (index) {
      this.conditions.splice(index, 1);
    },
    onAddcondition () {
      this.conditions.push({ ...this.initialCondition });
      this.onUpdate();
    },
    onDeleteConditional () {
      this.deleteConditional(this.conditionalIndex);
    },
    onUpdate () {
      const { conditions, operation, showValue } = this;

      this.valid = this.isValid();

      this.updateConditionalData({
        index: this.conditionalIndex,
        updates: {
          conditions: conditions.map(condition => {
            if (condition.ifValue && condition.ifValue.isActivity) {
              return {
                ...condition,
                ifValue: condition.ifValue.name.replaceAll(' ', '_'),
                activityCondition: true
              }
            }

            return {
              ...condition,
              activityCondition: false
            };
          }),
          operation,
          showValue,
          valid: this.valid,
        }
      });
    }
  },
}
</script>
