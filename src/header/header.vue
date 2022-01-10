<template>
  <v-card class="px-4 py-2">
    <v-row>
      <v-btn
        icon
        :disabled="currentScreen == config.PROTOCOL_SCREEN"
        @click="onBackToProtocolScreen"
      >
        <v-icon>
          mdi-keyboard-backspace
        </v-icon>
      </v-btn>

      <v-spacer />

      <small style="margin-right: 10px" v-if="nodeEnv != 'production'">v{{ version }}</small>

      <v-tooltip
        v-if="currentActivity"
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn
            :color="currentScreen == config.ITEM_SCREEN ? 'primary' : ''"
            class="mx-1"
            :class="itemStatus ? '' : 'invalid'"
            @click="viewItems"
            v-on="on"
          >
            <img
              v-show="currentScreen === config.ITEM_SCREEN"
              height="25"
              alt=""
              :src="baseImageURL + 'header-icons/white/items.png'"
            >
            <img
              v-show="currentScreen !== config.ITEM_SCREEN"
              height="25"
              alt=""
              :src="baseImageURL + 'header-icons/black/items.png'"
            >
          </v-btn>
        </template>
        <span>Item List</span>
      </v-tooltip>

      <v-tooltip
        v-if="currentActivity"
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn
            :color="currentScreen == config.CONDITIONAL_SCREEN ? 'primary' : ''"
            class="mx-1"
            :class="onePageAssessment ? 'disabled' : conditionalStatus ? '' : 'invalid'"
            @click="!onePageAssessment ? viewConditionalLogic() : ''"
            v-on="on"
          >
            <img
              v-show="currentScreen === config.CONDITIONAL_SCREEN"
              height="25"
              alt=""
              :src="baseImageURL + 'header-icons/white/conditional-icon.png'"
            >
            <img
              v-show="currentScreen !== config.CONDITIONAL_SCREEN"
              height="25"
              alt=""
              :src="baseImageURL + 'header-icons/black/conditional-icon.png'"
            >
          </v-btn>
        </template>
        <span
          v-if="!onePageAssessment"
        >Conditional Logic</span>
        <span
          v-else
        >Conditional logic is not available when the one-page activity is turned on</span>
      </v-tooltip>

      <v-tooltip
        v-if="currentActivity"
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn
            :color="currentScreen == config.SUBSCALE_SCREEN ? 'primary' : ''"
            class="mx-1"
            :class="subScaleStatus ? '' : 'invalid'"
            @click="viewSubScales"
            v-on="on"
          >
            <img
              v-show="currentScreen === config.SUBSCALE_SCREEN"
              height="25"
              alt=""
              :src="baseImageURL + 'header-icons/white/subscale-icon.png'"
            >
            <img
              v-show="currentScreen !== config.SUBSCALE_SCREEN"
              height="25"
              alt=""
              :src="baseImageURL + 'header-icons/black/subscale-icon.png'"
            >
          </v-btn>
        </template>
        <span>SubScales</span>
      </v-tooltip>

      <v-tooltip
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn
            class="mx-1"
            @click="saveToDashboard"
            v-on="on"
          >
            <img
              height="25"
              alt=""
              :src="baseImageURL + 'header-icons/black/save-icon.png'"
            >
          </v-btn>
        </template>
        <span>Save To Dashboard</span>
      </v-tooltip>

      <v-tooltip
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn
            class="mx-1"
            @click="downloadSchema"
            v-on="on"
          >
            <img
              height="25"
              alt=""
              :src="baseImageURL + 'header-icons/black/export-icon.png'"
            >
          </v-btn>
        </template>
        <span>Download Schema</span>
      </v-tooltip>


      <v-tooltip
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn
            class="mx-1"
            @click="resetBuilder"
            v-on="on"
          >
            <img
              height="25"
              alt=""
              :src="baseImageURL + 'header-icons/black/refresh-icon.png'"
            >
          </v-btn>
        </template>
        <span>Reset Builder</span>
      </v-tooltip>

      <v-tooltip
        v-if="formattedOriginalProtocol"
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn
            class="mx-1"
            @click="viewHistory"
            v-on="on"
          >
            <img
              height="25"
              alt=""
              :src="baseImageURL + 'header-icons/black/history-icon.png'"
            >
          </v-btn>
        </template>
        <span>View History</span>
      </v-tooltip>
      <v-tooltip
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn
            class="mx-1"
            @click="$emit('switchToLibrary')"
            v-on="on"
          >
            <v-icon>
              mdi-database-import
            </v-icon>
          </v-btn>
        </template>
        <span>Import from Library</span>
      </v-tooltip>
    </v-row>

    <v-dialog
      v-model="changeHistoryDialog.visibility"
      width="800"
      class="historyDialog"
    >
      <ChangeHistoryComponent
        :key="historyComponentKey"
        :history="changeHistoryDialog.data"
        :currentVersion="changeHistoryDialog.currentVersion"
        :defaultVersion="changeHistoryDialog.defaultVersion"
        :versions="versions"
        @updateHistoryView="updateHistoryView"
      />
    </v-dialog>

    <v-dialog
      v-model="dataAlertDialog.visibility"
      width="350"
    >
      <v-card>
        <v-card-title class="grey lighten-2 d-block">
          Protocol Data Alert
        </v-card-title>
        <v-card-text class="pa-4">
          {{ dataAlertDialog.message }}
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>
  .invalid {
    border-bottom: 4px solid red;
  }
  .disabled {
    background-color: rgb(224, 224, 224) !important;
  }
  .d-block {
    display: block !important;
  }
  .v-dialog .v-card .v-card__title {
    display: block !important;
  }
