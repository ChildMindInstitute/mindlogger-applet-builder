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
            @click="viewItems"
            v-on="on"
            icon
            x-large
          >
            <img height="25" alt='' v-bind:src="baseImageURL + 'items.png'"/>
          </v-btn>
        </template>
        <span>Item List</span>
      </v-tooltip>

      <v-tooltip
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn
            @click="viewConditionalLogic"
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
            @click="viewSubScales"
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
            @click="saveToDashboard"
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
            @click="downloadSchema"
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
            @click="resetBuilder"
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
            @click="viewHistory"
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
import Protocol from '../models/Protocol';
import Activity from '../models/Activity';
import Item from '../models/Item';

import { mapMutations, mapGetters } from 'vuex';
import { saveAs } from 'file-saver';

export default {
  computed: {
    config () {
      return config;
    },
    ...mapGetters(config.MODULE_NAME, [
      'currentScreen',
      'baseImageURL',
      'protocol',
      'activities'
    ])
  },
  methods: {
    ...mapMutations(config.MODULE_NAME, [
      'setCurrentScreen',
      'setCurrentActivity',
      'resetProtocol',
    ]),

    onBackToProtocolScreen () {
      this.setCurrentScreen(config.PROTOCOL_SCREEN);
      this.setCurrentActivity(-1);
    },

    saveToDashboard () {

    },

    downloadSchema () {
      const protocolModel = new Protocol();
      protocolModel.updateReferenceObject(this.protocol);

      const schemaObj = protocolModel.getCompressedSchema();
      const contextObj = protocolModel.getContext();

      var JSZip = require('jszip');
      var zip = new JSZip();

      zip
        .folder('protocols')
        .file('schema', JSON.stringify(schemaObj, null, 2));
      zip
        .folder('protocols')
        .file('context', JSON.stringify(contextObj, null, 2));

      this.activities.forEach(function(activity) {
        const activityModel = new Activity();
        activityModel.updateReferenceObject(activity);

        const activityData = activityModel.getActivityData();

        zip
          .folder(`activities/${activity.name}`)
          .file(
            `${activity.name}_schema`,
            JSON.stringify(activityData.schema, null, 2)
          );
        zip
          .folder(`activities/${activity.name}`)
          .file(
            `${activity.name}_context`,
            JSON.stringify(activityData.context, null, 2)
          );
        activity.items.forEach(function(item) {
          const itemModel = new Item();
          itemModel.updateReferenceObject(item);

          zip
            .folder(`activities/${activity.name}/items`)
            .file(`${item.name}`, JSON.stringify(itemModel.getCompressedSchema(), null, 2));
        });
      });

      zip.generateAsync({ type: 'blob' }).then((blob) => {
        saveAs(blob, `${this.protocol.name}.zip`);
      });
    },

    resetBuilder () {
      this.setCurrentScreen(config.PROTOCOL_SCREEN);
      this.setCurrentActivity(-1);
      this.resetProtocol();
    },

    viewItems () {

    },

    viewConditionalLogic () {

    },

    viewSubScales () {

    },

    viewHistory () {

    }
  }
}
</script>
