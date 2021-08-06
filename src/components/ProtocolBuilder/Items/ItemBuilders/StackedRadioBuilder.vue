<template>
  <div>
    <v-form>
      <v-row class="d-flex options-items">
        <v-col class="response-options">
          <v-row
            class="ma-2"
          >
            Response Options
          </v-row>

          <div
            class="option-list"
          >
            <div
              v-for="(option, index) in options"
              :key="index"
              class="px-2"
            >
              <v-row>
                <div class="radio-option">
                  <input
                    v-if="isMultipleChoice"
                    class="mx-2"
                    type="checkbox"
                    value="false"
                    disabled
                  >

                  <input
                    v-else
                    class="mx-2"
                    type="radio"
                    value="false"
                    disabled
                  >
                  <span>
                    {{ option.name }}
                  </span>

                  <span
                    v-if="option.description"
                    x-large
                  >
                    ( {{ option.description }} )
                  </span>
                </div>

                <v-spacer />

                <div class="d-flex align-center justify-end">
                  <v-btn
                    icon
                    large
                    @click="option.expanded = !option.expanded"
                  >
                    <v-icon
                      v-if="!option.expanded"
                      color="grey lighten-1"
                    >
                      edit
                    </v-icon>
                    <v-icon
                      v-if="option.expanded"
                    >
                      mdi-chevron-double-up
                    </v-icon>
                  </v-btn>

                  <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        icon
                        v-on="on"
                      >
                        <v-icon
                          :color="option.image ? 'primary' : ''"
                        >
                          mdi-image-search
                        </v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="onAddImageUrl(option)">
                        <v-list-item-title>{{ option.image ? 'Edit Image Url' : 'Add Image Url' }} </v-list-item-title>
                      </v-list-item>

                      <v-list-item>
                        <v-list-item-title>
                          <div
                            class="upload-from-pc"
                          >
                            <input
                              class="file-input"
                              type="file"
                              accept="image/jpeg, image/png, image/bmp"
                              @change="onChangeFile($event, option)"
                            >
                            Upload From Your computer
                          </div>
                        </v-list-item-title>
                      </v-list-item>

                      <v-list-item
                        :disabled="!option.image"
                        @click="onRemoveImage(option)"
                      >
                        <v-list-item-title>
                          Remove Image
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>

                  <v-btn
                    icon
                    large
                    @click="deleteOption(index)"
                  >
                    <v-icon color="grey lighten-1">
                      delete
                    </v-icon>
                  </v-btn>
                </div>
              </v-row>

              <div
                v-if="option.expanded"
                class="px-8"
              >
                <v-row>
                  <v-col
                    cols="12"
                    sm="5"
                    md="4"
                  >
                    <v-text-field
                      v-model="option.name"
                      :rules="textRules"
                      label="Option Text"
                      counter="11"
                      maxlength="11"
                      @change="updateOption(option)"
                    />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col
                    cols="12"
                    sm="12"
                  >
                    <v-text-field
                      v-model="option.description"
                      label="Option Tooltip"
                      @change="updateOption(option)"
                    />
                  </v-col>
                </v-row>
              </div>
            </div>
          </div>

          <div class="pa-2">
            <v-btn
              fab
              x-small
              color="primary"
              :disabled="options.length >= 3"
              @click="addOption"
            >
              <v-icon color="white">
                mdi-plus
              </v-icon>
            </v-btn>
          </div>
        </v-col>

        <v-col>
          <v-row
            class="ma-2"
          >
            Item List
          </v-row>

          <div
            class="item-list"
          >
            <div
              v-for="(item, index) in itemList"
              :key="index"
              class="px-4"
            >
              <v-row>
                <div class="radio-item">
                  <span>
                    {{ item.name }}
                  </span>

                  <span
                    v-if="item.description"
                    x-large
                  >
                    ( {{ item.description }} )
                  </span>
                </div>

                <v-spacer />

                <div class="d-flex align-center justify-end">
                  <v-btn
                    icon
                    large
                    @click="item.expanded = !item.expanded"
                  >
                    <v-icon
                      v-if="!item.expanded"
                      color="grey lighten-1"
                    >
                      edit
                    </v-icon>
                    <v-icon
                      v-if="item.expanded"
                    >
                      mdi-chevron-double-up
                    </v-icon>
                  </v-btn>

                  <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        icon
                        v-on="on"
                      >
                        <v-icon
                          :color="item.image ? 'primary' : ''"
                        >
                          mdi-image-search
                        </v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="onAddImageUrl(item)">
                        <v-list-item-title>{{ item.image ? 'Edit Image Url' : 'Add Image Url' }} </v-list-item-title>
                      </v-list-item>

                      <v-list-item>
                        <v-list-item-title>
                          <div
                            class="upload-from-pc"
                          >
                            <input
                              class="file-input"
                              type="file"
                              accept="image/jpeg, image/png, image/bmp"
                              @change="onChangeFile($event, item)"
                            >
                            Upload From Your computer
                          </div>
                        </v-list-item-title>
                      </v-list-item>

                      <v-list-item
                        :disabled="!item.image"
                        @click="onRemoveImage(item)"
                      >
                        <v-list-item-title>
                          Remove Image
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>

                  <v-btn
                    icon
                    large
                    @click="deleteItem(index)"
                  >
                    <v-icon color="grey lighten-1">
                      delete
                    </v-icon>
                  </v-btn>
                </div>
              </v-row>

              <div
                v-if="item.expanded"
                class="px-8"
              >
                <v-row>
                  <v-col
                    cols="12"
                    sm="5"
                    md="4"
                  >
                    <v-text-field
                      v-model="item.name"
                      :rules="textRules"
                      label="Item Text"
                      counter="11"
                      maxlength="11"
                      @change="updateItem(item)"
                    />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col
                    cols="12"
                    sm="12"
                  >
                    <v-text-field
                      v-model="item.description"
                      label="Item Tooltip"
                      @change="updateItem(item)"
                    />
                  </v-col>
                </v-row>
              </div>
            </div>
          </div>

          <div class="pa-2">
            <v-btn
              fab
              x-small
              color="primary"
              @click="addItem"
            >
              <v-icon color="white">
                mdi-plus
              </v-icon>
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          v-if="isTokenValue"
          class="d-flex align-center"
          cols="auto"
        >
          <v-btn
            class="deep-orange"
            color="primary"
            dark
            @click="onEditValues"
          >
            Edit Values
          </v-btn>
        </v-col>

        <v-col
          v-if="hasScoreValue"
          class="d-flex align-center"
          cols="auto"
        >
          <v-btn
            class="deep-orange"
            color="primary"
            dark
            @click="onEditScores"
          >
            Edit Scores
          </v-btn>
        </v-col>

        <v-col
          v-if="hasResponseAlert"
          class="d-flex align-center"
          cols="auto"
        >
          <v-btn
            class="deep-orange"
            color="primary"
            dark
            @click="onEditAlerts"
          >
            Edit Alerts
          </v-btn>
        </v-col>
      </v-row>

      <v-divider
        class="mt-4"
      />
      <v-row>
        <v-col
          class="d-flex align-center"
          cols="12"
          md="3"
          sm="6"
        >
          <v-checkbox
            v-model="isTokenValue"
            label="Token Value"
            @change="update"
          />
        </v-col>
        <v-col
          class="d-flex align-center"
          cols="12"
          md="3"
          sm="6"
        >
          <v-checkbox
            v-model="isSkippable"
            label="Skippable Item"
            :disabled="isSkippableItem == 2"
          />
        </v-col>
        <v-col
          class="d-flex align-center"
          cols="12"
          md="3"
          sm="6"
        >
          <v-checkbox
            v-model="hasResponseAlert"
            label="Set Alert"
            @change="update"
          />
        </v-col>
        <v-col
          class="d-flex align-center"
          cols="12"
          md="3"
          sm="6"
        >
          <v-checkbox
            v-model="hasScoreValue"
            label="Option Score"
            @change="update"
          />
        </v-col>
        <v-col
          class="d-flex align-center"
          cols="12"
          md="3"
          sm="6"
        >
          <v-checkbox
            v-model="removeBackOption"
            label="Remove back button"
            @change="update"
          />
        </v-col>
      </v-row>
    </v-form>

    <v-dialog
      v-model="imageUrlDialog.visible"
      persistent
      width="800"
    >
      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
          <v-icon left>
            mdi-pencil
          </v-icon>
          Upload from URL
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="imageUrlDialog.url"
            label="URL"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-btn
            outlined
            color="primary"
            @click="imageUrlDialog.visible = false;"
          >
            Close
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            @click="onAddImageFromUrl"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="inValidFileDlg"
      width="400"
    >
      <v-alert type="error">
        <span>{{ fileErrorMsg }}</span>
      </v-alert>
    </v-dialog>

    <v-dialog
      v-model="valueEditDialog.visible"
      width="600"
      persistent
    >
      <TableEditor
        :options="options"
        :items="itemList"
        :initial="values"
        title="Edit Values"
        @update="updateValues"
      />
    </v-dialog>

    <v-dialog
      v-model="scoreEditDialog.visible"
      width="600"
      persistent
    >
      <TableEditor
        :options="options"
        :items="itemList"
        :initial="scores"
        title="Edit Scores"
        @update="updateScores"
      />
    </v-dialog>

    <v-dialog
      v-model="alertEditDialog.visible"
      width="600"
      persistent
    >
      <TableEditor
        :options="options"
        :items="itemList"
        :initial="alerts"
        input-type="text"
        title="Edit Alerts"
        @update="updateAlerts"
      />
    </v-dialog>
  </div>
