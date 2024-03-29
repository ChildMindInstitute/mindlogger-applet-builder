<template>
  <v-card class="px-0">
    <CardHeader
      :score-id="report.id"
      :name="name"
      :valid="report.valid"
      :expanded="expanded"
      @setExpanded="expanded = $event"
      @deleteReport="$emit('deleteReport')"
    />

    <div
      v-if="expanded"
      class="pa-4 pt-0"
    >
      <v-row>
        <v-col>
          <v-text-field
            v-model.lazy="name"
            class="mr-6"
            label="Score Title"
            :error-messages="nameErrorMsg"
            @blur="onScoreTitleBlur"
          />
        </v-col>

        <v-col class="pl-6">
          <div 
            class="label score-label"
            :class="{ 'invalid-score-label': reportIdErrorMsg }"
          >
            Score ID

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon v-bind="attrs" v-on="on" class="pb-1" small>mdi-help-circle</v-icon>
              </template>

              <div class="tooltip-text">
                Surround the Score ID in [[   ]] or select it using the add variable button inside any markdown text editor to print the value of this score. <br />
                i.e. “You scored [[sumScore_happiness]] on the Happiness scale.”
              </div>
            </v-tooltip>
          </div>

          <v-text-field
            class="pt-0 mt-0"
            :value="report.id"
            readonly
            :error-messages="reportIdErrorMsg"
          />
        </v-col>
      </v-row>

      <div class="d-flex">
        <div class="output-type">
          <div class="label">
            How to calculate score:
          </div>

          <v-select
            v-model="outputType"
            :items="outputTypes"
            @change="onUpdateScoreRange"
            item-text="name"
            outlined
            dense
            return-object
          ></v-select>
        </div>

        <div class="mx-8">
          <div class="label">
            Possible range of scores:
          </div>

          <div
            v-show="minScore || maxScore"
            class="score-range mt-3"
          >
            {{ minScore }} ~ {{ maxScore }}
          </div>
          <div
            v-show="!(minScore || maxScore)"
            class="empty-score-range mt-3"
          >
             --
          </div>
        </div>
      </div>

      <div class="d-flex">
        <div class="all-items">
          <div class="d-flex">
            <div class="score-items-search">
              <div class="label">
                Items used to calculate score:
              </div>

              <v-text-field
                v-model="searchText"
                label="Search"
                outlined
                dense
              />
            </div>

            <div>
              <div class="label" />
              <div class="mt-3 mx-4">
                <v-btn
                  class="mx-2"
                  small
                  @click="onSelectAll"
                >
                  Select all
                </v-btn>

                <v-btn
                  class="mx-2"
                  small
                  @click="onDeselectAll"
                >
                  De-select all
                </v-btn>
              </div>
            </div>
          </div>

          <v-card class="item-list">
            <v-list>
              <template
                v-for="(item, index) in items"
              >
                <v-list-item
                  v-if="(item.name + ': ' + item.questionText).toLowerCase().includes(searchText.toLowerCase())"
                  :key="item.identifier"
                  @click="invertSelection(index)"
                >
                  <v-list-item-action class="mr-4">
                    <v-checkbox
                      v-model="selection[item.identifier]"
                      color="primary"
                      disabled
                    />
                  </v-list-item-action>

                  <v-list-item-title>{{ item.name }}: {{ item.questionText }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                v-if="!filteredItemsCount && searchText"
              >
                <v-list-item-title>No results found</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </div>

        <div class="selected-items px-4">
          <div class="label my-4">
            <span>Items Selected:</span>
            <span
              v-if="!selectedItemCount"
              class="ml-2 error-text"
            >This is a required field</span>
          </div>

          <v-card class="item-list">
            <v-list>
              <template
                v-for="(item) in items"
              >
                <v-list-item
                  v-if="selection[item.identifier]"
                  :key="item.identifier"
                >
                  <v-list-item-title>{{ item.name }}: {{ item.questionText }}</v-list-item-title>
                </v-list-item>
              </template>
            </v-list>
          </v-card>
        </div>
      </div>

      <ReportMessageBuilder
        class="py-4"
        :container="report"
        :score-id="report.id"
        :item-list="printItemList"
        @update="update($event)"
      />

      <draggable
        v-model="conditionals"
        @input="update"
        handle=".dragging-handle"
        :scroll-sensitivity="100"
        :force-fallback="true"
      >
        <transition-group>
          <v-card
            v-for="conditional in conditionals"
            class="px-4 my-4"
            :key="conditional.timestamp"
          >
            <CardHeader
              :score-id="conditional.id"
              :name="conditional.prefLabel"
              :expanded="conditional.expanded"
              :valid="conditional.valid"
              @setExpanded="conditional.expanded = $event"
              @deleteReport="deleteScoreCondition(conditional)"
            />

            <div
              v-if="conditional.expanded"
              class="mx-4"
            >
              <v-row>
                <v-col>
                  <v-text-field
                    class="mr-6"
                    v-model="conditional.prefLabel"
                    @input="onConditionalNameChanged(conditional)"
                    label="Score Condition Name"
                    :error-messages="getConditionalNameError(conditional)"
                  />
                </v-col>

                <v-col class="pl-6">
                  <div 
                    class="label score-label"
                    :class="{ 'invalid-score-label': getConditionalIdError(conditional) }"
                  >
                    Score Condition ID

                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon v-bind="attrs" v-on="on" class="pb-1" small>mdi-help-circle</v-icon>
                      </template>

                      <div class="tooltip-text">
                        You can re-use the logic created for this condition by using the Score Condition ID inside the Logic Editor.
                        i.e. scoreCondition_very_happy IS EQUAL TO  True
                      </div>
                    </v-tooltip>
                  </div>

                  <v-text-field
                    class="pt-0 mt-0"
                    :value="conditional.id"
                    readonly
                    :error-messages="getConditionalIdError(conditional)"
                  />
                </v-col>
              </v-row>

              <ConditionalComponent
                title="Define Score Condition:"
                :ifValue="report"
                :blank="false"
                :conditional-item="conditional.conditionalItem"
                :scores="[report]"
                @update="onUpdateConditional(conditional, { conditionalItem: $event } )"
              />

              <div class="py-4">
                <v-switch
                  v-model="conditional.flagScore"
                  @change="update"
                  inset
                  hide-details
                  label="Flag score (the score will be highlighted in red in the summary screen)"
                />

                <ReportMessageBuilder
                  :container="conditional"
                  :score-id="conditional.id"
                  :item-list="printItemList"
                  @update="onUpdateConditional(conditional, $event)"
                />
              </div>
            </div>
          </v-card>
        </transition-group>
      </draggable>
    </div>

    <v-card-actions
      v-if="expanded"
      class="py-4"
    >
      <v-spacer />
      <v-btn
        small
        @click="onAddScoreCondition"
        :disabled="!name || !report.jsExpression"
      >
        Add Score Condition
      </v-btn>
      <v-spacer />
    </v-card-actions>

    <template>
      <v-dialog
          :value="showScoreTitleVariableWarning"
          width="500"
          persistent
      >
        <v-card>
          <v-card-text class="pt-4">
            You are using this variable scoreID. Do you want to change it everywhere in markdown?
          </v-card-text>

          <v-card-actions>
            <v-spacer />

            <v-btn
                class="mx-2"
                color="primary"
                @click="() => {
                  replaceVariablesInMarkdown();
                  showScoreTitleVariableWarning = false;
                }"
            >
              Yes
            </v-btn>

            <v-btn
                @click="() => {
                  showScoreTitleVariableWarning = false
                }"
            >
              No
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>


  </v-card>
