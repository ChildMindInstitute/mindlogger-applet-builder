import util from '../utilities/util';

export default class ActivityFlow {
  constructor() {
    this.ref = null;
  }

  getActivityFlowBuilderData(initialActivityData) {
    const valid = initialActivityData.valid;

    return {
      name: initialActivityData.name || '',
      description: initialActivityData.description || '',
      id: initialActivityData._id || null,
      textRules: [(v) => !!v || 'This field is required'],
      order: initialActivityData.orderList || [],
      isVis: initialActivityData.isVis || false,
      combineReports: initialActivityData.combineReports || false,
      reportIncludeItem: initialActivityData.reportIncludeItem || '',
      showBadge: initialActivityData.showBadge || true,
      error: '',
      componentKey: 0,
      isItemEditable: true,
      editIndex: -1,
      valid: valid !== undefined ? valid : true,
      timestamp: Date.now()
    };
  }

  updateReferenceObject(ref) {
    this.ref = ref;
  }

  getAddProperties(activityFlowOrder) {
    return activityFlowOrder.map((activityFlow) => {
      return {
        variableName: activityFlow.name,
        isAbout: activityFlow.description,
        prefLabel: activityFlow.name,
        isVis: true,
      };
    });
  }

  getContext() {
    return {
      '@context': {
        '@version': 1.1,
      },
    };
  }

  // getCompressedSchema() {
  //   return {
  //     '@context': [
  //       'https://raw.githubusercontent.com/jj105/reproschema-context/master/context.json',
  //     ],
  //     _id: this.ref.id,
  //     '@id': this.ref.name,
  //     '@type': 'reproschema:ActivityFlow',
  //     'schema:description': this.ref.description,
  //     name: this.ref.name,
  //     combineReports: false,
  //     showBadge: false,
  //     order: this.ref.order
  //   };
  // }

  getActivityFlowData() {
    return {
      '@context': [
        'https://raw.githubusercontent.com/jj105/reproschema-context/master/context.json'
      ],
      '@id': this.ref.name.replace(/\s/g, '_'),
      '@type': 'reproschema:ActivityFlow',
      'name': this.ref.name,
      'description': this.ref.description,
      'combineReports': this.ref.combineReports,
      'reportIncludeItem': this.ref.reportIncludeItem,
      'showBadge': this.ref.showBadge,
      'order': this.ref.order,
      'isVis': this.ref.isVis,
      '_id': this.ref.id,
    };
  }

  static getHistoryTemplate(oldValue, newValue) {
    return {
      'name': {
        updated: (field) =>
          `ActivityFlow name was changed to ${_.get(newValue, field)}`,
        inserted: (field) => `ActivityFlow name set to ${_.get(newValue, field)}`,
      },
      'description': {
        updated: (field) =>
          `ActivityFlow description was changed to ${_.get(newValue, field)}`,
        removed: (field) => `ActivityFlow description was removed`,
        inserted: (field) =>
          `ActivityFlow description was added (${_.get(newValue, field)})`,
      },
      'combineReports': {
        updated: (field) =>
          `ActivityFlow combineReports was changed to ${_.get(newValue, field)}`,
      },
      'showBadge': {
        updated: (field) =>
          `ActivityFlow showBadge was changed to ${_.get(newValue, field)}`,
      },
      'reportIncludeItem': {
        updated: (field) =>
          `Item value option is updated in activity report`
      },
      'isVis': {
        updated: (field) =>
          `ActivityFlow visibility was changed to ${_.get(newValue, field)}`
      },
      'order': {
        updated: (field) => {
          const oldOrder = _.get(oldValue, field, []);
          const newOrder = _.get(newValue, field, []);

          if (JSON.stringify(oldOrder) != JSON.stringify(newOrder)) {
            return ['order of activities has been updated']
          }

          return [];
        }
      },
    }
  }

  static getChangeInfo(oldData, currentData, getDataUpdates = false) {
    const logTemplates = ActivityFlow.getHistoryTemplate(oldData, currentData);
    const metaInfoChanges = util.compareValues(
      oldData,
      currentData,
      Object.keys(logTemplates)
    );

    const result = [];
    let versionUpgrade = '0.0.0';
    let updates = {};
    let removed = [];

    const changeLog = [];

    Object.keys(metaInfoChanges).forEach((key) => {
      const changeType = metaInfoChanges[key];
      let logs = [];

      if (logTemplates[key][changeType]) {
        logs = logTemplates[key][changeType](key);
      } else {
        logs = logTemplates[key]['updated'](key);
      }

      if (!Array.isArray(logs)) {
        logs = [logs];
      }

      logs.forEach((log) => {
        changeLog.push({
          name: log,
          type: metaInfoChanges[key],
        });
      });
    });

    /** log activity metadata changes */

    if (changeLog.length) {
      result.push({
        name: 'activityflow metadata',
        children: changeLog,
      });

      versionUpgrade = '0.0.1';
    }

    if (versionUpgrade !== '0.0.0' && getDataUpdates) {
      updates = { ...currentData };
    }

    return {
      log: result,
      upgrade: versionUpgrade,
      updates,
      removed,
    };
  }

  static parseJSONLD(activityFlowObj) {
    const {
      ['_id']: id,
      ['schema:name']: name,
      ['schema:description']: description,
      ['reprolib:terms/combineReports']: combineReports,
      ['reprolib:terms/reportIncludeItem']: reportIncludeItem,
      ['reprolib:terms/showBadge']: showBadge,
      ['reprolib:terms/order']: orders,
    } = activityFlowObj;

    const activityInfo = {
      _id: id && id.split('/')[1],
      name:
        name && name[0] && name[0]['@value'],
      description:
        description && description[0] && description[0]['@value'],
      combineReports:
        combineReports && combineReports[0] && combineReports[0]['@value'],
      reportIncludeItem:
        reportIncludeItem && reportIncludeItem[0] && reportIncludeItem[0]['@value'],
      showBadge:
        showBadge && showBadge[0] && showBadge[0]['@value'],
      orderList: _.get(orders, '0.@list', []).map(order => order['@id'])
    };

    activityInfo.valid = true;

    return activityInfo;
  }

  static checkValidation(activityFlow) {
    if (!activityFlow.name || !activityFlow.description) {
      return false;
    }

    if (!activityFlow.order.length) {
      return false;
    }

    return true;
  }
}
