<template>
  <v-form
    ref="form"
    lazy-validation
  >
    <div
      v-for="(condition, index) in conditions"
      :key="index"
      class="d-flex align-baseline mx-4"
    >
      <v-select
        v-model="condition.ifValue"
        class="ds-select-box mb-3"
        :items="ifOptions"
        return-object
        label="If"
        @change="onUpdate"
        :disabled="!!presetIfValue"
      >
        <template v-slot:item="{ item, on }">
          <v-list-item
            :class="condition.ifValue == item ? 'v-list-item--active' : ''"
            color="primary"
            link
            v-on="on"
          >
            <v-list-item-title>{{ item.name || item.id || '' }}</v-list-item-title>
          </v-list-item>
        </template>

        <template v-slot:selection="{ item }">
          <div style="color: rgba(0, 0, 0, 0.87)">{{ item.name || item.id || '' }}</div>
        </template>
      </v-select>

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
        <template v-if="condition.ifValue && (condition.ifValue.inputType === 'slider' || condition.ifValue.dataType == 'score')">
          <v-text-field
            v-model="condition.minValue"
            class="ds-select-box"
            label="Value"
            :min="getMinValue(condition.ifValue)"
            :max="getMaxValue(condition.ifValue)"
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
            label="Value"
            :min="getMinValue(condition.ifValue)"
            :max="getMaxValue(condition.ifValue)"
            type="number"
            @input="onUpdate"
          />
        </template>

        <template v-else>
          <v-select
            v-if="!condition.ifValue || !condition.ifValue.isConditional"
            v-model="condition.answerValue"
            class="ds-select-box"
            item-text="name"
            :items="answerItems(condition.ifValue)"
            label="Value"
            return-object
            @input="onUpdate"
          />

          <v-select
            v-else
            v-model="condition.answerValue"
            class="ds-select-box"
            :items="answerItems(condition.ifValue)"
            label="Value"
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
      <v-col
        class="d-flex ds-panel align-self-center align-baseline mt-4 py-1 px-8"
        :class="current.valid ? '' : 'invalid'"
      >
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

        <div
          v-if="showValueRequired"
          class="text-uppercase h6"
        >
          Of The "IF" Rules Are Matched, Show
        </div>

        <div
          v-else
          class="h6"
        >
          conditions are TRUE:
        </div>

        <v-select
          v-if="showValueRequired"
          v-model="showValue"
          class="ds-select-box ds-show-value"
          item-text="name"
          :items="filteredItemsToShow"
          return-object
          dense
          outlined
          @change="onUpdate"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<style scoped>
.ds-select-box {
  max-height: 40px;
  margin: 5px;
}

.ds-show-value {
  max-width: 200px;
}

.ds-opers {
  max-width: 120px;
}

.ds-panel {
  background: #96CBFF;
  color: #001D34;
  letter-spacing: 1px;
}

.ds-panel.invalid {
  background: #FFB4A9;
}
</style>

<script>
export default {
  props: {
    activity: {
      type: Object,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    showItems: {
      type: Array,
      required: false,
      default: () => []
    },
    current: {
      type: Object,
      required: true,
    },
    showValueRequired: {
      type: Boolean,
      required: false,
      default: true
    },
    presetIfValue: {
      type: Object,
      required: false,
      default: () => null
    }
  },

  data () {
    return {
      conditions: (this.current.conditions || []).map(condition => ({ ...condition, ifValue: (condition.ifValue || this.presetIfValue) })),
      showValue: this.current.showValue || null,
      operation: this.current.operation || null,
      initialCondition: {
        ifValue: this.presetIfValue,
        stateValue: null,
        minValue: null,
        maxValue: null,
        answerValue: null,
      }
    }
  },

  computed: {
    ifOptions () {
      return this.items.concat({
        name: this.activity.name,
        isActivity: true
      });
    },
    filteredItemsToShow() {
      const items = this.conditions.find((condition) => condition.ifValue && condition.ifValue.isActivity) 
        ? this.showItems 
        : this.showItems.filter((item) => item.allowEdit && ['radio', 'checkbox', 'slider', 'prize', 'text'].includes(item.inputType))

      return items
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
      this.onUpdate();
    }
  },

  methods: {
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

      if ( ifValue.isConditional ) {
        return [
          { name: "IS EQUAL TO", val: "==" },
        ]
      }
      return [
        { name: "GREATER THAN", val: ">" },
        { name: "LESS THAN", val: "<" },
        { name: "EQUAL TO", val: "==" },
        { name: "IS NOT EQUAL TO", val: "!=" },
        { name: "BETWEEN", val: "between" },
        { name: "OUTSIDE OF", val: "outsideof" }
      ];
    },

    getMinValue (ifValue) {
      if (!ifValue || typeof ifValue != 'object') return 0;
      return ifValue.inputType === 'slider' && ifValue.options.minSliderTick || ifValue.minScore || 0;
    },

    getMaxValue (ifValue) {
      if (!ifValue || typeof ifValue != 'object') return 0;
      return ifValue.inputType === 'slider' && ifValue.options.maxSliderTick || ifValue.maxScore || 0;
    },

    answerItems (ifValue) {
      if (!ifValue || typeof ifValue != 'object') return [];

      if (ifValue.isConditional) return ['True', 'False'];

      return ifValue.inputType !== 'slider' && ifValue.options && ifValue.options.options || [];
    },

    isValid () {
      if (!this.operation || this.showValueRequired && !this.showValue) return false;

      for(const condition of this.conditions) {
        if (!condition.ifValue || !condition.stateValue) return false;

        if (condition.ifValue.inputType === 'slider' || condition.ifValue.dataType == 'score') {
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
      this.onUpdate();
    },

    onAddcondition () {
      this.conditions.push({ ...this.initialCondition });
      this.onUpdate();
    },

    onUpdate () {
      this.$emit('update', {
        conditions: this.conditions,
        operation: this.operation,
        showValue: this.showValue,
        valid: this.isValid()
      })
    }
  }
}
</script>
