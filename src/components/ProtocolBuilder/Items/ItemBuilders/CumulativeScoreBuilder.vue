<template>
  <div>
    <v-form>
      <v-expansion-panels
        v-model="panels"
        multiple
      >
        <MarkDownEditor
          v-model="scoreOverview"
          class="score-overview"
          placeholder="Overview"
        />
        <v-expansion-panel
          v-for="(rule, id) in rules"
          :key="id"
        >
          <v-expansion-panel-header class="rule-header">
            <div class="rule-header">
              <div class="rule-title">
                <span :class="rule.valid ? '' : 'invalid'">{{ rule.name }}</span>
              </div>

              <v-btn @click="deleteCumulative(id)">
                <v-icon> mdi-delete </v-icon>
              </v-btn>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-text-field
              v-model="rule.name"
              label="Cumulative Score Title"
              type="text"
              maxlength="55"
              @input="onUpdateRule(rule)"
              @keydown="nameKeydown($event)"
            />
            <MarkDownEditor
              v-model="rule.description"
              class="mb-4"
              placeholder="Cumulative Score Description"
              @input="onUpdateRule(rule, 'description')"
            />
            <v-card class="mb-4">
              <v-card-title>Which direction should be used in the report</v-card-title>
              <v-card-text>
                <v-radio-group
                  v-model="rule.direction"
                  class="mt-0"
                  color="primary"
                  row
                  @change="onUpdateRule(rule)"
                >
                  <v-radio :value="true">
                    <template v-slot:label>
                      <img
                        :src="baseImageURL + 'score_bar.png'"
                        class="score-bar"
                      >
                    </template>
                  </v-radio>
                  <v-radio :value="false">
                    <template v-slot:label>
                      <img
                        :src="baseImageURL + 'score_bar.png'"
                        class="score-bar reverse"
                      >
                    </template>
                  </v-radio>
                </v-radio-group>
              </v-card-text>
            </v-card>
            <div class="item-list">
              <div class="list-title">
                Items within cumulative score
              </div>
              <v-list
                class="items"
                subheader
              >
                <v-list-item-group color="primary">
                  <v-list-item
                    v-for="(item, index) in rule.items"
                    :key="index"
                    @click="rowClicked(item, rule)"
                  >
                    <v-list-item-action>
                      <v-checkbox
                        v-model="item.selected"
                        color="primary"
                        disabled
                      />
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
              item-text="text"
              item-value="value"
              label="Options"
              return-object
              @change="onUpdateRule(rule)"
            />

            <v-text-field
              v-model="rule.score"
              label="Score"
              type="number"
              :rules="scoreValueRules"
              @input="onUpdateRule(rule)"
            />

            <v-select
              v-model="rule.outputType"
              :items="outputTypes"
              item-text="text"
              item-value="value"
              label="Output Type"
              return-object
              @change="onUpdateRule(rule)"
            />

            <div>
              Message {{ rule.operator.text }}
              <MarkDownEditor
                v-model="rule.messageInRange"
                :rules="textRules"
                @input="onUpdateRule(rule, 'messageInRange')"
              />
            </div>

            <div class="d-flex align-baseline mt-2">
              <v-switch
                v-model="rule.isActivityInRange"
                class="mt-0 pt-0"
                inset
                type="text"
                @change="(v) => activitySelect(v, rule, 'activityInRange')"
              />
              <div v-if="rule.isActivityInRange" class="d-flex align-baseline">
                <div class="mr-2"> SHOW </div>
                <v-select
                  v-model="rule.activityInRange"
                  class="range-select"
                  :items="activityNames"
                  item-text="name"
                  item-value="name"
                  label="Select Activity"
                  solo
                  @change="onUpdateRule(rule)"
                />
                <div class="ml-2 text-uppercase">IF THE USER'S SCORE OF {{rule.operator.text || 'X'}} IS {{rule.score || 'Y'}}</div>
                <v-checkbox
                  class="ml-4"
                  label="Hide this activity until user meets threshold"
                  v-model="rule.hideActivityInRange"
                  @change="onUpdateRule(rule)"
                />
                <v-checkbox
                  class="ml-4"
                  label="Show recommendation badge"
                  v-model="rule.isInRangeRecommended"
                  @change="onUpdateRule(rule)"
                />
              </div>
              <div v-else>
                <div>Show an activity based on the score the user achieves</div>
              </div>
            </div>

            <div>
              Message out of range
              <MarkDownEditor
                v-model="rule.messageOutRange"
                :rules="textRules"
                @input="onUpdateRule(rule, 'messageOutRange')"
              />
            </div>

            <div class="d-flex align-baseline mt-2">
              <v-switch
                v-model="rule.isActivityOutRange"
                class="mt-0 pt-0"
                inset
                type="text"
                @change="(v) => activitySelect(v, rule, 'activityOutRange')"
              />

              <div v-if="rule.isActivityOutRange" class="d-flex align-baseline">
                <div class="mr-2"> SHOW </div>
                <v-select
                  class="range-select"
                  v-model="rule.activityOutRange"
                  :items="activityNames"
                  item-text="name"
                  item-value="name"
                  label="Select Activity"
                  solo
                  @change="onUpdateRule(rule)"
                />
                <div class="ml-2">IF THE USER'S SCORE OUT OF RANGE</div>
                <v-checkbox
                  class="ml-4"
                  label="Hide this activity until user meets threshold"
                  v-model="rule.hideActivityOutRange"
                  @change="onUpdateRule(rule)"
                />
                <v-checkbox
                  class="ml-4"
                  label="Show recommendation badge"
                  v-model="rule.isOutRangeRecommended"
                  @change="onUpdateRule(rule)"
                />
              </div>
              <div v-else>
                <div>Show an activity based on the score the user achieves</div>
              </div>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-btn
        class="mt-4"
        @click="addNewCumulative"
      >
        Add cumulative
      </v-btn>
    </v-form>
    <v-dialog
        v-model="alertFlag"
        persistent
        width="500"
      >
      <v-card>
        <v-card-text class="pt-4">
          {{alertMsg}}
        </v-card-text>

        <v-card-actions
          class="justify-space-around"
        >
          <v-btn
            @click="alertFlag = false"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
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

