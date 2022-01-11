<template>
  <div>
    <div
      class="positive-behaviors mt-6"
    >
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left behavior-text">Positive Behaviors</th>
              <th class="text-left behavior-value">Value</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(behavior, index) in positiveBehaviors"
              :key="index"
            >
              <th>
                <v-text-field
                  v-model="behavior.name"
                  :rules="textRules"
                  counter="32"
                  @input="saveBehaviors('positive')"
                />
              </th>
              <th>
                <v-text-field
                  v-model="behavior.value"
                  type="number"
                  min="1"
                  :rules="valueRules"
                  @input="saveBehaviors('positive')"
                />
              </th>
              <th class="text-right">
                <div class="d-flex justify-end">
                  <Uploader
                    initialType="image"
                    initialTitle="Option Image"
                    initialAdditionalType="small-circle"
                    :initialData="behavior.image"
                    @onAddFromUrl="onAddBehaviorImageFromUrl(index, 'positive', $event)"
                    @onAddFromDevice="onAddBehaviorImageFromDevice(index, 'positive', $event)"
                    @onRemove="onRemoveBehaviorImage(index, 'positive')"
                    @onNotify="$emit('loading', false); $emit('notify', $event);"
                  />

                  <v-btn
                    icon
                    @click="deleteBehavior('positive', index)"
                  >
                    <v-icon>
                      mdi-delete
                    </v-icon>
                  </v-btn>
                </div>
              </th>
            </tr>
          </tbody>
        </template>
      </v-simple-table>

      <v-btn
        class="ma-2"
        color="primary"
        rounded
        small
        @click="addBehavior('positive')"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </div>

    <div
      class="negative-behaviors mt-6"
    >
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left behavior-text">Negative Behaviors</th>
              <th class="text-left behavior-value">Value</th>
              <th>Rate of Increase</th>
              <th>Time Range</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(behavior, index) in negativeBehaviors"
              :key="index"
            >
              <th>
                <v-text-field
                  v-model="behavior.name"
                  :rules="textRules"
                  counter="32"
                  @input="saveBehaviors('negative')"
                />
              </th>
              <th>
                <v-text-field
                  v-model="behavior.value"
                  type="number"
                  min="1"
                  :rules="valueRules"
                  @input="saveBehaviors('negative')"
                />
              </th>
              <th class="pb-4">
                <div class="d-flex align-center">
                  <v-text-field
                    class="rate-input"
                    v-model="behavior.rate.hours"
                    type="number"
                    min="0"
                    hide-details
                    @input="saveBehaviors('negative')"
                  />

                  <span class="mx-2 pt-4">:</span>

                  <v-text-field
                    class="rate-input"
                    v-model="behavior.rate.minutes"
                    type="number"
                    min="0"
                    hide-details
                    @input="saveBehaviors('negative')"
                  />
                </div>
              </th>
              <th class="pb-4">
                <div class="d-flex align-center">
                  <div class="time-label">Start:</div>
                  <v-text-field
                    v-model="behavior.startTime"
                    @click="openTimePicker(behavior, 'startTime')"
                    hide-details
                    readonly
                  />
                </div>

                <div class="d-flex align-center">
                  <div class="time-label"> End: </div>
                  <v-text-field
                    v-model="behavior.endTime"
                    @click="openTimePicker(behavior, 'endTime')"
                    hide-details
                    readonly
                  />
                </div>
              </th>
              <th class="text-right">
                <div class="d-flex justify-end">
                  <Uploader
                    initialType="image"
                    initialTitle="Option Image"
                    initialAdditionalType="small-circle"
                    :initialData="behavior.image"
                    @onAddFromUrl="onAddBehaviorImageFromUrl(index, 'negative', $event)"
                    @onAddFromDevice="onAddBehaviorImageFromDevice(index, 'negative', $event)"
                    @onRemove="onRemoveBehaviorImage(index, 'negative')"
                    @onNotify="$emit('loading', false); $emit('notify', $event);"
                  />

                  <v-btn
                    icon
                    @click="deleteBehavior('negative', index)"
                  >
                    <v-icon>
                      mdi-delete
                    </v-icon>
                  </v-btn>
                </div>
              </th>
            </tr>
          </tbody>
        </template>
      </v-simple-table>

      <v-btn
        class="ma-2"
        color="primary"
        rounded
        small
        @click="addBehavior('negative')"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </div>

    <v-dialog
      v-model="timeDialog.visible"
      width="290px"
    >
      <v-time-picker
        v-model="timeDialog.value"
        full-width
      >
        <v-spacer></v-spacer>
        <v-btn
          text
          color="primary"
          @click="timeDialog.visible = false"
        >
          Cancel
        </v-btn>
        <v-btn
          text
          color="primary"
          @click="saveTime"
        >
          OK
        </v-btn>
      </v-time-picker>
    </v-dialog>
  </div>
</template>

<style scoped>
.positive-behaviors {
  width: 50%;
}
.negative-behaviors {
  width: 80%;
}

.positive-behaviors /deep/ thead th, .negative-behaviors /deep/ thead th {
  font-size: 14px !important;
}

.positive-behaviors /deep/ tbody th, .negative-behaviors /deep/ tbody th {
  border-right: none !important;
  border-left: none !important;
}

.behavior-text {
  width: 200px;
}

.behavior-value {
  width: 150px;
}

