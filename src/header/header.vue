<template>
  <v-card class="px-4 py-2">
    <v-row>
      <v-btn
        icon
        x-large
        :disabled="currentScreen == config.PROTOCOL_SCREEN"
        @click="onBackToProtocolScreen"
      >
        <v-icon>
          mdi-keyboard-backspace
        </v-icon>
      </v-btn>

      <v-spacer/>

      <v-tooltip
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            icon
            x-large
          >
            <img height="25" alt='' v-bind:src="baseImageURL + 'save-icon.png'"/>
          </v-btn>
        </template>
        <span>Save To Dashboard</span>
      </v-tooltip>


      <v-tooltip
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            icon
            x-large
          >
            <img height="25" alt='' v-bind:src="baseImageURL + 'export-icon.png'"/>
          </v-btn>
        </template>
        <span>Download Schema</span>
      </v-tooltip>

      <v-tooltip
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            icon
            x-large
          >
            <img height="25" alt='' v-bind:src="baseImageURL + 'refresh-icon.png'"/>
          </v-btn>
        </template>
        <span>Reset Builder</span>
      </v-tooltip>

      <v-tooltip
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            icon
            x-large
          >
            <img height="25" alt='' v-bind:src="baseImageURL + 'conditional-icon.png'"/>
          </v-btn>
        </template>
        <span>Conditional Logic</span>
      </v-tooltip>

      <v-tooltip
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            icon
            x-large
          >
            <img height="25" alt='' v-bind:src="baseImageURL + 'subscale-icon.png'"/>
          </v-btn>
        </template>
        <span>SubScales</span>
      </v-tooltip>

      <v-tooltip
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            icon
            x-large
          >
            <img height="25" alt='' v-bind:src="baseImageURL + 'history-icon.png'"/>
          </v-btn>
        </template>
        <span>View History</span>
      </v-tooltip>
    </v-row>
  </v-card>
</template>

<script>
import config from '../config';
import { mapMutations, mapGetters } from 'vuex';

export default {
  computed: {
    config() {
      return config;
    },
    ...mapGetters(config.MODULE_NAME, [
      'currentScreen',
      'baseImageURL',
    ])
  },
  methods: {
    ...mapMutations(config.MODULE_NAME, [
      'setCurrentScreen',
      'setCurrentActivity',
    ]),
    onBackToProtocolScreen() {
      this.setCurrentScreen(config.PROTOCOL_SCREEN);
      this.setCurrentActivity(-1);
    }
  }
}
</script>
