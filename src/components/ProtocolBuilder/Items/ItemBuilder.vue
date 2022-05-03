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
        <!-- <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-if="item.allowEdit"
              icon
              v-bind="attrs"
              v-on="on"
              @click="addItemHeader(itemIndex)"
            >
              <v-icon color="grey lighten-1">
                book
              </v-icon>
            </v-btn>
          </template>
          <span>Add Header</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-if="item.allowEdit"
              icon
              v-bind="attrs"
              v-on="on"
              @click="addItemSection(itemIndex)"
            >
              <v-icon color="grey lighten-1">
                light
              </v-icon>
            </v-btn>
          </template>
          <span>Add Section</span>
        </v-tooltip> -->
        <v-tooltip
          v-if="item.allowEdit && item.inputType != 'cumulativeScore'"
          top
        >
          <template v-slot:activator="{ on }">
            <v-btn
              class="ml-4"
              icon
              v-on="on"
              @click="$emit('addItem')"
            >
              <v-icon color="grey lighten-1">
                mdi-plus-circle-outline
              </v-icon>
            </v-btn>
          </template>

          <span>New Item</span>
        </v-tooltip>

        <v-tooltip
          v-if="item.allowEdit && item.inputType != 'cumulativeScore'"
          top
        >
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              v-on="on"
              @click="duplicateItem(itemIndex)"
            >
              <v-icon color="grey lighten-1">
                content_copy
              </v-icon>
            </v-btn>
          </template>

          <span>Duplicate Item</span>
        </v-tooltip>

        <v-tooltip
          v-if="!isConditionalItem(itemIndex)"
          top
        >
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              v-on="on"
              @click="checkVariableNameOnAction(itemIndex, hideItem)"
            >
              <v-icon v-if="isVis" color="grey lighten-1">
                mdi-eye-off-outline
              </v-icon>
              <v-icon v-else color="grey lighten-1">
                mdi-eye-outline
              </v-icon>
            </v-btn>
          </template>

          <span>{{ isVis ? 'Click to Show Item' : 'Click to Hide Item' }}</span>
        </v-tooltip>

        <v-tooltip
          v-if="item.allowEdit"
          top
        >
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              @click="editItem"
              v-on="on"
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
          </template>

          <span>Edit Item</span>
        </v-tooltip>

        <v-tooltip
          v-if="item.allowEdit"
          top
        >
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              v-on="on"
              @click="checkVariableNameOnAction(item, onDeleteItem)"
            >
              <v-icon color="grey lighten-1">
                mdi-delete
              </v-icon>
            </v-btn>
          </template>

          <span>Delete Item</span>
        </v-tooltip>

        <v-btn
          v-if="item.allowEdit && !['cumulativeScore', 'futureBehaviorTracker', 'pastBehaviorTracker'].includes(item.inputType)"
          class="ml-4 move-icon dragging-handle"
          icon
        >
          <v-icon color="grey lighten-1">
            mdi-dots-vertical
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
          @mouseup="onMouseup($event, item)"
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
        <div v-if="item.inputType !== 'cumulativeScore'">
          <v-card
            v-if="isTextExpanded"
            elevation="2"
            class="d-flex justify-space-between grey white--text px-6 py-2 card-expanded"
            @click="isTextExpanded = !isTextExpanded"
          >
            <div>Text Creator</div>
            <div>
              <v-icon color="white">
                mdi-chevron-up
              </v-icon>
            </div>
          </v-card>
          <v-card
            v-else
            elevation="2"
            class="d-flex justify-space-between px-6 py-2"
            @click="isTextExpanded = !isTextExpanded"
          >
            <div>Text Creator</div>
            <div>
              <v-icon>
                mdi-chevron-down
              </v-icon>
            </div>
          </v-card>
          <v-container v-if="isTextExpanded" class="pa-0">
            <MarkDownEditor
              v-model="largeText"
            />
          </v-container>

          <div v-if="largeText.length === 0" class="error--text text-body-2 mt-2 ml-4">
            * This field is required
          </div>
          <div v-if="invalidLargeText" class="error--text text-body-2 mt-2 ml-4">
            {{errorMsg}}
          </div>
          <div class="d-flex mt-2" :class="largeText.length > 75 ? 'justify-space-between' : 'justify-end'">
            <div
              v-if="largeText.length > 75 && isTextExpanded"
              class="ml-4 text-body-2 red--text text-left"
            >
              Visibility decreases over 75 characters
            </div>
            <div v-if="isTextExpanded" class="text-right mr-4">
              {{largeText.length}} / 75
            </div>
          </div>
        </div>

        <div
          v-if="item.inputType == 'text' && item.options && item.options.isResponseIdentifier"
          class="my-2"
        >
          {{ responseIdentifierMessage }}
        </div>
      </template>
      <v-row>
        <v-col
          cols="12"
          sm="3"
        >
          <v-select
            class="mt-4"
            :value="item.inputType"
            :items="inputTypes"
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
                  v-if="!hasScoringItem && item.text == 'cumulativeScore' || item.text == 'tokenSummary'"
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
                  <span v-if="item.text == 'cumulativeScore'">Please create an item with scores before creating this page</span>
                  <span v-else>Please create future behavior tracker or past behavior tracker items</span>
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
        <v-col
          v-if="!webItems.includes(item.inputType)"
          class="d-flex align-center red--text"
        >
          This item is only available for use in mobile version of MindLogger.
        </v-col>
      </v-row>

      <v-checkbox
        v-if="item.inputType === 'cumulativeScore'"
        v-model="currentActivity.allowSummary"
        label="Allow the user to see results"
      />

      <MarkDownBuilder
        v-if="item.inputType === 'markdownMessage'"
        :markdownText="item.markdownText"
        :initial-item-data="item.options"
        :timer="item.timer"
        @onUpdateMarkdown="onUpdateMarkdownText"
        @updateOptions="updateOptions"
        @updateTimer="updateTimer"
      />

      <RadioBuilder
        v-if="item.inputType === 'radio' || item.inputType === 'checkbox'"
        :key="`${baseKey}-radio`"
        :is-multiple-choice="item.inputType === 'checkbox'"
        :is-skippable-item="skippable"
        :initial-response-options="item.responseOptions"
        :allow-edit="item.allowEdit"
        :initial-item-data="item.options"
        :item-templates="itemTemplates"
        :has-prize-activity="hasPrizeActivity"
        :is-reviewer-activity="isReviewerActivity"
        :initial-is-optional-text="item.isOptionalText"
        :timer="item.timer"
        :current-activity="currentActivity"
        :variables-items="variablesItems"
        :item-index="itemIndex"
        @openPrize="setTokenPrizeModalStatus(true)"
        @removeTemplate="onRemoveTemplate"
        @updateTemplates="onUpdateTemplates"
        @updateOptions="updateOptions"
        @updateAllow="updateAllow"
        @updateOptionalText="updateOptionalText"
        @updateTimer="updateTimer"
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
        :timer="item.timer"
        @updateTimer="updateTimer"
        @updateOptions="updateOptions"
        @updateAllow="updateAllow"
      />

      <DropdownListBuilder
        v-if="item.inputType === 'dropdownList'"
        :key="`${baseKey}-dropdownList`"
        :is-skippable-item="skippable"
        :initial-response-options="item.responseOptions"
        :initial-item-data="item.options"
        :item-templates="itemTemplates"
        :has-prize-activity="hasPrizeActivity"
        :is-reviewer-activity="isReviewerActivity"
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
        :is-reviewer-activity="isReviewerActivity"
        :timer="item.timer"
        @updateOptions="updateOptions"
        @updateAllow="updateAllow"
        @updateOptionalText="updateOptionalText"
        @updateResponseOptions="updateResponseOptions"
        @updateTimer="updateTimer"
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
        :timer="item.timer"
        @updateTimer="updateTimer"
      />

      <VideoBuilder
        v-if="item.inputType === 'video'"
        :key="`${baseKey}-video`"
        :initial-is-optional-text="item.isOptionalText"
        :initial-item-data="item.options"
        :initial-item-response-options="item.responseOptions"
        :is-skippable-item="skippable"
        :timer="item.timer"
        @updateOptionalText="updateOptionalText"
        @updateOptions="updateOptions"
        @updateResponseOptions="updateResponseOptions"
        @updateAllow="updateAllow"
        @updateTimer="updateTimer"
      />

      <AgeSelectorBuilder
        v-if="item.inputType === 'ageSelector'"
        :key="`${baseKey}-ageSelector`"
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

      <PhotoBuilder
        v-if="item.inputType === 'photo'"
        :key="`${baseKey}-photo`"
        :initial-item-data="item.options"
        :initial-is-optional-text="item.isOptionalText"
        :initial-item-response-options="item.responseOptions"
        :is-skippable-item="skippable"
        :timer="item.timer"
        @updateOptionalText="updateOptionalText"
        @updateResponseOptions="updateResponseOptions"
        @updateAllow="updateAllow"
        @updateTimer="updateTimer"
        @updateOptions="updateOptions"
      />
