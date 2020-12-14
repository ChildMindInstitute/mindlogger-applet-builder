<template>
  <v-card>
    <v-card-title 
      class="headline grey lighten-2" 
      primary-title
    >
      <v-icon 
        left
      >
        {{ isEditing ? "mdi-pencil" : "mdi-upload" }}
      </v-icon>

      {{ isEditing ? "Replace Lookup Table" : "Upload Lookup Table"}}
    </v-card-title>

    <v-card-text>
      <v-file-input
        show-size
        label="Upload CSV"
        accept=".csv"
        @change="onCSVInput"
      ></v-file-input>

      <h2 class="table-title">
        {{isExampleTable ? 'Example Lookup Table' : 'Current Lookup Table'}}
      </h2>

      <v-data-table
        :headers="headers"
        :items="lookupTable"
        :loading="loading"
        :footer-props="{
          itemsPerPageOptions: [5]
        }"
      />
    </v-card-text>

    <v-card-actions>
      <v-btn
        outlined
        color="primary"
        @click="onDiscardChanges"
      >{{ "Discard Changes" }}</v-btn>
      <v-spacer />
      <v-btn color="primary" @click="onSaveLookupTable">Save Table</v-btn>
    </v-card-actions>

    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title class="grey lighten-2">Lookup Table Upload</v-card-title>
        <v-card-text class="pa-4">{{dialogText}}</v-card-text>
      </v-card>
    </v-dialog>

  </v-card>
</template>

<style scoped>
.table-title {
  margin: 20px 0px;
  text-align: center;
}
</style>

<script>
import { sampleLookupTable } from './lookupTable';
import csv from 'csvtojson';

export default {
  props: {
    subScale: {
      type: Object,
      required: true,
    }
  },
  data: function () {
    let lookupTable = sampleLookupTable;

    if (this.subScale['lookupTable']) {
      lookupTable = this.subScale['lookupTable'];
    }

    return {
      headers: [
        {
          text: 'T-Score',
          align: 'center',
          sortable: true,
          value: 'tScore',
        },
        {
          text: 'Raw Score',
          align: 'center',
          sortable: true,
          value: 'rawScore',
        },
        {
          text: 'Age',
          align: 'center',
          sortable: true,
          value: 'age',
        },
        {
          text: 'Sex',
          align: 'center',
          sortable: false,
          value: 'sex'
        }
      ],
      lookupTable,
      loading: false,
      isEditing: !!this.subScale['lookupTable'],
      isExampleTable: !this.subScale['lookupTable'],
      dialog: false,
      dialogText: '',
    };
  },
  computed: {

  },
  methods: {
    onCSVInput(file) {
      if (!file) {
        return ;
      }

      let reader = new FileReader();
      this.loading = true;

      reader.onload = () => {
        let headers = ['tScore', 'rawScore', 'age', 'sex'];

        csv({
          noheader: false,
          headers
        }).fromString(reader.result).then((lookupTable) => {
          let parseFailed = false;

          lookupTable = lookupTable.map(row => headers.reduce((previousValue, header) => {
            if (!/^[\d-\sMFmf/]*$/g.test(row[header])) {
              parseFailed = true;
            }

            return {
              ...previousValue,
              [header]: row[header],
            }
          }, {}));

          /** get rawScore from above row if editor leaves it as empty */
          for (let i = 0; i < lookupTable.length; i++) {
            if (!lookupTable[i].rawScore) {
              if (!i) {
                parseFailed = true;
              } else {
                lookupTable[i].rawScore = lookupTable[i-1].rawScore;
              }
            }
          }

          if (parseFailed) {
            this.dialogText = `Unfortunately, your lookup table can't be parsed. Please double check your table and try again.`;
          } else {
            this.lookupTable = lookupTable;
            this.isExampleTable = false;
            this.dialogText = `Your lookup table for ${this.subScale.variableName} was parsed successfully.`;
          }

          this.dialog = true;
          this.loading = false;
        })
      };

      reader.readAsText(file);
    },

    onSaveLookupTable() {
      this.$emit('closeLookupTableModal', this.lookupTable);
    },

    onDiscardChanges() {
      this.$emit('closeLookupTableModal', null);
    }
  },
};
</script>

