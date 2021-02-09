import Protocol from '../../../models/Protocol';
import Activity from '../../../models/Activity';
import Item from '../../../models/Item';

const activityGetters = {
  activityMeta (state) {
    return state.currentActivity;
  },

  activities (state) {
    return state.protocol.activities;
  },

  currentActivity (state) {
    return state.currentActivity;
  },

  prizeActivity (state) {
    return state.protocol.prizeActivity;
  },

  tokenPrizeModal (state) {
    return state.protocol.tokenPrizeModal;
  }
};

export default {
  ...activityGetters,
  
  /** get formatted protocol data from current protocol state */
  formattedProtocol (state) {
    const protocol = state.protocol;
    const protocolModel = new Protocol();

    const activities = protocol.activities.map(activity => {
      const activityModel = new Activity();

      activityModel.updateReferenceObject({
        ...activity,
        items: activity.items.map(item => {
          const itemModel = new Item();

          itemModel.updateReferenceObject(item);
          return itemModel.getItemData()
        })
      });

      return activityModel.getActivityData();
    })

    protocolModel.updateReferenceObject({
      ...protocol,
      activities
    });

    return protocolModel.getProtocolData();
  },

  protocol (state) {
    return state.protocol
  },

  formattedOriginalProtocol (state) {
    return state.original;
  },

  itemTemplates (state) {
    return state.templates;
  },

  currentScreen (state) {
    return state.currentScreen;
  },

  baseImageURL (state) {
    return state.baseImageURL;
  },

  itemInputTypes (state) {
    return state.itemInputTypes;
  }
}
