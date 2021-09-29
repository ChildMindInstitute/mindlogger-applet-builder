import Protocol from '../../../models/Protocol';
import Activity from '../../../models/Activity';
import Item from '../../../models/Item';
import { getInitialProtocol } from './state';

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
        ]
      }
    };

    if (obj) {
      item = obj;
    }

    let lastIndex = state.currentActivity.items.findIndex(item => !item.allowEdit || item.inputType == 'cumulativeScore');

    if (!obj) {
      item.name = `Screen${lastIndex >= 0 ? lastIndex + 1 : state.currentActivity.items.length + 1}`;
    }

    const itemData = model.getItemBuilderData(item);
    itemData.valid = Item.checkValidation(itemData);

    if (lastIndex >= 0) {
      state.currentActivity.items.splice(lastIndex, 0, itemData);
    } else {
      state.currentActivity.items.push(itemData);
    }
  },

  showOrHideItem(state, index) {
    const isVis = !!state.currentActivity.items[index].isVis;
    state.currentActivity.items[index].isVis = !isVis;
  },

  duplicateItem(state, index) {
    const item = JSON.parse(JSON.stringify(state.currentActivity.items[index]));

    const names = state.currentActivity.items.map((item) => item.name);

    let suffix = 1;
    while (names.includes(`${item.name}__${suffix}`)) {
      suffix++;
    }

    const newItem = {
      ...item,
      name: `${item.name}__${suffix}`,
      id: null,
    };

    // if (state.protocol.id && item.id) {
    //   newItem.baseAppletId = state.protocol.appletId;
    //   newItem.baseItemId = item.id;
    // }

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

    const conditionalItems = activity.conditionalItems.map(conditionalItem => {
      const conditions = conditionalItem.conditions.map(condition => ({ ...condition }));

      return {
        ...conditionalItem,
        conditions,
      };
    })

    const newActivity = {
      ...activity,
      id: null,
      name: `${activity.name} (${suffix})`,
      items: activity.items.map(item => ({
        ...item,
        id: null,
      })),
      finalSubScale: { ...activity.finalSubScale },
      subScales: [...activity.subScales],
      conditionalItems,
    };

    // if (state.protocol.id && activity.id) {
    //   newActivity.baseAppletId = state.protocol.appletId
    //   newActivity.baseActivityId = activity.id
    // }

    activities.push(newActivity);
  },

  deleteActivity (state, index) {
    state.protocol.activities.splice(index, 1);
  },

  showOrHideActivity(state, index) {
    const isVis = !!state.protocol.activities[index].isVis;
    state.protocol.activities[index].isVis = !isVis;
  },

  addActivity(state, isABTrails) {
    const activityModel = new Activity;
    let items = [];

    if (isABTrails) {
      const itemModel = new Item();

      for (let i = 1; i <= 4; i += 1) {
        const inputType = 'trail';
        let trailsItem = {
          name: inputType + i,
          question: inputType + i,
          description: inputType + i,
          options: {
            options: [],
          },
          ui: {
            inputType,
            allow: []
          }
        };
        const itemData = itemModel.getItemBuilderData(trailsItem);
        itemData.valid = true;

        items.push({ ...itemData });
      }
    }

    state.protocol.activities.push({
      ...activityModel.getActivityBuilderData({ items, isABTrails }),
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
      state.currentActivity.subScales.push({
        lookupTable: null,
        variableName: '',
        jsExpression: '',
        valid: false
      });
    }
  },

  updateSubScaleData (state, { index, obj }) {
    const name = state.currentActivity.subScales[index].variableName;
    const currentActivity = state.currentActivity;

    currentActivity.subScales[index] = { ...obj };
    state.currentActivity = { ...currentActivity };

    if (name && obj.variableName && name != obj.variableName)
    {
      for (const subScale of state.currentActivity.subScales)
      {
        subScale.jsExpression =
          subScale.jsExpression.replace(`(${name})`, `(${obj.variableName})`);
      }
    }
  },

  deleteSubScale (state, index) {
    state.currentActivity.subScales.splice(index, 1);
  },

  updateFinalSubScale(state, obj) {
    Object.assign(state.currentActivity.finalSubScale, obj);
  }
};

const conditionalMutations = {
  addConditional (state) {
    if (state.currentActivity) {
      state.currentActivity.conditionalItems.push({ id: Date.now() });
    }
  },

  updateConditionalData(state, { index, updates }) {
    const conditional = state.currentActivity.conditionalItems[index];
    state.currentActivity.conditionalItems[index] = {
      ...conditional,
      ...updates
    };
  },

  deleteConditional(state, index) {
    const conditionalItems = [...state.currentActivity.conditionalItems];

    conditionalItems.splice(index, 1);
    state.currentActivity.conditionalItems = [...conditionalItems];
  },
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

  initThemes (state, themes) {
    state.themes = themes;
  },

  initThemeId (state, initialData) {
    const initDefaultThemeId = (themes, initialData) => {
      if (initialData && initialData.applet && initialData.applet.themeId) {
        return initialData.applet.themeId;
      }

      return themes && themes.length >= 1 ? themes[0]._id : null;
    }

    const themeId = initDefaultThemeId(state.themes, initialData);
    state.themeId = themeId;
    state.originalThemeId = themeId;
  },

  setCurrentScreen (state, screen) {
    state.currentScreen = screen;
  },

  /** protocol meta data */
  updateProtocolMetaInfo (state, obj) {
    Object.assign(state.protocol, obj);
    state.protocol.valid = Protocol.checkValidation(state.protocol);
  },

  updateThemeId (state, themeId) {
      state.themeId = themeId;
  },

  resetProtocol (state) {
    state.protocol = getInitialProtocol()
    state.original = null;
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
  },
}