</style>

<script>
import config from '../config';
import Protocol from '../models/Protocol';
import Activity from '../models/Activity';
import Item from '../models/Item';
import util from '../utilities/util';
import { getVersion } from "../utilities/util";
import ChangeHistoryComponent from '../components/ProtocolBuilder/ChangeHistoryComponent';

import { mapMutations, mapGetters } from 'vuex';
import { saveAs } from 'file-saver';

export default {
  components: {
    ChangeHistoryComponent,
  },
  props: {
    getProtocols: {
      type: Function,
      required: false,
      default: null,
    }
  },
  data () {
    return {
      version: getVersion(),
      changeHistoryDialog: {
        visibility: false,
        defaultVersion: null,
        data: [],
      },
      historyComponentKey: 0,
      dataAlertDialog: {
        visibility: false,
        message: ''
      }
    };
  },
  computed: {
    config () {
      return config;
    },
    ...mapGetters(config.MODULE_NAME, [
      'currentScreen',
      'baseImageURL',
      'protocol',
      'activities',
      'currentActivity',
      'formattedOriginalProtocol',
      'versions',
      'nodeEnv',
      'themeId',
      'originalThemeId'
    ]),
    itemStatus () {
      return this.currentActivity && this.currentActivity.items.every(item => item.valid);
    },
    subScaleStatus () {
      return this.currentActivity && this.currentActivity.subScales.every(subScale => subScale.valid);
    },
    conditionalStatus () {
      return this.currentActivity && this.currentActivity.conditionalItems.every(conditional => conditional.valid);
    },
    onePageAssessment () {
      return this.currentActivity && this.currentActivity.isOnePageAssessment;
    }
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
      if (!this.appletStatus()) {
        return;
      }

      Protocol.formattedProtocol(this.protocol).then((data) => {
        if (!this.formattedOriginalProtocol) {
          this.$emit("uploadProtocol", {
            applet: data,
            themeId: this.themeId
          });
        } else {
          const updateTheme = this.themeId !== undefined && (this.originalThemeId === undefined || this.originalThemeId !== this.themeId);

          let { upgrade, updates, removed } = Protocol.getChangeInfo(this.formattedOriginalProtocol, data, true);
          let newVersion = util.upgradeVersion(this.protocol.protocolVersion, upgrade);

          if (newVersion != this.protocol.protocolVersion) {
            updates.data['schema:schemaVersion'] = updates.data['schema:version'] = newVersion;

            data.protocol = updates;
            data.removed = removed;
            data.baseVersion = this.protocol.protocolVersion;

            this.$emit("updateProtocol", {
              protocol: data,
              ...(updateTheme && {themeId: this.themeId})
            });
          } else if (updateTheme) {
            this.$emit("updateProtocol", {themeId: this.themeId});
          } else {
            this.$emit("onUploadError", 'Please make changes to update applet');
          }
        }
      }).catch(e => {
        if(this.prizeActivity)
          this.activities.pop();
        console.log(e);
      });
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
      this.setCurrentScreen(config.ITEM_SCREEN);
    },

    appletStatus () {
      this.dataAlertDialog.message = '';

      if (!this.protocol.name) {
        this.dataAlertDialog.message = 'Please input applet name.';
      } else if (!this.activities.length) {
        this.dataAlertDialog.message = 'Please add more than one activity.';
      }

      for (let activity of this.protocol.activities) {
        const valid = !(
          !activity.valid
            || activity.items.some(item => !item.valid)
            || activity.subScales.some(subScale => !subScale.valid)
            || activity.conditionalItems.some(conditional => !conditional.valid)
            || (activity.items.length === 0)
        );

        if (!valid) {
          this.dataAlertDialog.message = 'Please fix errors in your activities/items.';
          break;
        }
      }

      this.dataAlertDialog.visibility = (this.dataAlertDialog.message.length !== 0);

      return !this.dataAlertDialog.visibility;
    },

    viewConditionalLogic () {
      this.setCurrentScreen(config.CONDITIONAL_SCREEN);
    },

    viewSubScales () {
      this.setCurrentScreen(config.SUBSCALE_SCREEN);
    },

    viewHistory () {
      if (!this.appletStatus()) {
        return ;
      }

      Protocol.formattedProtocol(this.protocol).then((current) => {
        const { log, upgrade } = Protocol.getChangeInfo(
          this.formattedOriginalProtocol,
          current
        );

        this.changeHistoryDialog.visibility = true;
        this.changeHistoryDialog.data = log;
        this.changeHistoryDialog.currentVersion = util.upgradeVersion(
          this.protocol.protocolVersion,
          upgrade
        );
        this.changeHistoryDialog.defaultVersion = null;

        this.historyComponentKey++;
      });
    },

    updateHistoryView (version) {
      const index = this.versions.indexOf(version);

      /** viewing current changes */
      if (index < 0) {
        this.changeHistoryDialog.defaultVersion = version;

        this.viewHistory();
        return;
      }

      /** viewing old changes */
      this.getProtocols([this.versions[index], this.versions[index + 1]]).then(
        (resp) => {
          const data = resp.data;

          const { log, upgrade } = Protocol.getChangeInfo(
            data[1].content,
            data[0].content
          );

          this.changeHistoryDialog.visibility = true;
          this.changeHistoryDialog.data = log;
          this.changeHistoryDialog.defaultVersion = version;

          this.historyComponentKey++;
        }
      );
    }
  }
}
</script>
