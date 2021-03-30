<template>
  <v-card>
    <v-card-title
      class="px-2 py-0"
      :class="subScale.valid ? '' : 'invalid'"
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
                  :key="index"
                >
                  <v-list-item-content>
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
            <v-list subheader>
              <v-subheader>Items associated with one or more sub-scales</v-subheader>

              <template v-for="(item, index) in itemsFormatted">
                <v-list-item
                  v-if="item.subScales.length > 0"
                  :key="index"
                >
                  <v-list-item-content>
                    <div class="item-with-subscale d-flex">
                      <div class="item-name">
                        {{ item.name }}
                      </div>
                      <div class="subscales">
                        {{ item.subScales.map(subScale => subScale.variableName).join(', ') }}
                      </div>
                    </div>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-list>
          </v-card>
        </v-col>
      </v-row>

      <v-form v-model="valid">
        <v-text-field
          v-model="currentSubScale.variableName"
          label="Sub-Scale Name"
          :rules="nameRules"
          @input="saveSubScale"
        />

        <v-card
          width="100%"
          class="items"
        >
          <v-list subheader>
            <v-subheader>Items within sub-scale</v-subheader>
            <v-list-item-group
              color="primary"
            >
              <v-list-item
                v-for="(item, index) in itemsFormatted"
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
                  <v-list-item-title v-text="item.name" />
                </v-list-item-content>
              </v-list-item>
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
</style>

<script>
import { mapMutations } from 'vuex';
import config from '../../../config';

export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
    subScales: {
      type: Array,
      required: true
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
        v => !this.subScales.some((subScale, id) => subScale && subScale.variableName === v && id != this.subScaleIndex) || 'cannot use existing subscale name',
      ],
      valid: false,
      isExpanded: !this.subScale.variableName || !this.subScale.variableName.length
    };
  },
  computed: {
    config () {
      return config;
    },
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
    this.itemsFormatted = this.formattedItems();
  },
  methods: {
    ...mapMutations(config.MODULE_NAME, 
      [
        'updateSubScaleData',
        'deleteSubScale',
      ]
    ),
    saveSubScale () {
      let subScale = {
        variableName: this.currentSubScale.variableName,
        jsExpression: this.itemsFormatted.filter(
            item => item.selected
          ).map(
            item => item.name
          ).join(' + '),
        valid: this.valid && this.selectedItemCount >= 2
      };

      if (this.subScales[this.subScaleIndex].subScaleId) {
        subScale.subScaleId = this.subScales[this.subScaleIndex].subScaleId;
      }

      this.updateSubScaleData({
        index: this.subScaleIndex,
        obj: subScale
      });
    },

    getItemNames (subScale) {
      let expression = subScale.jsExpression || '';
      return expression.split('+').map(itemName => itemName.trim())
    },

    formattedItems () {
      let items = [];
      let subScales = [];

      for (let i = 0; i < this.subScales.length; i++) {
        subScales.push({
          ...this.subScales[i],
          items: this.getItemNames(this.subScales[i]),
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
          });
        }
      }

      return items;
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

