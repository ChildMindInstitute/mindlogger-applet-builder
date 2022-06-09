<template>
  <v-card>
    <v-card-title
      class="px-2 py-0"
      :class="name ? '' : 'invalid'"
    >
      <span class="activity-flow-name">{{ name }}</span>
      <v-spacer />
      <v-card-actions>
        <v-btn
          icon
          @click="editActivtiyFlow"
        >
          <v-icon
            v-if="!isExpanded"
            color="grey lighten-1"
          >
            edit
          </v-icon>
          <v-icon
            v-else
            color="grey lighten-1"
          >
            mdi-chevron-up
          </v-icon>
        </v-btn>
      </v-card-actions>
    </v-card-title>
    <div v-if="isExpanded">
      <v-text-field
        v-model="name"
        :rules="textRules"
        counter="55"
        maxlength="55"
        label="Activity Flow Name"
        required
      />
      <v-text-field
        v-model="description"
        counter="230"
        maxlength="230"
        label="Activity Flow Description"
      />

      <template>
        <v-row
          class="align-center"
        >
          <v-col
            class="py-0"
            cols="12"
            sm="4"
          >
            <v-checkbox
              v-model="combineReports"
              label="Combine reports into a single file"
            />
          </v-col>
          <v-col
            class="py-0"
            cols="12"
            sm="4"
          >
            <v-checkbox
              v-model="showBadge"
              label="Hide badge"
            />
          </v-col>
        </v-row>
      </template>
    </div>
    <Notify :notify="notify" />
    <Loading :loading="loading" />
  </v-card>
</template>

<style scoped>
.activity-flow-name {
  font-weight: 600;
}

.invalid {
  background-color: #d44c4c;
}
</style>
¸
<script>
import { mapGetters, mapMutations } from 'vuex';
import config from '../../config';
import Notify from './Additional/Notify.vue';
import Loading from './Additional/Loading.vue';

export default {
  components: {
    Notify,
    Loading,
  },
  props: {
    headerExpanded: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      textRules: [(v) => !!v || 'This field is required'],
      isExpanded: true,
      loading: false,
      notify: {},
    }
  },
  mounted() {
  },
  methods: {
    ...mapMutations(config.MODULE_NAME, [
      'updateActivityFlowInfo',
    ]),
    editActivtiyFlow () {
      this.isExpanded = !this.isExpanded;
      if (this.isExpanded) {
        this.$emit('onExpand');
      }
    },
  },
  computed: {
    ...mapGetters(config.MODULE_NAME, [
      'currentActivityFlow'
    ]),
    name: {
      get: function () {
        return this.currentActivityFlow && this.currentActivityFlow.name;
      },
      set: function (name) {
        this.updateActivityFlowInfo({ name });
      }
    },
    description: {
      get: function () {
        return this.currentActivityFlow && this.currentActivityFlow.description;
      },
      set: function (description) {
        this.updateActivityFlowInfo({ description });
      }
    },
    combineReports: {
      get: function () {
        return this.currentActivityFlow && this.currentActivityFlow.combineReports;
      },
      set: function (name) {
        this.updateActivityFlowInfo({ combineReports });
      }
    },
    showBadge: {
      get: function () {
        return this.currentActivityFlow && !this.currentActivityFlow.showBadge;
      },
      set: function (name) {
        this.updateActivityFlowInfo({ showBadge: !showBadge });
      }
    },
  },
  watch: {
    headerExpanded: {
      handler () {
        if (!this.headerExpanded) {
          this.isExpanded = false;
        }
      }
    }
  },
}
</script>
