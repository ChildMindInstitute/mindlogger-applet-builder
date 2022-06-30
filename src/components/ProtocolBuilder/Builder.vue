<template>
  <div class="builder">
    <div class="container">
      <Header
        :getProtocols="getProtocols"
        :viewMode="viewMode"
        @uploadProtocol="uploadProtocol"
        @updateProtocol="updateProtocol"
        @onUploadError="onUploadError"
        @switchToLibrary="onSwitchToLibrary"
      />
      <ProtocolBuilder
        v-if="currentScreen === config.PROTOCOL_SCREEN || currentScreen === config.ACTIVITY_FLOW_SCREEN"
      />
      <ActivityFlowBuilder
        v-else-if="currentScreen === config.FLOW_BUILDER_SCREEN"
      />
      <ActivityBuilder
        v-else
      />

      <v-dialog
        v-model="tokenPrizeDialog"
        persistent
        width="800"
      >
        <PrizeActivityBuilder
          :initial-activity-data="prizeActivity || {}"
          @closeModal="onClosePrizeActivityModal"
          @deleteOptions="onClosePrizeActivityModal"
        />
      </v-dialog>
    </div>
  </div>
</template>

<style scoped>
  .builder {
    background: rgb(239,239,243);
  }
  .d-block{
    display: block !important;
  }

</style>

<script>
import Header from '../../header/header';
import config from '../../config';

import ProtocolBuilder from './ProtocolBuilder';
import ActivityBuilder from './ActivityBuilder';
import ActivityFlowBuilder from './ActivityFlowBuilder';

import Protocol from '../../models/Protocol';
import Activity from '../../models/Activity';
import Item from '../../models/Item';
import PrizeActivityBuilder from './PrizeActivity/PrizeActivityBuilder.vue';
import util from '../../utilities/util';
import { getInitialProtocol } from '../../store/modules/appletBuilder/state';

import { mapMutations, mapGetters } from 'vuex';

