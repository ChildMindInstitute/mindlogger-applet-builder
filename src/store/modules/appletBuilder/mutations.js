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

  addItem (state) {
    const model = new Item();
    state.currentActivity.items.push(model.getItemBuilderData({
      options: {
        options: []
      },
      ui: {
        inputType: 'radio',
      }
    }));
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
}