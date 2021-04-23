<template>
  <v-card
    class="item pa-2"
    :class="item.allowEdit ? '' : 'not-editable'"
  >
    <v-card-title
      class="item-title px-2 py-0"
      :class="item.valid ? '' : 'invalid'"
    >
      <span
        v-if="!isExpanded"
        class="item-name"
      >
        {{ item.name }}
      </span>
      <v-spacer />
      <v-card-actions>
        <v-btn
          v-if="item.allowEdit"
          icon
          @click="duplicateItem(itemIndex)"
        >
          <v-icon color="grey lighten-1">
            content_copy
          </v-icon>
        </v-btn>
        <v-btn
          icon
          @click="editItem"
        >
          <v-icon
            v-if="!isExpanded && item.allowEdit"
            color="grey lighten-1"
          >
            edit
          </v-icon>
          <v-icon
            v-else-if="!isExpanded"
            color="grey lighten-1"
          >
            mdi-eye
          </v-icon>

          <v-icon
            v-else
            color="grey lighten-1"
          >
            mdi-chevron-double-up
          </v-icon>
        </v-btn>
        <v-btn
          v-if="item.allowEdit"
          icon
          @click="onDeleteItem(item)"
        >
          <v-icon color="grey lighten-1">
            mdi-delete
          </v-icon>
        </v-btn>
      </v-card-actions>
    </v-card-title>

    <v-form
      v-if="isExpanded"
      ref="form"
      class="px-2"
      lazy-validation
    >
      <div
        class="item-name-edit-wrapper"
        :class="{ 'editing': isItemNameEditing }"
      >
        <span
          :class="{ 'hide': isItemNameEditing }"
          class="item-name"
        >
          {{ item.name }}
        </span>
        <v-text-field
          v-model="item.name"
          class="item-name-input"
          :class="{ 'focus': isItemNameEditing }"
          label="Item Name"
          :rules="nameRules"
          :disabled="item.inputType == 'cumulativeScore'"
          required
          @focus="isItemNameEditing = true"
          @blur="isItemNameEditing = false"
          @input="onUpdateName"
          @keydown="nameKeydown($event)"
        />
      </div>
      <template
        v-if="item.inputType !== 'markdownMessage'"
      >
        <Uploader
          class="mt-3 mb-4"
          style="max-width: 300px"
          :initialType="'image'"
          :initialData="headerImage"
          :initialTitle="'Header Item Image'"
          @onAddFromUrl="onAddHeaderImageFromUrl($event)"
          @onAddFromDevice="loading = true; onAddHeaderImageFromDevice($event);"
          @onRemove="onRemoveHeaderImage()"
          @onNotify="loading = false; notify = $event;"
        />
        <v-textarea
          v-if="item.inputType !== 'cumulativeScore'"
          v-model="largeText"
          label="Large Text"
          auto-grow
          filled
          rows="1"
          :error-messages="largeText ? '' : 'Large Text is required.'"
        />
      </template>

      <v-row>
        <v-col
          cols="12"
          sm="3"
        >
          <v-select
            class="mt-4"
            :value="item.inputType"
            :items="itemInputTypes"
            label="Input Type"
            outlined
            hide-details
            @change="onUpdateInputType($event)"
          >
            <template
              v-slot:item="{ item, attrs, on }"
            >
              <v-list-item
                v-bind="attrs"
                v-on="on"
              >
                <v-tooltip
                  v-if="!hasScoringItem && item.text == 'cumulativeScore'"
                  top
                >
                  <template
                    v-slot:activator="{ on }"
                  >
                    <div
                      class="disabled-option"
                      v-on="on"
                      @click.stop=""
                    >
                      <img
                        height="20"
                        class="px-2 pt-2"
                        :src="item.icon"
                      >
                      <span>{{ item.text }}</span>
                    </div>
                  </template>
                  <span>Please create an item with scores before creating this page</span>
                </v-tooltip>
                <div
                  v-else
                >
                  <img
                    height="20"
                    class="px-2 pt-2"
                    :src="item.icon"
                  >
                  {{ item.text }}
                </div>
              </v-list-item>
            </template>

            <template
              v-slot:selection="{ item }"
            >
              <v-list-item>
                <img
                  height="20"
                  class="pr-2"
                  :src="item.icon"
                >

                {{ item.text }}
              </v-list-item>
            </template>
          </v-select>
        </v-col>
      </v-row>

      <div
        v-if="item.inputType === 'markdownMessage'"
      >
        Message:

        <MarkDownEditor
          :value="item.markdownText"
          @input="onUpdateMarkdownText"
        />
      </div>

      <RadioBuilder
        v-if="item.inputType === 'radio' || item.inputType === 'checkbox'"
        :key="`${baseKey}-radio`"
        :is-multiple-choice="item.inputType === 'checkbox'"
        :is-skippable-item="skippable"
        :initial-response-options="item.responseOptions"
        :initial-item-data="item.options"
        :item-templates="itemTemplates"
        :has-prize-activity="hasPrizeActivity"
        :initial-is-optional-text="item.isOptionalText"
        @openPrize="setTokenPrizeModalStatus(true)"
        @removeTemplate="onRemoveTemplate"
        @updateTemplates="onUpdateTemplates"
        @updateOptions="updateOptions"
        @updateAllow="updateAllow"
        @updateOptionalText="updateOptionalText"
        @updateResponseOptions="updateResponseOptions"
        @loading="loading = $event"
        @notify="notify = $event"
      />

      <StackedRadioBuilder
        v-if="item.inputType === 'stackedRadio' || item.inputType === 'stackedCheckbox'"
        :key="`${baseKey}-stackedRadio`"
        :is-multiple-choice="item.inputType === 'stackedCheckbox'"
        :is-skippable-item="skippable"
        :response-options="item.responseOptions"
        :initial-item-data="item.options"
        :item-templates="itemTemplates"
        :has-prize-activity="hasPrizeActivity"
        @updateOptions="updateOptions"
        @updateAllow="updateAllow"
      />

      <TextBuilder
        v-if="item.inputType === 'text'"
        :key="`${baseKey}-text`"
        :is-skippable-item="skippable"
        :initial-item-data="item.options"
        :response-option="item.responseOptions"
        :initial-answer="item.correctAnswer"
        @updateAnswer="updateAnswer"
        @updateOptions="updateOptions"
        @updateAllow="updateAllow"
      />

      <SliderBuilder
        v-if="item.inputType === 'slider'"
        :key="`${baseKey}-slider`"
        :is-skippable-item="skippable"
        :initial-item-data="item.options"
        :initial-response-options="item.responseOptions"
        :initial-is-optional-text="item.isOptionalText"
        @updateOptions="updateOptions"
        @updateAllow="updateAllow"
        @updateOptionalText="updateOptionalText"
        @updateResponseOptions="updateResponseOptions"
        @loading="loading = $event"
        @notify="notify = $event"
      />

      <StackedSliderBuilder
        v-if="item.inputType === 'stackedSlider'"
        :key="`${baseKey}-stackedSlider`"
        :is-skippable-item="skippable"
        :initial-item-data="item.options"
        @updateOptions="updateOptions"
        @updateAllow="updateAllow"
        @loading="loading = $event"
        @notify="notify = $event"
      />

      <VideoBuilder
        v-if="item.inputType === 'video'"
        :key="`${baseKey}-video`"
        :initial-is-optional-text="item.isOptionalText"
        :initial-item-response-options="item.responseOptions"
        :is-skippable-item="skippable"
        @updateOptionalText="updateOptionalText"
        @updateResponseOptions="updateResponseOptions"
        @updateAllow="updateAllow"
      />

      <PhotoBuilder
        v-if="item.inputType === 'photo'"
        :key="`${baseKey}-photo`"
        :initial-is-optional-text="item.isOptionalText"
        :initial-item-response-options="item.responseOptions"
        :is-skippable-item="skippable"
        @updateOptionalText="updateOptionalText"
        @updateResponseOptions="updateResponseOptions"
        @updateAllow="updateAllow"
      />

      <TimeRangeBuilder
        v-if="item.inputType === 'timeRange'"
        :key="`${baseKey}-timeRange`"
        :initial-is-optional-text="item.isOptionalText"
        :initial-item-response-options="item.responseOptions"
        :is-skippable-item="skippable"
        @updateOptionalText="updateOptionalText"
        @updateResponseOptions="updateResponseOptions"
        @updateAllow="updateAllow"
      />

      <DateBuilder
        v-if="item.inputType === 'date'"
        :key="`${baseKey}-date`"
        :initial-is-optional-text="item.isOptionalText"
        :initial-item-response-options="item.responseOptions"
        :is-skippable-item="skippable"
        @updateOptionalText="updateOptionalText"
        @updateResponseOptions="updateResponseOptions"
        @updateAllow="updateAllow"
      />

      <DrawingBuilder
        v-if="item.inputType === 'drawing'"
        :key="`${baseKey}-drawing`"
        :initial-item-response-options="item.responseOptions"
        :initial-item-input-options="item.inputOptions"
        :initial-is-optional-text="item.isOptionalText"
        :is-skippable-item="skippable"
        @updateResponseOptions="updateResponseOptions"
        @updateInputOptions="updateInputOptions"
        @updateOptionalText="updateOptionalText"
        @updateAllow="updateAllow"
        @loading="loading = $event"
        @notify="notify = $event"
      />

      <AudioRecordBuilder
        v-if="item.inputType === 'audioRecord'"
        :key="`${baseKey}-audioRecord`"
        :is-skippable-item="skippable"
        :initial-item-data="item.options"
        :initial-is-optional-text="item.isOptionalText"
        :initial-item-response-options="item.responseOptions"
        @updateOptions="updateOptions"
        @updateAllow="updateAllow"
        @updateOptionalText="updateOptionalText"
        @updateResponseOptions="updateResponseOptions"
      />

      <AudioImageRecordBuilder
        v-if="item.inputType === 'audioImageRecord'"
        :key="`${baseKey}-audioImageRecord`"
        :initial-item-response-options="item.responseOptions"
        :is-skippable-item="skippable"
        @checkValidation="valid = $event"
        @updateResponseOptions="updateResponseOptions"
        @updateAllow="updateAllow"
        @loading="loading = $event"
        @notify="notify = $event"
      />

      <GeolocationBuilder
        v-if="item.inputType === 'geolocation'"
        :key="`${baseKey}-geolocation`"
        :initial-item-response-options="item.responseOptions"
        :initial-is-optional-text="item.isOptionalText"
        :is-skippable-item="skippable"
        @updateOptionalText="updateOptionalText"
        @updateResponseOptions="updateResponseOptions"
        @loading="loading = $event"
        @notify="notify = $event"
        @updateAllow="updateAllow"
      />

      <AudioStimulusBuilder
        v-if="item.inputType === 'audioStimulus'"
        :key="`${baseKey}-audioStimulus`"
        :is-skippable-item="skippable"
        :initial-item-input-options="item.inputOptions"
        :initial-item-media="item.media"
        :initial-item-data="item.options"
        @updateAllow="updateAllow"
        @updateInputOptions="updateInputOptions"
        @updateMedia="updateMedia"
        @validation="item.valid = $event"
        @loading="loading = $event"
        @notify="notify = $event"
      />

      <CumulativeScoreBuilder
        v-if="item.inputType === 'cumulativeScore'"
        :key="`${baseKey}-cumulativeScore`"
        :items="currentActivity.items"
        :initial-item-data="item"
        @updateCumulativeScore="updateCumulativeScore"
      />
    </v-form>

    <div class="px-2">
      <div class="item-quiz">
        <img
          width="15"
          :src="itemInputTypes.find(({ text }) => text === item.inputType).icon"
        >

        <span
          v-if="item.inputType !== 'cumulativeScore' && item.inputType !== 'markdownMessage'"
          class="ml-2"
        >
          {{ largeText }}
        </span>
      </div>
    </div>

    <Notify :notify="notify" />
    <Loading :loading="loading" />

    <v-dialog
      v-model="removeDialog"
      persistent
      max-width="720"
    >
      <v-card>
        <v-card-title class="headline">
          Delete Item
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete this item? It will also remove the below condition
          <v-list>
            <v-list-group
              v-for="conditional in itemConditionals"
              :key="conditional.id"
              no-action
            >
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title v-text="'If ' + conditional.operation + ' of the `IF` rules are matched, show ' + conditional.showValue" />
                </v-list-item-content>
              </template>

              <v-list-item
                v-for="condition in conditional.conditions"
                :key="conditional.id + condition.ifValue.name"
              >
                <v-list-item-content>
                  <v-list-item-title v-text="condition.ifValue.name + ' ' + condition.stateValue.name + ' is ' + condition.answerValue.name" />
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="removeDialog = false"
          >
            No
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="removeConditionals()"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>

  .item.not-editable {
    position: relative;
  }

  .item.not-editable:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    z-index: 2;
    background-color: rgba(145, 145, 145, 0.1);
  }

  .item-title {
    position: relative;
    z-index: 3;
  }

  .item-name-edit-wrapper {
    position: relative;
    height: 27px;
    transition: height 0.2s ease;
    overflow: hidden;
  }

  .item-name-edit-wrapper:hover,
  .item-name-edit-wrapper.editing {
    height: 66px;
  }

  .item-name-edit-wrapper > * {
    transition: opacity 0.2s ease;
  }

  .item-name-edit-wrapper:hover .item-name,
  .item-name-edit-wrapper .item-name.hide,
  .item-name-edit-wrapper .item-name-input {
    opacity: 0;
  }

  .item-name-edit-wrapper .item-name-input {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }

  .item-name-edit-wrapper:hover .item-name-input,
  .item-name-edit-wrapper .item-name-input.focus {
    opacity: 1;
  }

  .item-name {
    font-size: 1.25rem;
    letter-spacing: 0.0125em;
  }

  .item-name, .item-quiz {
    font-weight: 600;
  }

  .item-quiz {
    display: flex;
    align-items: center;
  }

  .invalid {
    background-color: #d44c4c;
  }

  .invalid /deep/ input {
    color: white !important;
  }

  .disabled-option {
    color: grey;
  }
