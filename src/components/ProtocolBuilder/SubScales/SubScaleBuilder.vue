<template>
  <v-card>
    <v-card-title
      class="px-2 py-0"
      :class="valid && selectedItemCount >= 1 ? '' : 'invalid'"
    >
      <span class="item-name">
        (<v-icon
          :color="!hasLookupTable ? 'grey' : 'primary'"
        >
          mdi-table-search
        </v-icon>)

        {{ currentSubScale.variableName }}
      </span>
      <v-spacer />
      <v-card-actions>
        <v-menu bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
            >
              <v-icon color="grey lighten-1">
                mdi-table-search
              </v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item
              @click="$emit('onCreateLookupTable', subScaleIndex)"
            >
              <v-list-item-title>
                {{ !!hasLookupTable ? 'Replace Lookup Table' : 'Set Lookup Table' }}
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              :disabled="!hasLookupTable"
              @click="$emit('onDeleteLookupTable', subScaleIndex)"
            >
              <v-list-item-title>Delete Lookup Table</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

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
          @click="$emit('onDeleteLookupTable', subScaleIndex); deleteSubScale(subScaleIndex);"
        >
          <v-icon color="grey lighten-1">
            mdi-delete
          </v-icon>
        </v-btn>
      </v-card-actions>
    </v-card-title>

    <v-card-text
      v-if="isExpanded"
    >
      <v-row>
        <v-col
          class="d-flex align-center"
          cols="12"
          sm="6"
        >
          <v-card
            width="100%"
            class="items"
          >
            <v-list subheader>
              <v-subheader>Items not included in a sub-scale</v-subheader>

              <template v-for="(item, index) in itemsFormatted">
                <v-list-item
                  v-if="item.subScales.length == 0"
                  :key="`item-${index}`"
                >
                  <v-list-item-content
                    v-if="!item.isSubScale"
                  >
                    {{ item.name }}
                  </v-list-item-content>

                  <v-list-item-content
                    v-else
                    class="subscale-name"
                  >
                    {{ item.name }}
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-list>
          </v-card>
        </v-col>

        <v-col
          class="d-flex align-center"
          cols="12"
          sm="6"
        >
          <v-card
            width="100%"
            class="items"
          >
            <v-card-title>
              Items associated with one or more sub-scales
            </v-card-title>

            <v-simple-table>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">
                      Item
                    </th>
                    <th class="text-left">
                      SubScales
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <template v-for="(item, index) in itemsFormatted">
                    <tr
                      v-if="item.subScales.length > 0"
                      :key="index"
                    >
                      <td>
                        <div
                          v-if="!item.isSubScale"
                          class="item-name"
                        >
                          {{ item.name }}
                        </div>
                        <div
                          v-else
                          class="item-name subscale-name"
                        >
                          {{ item.name }}
                        </div>
                      </td>
                      <td>
                        <div class="subscales">
                          {{ item.subScales.map(subScale => subScale.variableName).join(', ') }}
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </template>
            </v-simple-table>
          </v-card>
        </v-col>
      </v-row>

      <v-form v-model="valid">
        <v-text-field
          v-model="currentSubScale.variableName"
          label="Sub-Scale Name"
          :error="nameError.exists"
          :error-messages="nameError.message"
          @input="saveSubScale"
        />

        <v-card width="100%">
          <v-list subheader>
            <v-subheader>Sub-scale Scoring</v-subheader>
            <v-radio-group
              v-model="scoringType"
              class="d-flex"
              color="primary"
              @change="saveSubScale"
            >
              <v-radio
                class="mx-4"
                value="sum"
                label="Sum Of Item Scores"
              />
              <v-radio
                class="mx-4"
                value="average"
                label="Average of Item Scores"
              />
            </v-radio-group>
          </v-list>
        </v-card>

        <v-card
          class="mt-4"
          width="100%"
        >
          <v-list subheader>
            <v-subheader>Items within sub-scale</v-subheader>
            <v-list-item-group
              color="primary"
            >
              <template
                v-for="(item, index) in itemsFormatted"
              >
                <v-list-item
                  v-if="item.name"
                  :key="index"
                  @click="rowClicked(item)"
                >
                  <v-list-item-action>
                    <v-checkbox
                      v-model="item.selected"
                      color="primary"
                      disabled
                    />
                  </v-list-item-action>
                  <v-list-item-content>
                    <div
                    >
                      <span
                        :class="item.isSubScale ? 'subscale-name' : ''"
                      >{{ item.name }}</span>
                      <template
                        v-if="item.isSubScale"
                      >
                      (
                        <span
                          v-for="(subItem, index) in item.items"
                          :key="index"
                        >
                          <span
                            :class="subItem.includes(')') ? 'subscale-name' : ''"
                          >
                            {{ subItem.replace(/[()]/g, ' ') }}
                          </span>
                          <span>{{ index != item.items.length - 1 ? ',' : '' }}</span>
                        </span>
                      )
                      </template>
                    </div>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<style scoped>
  .items {
    height: 200px;
    overflow-y: scroll;
  }

  .item-with-subscale .item-name {
    margin-right: 5px;
    color: grey;
  }

  .invalid {
    background-color: #d44c4c;
  }

  .subscale-name {
    color: red !important;
  }
