<template>
  <v-card>
    <v-card-title class="headline grey lighten-2" primary-title>
      <v-icon left>{{ isEditing ? "mdi-pencil" : "mdi-upload" }}</v-icon>
      {{ isEditing ? "Edit Sub-Scale Scoring" : "Add Sub-Scale Scoring"}}
    </v-card-title>

    <v-card-text class="subscale-content">
      <v-row>
        <v-col 
          class="d-flex align-center"
          cols="12"
          sm="6"
        >
          <v-card width="100%" class="items">
            <v-list subheader>
              <v-subheader>Items not included in a sub-scale</v-subheader>

              <template v-for="(item, index) in itemsFormatted">
                <v-list-item :key="index" v-if="item.subScales.length == 0">
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
          <v-card width="100%" class="items">
            <v-list subheader>
              <v-subheader>Items associated with one or more sub-scales</v-subheader>

              <template v-for="(item, index) in itemsFormatted">
                <v-list-item :key="index" v-if="item.subScales.length > 0">
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
        />

        <v-card width="100%" class="items">
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
        </v-card>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-btn
        outlined
        color="primary"
        @click="onDiscardSubScale"
      >{{ "Discard Changes" }}</v-btn>
      <v-spacer />
      <v-btn color="primary" @click="onSaveSubScale" :disabled="!valid || selectedItemCount < 2">Save SubScale</v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
  .items {
    height: 200px;
    overflow-y: scroll;
  }
  .subscale-content {
    max-height: 500px;
    overflow-y: scroll;
  }

  .item-with-subscale .item-name {
    margin-right: 5px;
    color: grey;
  }
</style>

<script>

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
    editIndex: {
      type: Number,
      required: true
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
  data: function () {
    return {
      itemsFormatted: [],
      currentSubScale: {
        variableName: (this.editIndex >= 0 && this.subScales[this.editIndex].variableName || ''),
        editing: true
      },
      shiftKeyOn: false,
      startRow: -1,
      previousRow: -1,
      nameRules: [
        v => !!v || 'name cannot be empty',
        v => !this.subScales.some((subScale, id) => subScale.variableName === v && id != this.editIndex) || 'cannot use existing subscale name',
      ],
      valid: false,
    };
  },
  beforeMount() {
    this.itemsFormatted = this.formattedItems();
  },
  computed: {
    selectedItemCount() {
      let itemCount = 0;
      for (let item of this.itemsFormatted) {
        if (item.selected) {
          itemCount ++;
        }
      }

      return itemCount;
    }
  },
  methods: {
    onSaveSubScale() {
      let subScale = {
        variableName: this.currentSubScale.variableName,
        jsExpression: this.itemsFormatted.filter(
            item => item.selected
          ).map(
            item => item.name
          ).join(' + ')
      };

      if (this.editIndex >= 0 && this.subScales[this.editIndex].subScaleId) {
        subScale.subScaleId = this.subScales[this.editIndex].subScaleId;
      }

      this.$emit('closeSubScaleModal', subScale);
    },
    onDiscardSubScale() {
      this.$emit('closeSubScaleModal', null);
    },
    getItemNames(subScale) {
      let expression = subScale.jsExpression || '';
      return expression.split('+').map(itemName => itemName.trim())
    },
    formattedItems() {
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
          (item.ui.inputType == 'radio' || item.ui.inputType == 'slider') && 
          item.responseOptions.scoring
        ) {
          const relatedSubScales = subScales.filter(subScale => subScale.items.includes(item.name));

          let index = relatedSubScales.findIndex(subScale => subScale.index === this.editIndex)
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
    rowClicked(item) {
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
    },

    invertSelection(item) {
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