<!-- 
      <DurationPicker
        v-if="item.inputType === 'duration'"
        :key="`${baseKey}-duration`"
        :initial-is-optional-text="item.isOptionalText"
        :initial-response-options="item.responseOptions"
        :initial-item-data="item.options"
        :is-skippable-item="skippable"
        @updateOptions="updateOptions"
        @updateOptionalText="updateOptionalText"
        @updateResponseOptions="updateResponseOptions"
        @updateAllow="updateAllow"
      /> -->

      <TimeRangeBuilder
        v-if="item.inputType === 'timeRange'"
        :key="`${baseKey}-timeRange`"
        :initial-item-data="item.options"
        :initial-is-optional-text="item.isOptionalText"
        :initial-item-response-options="item.responseOptions"
        :is-skippable-item="skippable"
        :timer="item.timer"
        @updateOptionalText="updateOptionalText"
        @updateResponseOptions="updateResponseOptions"
        @updateAllow="updateAllow"
        @updateTimer="updateTimer"
        @updateOptions="updateOptions"
      />

      <DateBuilder
        v-if="item.inputType === 'date'"
        :key="`${baseKey}-date`"
        :initial-item-data="item.options"
        :initial-is-optional-text="item.isOptionalText"
        :initial-item-response-options="item.responseOptions"
        :is-skippable-item="skippable"
        :timer="item.timer"
        @updateOptionalText="updateOptionalText"
        @updateResponseOptions="updateResponseOptions"
        @updateAllow="updateAllow"
        @updateTimer="updateTimer"
        @updateOptions="updateOptions"
      />

      <DrawingBuilder
        v-if="item.inputType === 'drawing'"
        :key="`${baseKey}-drawing`"
        :initial-item-data="item.options"
        :initial-item-response-options="item.responseOptions"
        :initial-item-input-options="item.inputOptions"
        :initial-is-optional-text="item.isOptionalText"
        :is-skippable-item="skippable"
        @updateOptions="updateOptions"
        :timer="item.timer"
        @updateResponseOptions="updateResponseOptions"
        @updateInputOptions="updateInputOptions"
        @updateOptionalText="updateOptionalText"
        @updateAllow="updateAllow"
        @loading="loading = $event"
        @notify="notify = $event"
        @updateTimer="updateTimer"
      />

      <AudioRecordBuilder
        v-if="item.inputType === 'audioRecord'"
        :key="`${baseKey}-audioRecord`"
        :is-skippable-item="skippable"
        :initial-item-data="item.options"
        :initial-is-optional-text="item.isOptionalText"
        :initial-item-response-options="item.responseOptions"
        :timer="item.timer"
        @updateOptions="updateOptions"
        @updateAllow="updateAllow"
        @updateOptionalText="updateOptionalText"
        @updateResponseOptions="updateResponseOptions"
        @updateTimer="updateTimer"
      />

      <AudioImageRecordBuilder
        v-if="item.inputType === 'audioImageRecord'"
        :key="`${baseKey}-audioImageRecord`"
        :initial-item-data="item.options"
        :initial-item-response-options="item.responseOptions"
        :is-skippable-item="skippable"
        @checkValidation="valid = $event"
        @updateResponseOptions="updateResponseOptions"
        @updateAllow="updateAllow"
        @loading="loading = $event"
        @notify="notify = $event"
        @updateOptions="updateOptions"
      />

      <GeolocationBuilder
        v-if="item.inputType === 'geolocation'"
        :key="`${baseKey}-geolocation`"
        :initial-item-data="item.options"
        :initial-item-response-options="item.responseOptions"
        :initial-is-optional-text="item.isOptionalText"
        :is-skippable-item="skippable"
        :timer="item.timer"
        @updateOptionalText="updateOptionalText"
        @updateResponseOptions="updateResponseOptions"
        @loading="loading = $event"
        @notify="notify = $event"
        @updateAllow="updateAllow"
        @updateTimer="updateTimer"
        @updateOptions="updateOptions"
      />

      <AudioStimulusBuilder
        v-if="item.inputType === 'audioStimulus'"
        :key="`${baseKey}-audioStimulus`"
        :is-skippable-item="skippable"
        :initial-item-input-options="item.inputOptions"
        :initial-item-response-options="item.responseOptions"
        :initial-is-optional-text="item.isOptionalText"
        :initial-item-media="item.media"
        :initial-item-data="item.options"
        @updateAllow="updateAllow"
        @updateInputOptions="updateInputOptions"
        @updateMedia="updateMedia"
        @loading="loading = $event"
        @notify="notify = $event"
        @updateOptions="updateOptions"
      />

      <BehaviorTracker
        v-if="item.inputType === 'pastBehaviorTracker' || item.inputType == 'futureBehaviorTracker'"
        :key="`${baseKey}-${item.inputType}`"
        :is-skippable-item="skippable"
        :initial-item-data="item.options"
        @notify="notify = $event"
        @loading="loading = $event"
        @updateOptions="updateOptions"
        @updateAllow="updateAllow"
      />

      <CumulativeScoreBuilder
        v-if="item.inputType === 'cumulativeScore'"
        :key="`${baseKey}-cumulativeScore`"
        :items="currentActivity.items"
        :activity="currentActivity"
        :initial-item-data="item"
        :allow-edit="item.allowEdit"
        :current-activity="currentActivity"
        :variables-items="variablesItems"
        :item-index="itemIndex"
        @updateAllow="updateAllow"
        @notify="notify = $event"
        @updateCumulativeScore="updateCumulativeScore"
      />
    </v-form>

    <div class="px-2 pt-2">
      <div class="item-quiz">
        <img
          width="15"
          :src="itemInputTypes.find(({ text }) => text === item.inputType).icon"
        >
        <span v-if="!isExpanded" class="ml-1">{{largeText.replace(/[^0-9A-Za-z ]/g, '')}}</span>
      </div>
    </div>

    <Notify :notify="notify" />
    <Loading :loading="loading" />

    <v-dialog
      v-model="warningFlag"
      persistent
      width="500"
    >
      <v-card>
        <v-card-text class="pt-4">
          {{warningMsg}}
        </v-card-text>

        <v-card-actions
          class="justify-space-around"
        >
          <v-btn
            @click="handleWarningConfirm(item, itemIndex)"
          >
            Continue
          </v-btn>

          <v-btn
            @click="warningFlag = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="alertFlag"
      persistent
      width="500"
    >
      <v-card>
        <v-card-text class="pt-4">
          {{alertMsg}}
        </v-card-text>

        <v-card-actions
          class="justify-space-around"
        >
          <v-btn
            @click="alertFlag = false"
          >
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="deleteHeaderDialog"
      persistent
      max-width="720"
    >
      <v-card>
        <v-card-title class="headline">
          Delete Item
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="deleteHeaderDialog = false"
          >
            No
          </v-btn>
          <v-btn
            color="primary"
            text
            @click="removeItemHeader()"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
                  <v-list-item-title v-text="'If ' + conditional.operation + ' of the `IF` rules are matched, show ' + conditional.showValue.name" />
                </v-list-item-content>
              </template>

              <v-list-item
                v-for="condition in conditional.conditions"
                :key="conditional.id + condition.ifValue.name"
              >
                <v-list-item-content>
                  <v-list-item-title v-text="(condition.ifValue.name || condition.ifValue) + ' ' + condition.stateValue.name + ' is ' + getConditionAnswer(condition)" />
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

    <v-card
      class="my-2 d-flex justify-space-between"
      v-if="itemHeader || itemSection"
    >
      <v-container fluid>
        <v-row>
          <v-col
            v-if="isHeaderAdded"
            class="py-0"
            sm="12"
            cols="12"
          >
            <v-text-field
              v-model="itemHeaderText"
              color="purple darken-2"
              :label="isHeaderAdded ? 'Header' : 'Section'"
              :readonly="!isUpdating"
              required
            />
          </v-col>
          <v-col
            v-if="!isHeaderAdded"
            class="py-0"
            sm="12"
            cols="12"
          >
            <v-text-field
              v-model="itemSectionText"
              color="purple darken-2"
              :label="isHeaderAdded ? 'Header' : 'Section'"
              :readonly="!isUpdating"
              required
            />
          </v-col>
        </v-row>
      </v-container>
      <v-card-actions>
        <v-btn
          icon
          @click="editItemHeader(itemIndex)"
          :disabled="itemHeader === '' && itemSection === ''"
        >
          <v-icon
            color="grey lighten-1"
          >
            {{isUpdating ? 'save' : 'edit'}}
          </v-icon>
        </v-btn>
        <v-btn
          v-if="item.allowEdit"
          icon
          @click="openHeaderRemoveConfirmation(itemIndex)"
        >
          <v-icon color="grey lighten-1">
            mdi-delete
          </v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-card>
