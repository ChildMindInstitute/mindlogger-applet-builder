<template>
  <v-form>
    <v-expansion-panels
      v-model="panels"
      multiple
    >
      <MarkDownEditor
        v-model="scoreOverview"
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
            placeholder="Cumulative Score Description"
            @input="onUpdateRule(rule)"
          />
          <v-card class="mb-4">
            <v-card-title>Which direction should be used in the report</v-card-title>
            <v-card-text>
              <v-radio-group
                v-model="rule.scoreDirection"
                class="mt-0"
                color="primary"
                row
                @change="onUpdateRule(rule)"
              >
                <v-radio value="true">
                  <template v-slot:label>
                    <img
                      src="@/assets/score_bar.png"
                      class="score-bar"
                    >
                  </template>
                </v-radio>
                <v-radio value="false">
                  <template v-slot:label>
                    <img
                      src="@/assets/score_bar.png"
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

          <v-text-field
            v-model="rule.messageInRange"
            :label="`Message ${rule.operator.text}`"
            type="text"
            :rules="textRules"
            @input="onUpdateRule(rule)"
          />

          <v-switch 
            v-model="rule.isActivityInRange" 
            inset 
            type="text" 
            @change="(v) => activitySelect(v, rule, 'activityInRange')" 
          />

          <v-select
            v-if="rule.isActivityInRange"
            v-model="rule.activityInRange"
            :items="activityNames"
            item-text="name"
            item-value="name"
            label="Select Activity"
            single-line
            @change="onUpdateRule(rule)"
          />

          <v-text-field
            v-model="rule.messageOutRange"
            label="Message out of range"
            type="text"
            :rules="textRules"
            @input="onUpdateRule(rule)"
          />

          <v-switch 
            v-model="rule.isActivityOutRange" 
            inset 
            type="text" 
            @change="(v) => activitySelect(v, rule, 'activityOutRange')" 
          />

          <v-select
            v-if="rule.isActivityOutRange"
            v-model="rule.activityOutRange"
            :items="activityNames"
            item-text="name"
            item-value="name"
            label="Select Activity"
            single-line
            @change="onUpdateRule(rule)"
          />
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

  .score-bar {
    width: 200px;
  }
  .score-bar.reverse{
    -webkit-transform: scaleX(-1);
    transform: scaleX(-1);
  }
</style>

<script>
import { mapGetters } from 'vuex';
import config from '../../../../config';
import MarkDownEditor from '../../MarkDownEditor';

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
    scoreOverview: {
      type: String,
      required: false,
      default: ''
    },
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
      activityNames: []
    };
  },
  computed: {
    ...mapGetters(config.MODULE_NAME, ['activities', 'currentActivity']),
  },
  beforeMount() {
    let rules = this.initialItemData.cumulativeScores || [];
    rules = rules.map((rule) => ({ ...rule }));

    for (let rule of rules) {
      Object.assign(rule, this.parseRuleData(rule));
    }

    this.rules = rules;

    if (!rules.length) {
      this.rules.push(this.parseRuleData());
      this.$emit("updateCumulativeScore", this.rules);
    }

    this.activityNames = this.activities && this.activities.filter(obj => obj.name !== this.currentActivity.name).map(act => act.name)
  },
  methods: {
    nameKeydown(e) {
      if (!/^[a-zA-Z0-9_\s]+$/.test(e.key)) {
        e.preventDefault();
      }
    },
    update() {
      this.$emit("updateCumulativeScore", this.rules);
    },

    rowClicked(item, rule) {
      item.selected = !item.selected;

      this.onUpdateRule(rule);
    },

    activitySelect(v, rule, key) {
      if(!v) this.onUpdateRule({...rule, [key]: null})
    },

    onUpdateRule(rule) {
      rule.compute = {
        jsExpression: rule.items
          .filter((item) => item.selected)
          .map((item) => item.name)
          .join(" + "),
        variableName: rule.name,
        direction: rule.direction,
      };

      rule.messages = [
        {
          jsExpression:
            rule.name + (rule.operator.value ? " >= " : " <= ") + rule.score,
          message: rule.messageInRange,
          outputType: rule.outputType.value,
          nextActivity: rule.activityInRange
        },
        {
          jsExpression:
            rule.name + (rule.operator.value ? " < " : " > ") + rule.score,
          message: rule.messageOutRange,
          outputType: rule.outputType.value,
          nextActivity: rule.activityOutRange
        },
      ];

      rule.valid =
        rule.messageInRange.length &&
        rule.messageOutRange.length &&
        rule.messageInRange.length &&
        rule.score !== "" &&
        (rule.isActivityInRange ? rule.isActivityInRange && rule.activityInRange : true) &&
        (rule.isActivityOutRange ? rule.isActivityOutRange && rule.activityOutRange : true) &&
        rule.items.some((item) => item.selected);

      this.update();
    },

    parseRuleData(rule) {
      if (!rule) {
        return {
          name: "",
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
          messageOutRange: "",
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
        isActivityOutRange: Boolean(messageOutRange && messageOutRange.nextActivity),
        activityOutRange: messageOutRange && messageOutRange.nextActivity
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