.range-select {
  height: 48px;
}

.rule-header .rule-title span {
  width: 100%;
  font-weight: 600;
  font-size: 20px;
}

.score-overview {
  width: 100%
}
.score-bar {
  width: 200px;
}
.score-bar.reverse{
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
</style>

<script>
import { mapGetters, mapMutations } from 'vuex';
import config from '../../../../config';
import MarkDownEditor from '../../MarkDownEditor';
import { checkItemVariableName } from '../../../../utilities/util';

export default {
  components: {
    MarkDownEditor
  },
  props: {
    initialItemData: {
      type: Object,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    activity: {
      type: Object,
      required: true,
    },
    currentActivity: {
      type: Object,
      required: false
    },
    itemIndex: {
      type: Number,
      default: -1,
    },
    allowEdit: {
      type: Boolean,
      default: true
    },
    variablesItems: {
      type: Object
    }
  },
  data: function () {
    return {
      rules: [],
      panels: [0],
      options: [
        {
          text: "at or above",
          value: true,
        },
        {
          text: "at or below",
          value: false,
        },
      ],
      outputTypes: [
        {
          text: "Percentage Correct",
          value: "percentage",
        },
        {
          text: "Cumulative Total",
          value: "cumulative",
        },
      ],

      scoreValueRules: [(v) => v !== "" || "score value must not be empty"],
      textRules: [(v) => !!v || "this field must not be empty"],
      activityNames: [],
      errorMsg: "This item is not supported, please remove it.",
      alertFlag: false,
      alertMsg: '',
    };
  },
  computed: {
    ...mapGetters(config.MODULE_NAME, ['activities', 'baseImageURL']),
    scoreOverview: {
      get() {
        return this.activity.scoreOverview;
      },
      set(value) { 
        this.activity.scoreOverview = value;
      }
    }
  },
  watch: {
    scoreOverview: function(text) {
      this.debounce(function() {
        const { valid, found, variableNames = [] } = checkItemVariableName(text, this.currentActivity, this.itemIndex);
        try {
          Object.assign(this.variablesItems, { [this.currentActivity.items[this.itemIndex].name]: variableNames })
        } catch (error) { }
        if (found) {
          if (this.currentActivity.isOnePageAssessment || this.currentActivity.isSkippable) {
            this.alertFlag = true;
            this.alertMsg = `${this.currentActivity.isSkippable ? 'Skipping all the items' : 'A one-page assessment'} cannot contain variables. This variable will automatically be removed.`
            setTimeout(()=> {
              variableNames.forEach(variable => {
                text = text.replace(`[[${variable}]]`, '');
              });
            }, 200);
          }
          this.currentActivity.hasVariable = found;
          this.updateActivityMetaInfo({ hasVariable: found })
        }

        if (_.concat([], ...Object.values(this.variablesItems)).length < 1) {
          this.currentActivity.hasVariable = false;
        }
      }, 300)
    },
  },
  beforeMount() {
    let rules = this.initialItemData.cumulativeScores || [];
    rules = rules.map((rule) => ({ ...rule }));
    
    this.activityNames = this.activities && this.activities.filter(obj => obj.name !== this.currentActivity.name).map(act => act.name)
    for (let rule of rules) {
      Object.assign(rule, this.parseRuleData(rule));

      if (!rule.activityOutRange || !this.activityNames.find(actName => actName === rule.activityOutRange)) {
        rule.isActivityOutRange = false;
      }
      if (!rule.activityInRange || !this.activityNames.find(actName => actName === rule.activityInRange)) {
        rule.isActivityInRange = false;
      }
    }

    this.rules = rules;

    if (!rules.length) {
      this.rules.push(this.parseRuleData());
      this.$emit("updateCumulativeScore", this.rules);
    }
  },
  methods: {
    ...mapMutations(config.MODULE_NAME,
      [
        'updateActivityMetaInfo',
      ],
    ),
    debounce (func, delay) {
      const context = this;
      const args = arguments;
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => func.apply(context, args), delay);
    },
    nameKeydown(e) {
      if (!/^[a-zA-Z0-9_\s]+$/.test(e.key)) {
        e.preventDefault();
      }
    },
    update() {
      this.$emit("updateCumulativeScore", this.rules);
    },

    handleActivityHide(key, value) {
      this.$emit("updateCumulativeScore", this.rules);
    },

    rowClicked(item, rule) {
      item.selected = !item.selected;

      this.onUpdateRule(rule);
    },

    activitySelect(v, rule, key) {
      if(!v) {
        rule[key] = null;
      } else {
        rule.valid = false;
        this.update();
      }
      this.onUpdateRule(rule)
    },

    onUpdateRule(rule, fieldName) {
      try {
        if (rule.name && rule.name.match(/[&\/\\#,+()$~%.'":*?<>{}]/g)) {
          rule.name = rule.name.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
        }        
      } catch (error) { }

      rule.compute = {
        jsExpression: rule.items
          .filter((item) => item.selected)
          .map((item) => item.name)
          .join(" + "),
        variableName: rule.name,
        direction: rule.direction,
        description: rule.description,
      };

      rule.messages = [
        {
          jsExpression:
            rule.name + (rule.operator.value ? " >= " : " <= ") + rule.score,
          message: rule.messageInRange,
          outputType: rule.outputType.value,
          nextActivity: rule.activityInRange,
          hideActivity: rule.hideActivityInRange,
          isRecommended: rule.isInRangeRecommended,
        },
        {
          jsExpression:
            rule.name + (rule.operator.value ? " < " : " > ") + rule.score,
          message: rule.messageOutRange,
          outputType: rule.outputType.value,
          nextActivity: rule.activityOutRange,
          hideActivity: rule.hideActivityOutRange,
          isRecommended: rule.isOutRangeRecommended,
        },
      ];

      rule.valid =
        rule.messageInRange.length &&
        rule.messageOutRange.length &&
        rule.name !== "" &&
        rule.score !== "" &&
        (rule.isActivityInRange ? rule.isActivityInRange && rule.activityInRange : true) &&
        (rule.isActivityOutRange ? rule.isActivityOutRange && rule.activityOutRange : true) &&
        rule.items.some((item) => item.selected);
      
      if (fieldName) {
        this.debounce(function() {
          const { valid, found, variableNames = [] } = checkItemVariableName(rule[fieldName], this.currentActivity, this.itemIndex);
          try {
            Object.assign(this.variablesItems, { [`${this.currentActivity.items[this.itemIndex]}${rule.name}`]: variableNames })
          } catch (error) { }
          if (found) {
            if (this.currentActivity.isOnePageAssessment || this.currentActivity.isSkippable) {
              this.alertFlag = true;
              this.alertMsg = `${this.currentActivity.isSkippable ? 'Skipping all the items' : 'A one-page assessment'} cannot contain variables. This variable will automatically be removed.`
              setTimeout(()=> {
                variableNames.forEach(variable => {
                  rule[fieldName] = rule[fieldName].replace(`[[${variable}]]`, '');
                });
              }, 200);
            }
            this.currentActivity.hasVariable = found;
            this.updateActivityMetaInfo({ hasVariable: found })
          }

          if (_.concat([], ...Object.values(this.variablesItems)).length < 1) {
            this.currentActivity.hasVariable = false;
          }
        }, 300)
      }

      this.update();
    },

    parseRuleData(rule) {
      if (!rule) {
        return {
          name: "",
          description: "",
          direction: true,
          items: this.items
            .filter((item) => item.options && item.options.hasScoreValue)
            .map((item) => ({
              name: item.name,
              selected: false,
            })),
          operator: this.options[0],
          score: "",
          outputType: this.outputTypes[0],
          messageInRange: "",
          hideActivityInRange: true,
          isInRangeRecommended: false,
          messageOutRange: "",
          hideActivityOutRange: true,
          isOutRangeRecommended: false,
          valid: false,
        };
      }

      const itemNames = rule.compute.jsExpression
        .split(" + ")
        .map((name) => name.trim());

      const message = rule.messages.find(
        (message) =>
          message.jsExpression.includes(">=") ||
          message.jsExpression.includes("<=")
      );

      const messageOutRange = message == rule.messages[0]
            ? rule.messages[1]
            : rule.messages[0];

      return {
        name: rule.compute.variableName,
        description: rule.compute.description,
        direction: rule.compute.direction,
        items: this.items
          .filter((item) => item.options && item.options.hasScoreValue)
          .map((item) => ({
            name: item.name,
            selected: itemNames.includes(item.name),
          })),
        operator: this.options.find(
          (option) => option.value === message.jsExpression.includes(">=")
        ),
        score: message.jsExpression.split(/[><]=/g)[1].trim(),
        outputType: this.outputTypes.find(
          (outputType) => outputType.value === message.outputType
        ),
        messageInRange: message.message,
        messageOutRange: messageOutRange.message,
        valid: true,
        isActivityInRange: Boolean(message && message.nextActivity),
        activityInRange: message && message.nextActivity,
        hideActivityInRange: message && message.hasOwnProperty('hideActivity') && message.hideActivity !== undefined ? message.hideActivity : true,
        isInRangeRecommended: message && message.hasOwnProperty('isRecommended') && message.isRecommended !== undefined ? message.isRecommended : false,
        isActivityOutRange: Boolean(messageOutRange && messageOutRange.nextActivity),
        activityOutRange: messageOutRange && messageOutRange.nextActivity,
        hideActivityOutRange: messageOutRange && messageOutRange.hasOwnProperty('hideActivity') && messageOutRange.hideActivity !== undefined ? messageOutRange.hideActivity : true,
        isOutRangeRecommended: messageOutRange && messageOutRange.hasOwnProperty('isRecommended') && messageOutRange.isRecommended !== undefined ? messageOutRange.isRecommended : false,
      };
    },

    deleteCumulative(id) {
      this.rules.splice(id, 1);

      this.update();
    },

    addNewCumulative() {
      this.rules.push(this.parseRuleData(null));
      this.panels.push(this.rules.length - 1);

      this.update();
    },
  },
};
</script>
