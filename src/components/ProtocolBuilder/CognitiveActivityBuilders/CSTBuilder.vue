<template>
  <v-card
    class="px-4 py-4"
  >
    <v-row>
      <v-col class="input-item">
        Number of Trials:
        <v-text-field
          v-model="trialCount"
          class="mx-2 input-element"
          type="number"
          :min="1"
        />
      </v-col>

      <v-col class="input-item">
        Length of Test:
        <v-text-field
          v-model="durationMins"
          class="mx-2 input-element"
          type="number"
          :min="1"
        />

        minutes
      </v-col>

      <v-col class="input-item">
        Lambda Slope:
        <v-text-field
          v-model="lambdaSlope"
          class="mx-2 input-element"
          type="number"
          :min="1"
        />
        %
      </v-col>
    </v-row>

    <v-row>
      <v-col class="align-center">
        Set Overview Instructions:

        <v-btn
          class="mx-2"
          fab
          x-small
          @click="openMarkdownDialog('overview', 'Set Overview Instructions')"
        >
          <v-icon>edit</v-icon>
        </v-btn>
      </v-col>

      <v-col>
        Update Practice Instructions:
        <v-btn
          class="mx-2"
          fab
          x-small
          @click="openMarkdownDialog('practice', 'Update Practice Instructions')"
        >
          <v-icon>edit</v-icon>
        </v-btn>
      </v-col>

      <v-col>
        Update Test Instructions:
        <v-btn
          class="mx-2"
          fab
          x-small
          @click="openMarkdownDialog('test', 'Update Test Instructions')"
        >
          <v-icon>edit</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-dialog
      v-model="markdownDialog"
      persistent
      max-width="800px"
    >
      <v-card>
        <v-card-title class="title">
          {{ dialogTitle }}
        </v-card-title>

        <v-card-text class="mt-2">
          <MarkDownEditor
            class="markdown-editor"
            v-model="markdown"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            @click="onSave"
          >
            OK
          </v-btn>

          <v-btn
            @click="markdownDialog=false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>
.input-item {
  display: flex;
  align-items: center;
}

.input-element {
  margin-top: 8px;
  max-width: 75px;
}

.markdown-editor /deep/ .v-note-panel {
  max-height: 400px;
  overflow: auto;
}
</style>

<script>
import { mapGetters, mapMutations } from 'vuex';
import config from '../../../config';
import MarkDownEditor from '../MarkDownEditor';

export default {
  components: {
    MarkDownEditor
  },

  data() {
    return {
      markdown: '',
      dialogTitle: '',
      markdownDialog: false,
      dataType: ''
    }
  },

  computed: {
    config () {
      return config;
    },
    ...mapGetters(config.MODULE_NAME,
      [
        'currentActivity',
      ]
    ),

    items () {
      return this.currentActivity.items;
    },

    durationMins: {
      get() {
        return this.getInputOption('durationMins');
      },

      set(value) {
        this.updateInputOption('durationMins', value)
      }
    },

    lambdaSlope: {
      get() {
        return this.getInputOption('lambdaSlope');
      },

      set(value) {
        return this.updateInputOption('lambdaSlope', value);
      }
    },

    trialCount: {
      get() {
        return this.getInputOption('trialNumber');
      },
      set(value) {
        return this.updateInputOption('trialNumber', value, 2);
      }
    },
  },

  methods: {
    ...mapMutations(config.MODULE_NAME, [
      'deleteItem',
      'duplicateItem',
      'updateItemMetaInfo',
    ]),

    getInputOption(name) {
      for (const item of this.items) {
        if (item.inputType == 'stabilityTracker') {
          const inputOption = item.inputOptions.find(option => option['schema:name'] == name);

          return inputOption['schema:value'];
        }
      }

      return 0;
    },

    updateInputOption(name, value, itemIndex = -1) {
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        if (item.inputType == 'stabilityTracker' && (itemIndex == -1 || itemIndex == i)) {
          this.updateItemMetaInfo({
            index: i,
            obj: {
              inputOptions: item.inputOptions.map(option => {
                if (option['schema:name'] == name) {
                  return {
                    ...option,
                    'schema:value': value
                  }
                }
                return option;
              })
            }
          });
        }
      }
    },

    getItemIndexFromType(type) {
      switch(type) {
        case 'overview':
          return [0];
        case 'practice':
          return [1];
        case 'test':
          return this.items.map((_, index) => index).filter(index => index >= 3 && index % 2 == 1);
      }
      return [-1];
    },

    onSave() {
      const indexes = this.getItemIndexFromType(this.dataType);

      this.markdownDialog = false;
      for (const index of indexes) {
        this.updateItemMetaInfo({
          index,
          obj: {
            markdownText: this.markdown
          }
        })
      }
    },

    openMarkdownDialog(type, title) {
      const index = this.getItemIndexFromType(type)[0];

      if (index >= 0) {
        this.dialogTitle = title;
        this.markdown = this.items[index].markdownText;
        this.dataType = type;
        this.markdownDialog = true;
      }
    }
  }
}
</script>
