<template>
  <v-card
    class="pa-2"
  >
    <v-card-title
      class="px-2 py-0"
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
        <v-btn icon @click="duplicateItem(itemIndex)">
          <v-icon color="grey lighten-1">
            content_copy
          </v-icon>
        </v-btn>
        <v-btn icon @click="editItem">
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
          @click="onDeleteItem"
        >
          <v-icon color="grey lighten-1">
            mdi-delete
          </v-icon>
        </v-btn>
      </v-card-actions>
    </v-card-title>

    <v-form
      v-if="isExpanded"
      class="px-2"
      ref="form"
      lazy-validation
    >
      <div class="item-name-edit-wrapper"
        v-bind:class="{ 'editing': isItemNameEditing }"
      >
        <span
          v-bind:class="{ 'hide': isItemNameEditing }"
          class="item-name"
        >
          {{ item.name }}
        </span>
        <v-text-field
          class="item-name-input"
          v-bind:class="{ 'focus': isItemNameEditing }"
          v-model="item.name"
          @focus="isItemNameEditing = true"
          @blur="isItemNameEditing = false"
          @input="onUpdateName"
          label="Item Name"
          :rules="nameRules"
          :disabled="!item.allowEdit || item.inputType == 'cumulativeScore'"
          required
          @keydown="nameKeydown($event)"
        />
      </div>
      <template
        v-if="item.inputType !== 'markdownMessage'"
      >
        <ImageUploader
          class="my-4"
          style="max-width: 300px"
          :uploadFor="'activity-item'"
          :itemImg="questionBuilder.imgURL"
          :notify-enabled="false"
          :disabled="!item.allowEdit"
          @onAddImg="onAddImg"
          @onRemoveImg="onRemoveImg"
        />
        <v-textarea
          v-model="questionBuilder.text"
          label="Large Text"
          v-if="item.inputType !== 'cumulativeScore'"
          :disabled="!item.allowEdit"
          auto-grow
          filled
          rows="1"
        />
      </template>

      <v-row>
        <v-col
          cols="12"
          sm="6"
        >
          <v-select
            class="mt-4"
            :value="item.inputType"
            :items="itemInputTypes"
            :disabled="!item.allowEdit"
            label="Input Type"
            @change="onUpdateInputType($event)"
            outlined
            hide-details
          >
            <template
              v-slot:item="{ item, attrs, on }"
            >
              <v-list-item
                v-on="on"
                v-bind="attrs"
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
                      />
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
                  />
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
                />

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
        :is-multiple-choice="item.inputType === 'checkbox'"
        :is-skippable-item="item.allow"
        :response-options="item.responseOptions"
        :initial-item-data="item.options"
        :is-item-editable="item.allowEdit"
        :item-templates="itemTemplates"
        :has-prize-activity="hasPrizeActivity"
        @openPrize="setTokenPrizeModalStatus(true)"
        @removeTemplate="onRemoveTemplate"
        @updateTemplates="onUpdateTemplates"
        @updateOptions="updateOptions"
        @updateAllow="updateAllow"
        @uploading="isUploadingState = $event"
        @error="isError = $event"
      />
      <TextBuilder
        v-if="item.inputType === 'text'"
        :is-skippable-item="item.allow"
        :initial-item-data="item.options"
        :response-option="item.responseOptions"
        :initial-answer="item.correctAnswer"
        :is-item-editable="item.allowEdit"
        @updateAnswer="updateAnswer"
        @updateOptions="updateOptions"
        @updateAllow="updateAllow"
      />
      <SliderBuilder
        v-if="item.inputType === 'slider'"
        :is-skippable-item="item.allow"
        :initial-item-data="item.options"
        :is-item-editable="item.allowEdit"
        @updateOptions="updateOptions"
        @updateAllow="updateAllow"
        @uploading="isUploadingState = $event"
        @error="isError = $event"
      />
      <VideoBuilder v-if="item.inputType === 'video'" />
      <PhotoBuilder v-if="item.inputType === 'photo'" />
      <TimeRangeBuilder v-if="item.inputType === 'timeRange'" />
      <DateBuilder v-if="item.inputType === 'date'" />

      <DrawingBuilder
        v-if="item.inputType === 'drawing'"
        :initial-item-response-options="item.responseOptions"
        :initial-item-input-options="item.inputOptions"
        @uploading="isUploadingState = $event"
        @error="isError = $event"
        @updateResponseOptions="updateResponseOptions"
        @updateInputOptions="updateInputOptions"
      />

      <AudioRecordBuilder
        v-if="item.inputType === 'audioRecord'"
        :is-skippable-item="item.allow"
        :initial-item-data="item.options"
        @updateOptions="updateOptions"
        @updateAllow="updateAllow"
      />

      <AudioImageRecordBuilder
        v-if="item.inputType === 'audioImageRecord'"
        :initial-item-response-options="item.responseOptions"
        :is-skippable-item="item.allow"
        @uploading="isUploadingState = $event"
        @error="isError = $event"
        @checkValidation="valid = $event"
        @updateResponseOptions="updateResponseOptions"
        @updateAllow="updateAllow"
      />

      <GeolocationBuilder
        v-if="item.inputType === 'geolocation'"
        :initial-item-response-options="item.responseOptions"
        @uploading="isUploadingState = $event"
        @error="isError = $event"
        @updateResponseOptions="updateResponseOptions"
      />

      <AudioStimulusBuilder
        v-if="item.inputType === 'audioStimulus'"
        :is-skippable-item="item.allow"
        :initial-item-input-options="item.inputOptions"
        :initial-item-media="item.media"
        :initial-item-data="item.options"
        :is-item-editable="item.allowEdit"
        @updateAllow="updateAllow"
        @updateInputOptions="updateInputOptions"
        @updateMedia="updateMedia"
      />
      <CumulativeScoreBuilder
        v-if="item.inputType === 'cumulativeScore'"
        :items="currentActivity.items"
        :is-item-editable="item.allowEdit"
        :initial-item-data="item"
        @updateCumulativeScore="updateCumulativeScore"
      />
    </v-form>

    <div
      v-else-if="item.inputType !== 'cumulativeScore' && item.inputType !== 'markdownMessage'"
      class="px-2"
    >
      <div class="item-quiz">
        <img
          v-if="questionBuilder.text"
          width="15"
          :src="itemInputTypes.find(({ text }) => text === item.inputType).icon" 
        />
        
        <span class="ml-2">{{ questionBuilder.text }}</span>
      </div>

      <div
        v-if="item.inputType == 'radio' || item.inputType == 'checkbox'"
        class="mt-4"
      >
        <div
          v-for="(option, index) in item.options.options"
          :key="index"
        >
          <input
            v-if="item.inputType == 'checkbox'"
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

          <span>{{ option.name }}</span>
        </div>
      </div>
    </div>

    <v-dialog
      v-model="isUploadingState"
      persistent
      width="400"
    >
      <v-card class="pt-5 pb-6 text-center">
        <v-progress-circular class="d-block mx-auto mt-2" color="primary" indeterminate :size="50">
        </v-progress-circular>
        <span> Uploading ... </span>
      </v-card>
    </v-dialog>

  </v-card>