</style>

<script>
import { mapMutations, mapGetters } from 'vuex';
import config from '../../../config';

export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
    subScaleIndex: {
      type: Number,
      required: true
    },
    subScale: {
      type: Object,
      required: true
    },
    hasLookupTable: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data: function () {
    return {
      itemsFormatted: [],
      currentSubScale: {
        variableName: (this.subScale && this.subScale.variableName || ''),
        editing: true
      },
      shiftKeyOn: false,
      startRow: -1,
      previousRow: -1,
      nameRules: [
        v => !!v || 'name cannot be empty',
        v => !this.currentActivity.subScales.some((subScale, id) => subScale && subScale.variableName === v && id != this.subScaleIndex) || 'cannot use existing subscale name',
      ],
      valid: false,
      scoringType: this.subScale.isAverageScore ? "average" : "sum",
      isExpanded: !this.subScale.variableName || !this.subScale.variableName.length,
      nameError: {
        exists: false,
        message: ''
      },
    };
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
    selectedItemCount () {
      let itemCount = 0;
      for (let item of this.itemsFormatted) {
        if (item.selected) {
          itemCount ++;
        }
      }

      return itemCount;
    }
  },
  watch: {
    currentActivity: {
      deep: true,
      handler() {
        this.itemsFormatted = this.mergeList(this.formattedItems(), this.formattedSubScales());

        if (this.isExpanded) {
          this.$set(this, 'itemsFormatted', this.mergeList(
            this.itemsFormatted.filter(item => !item.isSubScale),
            this.formattedSubScales()
          ));
        }
      }
    },
    valid: {
      handler () {
        this.saveSubScale ();
      }
    },
    isExpanded() {
      if (this.isExpanded) {
        this.$set(this, 'itemsFormatted', this.mergeList(
          this.itemsFormatted.filter(item => !item.isSubScale),
          this.formattedSubScales()
        ));
      }
    },
  },
  created() {
    const self = this;
    self.keyDownHandler = function ({ key }) {
      if (key == "Shift") self.shiftKeyOn = true;
    };
    self.keyUpHandler = function ({ key }) {
      if (key == "Shift") self.shiftKeyOn = false;
    };

    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);
  },
  beforeDestroy() {
    if (this.multiSelectionEnabled) {
      window.removeEventListener("keydown", this.keyDownHandler);
      window.removeEventListener("keyup", this.keyUpHandler);
    }
  },
  beforeMount() {
    this.itemsFormatted = this.mergeList(this.formattedItems(), this.formattedSubScales());

    const message = this.getNameError();
    this.valid = (message.length === 0);

    this.$set(this, 'nameError', {
      exists: message.length > 0,
      message
    });
  },
  methods: {
    ...mapMutations(config.MODULE_NAME,
      [
        'updateSubScaleData',
        'deleteSubScale',
      ]
    ),

    mergeList(items, subScales) {
      const list = [];
      for (const subScale of subScales) {
        if (
          !subScale.current
          && !subScale.items.includes(`(${this.currentSubScale.variableName})`)
        ) {
          list.push({
            ...subScale,
            name: subScale.variableName,
            isSubScale: true,
            id: items.length
          });
        }
      }

      return list.concat(items);
    },

    getNameError() {
      if (!this.currentSubScale.variableName) {
        return 'Please enter the name of sub-scale.'
      }
      if (
        this.currentActivity.subScales.some((subScale, id) =>
          subScale &&
          subScale.variableName === this.currentSubScale.variableName &&
          id != this.subScaleIndex
        )
      ) {
        return 'Cannot use existing subscale name.'
      }

      return '';
    },
    saveSubScale () {
      const message = this.getNameError();
      this.$set(this, 'nameError', {
        exists: message.length > 0,
        message
      });

      let subScale = {
        variableName: this.currentSubScale.variableName,
        jsExpression: this.itemsFormatted.filter(
            item => item.selected
          ).map(
            item => item.isSubScale ? `(${item.name})` : item.name
          ).join(' + '),
        isAverageScore: this.scoringType === "sum" ? false : true,
        lookupTable: this.subScale && this.subScale.lookupTable,
        valid: this.valid && this.selectedItemCount >= 1,
        items: this.itemsFormatted.filter(item => item.selected).map(item => item.obj),
      };

      if (this.currentActivity.subScales[this.subScaleIndex].subScaleId) {
        subScale.subScaleId = this.currentActivity.subScales[this.subScaleIndex].subScaleId;
      }

      this.updateSubScaleData({
        index: this.subScaleIndex,
        obj: subScale
      });
    },

    getItemNames (subScale) {
      let expression = subScale.jsExpression || '';
      return expression.split('+').map(itemName => itemName.trim()).filter(itemName => itemName.length)
    },

    getSubScaleNames (subScale) {
      const items = this.getItemNames(subScale);
      return items.filter(name => name.match(/^\(.*\)$/i)).map(name => name.substr(1, name.length-2));
    },

    formattedItems () {
      let items = [];
      let subScales = [];

      for (let i = 0; i < this.currentActivity.subScales.length; i++) {
        subScales.push({
          ...this.currentActivity.subScales[i],
          items: this.getItemNames(this.currentActivity.subScales[i]),
          index: i
        });
      }

      for (let i = 0; i < this.items.length; i++) {
        let item = this.items[i];

        if (
          (item.inputType == 'radio' || item.inputType == 'prize' || item.inputType == 'slider' || item.inputType == 'checkbox') &&
          item.options.hasScoreValue
        ) {
          const relatedSubScales = subScales.filter(subScale => subScale.items.includes(item.name));

          let index = relatedSubScales.findIndex(subScale => subScale.index === this.subScaleIndex)
          if (index >= 0) {
            relatedSubScales[index] = this.currentSubScale;
          }

          items.push({
            ...item,
            subScales: relatedSubScales,
            selected: (index >= 0),
            id: items.length,
            obj: item
          });
        }
      }

      return items;
    },

    formattedSubScales () {
      let subScales = [];

      for (let i = 0; i < this.currentActivity.subScales.length; i++)
      {
        subScales.push(
          {
            ...this.currentActivity.subScales[i],
            subScales: [],
            items: this.getItemNames(this.currentActivity.subScales[i]),
            selected: false,
            current: i == this.subScaleIndex,
            obj: this.currentActivity.subScales[i]
          }
        );
      }

      for (let i = 0; i < this.currentActivity.subScales.length; i++)
      {
        const names = this.getSubScaleNames(this.currentActivity.subScales[i]);
        const relatedSubScales = names.map(
          name => subScales.find(
            subScale => subScale.variableName == name
          )
        ).filter(subScale => subScale);

        for (const subScale of relatedSubScales)
        {
          if (i == this.subScaleIndex)
          {
            subScale.selected = true;
            subScale.subScales.push(this.currentSubScale);
          }
          else
          {
            subScale.subScales.push(this.currentActivity.subScales[i]);
          }
        }
      }

      return subScales;
    },

    rowClicked (item) {
      if (this.startRow < 0 || !this.shiftKeyOn) {
        this.invertSelection(item);

        this.startRow = this.previousRow = item.id;
      } else {
        const start = Math.min(item.id, this.previousRow);
        const end = Math.max(item.id, this.previousRow);

        for (let i = start; i <= end; i++) {
          const status0 =
            i >= start && i <= this.startRow ||
            i <= start && i >= this.startRow
          ;

          const status1 =
            i >= end && i <= this.startRow ||
            i <= end && i >= this.startRow
          ;

          if (status0 !== status1) {
            this.invertSelection(this.itemsFormatted[i]);
          }
        }

        this.previousRow = item.id;
      }

      this.saveSubScale();
    },

    invertSelection (item) {
      item.selected = !item.selected;

      if (item.selected) {
        item.subScales.push(this.currentSubScale);
      } else {
        item.subScales.splice(
          item.subScales.findIndex(subScale => subScale.editing),
          1
        );
      }
    },
  },
};
</script>

