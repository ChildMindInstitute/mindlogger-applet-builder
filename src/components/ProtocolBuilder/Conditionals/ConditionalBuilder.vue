<template>
  <v-card
    class="conditional-container"
    :class="valid ? '' : 'invalid'"
  >
    <v-card-title
      class="px-2 py-0 conditional-title"
    >
      <span v-if="!isExpanded">
        <span>IF </span>
        <span class="font-weight-bold">
          {{ current.operation || 'XXX' }}
        </span>
        <span>
          OF THE "IF" RULES ARE MATCHED, SHOW
        </span>
        <span class="font-weight-bold">{{ current.showValue && current.showValue.name || 'XXX' }} </span>
      </span>

      <v-spacer />

      <v-card-actions>
        <v-btn
          icon
          @click="isExpanded = !isExpanded;"
        >
          <v-icon
            v-if="!isExpanded"
            class="header-icon"
            color="grey lighten-1"
          >
            mdi-chevron-down
          </v-icon>

          <v-icon
            v-else
            class="header-icon"
            color="lighten-1"
          >
            mdi-chevron-up
          </v-icon>
        </v-btn>

        <v-btn
          icon
          :disabled="!isExpanded"
          @click="$refs.form.onAddcondition()"
        >
          <v-icon
            class="header-icon"
            color="lighten-1"
          >
            mdi-plus
          </v-icon>
        </v-btn>

        <v-btn
          icon
          @click="onDeleteConditional()"
        >
          <v-icon
            class="header-icon"
            color="lighten-1"
          >
            mdi-delete
          </v-icon>
        </v-btn>
      </v-card-actions>
    </v-card-title>

    <div
      v-if="isExpanded"
    >
      <ConditionalForm
        ref="form"
        :current="current"
        :items="filteredItems"
        :activity="currentActivity"
        @update="onUpdate"
      />
    </div>
    <v-dialog
      v-model="deleteConditionalDlg"
      persistent
      width="500"
    >
      <v-card>
        <v-card-text class="pt-4">
          Are you sure you remove all logical conditions
        </v-card-text>

        <v-card-actions
          class="justify-space-around"
        >
          <v-btn
            @click="deleteAllConditions"
          >
            Yes
          </v-btn>

          <v-btn
            @click="deleteConditionalDlg = false;"
          >
            No
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>
.conditional-title {
  font-size: 17px;
}

.conditional-container {
  background: #E8F1FF;
}
.conditional-container.invalid {
  background: #FFEDE9;
}

.conditional-container .header-icon {
  color: #00629D;
}

.conditional-container.invalid .header-icon {
  color: #BA1B1B;
}
</style>

<script>
import { mapGetters, mapMutations } from 'vuex';
import ConditionalForm from '../ConditionalForm';
import config from '../../../config';

export default {
  components: {
    ConditionalForm
  },

  props: {
    conditionalIndex: {
      type: Number,
      required: true,
    },
    current: {
      type: Object,
      required: true,
    }
  },
  data () {
    return {
      isExpanded: !this.current.stateValue,
      valid: this.current.valid || false,
      deleteConditionalDlg: false,
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

    filteredItems () {
      return this.items.filter(item =>
        (item.inputType == 'radio' || item.inputType == 'checkbox' || item.inputType == 'slider' || item.inputType == 'prize') && item.allowEdit
      )
    },
  },

  methods: {
    ...mapMutations(config.MODULE_NAME,
      [
        'deleteConditional',
        'updateConditionalData',
      ]
    ),

    onDeleteConditional () {
      if (this.current.conditions.length > 1) {
        this.deleteConditionalDlg = true;
      } else {
        this.deleteConditional(this.conditionalIndex);
      }
    },

    onUpdate ({ conditions, operation, showValue, valid }) {
      this.valid = valid;

      this.updateConditionalData({
        index: this.conditionalIndex,
        updates: {
          conditions: conditions.map(condition => {
            if (condition.ifValue && condition.ifValue.isActivity) {
              return {
                ...condition,
                ifValue: condition.ifValue.name.replaceAll(' ', '_'),
                activityCondition: true
              }
            }

            return {
              ...condition,
              activityCondition: false
            };
          }),
          operation,
          showValue,
          valid: this.valid,
        }
      });
    },

    deleteAllConditions () {
      this.deleteConditional(this.conditionalIndex);
    }
  },
}
</script>