</template>

<style scoped>
  .radio-option, .radio-item {
    display: flex;
    align-items: center;
  }

  .radio-option > *, .radio-item > * {
    margin-left: 10px;
  }

  .response-options {
    border-right: 2px solid black;
  }
</style>

<script>
import ImageUpldr from '../../../../models/ImageUploader';
import TableEditor from './TableEditor';

export default {
  components: {
    TableEditor,
  },
  props: {
    initialItemData: {
      type: Object,
      required: true
    },
    isSkippableItem: {
      type: Number,
      default: 0,
    },
    responseOptions: {
      type: Object,
      required: true
    },
    itemTemplates: {
      type: Array,
      default: null
    },
    hasPrizeActivity: {
      type: Boolean,
      required: false,
      default: false,
    },
    isMultipleChoice: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data: function () {
    const imgUploader = new ImageUpldr();

    const isTokenValue = (this.responseOptions.valueType && this.responseOptions.valueType.includes("token")) || false;

    let values = [], scores = [], alerts = [];
    if (Array.isArray(this.initialItemData.choices)) {
      for (let i = 0; i < this.initialItemData.choices.length; i++) {
        values.push([]);
        scores.push([]);
        alerts.push([]);

        const choices = this.initialItemData.choices[i];

        for (let j = 0; j < choices.length; j++) {
          values[i].push(choices[j].value || 0);
          scores[i].push(choices[j].score || 0);
          alerts[i].push(choices[j].alert || '');
        }
      }
    }

    return {
      inValidFileDlg: false,
      fileErrorMsg: '',
      options: (this.initialItemData.options || []).map(option => ({
        name: option.name,
        value: option.value || 0,
        score: option.score || 0,
        image: option.image || '',
        description: option.description || '',
        expanded: false,
        valid: true
      })),
      itemList: (this.initialItemData.itemList || []).map(item => ({
        name: item.name,
        image: item.image || '',
        description: item.description || '',
        expanded: false,
        valid: true
      })),
      imageUrlDialog: {
        visible: false,
        option: null,
        url: ''
      },
      valueEditDialog: {
        visible: false,
        key: 0
      },
      scoreEditDialog: {
        visible: false,
        key: 0
      },
      alertEditDialog: {
        visible: false,
        key: 0
      },
      textRules: [
        v => !!v || 'Radio options cannot be empty',
      ],
      numberRules: [
        v => !isNaN(parseInt(v)) || 'Please enter a numerical value',
      ],
      alertTextRules: [
        v => !!v || 'Alert Text cannot be empty',
      ],

      isTokenValue,
      hasScoreValue: this.initialItemData.hasScoreValue || false,
      removeBackOption: this.initialItemData.removeBackOption,
      hasResponseAlert: this.initialItemData.hasResponseAlert || false,
      imgUploader,
      values,
      scores,
      alerts,
      valueDialog: false,
      scoreDialog: false,
    };
  },

  computed: {
    isSkippable: {
      get() {
        return this.isSkippableItem === 1 || false;
      },
      set(value) {
        this.$emit('updateAllow', value);
      }
    }
  },

  beforeMount() {
    if (!this.itemList.length) {
      this.addItem();
      this.itemList[0].expanded = true;
    }

    if (!this.options.length) {
      this.addOption();
      this.options[0].expanded = true;
    }
  },

  methods: {
    addOption() {
      const nextOption = {
        'name': `Option ${this.options.length + 1}`,
        'value': 0,
        'score': 0,
        'description': '',
        'expanded': false,
        'image': '',
        'valid': true,
      };

      for (let i = 0; i < this.itemList.length; i++) {
        this.values[i].push(0);
        this.scores[i].push(0);
        this.alerts[i].push('');
      }
      this.options.push(nextOption);

      this.update();
    },

    addItem() {
      const nextItem = {
        'name': `Item ${this.itemList.length + 1}`,
        'image': '',
        'description': '',
        'expanded': false,
      };

      this.values.push([]);
      this.scores.push([]);
      this.alerts.push([]);

      for (let i = 0; i < this.options.length; i++) {
        this.values[this.values.length-1].push(0);
        this.scores[this.scores.length-1].push(0);
        this.alerts[this.alerts.length-1].push('');
      }

      this.itemList.push(nextItem);

      this.update();
    },

    deleteOption(index) {
      for (let i = 0; i < this.itemList.length; i++) {
        this.values[i].splice(index, 1);
        this.scores[i].splice(index, 1);
        this.alerts[i].splice(index, 1);
      }
      this.options.splice(index, 1);
      this.update();
    },

    deleteItem(index) {
      this.itemList.splice(index, 1);
      this.values.splice(index, 1);
      this.scores.splice(index, 1);
      this.alerts.splice(index, 1);
      this.update();
    },

    update() {
      const choices = [];

      for (let i = 0; i < this.itemList.length; i++) {
        choices.push([]);
        for (let j = 0; j < this.options.length; j++) {
          const choice = {
            score: this.scores[i] && this.scores[i][j] || 0,
            value: this.values[i] && this.values[i][j] || 0,
            alert: this.alerts[i] && this.alerts[i][j] || '',
          };

          choices[i].push(choice);
        }
      }

      const responseOptions = {
        'hasScoreValue': this.hasScoreValue,
        'hasResponseAlert': this.hasResponseAlert,
        'isTokenValue': this.isTokenValue,
        'valueType': this.isTokenValue ? 'xsd:token' : 'xsd:anyURI',
        'isMultipleChoice': this.isMultipleChoice,
        'isSkippableItem': this.isSkippable,
        'removeBackOption': this.removeBackOption,
        'options': this.options,
        'itemList': this.itemList,
        'choices': (this.isTokenValue || this.hasScoreValue || this.hasResponseAlert) ? choices : [],
      };
      this.$emit('updateOptions', responseOptions);
    },

    updateOption(option) {
      option.valid = this.isValidOption(option);

      this.update();
    },

    updateItem(item) {
      item.valid = item.name.length > 0;
      this.update();
    },

    isValidOption(option) {
      if (option.name.length == 0) {
        return false;
      }
      if (this.isTokenValue && isNaN(option.value) || this.hasScoreValue && isNaN(option.score)) {
        return false;
      }

      return true;
    },

    onAddImageUrl(option) {
      this.imageUrlDialog.visible = true;
      this.imageUrlDialog.option = option;
      this.imageUrlDialog.url = option.image;
    },

    onRemoveImage(option) {
      option.image = '';
    },

    onAddImageFromUrl() {
      const { option } = this.imageUrlDialog;
      this.imageUrlDialog.visible = false;

      option.image = this.imageUrlDialog.url;
      this.update();
    },

    async onChangeFile(event, option) {
      if (!event.target.files.length) {
        return ;
      }

      const file = event.target.files[0];

      this.fileErrorMsg = await this.imgUploader.isImageValid(file);
      if (this.fileErrorMsg) {
        this.inValidFileDlg = true;
      }

      this.$emit('uploading', true);

      const response = await this.imgUploader.uploadImage(file);
      option.image = response.location;

      this.$emit('uploading', false);

      this.update();
    },

    updateValues(values) {
      if (values) {
        this.values = values;
      }
      this.valueEditDialog.visible = false;
      this.update();
    },

    updateScores(scores) {
      if (scores) {
        this.scores = scores;
      }
      this.scoreEditDialog.visible = false;
      this.update();
    },

    updateAlerts(alerts) {
      if (alerts) {
        this.alerts = alerts;
      }

      this.alertEditDialog.visible = false;
      this.update();
    },

    onEditValues() {
      this.valueEditDialog.visible = true;
      this.valueEditDialog.key++;
    },

    onEditScores() {
      this.scoreEditDialog.visible = true;
      this.scoreEditDialog.key++;
    },

    onEditAlerts() {
      this.alertEditDialog.visible = true;
      this.alertEditDialog.key++;
    }
  }
}
</script>

<style lang="scss" scoped>
.mx-template-list {
  position: absolute;
  margin-top: 36px;
  z-index: 1;
}

.option-list, .item-list {
  width: 90%;
}

.options-items {
  border: 2px solid black;
}

.upload-from-pc {
  position: relative;

  .file-input, .file-input:after {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    border-radius: 4px;
    z-index: 1;
    opacity: 0;
  }

  .file-input {
    &:after {
      content: '';
      cursor: pointer;
    }
  }
}
</style>
