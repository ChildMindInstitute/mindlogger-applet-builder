import Protocol from '../../../models/Protocol';
import Activity from '../../../models/Activity';
import Item from '../../../models/Item';
import CognitiveTasks from '../../cognitive-tasks';
import { getInitialProtocol } from './state';

const itemMutations = {
  updateItemMetaInfo (state, { index, obj }) {
    if (!state.currentActivity) {
      return ;
    }
    const item = state.currentActivity.items[index];

    Object.assign(item, obj);
    if (!Object.hasOwnProperty.call(obj, "valid"))
      item.valid = Item.checkValidation(item);

    for (const existing of state.currentActivity.items) {
      if (existing != item && existing.name == item.name && existing.valid) {
        item.valid = false;
        break;
      }
    }

    if (obj.name) {
      for (const subScale of state.currentActivity.subScales) {
        if (subScale.items.includes(item)) {
          subScale.jsExpression = subScale.items.map(
            item => item.variableName ? `(${item.variableName})` : item.name
          ).join(' + ');
        }
      }
    }
  },

  addTimeScreen (state, { index, screen }) {
    const obj = { ...screen };

    for (let suffix = 0; ; suffix++) {
      obj.name = `${screen.name}_${suffix}`;

      let exists = false;
      for (const item of state.currentActivity.items) {
        if (item.name == obj.name) {
          exists = true;
          break;
        }
      }

      if (!exists) break;
    }

    const model = new Item();
    const itemData = model.getItemBuilderData(obj);
    itemData.valid = Item.checkValidation(itemData);

    state.currentActivity.items[index].options.timeScreen = obj.name;
    state.currentActivity.items.splice(index, 0, itemData);
  },

  deleteTimeScreen (state, index) {
    const item = state.currentActivity.items[index];

    if (item.inputType == 'radio' && /time_screen/.test(item.name)) {
      state.currentActivity.items.splice(index, 1);
    }
  },

  transferItems (state, { target, items }) {
    for (const item of items) {
      if (state.protocol.activities[target].items.some(origin => origin.name == item.name)) {
        item.valid = false;
      }

      state.protocol.activities[target].items.push(item);
    }

    state.currentActivity.items = state.currentActivity.items.filter(
      item => items.indexOf(item) < 0
    );
  },

  removeScoresAndSubScals(state, { scores, subScales }) {
    state.currentActivity.items[state.currentActivity.items.length - 1].cumulativeScores = scores;
    state.currentActivity.subScales = subScales;
  },

  addItem (state, { index, obj }) {
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

    let lastIndex = index >= 0 ? index : state.currentActivity.items.findIndex(
      item => (!item.allowEdit && ['age_screen', 'gender_screen'].indexOf(item.name) >=0 ) || item.inputType == 'cumulativeScore' || item.inputType == 'tokenSummary'
    );

    if (!obj) {
      item.name = `Screen${lastIndex >= 0 ? lastIndex + 1 : state.currentActivity.items.length + 1}`;

      let suffix = 0, name = item.name;

      while (state.currentActivity.items.find(obj => obj.name == name)) {
        suffix++;
        name = `${item.name}__${suffix}`;
      }

      item.name = name;
    }

    const itemData = model.getItemBuilderData(item);
    itemData.valid = Item.checkValidation(itemData);

    if (lastIndex >= 0) {
      state.currentActivity.items.splice(lastIndex, 0, itemData);
    } else {
      state.currentActivity.items.push(itemData);
    }
  },

  updateTokenSummary (state, screen) {
    let behaviorTrackers = 0, hasTokenSummary = false;

    const itemData = new Item().getItemBuilderData(screen);
    itemData.valid = Item.checkValidation(itemData);

    for (const item of state.currentActivity.items) {
      if (['futureBehaviorTracker', 'pastBehaviorTracker'].includes(item.inputType)) {
        behaviorTrackers++;
      }

      if (item.inputType == 'tokenSummary') {
        hasTokenSummary = true;
      }
    }

    if (behaviorTrackers && !hasTokenSummary) {
      const index = state.currentActivity.items.findIndex(item => item.inputType == 'cumulativeScore')

      if (index >= 0) {
        state.currentActivity.items.splice(index, 0, itemData);
      } else {
        state.currentActivity.items.push(itemData);
      }
    }

    if (!behaviorTrackers && hasTokenSummary) {
      const index = state.currentActivity.items.findIndex(item => item.inputType == 'tokenSummary');
      state.currentActivity.items.splice(index, 1);
    }
  },

  showOrHideItem(state, index) {
    const isVis = !!state.currentActivity.items[index].isVis;
    state.currentActivity.items[index].isVis = !isVis;
  },

  showItem(state, index) {
    state.currentActivity.items[index].isVis = false;
  },

  updateHeader(state, {index, headerName}) {
    state.currentActivity.items[index].header = headerName;
  },

  updateSection(state, { index, sectionName }) {
    state.currentActivity.items[index].section = sectionName
  },

  duplicateItem(state, { appendToActivity = false, index }) {
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
      timestamp: Date.now()
    };

    if (appendToActivity) {
      state.currentActivity.items.push(newItem);
    } else {
      state.currentActivity.items.splice(index + 1, 0, newItem);
    }
  },

  deleteItem(state, index) {
    state.currentActivity.items.splice(index, 1);
  },

  updateItemList(state, items) {
    state.currentActivity.items = items;
  }
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
      const conditions = conditionalItem.conditions.map(condition => {
        let { ifValue } = condition;

        if (typeof ifValue == 'string' && ifValue.replace(/ /g, '_') === activity.name.replace(/ /g, '_')) {
          ifValue = `${activity.name} (${suffix})`;
        }

        return {
          ...condition,
          ifValue
        };
      });

      return {
        ...conditionalItem,
        conditions,
      };
    })

    const newActivity = {
      ...activity,
      id: null,
      name: `${activity.name} (${suffix})`,
      items: activity.items.map((item, index) => ({
        ...item,
        id: null,
        timestamp: Date.now() + index
      })),
      finalSubScale: { ...activity.finalSubScale },
      subScales: [...activity.subScales],
      conditionalItems,
      index: index+1,
      timestamp: Date.now()
    };

    activities.splice(index+1, 0, newActivity);

    for (let i = index+1; i < activities.length; i++) {
      activities[i].index = i;
    }
  },

  deleteActivity (state, index) {
    state.protocol.activities.splice(index, 1);
  },

  showOrHideActivity(state, index) {
    const isVis = !!state.protocol.activities[index].isVis;
    state.protocol.activities[index].isVis = !isVis;
  },

  showActivity(state, index) {
    state.protocol.activities[index].isVis = false;
  },

  addActivity(state, { index, type }) {
    const activityModel = new Activity;

    let content = { activityType: "NORMAL" };

    if (type) {
      const itemModel = new Item();

      content = JSON.parse(JSON.stringify(CognitiveTasks[type]));
      content.valid = true;
      content.items = content.items.map(item => itemModel.getItemBuilderData(item))

      const names = state.protocol.activities.map(activity => activity.name);

      let name = content.name, suffix = 0;
      while (names.includes(name)) {
        suffix++;
        name = `${content.name} (${suffix})`;
      }
      content.name = name;
    }

    const activity = {
      ...activityModel.getActivityBuilderData(content),
      index: index < 0 ? state.protocol.activities.length : index,
    };

    if (index >= 0) {
      state.protocol.activities.splice(index, 0, activity);

      for (let i = index + 1; i < state.protocol.activities.length; i++) {
        state.protocol.activities[i].index = i;
      }
    } else {
      state.protocol.activities.push(activity);
    }
  },

  updateActivityMetaInfo (state, obj) {
    if (obj.name && state.currentActivity.valid) {
      for (const existing of state.protocol.activities) {
        if (existing != state.currentActivity && existing.name == state.currentActivity.name) {
          existing.valid = Activity.checkValidation(existing);

          if (existing.valid) {
            break;
          }
        }
      }
    }

    Object.assign(state.currentActivity, obj);

    if (!obj.hasOwnProperty('valid'))
      state.currentActivity.valid = Activity.checkValidation(state.currentActivity);

    for (const existing of state.protocol.activities) {
      if (existing != state.currentActivity && existing.name == state.currentActivity.name && existing.valid) {
        state.currentActivity.valid = false;
        break;
      }
    }
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
  },

  updateActivityList(state, activities) {
    state.protocol.activities = activities;

    for (let i = 0; i < state.protocol.activities.length; i++) {
      state.protocol.activities[i].index = i;
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
    state.currentActivity.conditionalItems.splice(index, 1, {
      ...conditional,
      ...updates
    });
  },

  deleteConditional(state, index) {
    const conditionalItems = [...state.currentActivity.conditionalItems];

    conditionalItems.splice(index, 1);
    state.currentActivity.conditionalItems = [...conditionalItems];
  },

  deleteConditionals (state) {
    state.currentActivity.conditionalItems = [];
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

  setNodeEnv (state, nodeEnv) {
    state.nodeEnv = nodeEnv;
  },
}
