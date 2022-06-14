<template>
  <v-card>
    <CardHeader
      :score-id="report.id"
      :name="name"
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
            v-model="name"
            class="mr-6"
            label="Score Title"
          />
        </v-col>

        <v-col class="pl-6">
          <div class="label score-label">
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
            hide-details
            readonly
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
            @change="update"
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

          <div>
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
                  v-if="item.name.includes(searchText)"
                  :key="item.identifier"
                  @click="invertSelection(index)"
                >
                  <v-list-item-action>
                    <v-checkbox
                      v-model="selection[item.identifier]"
                      color="primary"
                      disabled
                    />
                  </v-list-item-action>

                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                </v-list-item>
              </template>
            </v-list>
          </v-card>
        </div>

        <div class="selected-items px-4">
          <div class="label my-4">
            Items Selected:
          </div>

          <v-card class="item-list">
            <v-list>
              <template
                v-for="item in items"
              >
                <v-list-item
                  v-if="selection[item.identifier]"
                  :key="item.identifier"
                >
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
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
        :item-list="items"
        @update="$emit('update', $event)"
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
            v-for="(conditional, index) in conditionals"
            class="px-4 my-4"
            :key="conditional.timestamp"
          >
            <CardHeader
              :score-id="conditional.id"
              :name="conditional.prefLabel"
              :expanded="conditional.expanded"
              @setExpanded="conditional.expanded = $event"
              @deleteReport="deleteScoreCondition(index)"
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
                  />
                </v-col>

                <v-col class="pl-6">
                  <div class="label score-label">
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
                    hide-details
                    readonly
                  />
                </v-col>
              </v-row>

              <ReportMessageBuilder
                class="py-4"
                :container="conditional"
                :score-id="conditional.id"
                :item-list="items"
                @update="onUpdateConditional(conditional, $event)"
              />
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
      >
        Add Score Condition
      </v-btn>
      <v-spacer />
    </v-card-actions>
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

.score-label {
  margin: 0px;
  font-size: 12px;
  transform: translateY(5px);
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
import draggable from 'vuedraggable';
import { mapGetters, mapMutations } from 'vuex';
import config from '../../../config';

export default {
  components: {
    CardHeader,
    ReportMessageBuilder,
    draggable,
  },

  props: {
    report: {
      type: Object,
      required: true
    }
  },

  data () {
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
      expanded: true,
      messageTemplate: `
        <h3 style="color:#0067a0"> {score_title} </h3> The subject’s score on the **{Score Title}** subscale was [[{score_id}]].
      `,
      outputTypes,
      outputType: outputTypes.find(type => type.value == this.report.outputType),
      searchText: '',
      selection: {},
      conditionals: this.report.conditionals.map(conditional => ({ ...conditional })),
      timerId: null
    }
  },

  computed: {
    config () {
      return config;
    },

    name: {
      get () {
        return this.report.prefLabel
      },
      set (value) {
        let message = this.report.message;
        let scoreId = this.getScoreId(value, this.outputType.value);

        if (!this.report.initialized) {
          message = this.messageTemplate.replace('{score_id}', scoreId).replace('{score_title}', value);

          clearTimeout(this.timerId);
          this.timerId = setTimeout(() => {
            this.$emit('update', {
              initialized: true
            })
          }, 500)
        }

        for (const conditional of this.conditionals) {
          this.$set(conditional, 'id', scoreId + '_' + conditional.prefLabel);
        }

        this.$emit('update', {
          prefLabel: value,
          id: scoreId,
          message,
          conditionals: this.conditionals.map(conditional => ({ ...conditional })),
        })
      }
    },

    ...mapGetters(config.MODULE_NAME,
      [
        'currentActivity',
      ]
    ),

    items () {
      return this.currentActivity.items.filter(item =>
          (item.inputType == 'radio' || item.inputType == 'prize' || item.inputType == 'slider' || item.inputType == 'checkbox')
            &&
          item.options.hasScoreValue
      ).map((item) => ({
        ...item,
        identifier: `${item.timestamp}-${item.id || 0}`
      }))
    },

    scoreRange () {
      switch (this.outputType.value) {
        case 'percentage':
          return '';
        case 'average':
          return '';
        case 'cumulative':
          return '';
      }

      return '';
    }
  },

  beforeMount () {
    for (const item of this.items) {
      this.$set(this.selection, item.identifier, false);
    }
  },

  methods: {
    invertSelection (index) {
      const id = this.items[index].identifier;
      const value = !this.selection[id];

      this.$set(this.selection, id, value);
    },

    onSelectAll () {
      for (const item of this.items) {
        if (item.name.includes(this.searchText)) {
          this.$set(this.selection, item.identifier, true);
        }
      }
    },

    onDeselectAll () {
      for (const item of this.items) {
        if (item.name.includes(this.searchText)) {
          this.$set(this.selection, item.identifier, false);
        }
      }
    },

    onAddScoreCondition () {
      this.conditionals.push({
        prefLabel: '',
        id: '',
        showMessage: false,
        showItems: false,
        message: '',
        printItems: [],
        jsExpression: '',
        expanded: true,
        timestamp: Date.now(),
      });

      this.update();
    },

    deleteScoreCondition (index) {
      this.conditionals.splice(index, 1);
      this.update();
    },

    onConditionalNameChanged (conditional) {
      this.$set(conditional, 'id', this.report.id + '_' + conditional.prefLabel);
      this.update();
    },

    onUpdateConditional (conditional, updates) {
      Object.assign(conditional, updates);
      this.update();
    },

    getScoreId (title, outputType) {
      const scorePrefix = {
        cumulative: 'sumScore_',
        average: 'averageScore_',
        percentage: 'percentScore_',
      };

      return scorePrefix[outputType] + title.toLowerCase().replace(/\s/g, '_').replace(/[()/]/g, '');
    },

    update () {
      this.$emit('update', {
        conditionals: this.conditionals.map(conditional => ({ ...conditional })),
        outputType: this.outputType.value,
        id: this.getScoreId(this.report.prefLabel, this.outputType.value)
      })
    },
  }
}
</script>