.time-label {
  min-width: 50px;
  padding-top: 20px;
}

.rate-input {
  width: 40px;
}
</style>

<script>
import Uploader from '../../Uploader.vue';

export default {
  components: {
    Uploader
  },

  props: {
    isSkippableItem: {
      type: Number,
      default: 0,
    },
    initialItemData: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      positiveBehaviors: this.initialItemData.positiveBehaviors || [],
      negativeBehaviors: (this.initialItemData.negativeBehaviors || []).map(behavior => ({
        ...behavior,
        rate: {
          hours: Math.floor(behavior.rate / 60),
          minutes: Number(behavior.rate % 60)
        }
      })),
      timeDialog: {
        visible: false,
        value: '',
        behavior: null,
        type: 'startTime'
      },
      valueRules: [
        v => (v > 0 && v % 1 === 0 && !v.toString().startsWith('0')) || 'value must be a positive integer',
      ],
      textRules: [
        v => !!v || 'This option cannot be empty',
        v => v.length <= 32 || 'Visibility decreases over 32 characters',
      ],
    }
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

  methods: {
    openTimePicker (behavior, type) {
      this.$set(this, 'timeDialog', {
        visible: true,
        value: behavior[type],
        behavior,
        type
      })
    },

    saveTime () {
      this.$set(this.timeDialog, 'visible', false);
      this.$set(this.timeDialog.behavior, this.timeDialog.type, this.timeDialog.value)
      this.saveBehaviors('negative')
    },

    isValidBehavior (behavior, type = 'positive') {
      if (!behavior.name.length || !behavior.value) {
        return false;
      }

      if (behavior.value <= 0 || behavior.value % 1 != 0 || behavior.value.toString().startsWith('0')) {
        return false;
      }

      if (type == 'negative') {
        if (!behavior.startTime || !behavior.endTime || behavior.startTime >= behavior.endTime) {
          return false;
        }

        if (
          behavior.rate.hours % 1 != 0 ||
          behavior.rate.hours < 0 ||
          behavior.rate.minutes % 1 != 0 ||
          behavior.rate.minutes < 0 || behavior.rate.minutes > 59
        ) {
          return false;
        }

        const minutes = Number(behavior.rate.hours * 60) + Number(behavior.rate.minutes);
        if (minutes <= 0 || minutes > 24 * 60) {
          return false;
        }
      }

      return true;
    },

    addBehavior (type) {
      if (type == 'positive') {
        this.positiveBehaviors.push({
          name: '', value: '',
          image: '',
        })
      } else {
        this.negativeBehaviors.push({
          name: '', value: '',
          rate: {
            hours: 0,
            minutes: 1
          },
          startTime: '00:00', endTime: '23:59',
          image: '',
        })
      }

      this.saveBehaviors(type)
    },

    deleteBehavior (type, index) {
      if (type == 'positive') {
        this.positiveBehaviors.splice(index, 1)
      } else {
        this.negativeBehaviors.splice(index, 1)
      }

      this.saveBehaviors(type)
    },

    onAddBehaviorImageFromUrl (index, type, url) {
      const behavior = type == 'positive' ? this.positiveBehaviors[index] : this.negativeBehaviors[index];
      this.$set(behavior, 'image', url);

      this.$emit('notify', {
        type: 'success',
        message: 'Image from URL successfully added to Option.',
        duration: 3000,
      });

      this.saveBehaviors(type)
    },

    async onAddBehaviorImageFromDevice (index, type, uploadFunction) {
      try {
        this.$emit('loading', true);
        const url = await uploadFunction();
        const behavior = type == 'positive' ? this.positiveBehaviors[index] : this.negativeBehaviors[index];

        this.$set(behavior, 'image', url);

        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'success',
          message: 'Image successfully added to behavior.',
          duration: 3000,
        });

        this.saveBehaviors(type)
      } catch (error) {
        this.$emit('loading', false);
        this.$emit('notify', {
          type: 'error',
          message: 'Something went wrong with uploading image for behavior.',
        });
      }
    },

    removeBehaviorImage (index, type) {
      const behavior = type == 'positive' ? this.positiveBehaviors[index] : this.negativeBehaviors[index];
      this.$set(behavior, 'image', '');

      this.saveBehaviors(type)
    },

    saveBehaviors (type) {
      if (type == 'positive') {
        for (const behavior of this.positiveBehaviors) {
          this.$set(behavior, 'valid', this.isValidBehavior(behavior, 'positive'))
        }
      } else {
        for (const behavior of this.negativeBehaviors) {
          this.$set(behavior, 'valid', this.isValidBehavior(behavior, 'negative'))
        }
      }

      let valid = (this.positiveBehaviors.length > 0 || this.negativeBehaviors.length > 0);
      for (const behavior of this.positiveBehaviors) {
        if (!behavior.valid) {
          valid = false;
        }
      }

      for (const behavior of this.negativeBehaviors) {
        if (!behavior.valid) {
          valid = false;
        }
      }

      this.$emit('updateOptions', {
        ...this.initialItemData,
        positiveBehaviors: this.positiveBehaviors,
        negativeBehaviors: this.negativeBehaviors.map(behavior => ({
          ...behavior,
          rate: Number(behavior.rate.hours * 60) + Number(behavior.rate.minutes)
        })),
        valid
      })
    },
  }
}
</script>