export default {
  components: {
    Header,
    ProtocolBuilder,
    ActivityBuilder,
    PrizeActivityBuilder,
    ActivityFlowBuilder,
  },
  props: {
    exportButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    initialData: {
      type: Object,
      required: false,
      default: null,
    },
    templates: {
      type: Array,
      required: false,
      default: null,
    },
    themes: {
      type: Array,
      required: false,
      default: null,
    },
    versions: {
      type: Array,
      required: false,
      default: null,
    },
    getProtocols: {
      type: Function,
      required: false,
      default: null,
    },
    cacheData: {
      type: Object,
      required: false,
      default: null,
    },
    basketApplets: {
      type: Object,
      required: false,
      default: null,
    },
    nodeEnv: {
      type: String,
      required: false,
      default: 'development',
    },
    viewMode: {
      type: Boolean,
      required: false,
      default: false
    },
    pdfServerToken: {
      type: String,
      required: false,
      default: ''
    }
  },
  computed: {
    ...mapGetters(config.MODULE_NAME, [
      'currentScreen',
      'tokenPrizeModal',
      'activities',
      'prizeActivity',
      'templateUpdateRequest',
      'themeId'
    ]),
    config() {
      return config;
    },
    tokenPrizeDialog: {
      get: function () {
        return this.tokenPrizeModal;
      },
      set: function (value) {
        this.setTokenPrizeModalStatus(value);
      }
    }
  },
  watch: {
    templateUpdateRequest: {
      deep: true,
      handler () {
        const req = this.templateUpdateRequest;
        if (req.pending) {
          this.$emit(req.type, req.option);
          this.updateTemplateRequestStatus(false);
        }
      }
    }
  },
  async beforeMount() {
    this.setTemplates(this.templates);

    this.initThemes(this.themes);
    this.initThemeId(this.initialData);
    this.setPDFToken(this.pdfServerToken);
    this.setVersions(this.versions);
    this.setNodeEnv(this.nodeEnv);
    this.setCurrentScreen(config.PROTOCOL_SCREEN);
    this.setCurrentActivity(-1);

    let initialStoreData = await this.fillStoreWithAppletData();
    if (this.basketApplets) {
      initialStoreData = await this.mergeStoreDataWithBasketApplets(initialStoreData, this.basketApplets);
    }

    this.initProtocolData(initialStoreData);

    if (this.initialData || (this.cacheData && this.cacheData.original)) {
      if (!this.versions.length) {
        this.$emit('setLoading', true);
      }

      const original = this.cacheData && this.cacheData.original ? this.cacheData.original : await this.formattedProtocol();

      if (!this.versions.length) {
        /** upload first version */

        original.protocol.data[
          'schema:schemaVersion'
        ] = original.protocol.data['schema:version'] = util.upgradeVersion(
          original.protocol.data['schema:version'],
          '0.0.1'
        );

        this.$emit('prepareApplet', original);
        return;
      }

      this.setFormattedOriginalProtocol(JSON.parse(JSON.stringify(original)));
    } else {
      this.setFormattedOriginalProtocol(null);
    }

    this.$emit("setLoading", false);
  },
  methods: {
    ...mapMutations(config.MODULE_NAME, [
      'initProtocolData',
      'setTemplates',
      'initThemes',
      'initThemeId',
      'setCurrentScreen',
      'setFormattedOriginalProtocol',
      'setPrizeActivity',
      'deleteActivity',
      'setCurrentActivity',
      'replaceActivityData',
      'setTokenPrizeModalStatus',
      'updateTemplateRequestStatus',
      'setVersions',
      'setNodeEnv',
      'setPDFToken',
      'resetProtocol',
    ]),
    ...mapGetters(config.MODULE_NAME, [
      'formattedProtocol'
    ]),
    async fillStoreWithAppletData () {
      let initialStoreData = null;

      if (this.cacheData) {
        initialStoreData = JSON.parse(JSON.stringify(this.cacheData.protocol));
      } else if (this.initialData) {
        initialStoreData = await Protocol.parseApplet(this.initialData);
      }

      if (!initialStoreData) {
        initialStoreData = getInitialProtocol();
      }
      return initialStoreData;
    },

    async mergeStoreDataWithBasketApplets(storeData, basketApplets) {
      const activityModel = new Activity();
      const itemModel = new Item();

      if (!storeData.id) {
        if (Object.entries(basketApplets).length === 1) {
          const [appletData] = Object.values(basketApplets)
          storeData = {
            ... await Protocol.parseJSONLD(appletData.applet, appletData.protocol),
            valid: true,
            activities: [],
            tokenPrizeModal: false,
          };
        }
      }

      Object.entries(basketApplets).map(([appletId, appletData]) => {
        const { applet, activities, items, protocol } = appletData;

        let orders = _.get(applet, ['reprolib:terms/order', 0, '@list'], []).map(orderItem => orderItem['@id']);
        if (!orders.length) {
          orders = Object.keys(activities);
        }

        orders.forEach((key) => {
          const act = activities[key];

          if (!act || act.isPrize) {
            return;
          }

          const activityInfo = Activity.parseJSONLD(act)
          const activityItems = activityInfo.orderList.filter(key => items[key]).map((key, index) => {
            const itemData = itemModel.getItemBuilderData(Item.parseJSONLD(items[key]));
            itemData.baseAppletId = appletId;
            itemData.baseItemId = itemData.id;
            itemData.id = null;
            itemData.timestamp = Date.now() + index;
            return itemData;
          });

          if (activityItems.length < activityInfo.orderList.length) {
            delete activityInfo.finalSubScale
            delete activityInfo.subScales
          }

          const activityBuilderData = activityModel.getActivityBuilderData({
            ...activityInfo,
            items: activityItems,
          });
          activityBuilderData.timestamp = Date.now() + storeData.activities.length;
          activityBuilderData.index = storeData.activities.length;
          activityBuilderData.baseAppletId = appletId;
          activityBuilderData.baseActivityId = activityBuilderData.id;
          activityBuilderData.id = null;

          storeData.activities.push(activityBuilderData);
        });
      });
      return storeData;
    },

    onClosePrizeActivityModal (response) {
      const prizeIndex = this.activities.findIndex(activity => activity.isPrize);

      if (!response) {
        if (prizeIndex >= 0) {
          this.setPrizeActivity(null);
          this.deleteActivity(prizeIndex);
        }
      } else {
        if (prizeIndex >= 0) {
          this.replaceActivityData({
            index: prizeIndex,
            activity: response
          });
        } else {
          this.setPrizeActivity(response);
        }
      }

      this.setTokenPrizeModalStatus(false);
    },

    uploadProtocol (data) {
      this.$emit("uploadProtocol", data);
    },

    updateProtocol (data) {
      this.$emit("updateProtocol", data);
    },

    onUploadError (msg) {
      this.$emit("onUploadError", msg);
    },

    onSwitchToLibrary () {
      this.$emit("switchToLibrary", JSON.parse(JSON.stringify(this.$store.state.appletBuilder)));
    }
  }
}
</script>
