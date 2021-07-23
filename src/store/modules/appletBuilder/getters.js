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
  },

  themeId (state) {
    return state.themeId;
  }
};

export default {
  ...activityGetters,

  /** get formatted protocol data from current protocol state */
  formattedProtocol (state) {
    return Protocol.formattedProtocol(state.protocol);
  },

  protocol (state) {
    return state.protocol
  },

  formattedOriginalProtocol (state) {
    return state.original;
  },

  originalThemeId (state) {
    return state.originalThemeId;
  },

  itemTemplates (state) {
    return state.templates;
  },

  themes (state) {
    return state.themes;
  },

  currentScreen (state) {
    return state.currentScreen;
  },

  baseImageURL (state) {
    return state.baseImageURL;
  },

  itemInputTypes (state) {
    return state.itemInputTypes;
  },

  templateUpdateRequest (state) {
    return state.templateUpdateRequest;
  },

  versions (state) {
    return state.versions;
  }
}