</style>

<script>
import Uploader from '../Uploader.vue';

import RadioBuilder from "./ItemBuilders/RadioBuilder.vue";
import StackedRadioBuilder from "./ItemBuilders/StackedRadioBuilder.vue";
import TextBuilder from "./ItemBuilders/TextBuilder.vue";
import SliderBuilder from "./ItemBuilders/SliderBuilder.vue";
import VideoBuilder from "./ItemBuilders/VideoBuilder.vue";
import PhotoBuilder from "./ItemBuilders/PhotoBuilder.vue";
import TimeRangeBuilder from "./ItemBuilders/TimeRangeBuilder.vue";
import DateBuilder from "./ItemBuilders/DateBuilder.vue";
import DrawingBuilder from "./ItemBuilders/DrawingBuilder.vue";
import AudioRecordBuilder from "./ItemBuilders/AudioRecordBuilder.vue";
import AudioImageRecordBuilder from "./ItemBuilders/AudioImageRecordBuilder.vue";
import GeolocationBuilder from "./ItemBuilders/GeolocationBuilder.vue";
import AudioStimulusBuilder from "./ItemBuilders/AudioStimulusBuilder.vue";
import CumulativeScoreBuilder from "./ItemBuilders/CumulativeScoreBuilder.vue";
import StackedSliderBuilder from "./ItemBuilders/StackedSliderBuilder";

