<template>
  <v-form>
    <v-expansion-panels
      v-model="panels"
      multiple
    >
      <v-expansion-panel
        v-for="(rule, id) in rules"
        :key="id"
      >
        <v-expansion-panel-header class="rule-header">
          <div class="rule-header">
            <div class="rule-title">
              <span :class="rule.valid ? '' : 'invalid'">{{ rule.name }}</span> 
            </div>

            <v-btn
              @click="deleteCumulative(id)"
            >
              <v-icon>
                mdi-delete
              </v-icon>
            </v-btn>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-text-field
            v-model="rule.name"
            label="Cumulative Score Title"
            type="text"
            :disabled="!isItemEditable"
            @input="onUpdateRule(rule)"
            @keydown="nameKeydown($event)"
          />

          <div class="item-list">
            <div class="list-title">Items within cumulative score</div>
            <v-list
              class="items"
              subheader
            >
              <v-list-item-group
                color="primary"
              >
                <v-list-item
                  v-for="(item, index) in rule.items"
                  :key="index"
                  @click="rowClicked(item, rule)"
                >
                  <v-list-item-action>
                    <v-checkbox
                      color="primary"
                      v-model="item.selected"
                      disabled
                    ></v-checkbox>
                  </v-list-item-action>
                  <v-list-item-content>
                    <v-list-item-title v-text="item.name" />
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </div>

          <v-select
            v-model="rule.operator"
            :items="options"
            :disabled="!isItemEditable"
            item-text="text"
            item-value="value"
            label="Options"
            @change="onUpdateRule(rule)"
            return-object
          />

          <v-text-field
            v-model="rule.score"
            label="Score"
            type="number"
            :disabled="!isItemEditable"
            :rules="scoreValueRules"
            @input="onUpdateRule(rule)"
          />

          <v-select
            v-model="rule.outputType"
            :items="outputTypes"
            :disabled="!isItemEditable"
            item-text="text"
            item-value="value"
            label="Output Type"
            @change="onUpdateRule(rule)"
            return-object
          />

          <v-text-field
            v-model="rule.messageInRange"
            :label="`Message ${rule.operator.text}`"
            type="text"
            :disabled="!isItemEditable"
            :rules="textRules"
            @input="onUpdateRule(rule)"
          />

          <v-text-field
            v-model="rule.messageOutRange"
            label="Message out of range"
            type="text"
            :disabled="!isItemEditable"
            :rules="textRules"
            @input="onUpdateRule(rule)"
          />
        </v-expansion-panel-content>

      </v-expansion-panel>
    </v-expansion-panels>

    <v-btn
      :disabled="!isItemEditable"
      @click="addNewCumulative"
      class="mt-4"
    >
      Add cumulative
    </v-btn>
  </v-form>
</template>

<style scoped>
  .item-list .items {
    max-height: 200px;
    overflow-y: scroll;
  }

  .item-list .list-title {
    color: rgba(0, 0, 0, 0.6);
  }

  .invalid {
    border-bottom: 2px solid red;
  }

  .rule-header {
    display: flex;
  }

  .rule-header .rule-title {
    width: 100%;
  }

  .rule-header .rule-title span {
    width: 100%;
    font-weight: 600;
    font-size: 20px;
  }
</style>

<script>
export default {
  props: {
    initialItemData: {
      type: Object,
      required: true
    },
    items: {
      type: Array,
      required: true,
    },
    isItemEditable: {
      type: Boolean,
      default: true,
    },
  },
  data: function () {
    return {
      rules: [],
      panels: [0],
      options: [
        {
          text: 'at or above',
          value: true
        },
        {
          text: 'at or below',
          value: false
        }
      ],
      outputTypes: [
        {
          text: 'Percentage Correct',
          value: 'percentage',
        },
        {
          text: 'Cumulative Total',
          value: 'cumulative'
        }
      ],
      scoreValueRules: [
        v => v !== '' || 'score value must not be empty',
      ],
      textRules: [
        v => !!v || 'this field must not be empty',
      ]
    };
  },
  beforeMount() {
    let rules = this.initialItemData.cumulativeScores || [];
    rules = rules.map(rule => ({ ...rule }));

    for (let rule of rules) {
      Object.assign(rule, this.parseRuleData(rule));
    }

    this.rules = rules;

    if (!rules.length) {
      this.rules.push(this.parseRuleData());
    }
  },
  methods: {
    nameKeydown(e) {
      if (!/^[a-zA-Z0-9_]+$/.test(e.key)) {
        e.preventDefault();
      }
    },
    update () {
      this.$emit('updateCumulativeScore', this.rules);
    },

    rowClicked (item, rule) {
      item.selected = !item.selected;

      this.onUpdateRule(rule);
    },

    onUpdateRule (rule) {
      rule.compute = {
        jsExpression: rule.items.filter(item => item.selected).map(item => item.name).join(' + '),
        variableName: rule.name,
      }

      rule.messages = [
        {
          jsExpression: rule.name + (rule.operator.value ? ' >= ' : ' <= ') + rule.score,
          message: rule.messageInRange,
          outputType: rule.outputType.value,
        },
        {
          jsExpression: rule.name + (rule.operator.value ? ' < ' : ' > ') + rule.score,
          message: rule.messageOutRange,
          outputType: rule.outputType.value,
        }
      ]

      rule.valid = rule.messageInRange.length && 
        rule.messageOutRange.length &&
        rule.messageInRange.length &&
        rule.score !== '' && 
        rule.items.some(item => item.selected)

      this.update();
    },

    parseRuleData (rule) {
      if (!rule) {
        return {
          name: '',
          items: this.items.filter(item => item.options && item.options.hasScoreValue).map(item => ({
            name: item.name,
            selected: false,
          })),
          operator: this.options[0],
          score: '',
          outputType: this.outputTypes[0],
          messageInRange: '',
          messageOutRange: '',
          valid: false,
        };
      }

      const itemNames = rule.compute.jsExpression.split(' + ').map(name => name.trim());

      const message = rule.messages.find(
        message => 
          message.jsExpression.includes('>=') || message.jsExpression.includes('<=')
      );

      return {
        name: rule.compute.variableName,
        items: this.items.filter(item => item.options && item.options.hasScoreValue).map(item => ({
          name: item.name,
          selected: itemNames.includes(item.name)
        })),
        operator: this.options.find(option => option.value === message.jsExpression.includes('>=')),
        score: message.jsExpression.split(/[><]=/g)[1].trim(),
        outputType: this.outputTypes.find(outputType => outputType.value === message.outputType),
        messageInRange: message.message,
        messageOutRange: message == rule.messages[0] ? rule.messages[1].message : rule.messages[0].message,
        valid: true,
      }
    },

    deleteCumulative (id) {
      this.rules.splice(id, 1);

      this.update();
    },

    addNewCumulative () {
      this.rules.push(this.parseRuleData(null));
      this.panels.push(this.rules.length - 1);

      this.update();
    }
  }
}
</script>
