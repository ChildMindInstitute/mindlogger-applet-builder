import Protocol from '../../../models/Protocol';
import Activity from '../../../models/Activity';
import Item from '../../../models/Item';
import { initialProtocol } from './state';

const itemMutations = {
  updateItemMetaInfo (state, { index, obj }) {
    if (!state.currentActivity) {
      return ;
    }

    Object.assign(state.currentActivity.items[index], obj);
    state.currentActivity.items[index].valid = Item.checkValidation(state.currentActivity.items[index]);
  },

  addItem (state, obj) {
    const model = new Item();
    let item = {
      options: {
        options: [],
      },
      ui: {
        inputType: 'radio',
        allow: [
          'dontKnow'
        ]
      }
    };
  
    if (obj) {
      item = obj;
    }

    let lastIndex = state.currentActivity.items.findIndex(item => !item.allowEdit || item.inputType == 'cumulativeScore');

    if (lastIndex >= 0) {
      state.currentActivity.items.splice(lastIndex, 0, model.getItemBuilderData(item));
    } else {
      state.currentActivity.items.push(model.getItemBuilderData(item));
    }
  },

  duplicateItem(state, index) {
    const item = state.currentActivity.items[index];

    const names = state.currentActivity.items.map((item) => item.name);

    let suffix = 1;
    while (names.includes(`${item.name} (${suffix})`)) {
      suffix++;
    }

    const newItem = {
      ...item,
      name: `${item.name} (${suffix})`,
      id: null,
    };

    let lastIndex = state.currentActivity.items.findIndex(item => !item.allowEdit || item.inputType == 'cumulativeScore');

    if (lastIndex >= 0) {
      state.currentActivity.items.splice(lastIndex, 0, newItem);
    } else {
      state.currentActivity.items.push(newItem);
    }
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
      id: null,
      name: `${activity.name} (${suffix})`,
      items: activity.items.map(item => ({
        ...item,
        id: null,
      })),
    });
  },

  deleteActivity (state, index) {
    state.protocol.activities.splice(index, 1);
  },

  addActivity (state) {
    const model = new Activity;
    state.protocol.activities.push({
      ...model.getActivityBuilderData({ items: [] }),
      index: state.protocol.activities.length,
    })
  },

  updateActivityMetaInfo (state, obj) {
    Object.assign(state.currentActivity, obj);

    state.currentActivity.valid = Activity.checkValidation(state.currentActivity);
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

const subScaleMutations = {
  addSubScale (state) {
    if (state.currentActivity) {
      state.currentActivity.subScales.push({});
    }
  },

  updateSubScaleData (state, { index, obj }) {
    Object.assign(state.currentActivity.subScales[index], obj);
  },

  deleteSubScale (state, index) {
    state.currentActivity.subScales.splice(index, 1);
  }
};

const conditionalMutations = {
  addConditional (state) {
    if (state.currentActivity) {
      state.currentActivity.conditionalItems.push({});
    }
  },

  updateConditionalData (state, { index, obj }) {
    state.currentActivity.conditionalItems[index] = obj;
  },

  deleteConditional (state, index) {
    state.currentActivity.conditionalItems.splice(index, 1);
  }
}

export default {
  ...activityMutations,
  ...itemMutations,
  ...subScaleMutations,
  ...conditionalMutations,

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
    state.protocol.valid = Protocol.checkValidation(state.protocol);
  },

  resetProtocol (state) {
    state.protocol = initialProtocol;
  },

  setTokenPrizeModalStatus (state, status) {
    state.protocol.tokenPrizeModal = status;
  },

  insertTemplateUpdateRequest (state, { type, option }) {
    Object.assign(state.templateUpdateRequest, {
      type,
      option,
      pending: true
    });
  },

  updateTemplateRequestStatus (state, status) {
    state.templateUpdateRequest.pending = status;
  },

  setVersions (state, versions) {
    state.versions = versions;
  }
}