</template>

<style scoped>
.label {
  font-size: 14px;
  line-height: 20px;
  height: 20px;
  margin: 5px 0px;
  color: rgba(0, 0, 0, 0.6);
}

.error-text {
  color: #FF0000;
}

.score-label {
  margin: 0px;
  font-size: 12px;
  transform: translateY(5px);
}

.invalid-score-label {
  color: #FF0000;
}

.invalid-score-label .v-icon {
    color: #FF0000;
}

.score-range {
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
  font-size: 16px;
  text-align: center;
}

.empty-score-range {
  font-weight: bold
}

.output-type {
  width: 32%;
}

.score-items-search {
  width: 50%;
}

.all-items {
  width: 70%;
}
.selected-items {
  width: 30%;
  margin-top: 42px;
}
.item-list {
  height: 250px;
  overflow: auto;
}

.tooltip-text {
  max-width: 270px;
}
</style>

<script>
import CardHeader from './CardHeader';
import ReportMessageBuilder from './ReportMessageBuilder';
import ConditionalComponent from './ConditionalComponent';
import draggable from 'vuedraggable';
import { mapGetters } from 'vuex';
import config from '../../../config';

export default {
  components: {
    CardHeader,
    ReportMessageBuilder,
    ConditionalComponent,
    draggable,
  },

  props: {
    report: {
      type: Object,
      required: true
    }
  },

  data() {
    const outputTypes = [
      {
        name: 'Sum',
        value: 'cumulative'
      },
      {
        name: 'Average',
        value: 'average'
      },
      {
        name: 'Percentage',
        value: 'percentage'
      }
    ];

    return {
      expanded: this.report.initialized ? false : true,
      messageTemplate: `<h3 style="color:#0067a0"> score_title </h3> \nThe subject’s score on the <strong>score_title</strong> subscale was [[score_id]].`,
      scoreIdInMessage: '',
      outputTypes,
      outputType: outputTypes.find(type => type.value == this.report.outputType),
      searchText: '',
      selection: {},
      conditionals: this.report.conditionals.map(conditional => ({ ...conditional })),
      minScore: this.report.minScore,
      maxScore: this.report.maxScore,
      timerId: null,
      showScoreTitleVariableWarning: false,
      firstEdit: false,
    }
  },

  computed: {
    config() {
      return config;
    },

    name: {
      get() {
        return this.report.prefLabel
      },
      set(value) {
        this.onScoreTitleChange(value);
      }
    },

    ...mapGetters(config.MODULE_NAME,
      [
        'currentActivity',
      ]
    ),

    scoreId() {
      return this.getScoreId(this.report.prefLabel, this.outputType.value);
    },

    reportMessageIncludesId() {
      return this.includesScoreId(this.report.message);
    },

    conditionalMessageIncludesId() {
      return this.conditionals && !!this.conditionals.find(conditional => conditional.showMessage && this.includesScoreId(conditional.message));
    },

    nameErrorMsg() {
      if (!this.name) {
        return 'This is a required field';
      }

      if (this.currentActivity.reports.find(score => score.dataType == this.report.dataType && score.prefLabel == this.name && score != this.report)) {
        return 'That score title is already in use. Please use a different title.';
      }

      return '';
    },

    reportIdErrorMsg() {
      if (!this.nameErrorMsg && this.currentActivity.reports.find(score => score.dataType == this.report.dataType && score.id == this.report.id && score != this.report)) {
        return 'That score ID is already in use. Please use a different title.';
      }

      return '';
    },

    filteredItemsCount () {
      return this.items.filter(
        item => (item.name + ': ' + item.questionText).toLowerCase().includes(this.searchText.toLowerCase())
      ).length;
    },

    items() {
      return this.currentActivity.items.filter(item =>
          (item.inputType == 'radio' || item.inputType == 'prize' || item.inputType == 'slider' || item.inputType == 'checkbox')
            &&
          item.options.hasScoreValue
      ).map((item) => ({
        ...item,
        identifier: `${item.timestamp}-${item.id || 0}`,
        questionText: this.getQuestion(item.question.displayedText),
        ...this.getScoreRange(item)
      }))
    },

    printItemList() {
      return this.currentActivity.items.filter(item => ['radio', 'checkbox', 'prize', 'slider', 'text'].includes(item.inputType))
    },

    selectedItemCount() {
      let count = 0;
      for (let i = 0; i < this.items.length; i++) {
        const id = this.items[i].identifier;

        if (this.selection[id]) {
          count++;
        }
      }

      return count;
    }
  },

  beforeMount() {
    const selectedItems = this.report.jsExpression.split('+').map(name => name.trim());
    this.firstEdit = !this.report.initialized

    if (this.report.message.length > 0 && this.report.message.includes(`[[${this.scoreId}]]`)) {
      this.scoreIdInMessage = this.scoreId
    }

    for (const item of this.items) {
      this.$set(this.selection, item.identifier, selectedItems.includes(item.name));
    }

    this.onUpdateScoreRange();
  },

  methods: {
    onScoreTitleChange(value) {
      let message = this.report.message;
      let scoreId = this.getScoreId(value, this.outputType.value);

      if (!this.report.initialized) {
        clearTimeout(this.timerId);
        this.timerId = setTimeout(() => {
          this.update({
            initialized: true,
          })
        }, 500)
      }

      if(!this.reportMessageIncludesId && !this.conditionalMessageIncludesId) {
        this.scoreIdInMessage = scoreId;
      }

      for (const conditional of this.conditionals) {
        this.$set(conditional, 'id', scoreId + '_' + conditional.prefLabel);
      }

      this.update({
        prefLabel: value,
        id: scoreId,
        message,
        conditionals: this.conditionals.map(conditional => ({ ...conditional })),
      })
    },

    onScoreTitleBlur() {
      let message = this.report.message;

      if(this.firstEdit && !message.length && this.report.prefLabel) {
        message = this.messageTemplate.replace('score_id', this.scoreId).replaceAll('score_title', this.report.prefLabel);
        this.firstEdit = false;

        this.update({
          message,
        })
      } 

      if (this.scoreIdInMessage !== this.scoreId && (this.reportMessageIncludesId || this.conditionalMessageIncludesId)) {
        this.showScoreTitleVariableWarning = true;
      }
    },

    replaceVariablesInMarkdown() {
      let message = this.report.message;  
      this.conditionals && !!this.conditionals.find(conditional => conditional.showMessage && this.includesScoreId(conditional.message))

      if(this.reportMessageIncludesId) {
        message = message.replaceAll(`[[${this.scoreIdInMessage}]]`, `[[${this.scoreId}]]`)
      }

      if(this.conditionalMessageIncludesId) {
        this.conditionals.forEach(conditional => {
          if(!conditional.showMessage || !conditional.message) {
            return
          }
          
          conditional.message = conditional.message.replaceAll(`[[${this.scoreIdInMessage}]]`, `[[${this.scoreId}]]`)
        })
      }      

      this.scoreIdInMessage = this.scoreId;
      this.update({
        message,
        conditionals: this.conditionals.map(conditional => ({ ...conditional })),
      })
    },

    getScoreRange(item) {
      let scores = [];
      if (item.inputType == 'radio' || item.inputType == 'checkbox' || item.inputType == 'prize') {
        scores = item.options.options.filter(option => !option.isVis).map(option => option.score);
      } else { // slider
        scores = item.options.scores;
      }

      let maxScore = 0, minScore = 0;
      if (item.inputType == 'radio' || item.inputType == 'slider') {
        maxScore = Math.max(...scores);
        minScore = Math.min(...scores);
      } else { // checkbox
        for (let i = 0; i < scores.length; i++) {
          if (scores[i] > 0) {
            maxScore += scores[i];
          }
        }
        minScore = Math.min(...scores);
      }

      return { maxScore, minScore }
    },

    invertSelection(index) {
      const id = this.items[index].identifier;
      const value = !this.selection[id];

      this.$set(this.selection, id, value);
      this.onUpdateScoreRange();
    },

    onSelectAll() {
      for (const item of this.items) {
        if (item.name.includes(this.searchText)) {
          this.$set(this.selection, item.identifier, true);
        }
      }

      this.onUpdateScoreRange();
    },

    onDeselectAll() {
      for (const item of this.items) {
        if (item.name.includes(this.searchText)) {
          this.$set(this.selection, item.identifier, false);
        }
      }

      this.onUpdateScoreRange();
    },

    onAddScoreCondition() {
      this.conditionals.push({
        prefLabel: '',
        id: '',
        flagScore: false,
        showMessage: false,
        showItems: false,
        message: '',
        printItems: [],
        expanded: true,
        timestamp: Date.now(),
        isConditional: true,

        conditionalItem: {
          showValue: null,
          conditions: [],
          operation: "ALL",
          valid: false
        },

        valid: false
      });

      this.update();
    },

    deleteScoreCondition(conditional) {
      this.conditionals.splice(this.conditionals.indexOf(conditional), 1);
      this.update();
    },

    getConditionalNameError(conditional) {
      if (!conditional.prefLabel) {
        return 'This is a required field';
      }

      if (this.conditionals.find(d => d.prefLabel == conditional.prefLabel && d !== conditional)) {
        return 'That title is already in use. Please use a different title.';
      }

      return '';
    },

    getConditionalIdError(conditional) {
      if (!this.getConditionalNameError(conditional) 
        && this.conditionals.find(cond => cond.id == conditional.id && cond !== conditional)
      ) {
        return 'That score condition ID is already in use. Please use a different title.';
      }

      return '';
    },

    checkConditionalValidation (conditional) {
      if (!conditional.conditionalItem.valid || this.getConditionalNameError(conditional) || this.getConditionalIdError(conditional)) {
        return false;
      }

      if (!conditional.showMessage && !conditional.showItems) {
        return false;
      }

      if (conditional.showMessage && !conditional.message || conditional.showItems && !conditional.printItems.length) {
        return false;
      }

      return true;
    },

    onConditionalNameChanged (conditional) {
      this.$set(conditional, 'id', this.report.id + '_' + conditional.prefLabel.toLowerCase().replace(/\s/g, '_').replace(/[()/]/g, ''));
      this.$set(conditional, 'valid', this.checkConditionalValidation(conditional));

      this.update();
    },

    onUpdateConditional(conditional, updates) {
      Object.assign(conditional, updates);
      this.$set(conditional, 'valid', this.checkConditionalValidation(conditional));

      this.update();
    },

    getScoreId(title, outputType) {
      const scorePrefix = {
        cumulative: 'sumScore_',
        average: 'averageScore_',
        percentage: 'percentScore_',
      };

      return scorePrefix[outputType] + title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g,'_')
        .replace(/[^\w\s]|(_)(?=\1)/g, '');
    },

    onUpdateScoreRange() {
      let totalMinScore = 0, totalMaxScore = 0, count = 0;

      for (const item of this.items) {
        if (this.selection[item.identifier]) {
          totalMinScore += item.minScore;
          totalMaxScore += item.maxScore;
          count++;
        }
      }

      switch (this.outputType.value) {
        case 'cumulative':
          this.minScore = totalMinScore;
          this.maxScore = totalMaxScore;
          break;
        case 'average':
          this.minScore = count ? totalMinScore / count : 0;
          this.maxScore = count ? totalMaxScore / count : 0;
          break;
        case 'percentage':
          this.minScore = totalMaxScore ? totalMinScore / totalMaxScore * 100 : 0;
          this.maxScore = 100;
          break;
      }

      this.report.id = this.getScoreId(this.report.prefLabel, this.outputType.value);
      this.conditionals.forEach(conditional => {
        if(!conditional.id) return;
        conditional.id = this.report.id + '_' + conditional.prefLabel.toLowerCase().replace(/\s/g, '_').replace(/[()/]/g, '');
      })

      this.update();
    },

    update(newOptions = null) {
      const updates = {
        conditionals: this.conditionals.map(conditional => ({ ...conditional })),
        outputType: this.outputType.value,

        jsExpression: this.items.filter(
          item => this.selection[item.identifier]
        ).map(
          item => item.name
        ).join(' + '),

        minScore: this.minScore,
        maxScore: this.maxScore,

        id: this.scoreId,
      };

      if (newOptions) {
        Object.assign(updates, newOptions);
      }

      this.$emit('update', updates);
    },

    getQuestion(text) {
      return text.replace(/[#*]/g, '')
                .replace(/<\/?(div|span|a|img|b|h[\d]).*?>/g, '')
                .replace(/\!\[.*?\]\(.*?\)/g, '')
                .replace(/\+\+|\=\=|:::(\shljs-\S+)?|\*\*|[#-]/g, '')
                .replace(/\|/g, '')
    },

    includesScoreId(message) {
      return message.length > 0 && message.includes(`[[${this.scoreIdInMessage}]]`)
    }
  }
}
</script>