</template>
<style scoped>
  .move-icon {
    cursor: move;
  }

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

  .card-expanded {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
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
import _ from 'lodash';
import Uploader from '../Uploader.vue';

import RadioBuilder from "./ItemBuilders/RadioBuilder.vue";
import MarkDownBuilder from "./ItemBuilders/MarkDownBuilder.vue";
import StackedRadioBuilder from "./ItemBuilders/StackedRadioBuilder.vue";
import DropdownListBuilder from "./ItemBuilders/DropdownListBuilder.vue";
import TextBuilder from "./ItemBuilders/TextBuilder.vue";
import SliderBuilder from "./ItemBuilders/SliderBuilder.vue";
import VideoBuilder from "./ItemBuilders/VideoBuilder.vue";
import AgeSelectorBuilder from "./ItemBuilders/AgeSelectorBuilder.vue";
import PhotoBuilder from "./ItemBuilders/PhotoBuilder.vue";
// import DurationPicker from "./ItemBuilders/DurationPicker.vue";
import TimeRangeBuilder from "./ItemBuilders/TimeRangeBuilder.vue";
import DateBuilder from "./ItemBuilders/DateBuilder.vue";
import DrawingBuilder from "./ItemBuilders/DrawingBuilder.vue";
import AudioRecordBuilder from "./ItemBuilders/AudioRecordBuilder.vue";
import AudioImageRecordBuilder from "./ItemBuilders/AudioImageRecordBuilder.vue";
import GeolocationBuilder from "./ItemBuilders/GeolocationBuilder.vue";
import AudioStimulusBuilder from "./ItemBuilders/AudioStimulusBuilder.vue";
import CumulativeScoreBuilder from "./ItemBuilders/CumulativeScoreBuilder.vue";
import StackedSliderBuilder from "./ItemBuilders/StackedSliderBuilder";
import BehaviorTracker from "./ItemBuilders/BehaviorTracker";
import { timeScreen } from './ItemBuilders/timeScreen';
import { tokenSummary } from './ItemBuilders/tokenSummary';

import MarkDownEditor from "../MarkDownEditor";
import Item from '../../../models/Item';

import Notify from '../Additional/Notify.vue';
import Loading from '../Additional/Loading.vue';

import { mapMutations, mapGetters } from 'vuex';
import config from '../../../config';
import { checkItemVariableName, checkItemVariableNameIndex, getTextBetweenBrackets } from '../../../utilities/util';

export default {
  components: {
    Uploader,
    RadioBuilder,
    DropdownListBuilder,
    TextBuilder,
    SliderBuilder,
    VideoBuilder,
    AgeSelectorBuilder,
    PhotoBuilder,
    TimeRangeBuilder,
    DateBuilder,
    // DurationPicker,
    DrawingBuilder,
    AudioRecordBuilder,
    AudioImageRecordBuilder,
    GeolocationBuilder,
    AudioStimulusBuilder,
    CumulativeScoreBuilder,
    MarkDownEditor,
    MarkDownBuilder,
    StackedRadioBuilder,
    StackedSliderBuilder,
    Notify,
    Loading,
    BehaviorTracker,
  },
  props: {
    itemIndex: {
      type: Number,
      required: true,
    },
    variablesItems: {
      type: Object,
      required: true
    },
    header: {
      type: String,
    },
    section: {
      type: String,
    }
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
      isTextExpanded: false,
      isItemNameEditing: false,
      baseKey: 0,
      loading: false,
      notify: {},
      isVis: false,
      invalidLargeText: false,
      debounceTimer: undefined,
      responseIdentifierMessage: 'By using this option, the user will be required to enter response data identifier text into the field. The text entered will identify the response data collected at that point in time. The identifier used will be filterable on the user\'s data visualization tab.',
      webItems: ['radio', 'checkbox', 'dropdownList', 'text', 'slider', 'cumulativeScore', 'ageSelector', 'duration'],
      warningFlag: false,
      warningMsg: '',
      errorMsg: '* This item is not supported, please remove it.',
      alertFlag: false,
      alertMsg: '',
      editVariableValid: true,
      isUpdating: false,
      deleteHeaderDialog: false,
      isHeaderAdded: this.header ? true: false,
      itemHeader: this.header || "",
      itemHeaderText: this.header || "",
      itemSection: this.section || "",
      itemSectionText: this.section || "",
      actionItemIndex: 0,
    }
  },
  computed: {
    config () {
      return config;
    },

    ...mapGetters(config.MODULE_NAME,
      [
        'currentActivity',
        'currentHeaders',
        'itemInputTypes',
        'itemTemplates',
        'prizeActivity',
      ]
    ),

    canAddHeader () {
      if (this.itemHeader === "" && this.itemSection === "") {
        return false;
      }
      return true;
    },

    canAddSection () {
      if (this.itemHeader === "" && this.itemSection === "") {
        return false;
        // for (let i = this.itemIndex; i >= 0; i -= 1) {
        //   if (this.currentHeaders[i]) {
        //     return false;
        //   }
        // }
      }
      return true;
    },

    isReviewerActivity () {
      return this.currentActivity.isReviewerActivity;
    },

    inputTypes () {
      if (this.isReviewerActivity) {
        return this.itemInputTypes.filter(
          type => type.text == 'radio' || type.text == 'checkbox' || type.text == 'slider'
        )
      }

      return this.itemInputTypes;
    },

    conditionals () {
      return this.currentActivity.conditionalItems;
    },

    hasPrizeActivity () {
      return !!this.prizeActivity;
    },

    item () {
      // this.itemHeader = this.currentActivity.items[this.itemIndex].header;
      // this.itemSection = this.currentActivity.items[this.itemIndex].section;
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
    item: function(newItem) {
      this.largeText = newItem.question.text;
    },
    largeText: function(text) {
      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: { question: { text, image: this.headerImage } },
      });

      this.debounce(function() {
        const { valid, found, variableNames = [] } = checkItemVariableName(text, this.currentActivity, this.itemIndex);
        try {
          Object.assign(this.variablesItems, { [this.currentActivity.items[this.itemIndex].name]: variableNames })
        } catch (error) { }
        this.invalidLargeText = valid;
        if (typeof this.invalidLargeText === 'object') {
          this.errorMsg = `* You cannot use ${this.currentActivity.items[this.itemIndex].name} in the same item. Please remove`
          this.invalidLargeText = true;
        } else {
          this.errorMsg = '* This item is not supported, please remove it.'
        }

        if (found) {
          if (this.currentActivity.isOnePageAssessment || this.currentActivity.isSkippable) {
            this.alertFlag = true;
            this.alertMsg = `${this.currentActivity.isSkippable ? 'Skipping all the items' : 'A one-page assessment'} cannot contain variables. This variable will automatically be removed.`
            setTimeout(()=> {
              variableNames.forEach(variable => {
                text = text.replace(`[[${variable}]]`, '');
              });
              this.largeText = text;
              this.updateItemMetaInfo({
                index: this.itemIndex,
                obj: { question: { text, image: this.headerImage } },
              });
            }, 200);
          }
          this.currentActivity.hasVariable = found;
          this.updateActivityMetaInfo({ hasVariable: found })
        }

        if (_.concat([], ...Object.values(this.variablesItems)).length < 1) {
          this.currentActivity.hasVariable = false;
        }

        this.updateItemMetaInfo({
          index: this.itemIndex,
          obj: { valid: !this.invalidLargeText },
        });
      }, 300)
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

    this.isVis = !!this.item.isVis;
    this.setItemName();
  },
  methods: {
    ...mapMutations(config.MODULE_NAME,
      [
        'updateItemMetaInfo',
        'duplicateItem',
        'showOrHideItem',
        'showItem',
        'updateHeader',
        'updateSection',
        'deleteConditional',
        'deleteItem',
        'updateItemInputType',
        'setTokenPrizeModalStatus',
        'insertTemplateUpdateRequest',
        'addTimeScreen',
        'deleteTimeScreen',
        'updateTokenSummary',
        'updateActivityMetaInfo',
      ],
    ),

    debounce (func, delay) {
      const context = this;
      const args = arguments;
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => func.apply(context, args), delay);
    },

    setItemName () {
      if(!this.item.name) this.onUpdateName(`Screen${this.itemIndex + 1}`);
    },

    editItem () {
      this.isExpanded = !this.isExpanded;
    },

    hideItem (index) {
      this.isVis = !this.isVis;
      this.showOrHideItem(index);
    },

    addItemHeader (index) {
      let headerIndex = 1;
      this.currentActivity.items.forEach(item => {
        if (item.header) {
          const values = item.header.split(' ');

          if (
            values[0] === "Header" &&
            values[1] &&
            Number(values[1]) >= headerIndex
          ) {
            headerIndex = Number(values[1]) + 1
          }
        }
      })

      this.itemHeader = "Header " + headerIndex;
      this.itemHeaderText = this.itemHeader;
      this.isHeaderAdded = true;
      this.updateHeader({ index, headerName: this.itemHeader });
    },

    editItemHeader (index) {
      if (this.isUpdating) {
        if (this.itemHeader) {
          if (this.itemHeaderText) {
            this.updateHeader({ index, headerName: this.itemHeaderText });
            this.isUpdating = false;
          }
        } else {
          if (this.itemSectionText) {
            this.updateSection({ index, sectionName: this.itemSectionText });
            this.isUpdating = false;
          }
        }
      } else {
        this.isUpdating = true;
      }
    },

    openHeaderRemoveConfirmation (index) {
      this.deleteHeaderDialog = true;
      this.actionItemIndex = index;
    },

    removeItemHeader () {
      if (this.itemHeader) {
        this.updateHeader({ index: this.actionItemIndex, headerName: '' });
        this.itemHeader = '';
      } else {
        this.updateSection({ index: this.actionItemIndex, sectionName: '' });
        this.itemSection = '';
      }
      this.isHeaderAdded = false;
      this.deleteHeaderDialog = false;
    },

    addItemSection (index) {
      let sectionIndex = 1;

      this.currentActivity.items.forEach(item => {
        if (item.section) {
          const values = item.section.split(' ');

          if (
            values[0] === "Section" &&
            values[1] &&
            Number(values[1]) >= sectionIndex
          ) {
            sectionIndex = Number(values[1]) + 1
          }
        }
      })

      this.itemSection = "Section " + sectionIndex;
      this.itemSectionText = this.itemSection;
      this.updateSection({ index, sectionName: this.itemSection });
    },

    getConditionAnswer (condition) {
      if (condition.answerValue) {
        return condition.answerValue.name;
      }
      if (condition.maxValue || condition.maxValue === 0) {
        return condition.maxValue;
      }
      return condition.minValue;
    },

    handleWarningConfirm(item, itemIndex) {
      if (this.warningMsg.includes('By deleting'))
        this.onDeleteItem(item)
      else if (this.warningMsg.includes('By hiding')) {
        this.hideItem(itemIndex)
      }
      this.warningFlag = false;
    },

    checkVariableNameOnAction(item, callBack) {
      let index;
      if (typeof item === 'number') {
        index = item;
        item = this.currentActivity.items[item];
      }
      if (item && !item.isVis) {
        let invalidLargeTextIndex;
        for (const citem of this.currentActivity.items) {
          if (citem.inputType === "cumulativeScore") {
            for (const cumulativeItem of citem.cumulativeScores) {
              const { messageInRange, messageOutRange, description } = cumulativeItem;
              invalidLargeTextIndex = checkItemVariableNameIndex(`${messageInRange} ${messageOutRange} ${description}`, { items: [item] });
              if (invalidLargeTextIndex != -1) {
                break;
              }
            }
          } else {
            invalidLargeTextIndex = checkItemVariableNameIndex(citem.question.text, { items: [item] });
          }
          if (invalidLargeTextIndex != -1) {
            if (index > -1) {
              this.warningMsg = `By hiding ${item.name}, it will cause ${citem.name} to fail. Do you want to continue? (Please fix ${citem.name} if you choose to continue.)`;
            } else
              this.warningMsg = `By deleting ${item.name}, it will cause ${citem.name} to fail. Do you want to continue? (Please fix ${citem.name} if you choose to continue.)`;
            this.warningFlag = true;
            return;
          }
        }
      }
      callBack(index > -1 ? index : item);
    },

    onDeleteItem () {
      this.itemConditionals = [];
      this.conditionals.forEach(conditional => {
        if (conditional.showValue.name === this.item.name) {
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
      const inputType = this.item.inputType;

      this.deleteItem(this.itemIndex);

      if (inputType == 'futureBehaviorTracker') {
        this.deleteTimeScreen(this.itemIndex - 1)
      }

      this.updateTokenSummary(tokenSummary);

      this.itemConditionals.forEach((conditional) => {
        const index = this.conditionals.findIndex(({ id }) => id === conditional.id);

        if (index !== -1) {
          this.deleteConditional(index);
        }
      })

      this.removeDialog = false;
    },

    isConditionalItem (index) {
      const res = this.conditionals.some(({ showValue }) => showValue === this.item);

      if (res) {
        this.showItem(index);
      }
      return res;
    },

    nameKeydown (e) {
      if (!this.editVariableValid) {
        this.alertMsg = `You cannot edit this item name, since it is using as a variable.`;
        this.alertFlag = true;
        e.preventDefault();
      }

      if (!/^[a-zA-Z0-9-_]+$/.test(e.key)) {
        e.preventDefault();
      }
    },

    onMouseup (event, item) {
      if (_.concat([], ...Object.values(this.variablesItems)).includes(item.name)) {
        this.editVariableValid = false;
      } else {
        this.editVariableValid = true;
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
      updates.timer = 0;

      const prev = this.item.inputType;

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

      if (prev == 'futureBehaviorTracker') {
        this.deleteTimeScreen(this.itemIndex-1)
      } else if (inputType == 'futureBehaviorTracker') {
        let name = this.addTimeScreen({
          index: this.itemIndex,
          screen: timeScreen
        })
      }

      this.updateTokenSummary(tokenSummary);
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
      if (allowItem) {
        const item = this.currentActivity.items[this.itemIndex];
        let invalidLargeTextIndex;
        for (const citem of this.currentActivity.items) {
          if (citem.inputType === "cumulativeScore") {
            for (const cumulativeItem of citem.cumulativeScores) {
              const { messageInRange, messageOutRange, description } = cumulativeItem;
              invalidLargeTextIndex = checkItemVariableNameIndex(`${messageInRange} ${messageOutRange} ${description}`, { items: [item] });
              if (invalidLargeTextIndex != -1) {
                break;
              }
            }
          } else {
            invalidLargeTextIndex = checkItemVariableNameIndex(citem.question.text, { items: [item] });
          }
          if (invalidLargeTextIndex != -1) {
            this.updateItemMetaInfo({
              index: this.itemIndex,
              obj: { allow: false, valid: false }
            })
            this.alertMsg = `By skipping ${item.name}, it will cause ${citem.name} to fail.`;
            this.alertFlag = true;
            return;
          }
        }
      }

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

    updateTimer(timer) {
      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: { timer }
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

    updateAgeOptions (newOptions) {
      this.updateItemMetaInfo({
        index: this.itemIndex,
        obj: { options: newOptions, valid: newOptions.valid }
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
