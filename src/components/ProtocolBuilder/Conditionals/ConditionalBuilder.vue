<template>
  <v-card
    class="pa-2"
  >
    <v-card-title
      class="px-2 py-0 conditional-title"
      :class="current.valid ? '' : 'invalid'"
    >
      <span v-if="stateValue">
        <span
          :class="current.valid ? 'blue--text' : 'yellow-text'"
        >IF </span>
        <span>
          {{ ifValue.name || 'XXX' }}
        </span>

        <span
          :class="current.valid ? 'blue--text' : 'yellow-text'"
        >
          {{ stateValue.name }}
        </span>

        <span v-if="answerValue">{{ answerValue.name }} </span>
        <template v-else>
          <span>{{ minValue !== null ? minValue : 'XXX' }} </span>
          <span v-if="maxValue">AND {{ maxValue }} </span>
        </template>
        <span
          :class="current.valid ? 'blue--text' : 'yellow-text'"
        >
          SHOW 
        </span>
        <span>{{ showValue || 'XXX' }} </span>
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
            edit
          </v-icon>

          <v-icon
            v-else
            color="grey lighten-1"
          >
            mdi-chevron-double-up
          </v-icon>
        </v-btn>

        <v-btn
          icon
          @click="deleteConditional(conditionalIndex)"
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
        <v-select
          v-model="ifValue"
          item-text="name"
          :items="filteredItems"
          return-object
          label="If"
          @change="onUpdate"
        />
        <v-select
          v-model="stateValue"
          name="name"
          :items="stateItems"
          item-text="name"
          return-object
          label="State"
          @change="onUpdate"
        />

        <template v-if="ifValue.inputType === 'slider'">
          <v-text-field
            v-model="minValue"
            label="Min value"
            :min="minSliderTick"
            :max="maxSliderTick"
            type="number"
            @input="onUpdate"
          />

          <v-text-field
            v-if="
              stateValue.name === 'WITHIN' ||
                stateValue.name === 'OUTSIDE OF'
            "
            v-model="maxValue"
            label="Max value"
            :min="minSliderTick"
            :max="maxSliderTick"
            type="number"
            @input="onUpdate"
          />
        </template>
        <template v-else>
          <v-select
            v-model="answerValue"
            item-text="name"
            :items="answerItems"
            label="Answer"
            return-object
            @input="onUpdate"
          />
        </template>
        <v-select
          v-model="showValue"
          item-text="name"
          :items="items"
          label="Show"
          @change="onUpdate"
        />
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

      ifValue: this.current.ifValue || null,
      stateValue: this.current.stateValue || null,
      minValue: this.current.minValue === undefined ? null : this.current.minValue,
      maxValue: this.current.maxValue === undefined ? null : this.current.maxValue,
      answerValue: this.current.answerValue === undefined ? null : this.current.answerValue,
      showValue: this.current.showValue || null,
    }
  },
  beforeMount () {
    if (!this.ifValue) {
      this.ifValue = this.filteredItems[0];
    }
  },
  computed: {
    config () {
      return config;
    },
    ...mapGetters(config.MODULE_NAME,
      [
        'currentActivity'
      ]
    ),

    items () {
      return this.currentActivity.items;
    },

    filteredItems () {
      return this.items.filter(item => 
        (item.inputType == 'radio' || item.inputType == 'checkbox' || item.inputType == 'slider' || item.inputType == 'prize') && item.allowEdit
      );
    },

    stateItems () {
      if ( this.ifValue.inputType === 'radio' || this.ifValue.inputType === 'checkbox' || this.ifValue.inputType === 'prize' ) {
        return this.ifValue.options && this.ifValue.options.isMultipleChoice
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
        { name: "GREATER THEN", val: ">" },
        { name: "LESS THEN", val: "<" },
        { name: "EQUAL TO", val: "=" },
        { name: "WITHIN", val: "within" },
        { name: "OUTSIDE OF", val: "outsideof" }
      ];
    },

    minSliderTick () {
      return this.ifValue.inputType == 'slider' && this.ifValue.options.minSliderTick || 0;
    },
    maxSliderTick () {
      return this.ifValue.inputType == 'slider' && this.ifValue.options.maxSliderTick || 0;
    },

    answerItems () {
      return this.ifValue.inputType != 'slider' && this.ifValue.options.options || [];
    }
  },
  methods: {
    ...mapMutations(config.MODULE_NAME,
      [
        'deleteConditional',
        'updateConditionalData'
      ]
    ),
    isValid () {
      if (!this.ifValue || !this.stateValue || !this.showValue) {
        return false;
      }

      if (this.ifValue.inputType == 'slider') {
        if ( (this.stateValue.name === 'WITHIN' || this.stateValue.name === 'OUTSIDE OF') && (!this.maxValue && this.maxValue !== 0) ) {
          return false;
        }

        return (this.minValue || this.minValue === 0);
      }
      return (this.answerValue || this.answerValue === 0);
    },
    onUpdate () {
      this.updateConditionalData({
        index: this.conditionalIndex,
        obj: {
          ifValue: this.ifValue,
          stateValue: this.stateValue,
          showValue: this.showValue,
          answerValue: this.answerValue,
          minValue: this.minValue,
          maxValue: this.maxValue,
          valid: this.isValid()
        }
      })
    }
  },
}
</script>
