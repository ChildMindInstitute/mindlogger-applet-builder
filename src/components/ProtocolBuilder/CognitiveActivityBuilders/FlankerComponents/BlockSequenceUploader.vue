<template>
  <v-dialog
    max-width="800"
    :value="value"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title class="dialog-title">
        Please upload a table (.csv file formatted as below) containing the sequence of stimulus image files for each block
      </v-card-title>

      <v-card-text>
        <input
          :key="inputKey"
          v-show="false"
          ref="fileInput"
          type="file"
          accept=".csv"
          @change="onCSVInput($event)"
        />

        <v-simple-table
          v-if="blocks.length > 0"
          class="block-sequences"
        >
          <template v-slot:default>
            <thead>
              <tr>
                <th
                  v-for="(block, index) in blocks"
                  :key="index"
                >
                  {{ block.name }}
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(_, screenIndex) in blocks[0].screens"
                :key="screenIndex"
              >
                <td
                  v-for="(block, blockIndex) in blocks"
                  :key="blockIndex"
                >
                  {{ block.screens[screenIndex].name }}
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>

      <v-card-actions class="mx-4">
        <a @click="downloadTemplate">Download template (.csv)</a>
        <v-spacer />

        <v-btn @click="$refs.fileInput.click()">
          Upload
        </v-btn>

        <v-btn @click="saveBlocks" color="primary">
          Save
        </v-btn>
      </v-card-actions>

      <v-dialog
        v-model="csvResultDialog"
        width="500"
      >
        <v-card>
          <v-card-title class="grey lighten-2">
            Block Sequence Upload
          </v-card-title>

          <v-card-text class="pa-4">
            {{ message }}
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.dialog-title {
  font-size: 15px !important;
}

.block-sequences th {
  min-width: 90px;
}
</style>

<script>
import csv from 'csvtojson';
import ObjectToCSV from 'object-to-csv';

export default {
  props: {
    value: {
      type: Boolean,
      required: true
    },
    screens: {
      type: Array,
      required: true
    },
    initialBlocks: {
      type: Array,
      required: true
    }
  },

  data () {
    let screenLength = this.initialBlocks.length ? this.initialBlocks[0].screens.length : this.screens.length;

    const blocks = this.initialBlocks.map(block => ({
      name: block.name,
      screens: block.screens.map(id => this.screens.find(screen => screen.id == id))
    }));

    const templates = [1,2,3,4].map(index => ({
      name: `block ${index}`,
      screens: [...this.screens]
    }));


    return {
      inputKey: 0,
      blocks,
      templates: blocks.length ? blocks : templates,
      screenLength,
      csvResultDialog: false,
      message: ''
    }
  },

  methods: {
    downloadTemplate () {
      const data = [];

      for (let i = 0; i < this.screenLength; i++) {
        const obj = {};
        for (let j = 0; j < this.templates.length; j++) {
          obj[this.templates[j].name] = this.templates[j].screens[i].name;
        }

        data.push(obj);
      }

      this.downloadFile({
        name: 'template.csv',
        content: new ObjectToCSV({
          keys: this.templates.map(column => ({ key: column.name, as: column.name })),
          data
        }).getCSV(),
        type: 'text/csv;charset=utf-8'
      });
    },

    downloadFile({ name, content, type }) {
      const file = new Blob([content], { type })
      return new Promise(resolve => {
        saveAs(file, name)
        resolve(true)
      })
    },

    getScreen (name) {
      return this.screens.find(screen => screen.name == name || screen.name.startsWith(name + '.'));
    },

    onCSVInput (e) {
      const file = e.target.files[0];
      let reader = new FileReader();

      reader.onload = () => {
        csv().fromString(reader.result).then(sequences => {
          if (!sequences.length) {
            this.csvResultDialog = true;
            return ;
          }

          const blocks = [];
          for (const blockName in sequences[0]) {
            blocks.push({
              name: blockName,
              screens: []
            })
          }

          for (const sequence of sequences) {
            for (let i = 0; i < blocks.length; i++) {
              const screen = this.getScreen(sequence[blocks[i].name]);

              if (!screen) {
                this.csvResultDialog = true;
                this.message = 'The uploaded table cannot be parsed. Please ensure stimulus screens have been uploaded prior to the block sequences and ensure the image name is the same as the file name uploaded.';
                return ;
              }

              blocks[i].screens.push(screen);
            }
          }

          this.blocks = blocks;
          this.templates = blocks;
        })
      }
      reader.readAsText(file);
      this.inputKey++;

      this.csvResultDialog = true;
      this.message = 'Block sequences were uploaded succesfully.'
    },

    saveBlocks () {
      this.$emit('save', this.blocks.map(block => ({
        name: block.name,
        screens: block.screens.map(screen => screen.id)
      })))
    }
  }
}
</script>