import MarkDownEditor from "../MarkDownEditor";
import Item from '../../../models/Item';

import Notify from '../Additional/Notify.vue';
import Loading from '../Additional/Loading.vue';

import { mapMutations, mapGetters } from 'vuex';
import config from '../../../config';

export default {
  components: {
    Uploader,
    RadioBuilder,
    TextBuilder,
    SliderBuilder,
    VideoBuilder,
    PhotoBuilder,
    TimeRangeBuilder,
    DateBuilder,
    DrawingBuilder,
    AudioRecordBuilder,
    AudioImageRecordBuilder,
    GeolocationBuilder,
    AudioStimulusBuilder,
    CumulativeScoreBuilder,
    MarkDownEditor,
    StackedRadioBuilder,
    StackedSliderBuilder,
    Notify,
    Loading,
  },
  props: {
    itemIndex: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      model: null,
      textRules: [v => !!v || "This field is required"],
      nameRules: [
        v =>
          /^[a-zA-Z0-9-_]+$/.test(v) ||
          "Item name must be contain only alphanumeric symbols or underscore"
      ],
      itemConditionals: [],
      hasScoringItem: false,
      removeDialog: false,
      valid: false,
      largeText: '',
      headerImage: '',
      isExpanded: false,
      isItemNameEditing: false,
      baseKey: 0,
      loading: false,
      notify: {},
    }
  },
  computed: {
    config () {
      return config;
    },

    ...mapGetters(config.MODULE_NAME,
      [
        'currentActivity',
        'itemInputTypes',
        'itemTemplates',
        'prizeActivity'
      ]
    ),

    conditionals () {
      return this.currentActivity.conditionalItems;
    },

    hasPrizeActivity () {
      return !!this.prizeActivity;
    },

    item () {
      return this.currentActivity.items[this.itemIndex];
    },
    skippable() {
      if (this.currentActivity.isSkippable) {
        return 2;
      }

      return Number(this.item.allow);
    }
  },
  watch: {
    largeText: function(text) {
      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: { question: { text, image: this.headerImage } }
      });
    },
    headerImage: function(image) {
      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: { question: { text: this.largeText, image } }
      });
    },
  },

  beforeMount() {

    Object.assign(this, {
      valid: this.item.name && this.item.name.length > 0,
      hasScoringItem: this.currentActivity.items.some((item) => item.options.hasScoreValue),
      largeText: this.item.question.text,
      headerImage: this.item.question.image,
      isExpanded: !this.item.name.length
    });

    this.setItemName();

  },
  methods: {
    ...mapMutations(config.MODULE_NAME,
      [
        'updateItemMetaInfo',
        'duplicateItem',
        'deleteConditional',
        'deleteItem',
        'updateItemInputType',
        'setTokenPrizeModalStatus',
        'insertTemplateUpdateRequest',
      ],
    ),

    setItemName () {
      if(!this.item.name) this.onUpdateName(`Screen${this.itemIndex + 1}`);
    },

    editItem () {
      this.isExpanded = !this.isExpanded;
    },

    onDeleteItem () {
      this.itemConditionals = [];
      this.conditionals.forEach(conditional => {
        if (conditional.showValue === this.item.name) {
          this.itemConditionals.push(conditional);
        } else if(conditional.conditions.find(({ ifValue }) => ifValue.name === this.item.name)) {
          this.itemConditionals.push(conditional);
        }
      });

      if (this.itemConditionals.length) {
        this.removeDialog = true;
      } else {
        this.removeConditionals();
      }
    },

    removeConditionals () {
      this.deleteItem(this.itemIndex);
      this.itemConditionals.forEach((conditional) => {
        const index = this.conditionals.findIndex(({ id }) => id === conditional.id);

        if (index !== -1) {
          this.deleteConditional(index);
        }
      })

      this.removeDialog = false;
    },

    nameKeydown (e) {
      if (!/^[a-zA-Z0-9-_]+$/.test(e.key)) {
        e.preventDefault();
      }
    },

    onUpdateInputType (inputType) {
      const updates = {
        inputType
      };
      if (inputType === 'cumulativeScore') {
        updates.name = 'cumulatives';
      }

      updates.options = { options: [] };
      updates.allow = false;

      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: updates
      })

      const model = new Item();
      model.updateReferenceObject(this.item);

      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: { responseOptions: model.getResponseOptions() }
      })

      this.baseKey++;
    },

    onUpdateName (name) {
      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: { name }
      })
    },

    onUpdateMarkdownText (markdownText) {
      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: { markdownText }
      })
    },

    updateResponseOptions(responseOptions) {
      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: { responseOptions }
      })
    },

    updateInputOptions(inputOptions) {
      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: { inputOptions }
      })
    },

    updateAnswer(correctAnswer) {
      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: { correctAnswer }
      })
    },

    updateAllow(allowItem) {
      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: { allow: allowItem }
      })
    },

    updateOptionalText(isOptionalText) {
      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: { isOptionalText }
      });
    },

    updateMedia(newMedia) {
      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: { media: newMedia }
      })
    },

    onUpdateTemplates (option) {
      this.insertTemplateUpdateRequest({
        type: 'updateTemplates',
        option
      })
    },

    onRemoveTemplate (option) {
      this.insertTemplateUpdateRequest({
        type: 'removeTemplate',
        option
      })
    },

    updateOptions (newOptions) {
      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: { options: newOptions }
      })

      const model = new Item();
      model.updateReferenceObject(this.item);

      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: { responseOptions: model.getResponseOptions() }
      })
    },

    updateCumulativeScore (scoreRules) {
      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: { cumulativeScores: scoreRules }
      });
    },

    onAddHeaderImageFromUrl(url) {
      this.headerImage = url;
      this.notify = {
        type: 'success',
        message: 'Header image from URL successfully added to Item.',
        duration: 3000,
      };
    },

    async onAddHeaderImageFromDevice(uploadFunction) {
      try {
        this.headerImage = await uploadFunction();
        this.loading = false;
        this.notify = {
          type: 'success',
          message: 'Header image successfully added to Item.',
          duration: 3000,
        };
      } catch (error) {
        this.loading = false;
        this.notify = {
          type: 'error',
          message: 'Something went wrong with uploading header image for Item. Please try to upload again or just save Item without changes for header image.',
        };
      }
    },

    onRemoveHeaderImage() {
      this.headerImage = '';
      this.notify = {
        type: 'warning',
        message: 'Header image successfully removed from Item.',
        duration: 3000,
      };
    },

  }
}
</script>