</template>

<style scoped>

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

import ImageUploader from '../ImageUploader.vue';
import RadioBuilder from "./ItemBuilders/RadioBuilder.vue";
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
import MarkDownEditor from "../MarkDownEditor";
import Item from '../../../models/Item';
import ImageUpldr from '../../../models/ImageUploader';
import { mapMutations, mapGetters } from 'vuex';
import config from '../../../config';

export default {
  components: {
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
    ImageUploader,
    MarkDownEditor,
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
      hasScoringItem: false,
      valid: false,
      imgUploader: new ImageUpldr(),
      questionBuilder: {
        text: '',
        imgURL: ''
      },
      isUploadingState: false,
      isError: '',
      isExpanded: false,
      isItemNameEditing: false,
    }
  },

  beforeMount() {

    Object.assign(this, {
      valid: this.item.name && this.item.name.length > 0,
      hasScoringItem: this.currentActivity.items.some((item) => item.options.hasScoreValue),
      questionBuilder: {
        text: this.item.question.text,
        imgURL: this.item.question.image
      },
      isExpanded: !this.item.name.length
    });

    this.setItemName();

  },

  watch: {
    questionBuilder: {
      deep: true,
      handler() {
        this.updateItemMetaInfo({
          index: this.itemIndex,
          obj: {
            question: {
              text: this.questionBuilder.text,
              image: this.questionBuilder.imgURL
            }
          }
        })
      }
    },
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

    hasPrizeActivity () {
      return !!this.prizeActivity;
    },

    item () {
      return this.currentActivity.items[this.itemIndex];
    }
  },
  methods: {
    ...mapMutations(config.MODULE_NAME,
      [
        'updateItemMetaInfo',
        'duplicateItem',
        'deleteItem',
        'updateItemInputType',
        'setTokenPrizeModalStatus',
        'insertTemplateUpdateRequest',
      ],
    ),

    setItemName() {
      if(!this.item.name) this.onUpdateName(`Screen${this.itemIndex + 1}`);
    },

    editItem () {
      this.isExpanded = !this.isExpanded;
    },

    onDeleteItem () {
      this.deleteItem(this.itemIndex);
    },

    nameKeydown (e) {
      if (!/^[a-zA-Z0-9-_]+$/.test(e.key)) {
        e.preventDefault();
      }
    },

    async onAddImg (data) {
      this.isError = '';

      if ( typeof data !== 'string' ) {
        this.isUploadingState = true;
        const response = await this.imgUploader.uploadImage(data);
        this.questionBuilder.imgURL = response.location;
      } else {
        this.questionBuilder.imgURL = data;
      }

      this.isUploadingState = false;

      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: {
          question: {
            text: this.questionBuilder.text,
            image: this.questionBuilder.imgURL
          }
        }
      });
    },

    onRemoveImg () {
      this.isError = '';
      this.questionBuilder.imgFile = null;
      this.questionBuilder.imgURL = '';
    },

    onUpdateInputType (inputType) {
      const updates = {
        inputType
      };
      if (inputType === 'cumulativeScore') {
        updates.name = 'cumulatives';
      }

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
    }
  }
}
</script>
