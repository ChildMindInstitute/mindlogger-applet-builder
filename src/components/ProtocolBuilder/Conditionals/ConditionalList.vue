<template>
  <v-card>
    <v-card-title>
      Conditionals
    </v-card-title>

    <div>
      <ConditionalBuilder
        v-for="(conditional) in currentConditionals"
        class="ma-4"
        :key="conditional.id"
        :conditional-index="currentConditionals.findIndex(({ id }) => id === conditional.id)"
        :current="conditional"
      >
      </ConditionalBuilder>
    </div>

    <v-btn
      @click="onAddConditional"
      color="primary"
      class="mx-4 my-2"
      rounded
    >
      Add Conditional
    </v-btn>

    <v-dialog v-model="conditionalAlert" width="350">
      <v-card>
        <v-card-title class="grey lighten-2">Conditional Logic Alert</v-card-title>
        <v-card-text class="pa-4">{{ alertMessage }}</v-card-text>
      </v-card>
    </v-dialog>

  </v-card>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import config from '../../../config';
import ConditionalBuilder from './ConditionalBuilder';

export default {
  components: {
    ConditionalBuilder
  },
  data () {
    return {
      currentConditionals: [],
      conditionalAlert: false,
      alertMessage: ''
    }
  },
  computed: {
    config () {
      return config;
    },
    ...mapGetters(config.MODULE_NAME,
      [
        'currentActivity'
      ]
    ),
    conditionals () {
      return this.currentActivity.conditionalItems;
    },
  },
  beforeMount() {
    this.currentConditionals = [...this.conditionals];
  },
  methods: {
    ...mapMutations(config.MODULE_NAME,
      [
        'addConditional',
      ]
    ),
    getConditionalAlertMsg () {
      let radioSliderItems = 0;

      if (this.currentActivity.items.length < 2) {
        return 'Please insert two or more items to add conditional logic';
      }

      for (let item of this.currentActivity.items) {
        if (item.allowEdit && item.inputType == 'radio' || item.inputType == 'checkbox' || item.inputType == 'prize' || item.inputType == 'slider') {
          return null;
        }
      }
      return 'Please insert at least one slider/radio item to add conditional logic';
    },

    onAddConditional () {
      this.alertMessage = this.getConditionalAlertMsg()

      if (this.alertMessage) {
        this.conditionalAlert = true;
        return ;
      }

      this.addConditional();
    },
  },
  watch: {
    conditionals: {
      deep: true,
      handler() {
        this.currentConditionals = [...this.conditionals];
      }
    },
  },
}
</script>
