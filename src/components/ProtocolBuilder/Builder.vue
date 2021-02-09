<template>
  <div class="builder">
    <div class="container">
      <Header/>
      <ProtocolBuilder
        v-if="currentScreen == config.PROTOCOL_SCREEN"
      />
      <ActivityBuilder
        v-else
      />


      <v-dialog v-model="tokenPrizeModal" persistent width="800">
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
</style>

<script>
import Header from '../../header/header';
import config from '../../config';

import ProtocolBuilder from './ProtocolBuilder';
import ActivityBuilder from './ActivityBuilder';

import Protocol from '../../models/Protocol';
import Activity from '../../models/Activity';
import Item from '../../models/Item';
import PrizeActivityBuilder from './PrizeActivity/PrizeActivityBuilder.vue';

import { mapMutations, mapGetters } from 'vuex';

export default {
  components: {
    Header,
    ProtocolBuilder,
    ActivityBuilder,
    PrizeActivityBuilder,
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
    versions: {
      type: Array,
      required: false,
      default: null,
    },
    getProtocols: {
      type: Function,
      required: false,
      default: null,
    }
  },
  async beforeMount() {
    this.setTemplates(this.templates);
    this.setCurrentScreen(config.PROTOCOL_SCREEN);

    if (this.initialData) {
      this.isEditing = true;
      if (!this.versions.length) {
        this.$emit('setLoading', true);
      }

      await this.fillStoreWithAppletData();

      const original = await this.formattedProtocol();

      if (!this.versions.length) {
        /** upload first version */

        original.protocol.data[
          'schema:schemaVersion'
        ] = original.protocol.data['schema:version'] = util.upgradeVersion(
          this.protocolVersion,
          '0.0.1'
        );

        this.$emit('prepareApplet', original);
        return;
      }

      this.setFormattedOriginalProtocol(original);
    }

    this.$emit("setLoading", false);
  },
  computed: {
    ...mapGetters(config.MODULE_NAME, [
      'currentScreen',
      'tokenPrizeModal',
      'activities',
      'prizeActivity',
    ]),
    config() {
      return config;
    }
  },
  methods: {
    ...mapMutations(config.MODULE_NAME, [
      'initProtocolData',
      'setTemplates',
      'setCurrentScreen',
      'setFormattedOriginalProtocol',
      'setPrizeActivity',
      'deleteActivity',
      'replaceActivityData',
    ]),
    ...mapGetters(config.MODULE_NAME, [
      'formattedProtocol'
    ]),
    async fillStoreWithAppletData () {
      const { applet, activities, items, protocol } = this.initialData;

      const initialStoreData = {
        ... await Protocol.parseJSONLD(applet, protocol),
        activities: [],
      };

      const activityModel = new Activity();
      const itemModel = new Item();

      Object.values(activities).forEach((act) => {
        const activityInfo = Activity.parseJSONLD(act)
        const activityItems = activityInfo.orderList.filter(key => items[key]).map((key) => {
          return itemModel.getItemBuilderData(Item.parseJSONLD(items[key]));
        });

        const builderData = activityModel.getActivityBuilderData({
          ...activityInfo,
          items: activityItems,
        });
        builderData.index = initialStoreData.activities.length;

        initialStoreData.activities.push(builderData);
      });

      initialStoreData.prizeActivity = initialStoreData.activities.find(activity => activity.isPrize);
      this.initProtocolData(initialStoreData);
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
    }
  }
}
</script>
