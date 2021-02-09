import Protocol from '../../../models/Protocol';
import Activity from '../../../models/Activity';
import Item from '../../../models/Item';

const itemMutations = {
  updateItemMetaInfo (state, { index, obj }) {
    if (!state.currentActivity) {
      return ;
    }

    Object.assign(state.currentActivity.items[index], obj);
  },

  addItem (state, obj) {
    const model = new Item();
    let item = {
      options: {
        options: []
      },
      ui: {
        inputType: 'radio',
      }
    };
  
    if (obj) {
      item = obj;
    }

    state.currentActivity.items.push(model.getItemBuilderData(item));
  },

  duplicateItem(state, index) {
    const item = state.currentActivity.items[index];

    const names = state.currentActivity.items.map((item) => item.name);

    let suffix = 1;
    while (names.includes(`${item.name} (${suffix})`)) {
      suffix++;
    }

    state.currentActivity.items.push({
      ...item,
      name: `${item.name} (${suffix})`,
      _id: null,
    })
  },

  deleteItem(state, index) {
    state.currentActivity.items.splice(index, 1);
  },
};

const activityMutations = {
  setCurrentActivity (state, index) {
    if (index < 0) {
      state.currentActivity = null;
      return ;
    }

    state.currentActivity = state.protocol.activities[index];
  },

  duplicateActivity (state, index) {
    const activities = state.protocol.activities;

    const names = activities.map((activity) => activity.name);
    const activity = activities[index];

    let suffix = 1;
    while (names.includes(`${activity.name} (${suffix})`)) {
      suffix++;
    }

    activities.push({
      ...activity,
      _id: null,
      name: `${activity.name} (${suffix})`,
      isValid: true,
      items: activity.items.map(item => ({
        ...item,
        _id: null,
      })),
    });
  },

  deleteActivity (state, index) {
    state.protocol.activities.splice(index, 1);
  },

  addActivity (state) {
    const model = new Activity;
    state.protocol.activities.push({
      ...model.getActivityBuilderData({}),
      index: state.protocol.activities.length,
    })
  },

  updateActivityMetaInfo (state, obj) {
    Object.assign(state.currentActivity, obj);

    state.currentActivity.isValid = Activity.checkValidation(state.currentActivity);
  },

  setPrizeActivity (state, prizeActivity) {
    if (!state.protocol.prizeActivity) {
      state.protocol.activities.push({
        ...prizeActivity,
        index: state.protocol.activities.length,
      })
    }

    state.protocol.prizeActivity = prizeActivity;
  },

  replaceActivityData (state, { index, activity }) {
    state.protocol.activities[index] = {
      ...activity,
      index
    };

    if (state.currentActivity.index == index) {
      state.currentActivity = state.protocol.activities[index];
    }
    if (state.protocol.prizeActivity.index == index) {
      state.protocol.prizeActivity = state.protocol.activities[index];
    }
  }
};

export default {
  ...activityMutations,
  ...itemMutations,
  initProtocolData (state, data) {
    state.protocol = data;
  },

  setFormattedOriginalProtocol (state, data) {
    state.original = data;
  },

  setTemplates (state, templates) {
    state.templates = templates;
  },

  setCurrentScreen (state, screen) {
    state.currentScreen = screen;
  },

  /** protocol meta data */
  updateProtocolMetaInfo (state, obj) {
    Object.assign(state.protocol, obj);
  },

  resetProtocol (state) {
    state.protocol = {
      id: '',
      description: '',
      markdownData: '',
      name: '',
      protocolVersion: '',
      isValid: false,
      activities: []
    }
  },

  setTokenPrizeModalStatus (state, status) {
    state.protocol.tokenPrizeModal = status;
  },
}