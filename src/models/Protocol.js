import api from '../utilities/api';
import util from '../utilities/util';
import Activity from './Activity';
import ActivityFlow from './ActivityFlow';
import Item from './Item';
import _ from 'lodash';

export default class Protocol {
  constructor() {
    this.ref = null;
  }

  updateReferenceObject(ref) {
    this.ref = ref;
  }

  static getConvertedActivityName(name) {
    return name.replace(/\s/g, '__').replace(/[()/]/g, '');
  }

  getVariableMap(convertNames=false) {
    const variableMap = this.ref.activities.map((activity) => {
      const name = convertNames ? Protocol.getConvertedActivityName(activity.name) : activity.name;
      return {
        variableName: `${name}`,
        isAbout: `${name}`,
        prefLabel: activity.name,
        isVis: true,
      }
    })

    return variableMap;
  }

  getActivityOrder(convertNames=false) {
    const activityNamesArray = this.ref.activities.map(
      (activity) => convertNames ? Protocol.getConvertedActivityName(activity.name) : activity.name
    );
    return activityNamesArray;
  }

  getActivityFlowOrder() {
    return this.ref.activityFlows.map(actFlow => actFlow['@id']);
  }

  getActivityDisplayNames() {
    const displayNamesObj = {};
    this.ref.activities.forEach(function(activity) {
      displayNamesObj[activity.name] = activity.name;
    });
    return displayNamesObj;
  }

  getActivityVisibility() {
    const visibilityObj = {};
    this.ref.activities.forEach(function(activity) {
      visibilityObj[activity.name] = true;
    });
    return visibilityObj;
  }

  getCompressedSchema(convertNames = false) {
    const variableMap = this.getVariableMap(convertNames);
    const activityOrder = this.getActivityOrder(convertNames);
    const activityFlowProperties = this.ref.activityFlows.map(actFlow => {
      return {
        variableName: actFlow['@id'],
        isAbout: actFlow.description,
        prefLabel: actFlow.name,
        isVis: true
      }
    })
    const schema = {
      "@context": [
        "https://raw.githubusercontent.com/jj105/reproschema-context/master/context.json",
        "https://raw.githubusercontent.com/YOUR-PROTOCOL-CONTEXT-FILE",
      ],
      "@type": "reproschema:Protocol",
      "_id": this.ref.id,
      "@id": `${this.ref.name}_schema`,
      "skos:prefLabel": this.ref.name,
      "schema:description": this.ref.description,
      "schema:image": this.ref.image,
      "schema:watermark": this.ref.watermark,
      "schema:schemaVersion": this.ref.protocolVersion,
      "schema:version": this.ref.protocolVersion,
      "streamEnabled": this.ref.streamEnabled,
      "combineReports": this.ref.combineReports,
      landingPageContent: this.ref.markdownData, //point to the readme of protocol
      landingPageType: this.ref.landingPageType,
      landingPage: "",
      reportConfigs: this.getReportConfigs(),
      // variableMap: variableMap,
      ui: {
        addProperties: variableMap,
        order: activityOrder,
        shuffle: false,
      },
      activityFlows: {
        activityFlowProperties,
        activityFlowOrder: this.getActivityFlowOrder(),
      },
    };
    return schema;
  }

  getReportConfigs () {
    const config = this.ref.reportConfigs;
    return [
      {
        "schema:name": "serverIp",
        "schema:value": config.serverIp,
        "@type": "schema:Text"
      },
      {
        "schema:name": "publicEncryptionKey",
        "schema:value": config.publicEncryptionKey,
        "@type": "schema:Text"
      },
      {
        "schema:name": "emailRecipients",
        "schema:value": config.emailRecipients,
        "@type": "schema:List"
      },
      {
        "schema:name": "includeUserId",
        "schema:value": config.includeUserId,
        "@type": "schema:Boolean"
      },
      {
        "schema:name": "includeCaseId",
        "schema:value": config.includeCaseId,
        "@type": "schema:Boolean"
      },
      {
        "schema:name": "emailBody",
        "schema:value": config.emailBody,
        "@type": "schema:Text"
      }
    ]
  }

  getContext(includeActivityPath = false) {
    const contextObj = {
      "@version": 1.1,
      activity_path:
      "https://raw.githubusercontent.com/ReproNim/reproschema/master/activities/",
    };

    if (includeActivityPath) {
      this.ref.activities.forEach(function(activity) {
        const name = Protocol.getConvertedActivityName(activity.name);

        contextObj[name] = {
          "@id": `activity_path:${name}/${name}_schema`,
          "@type": "@id",
        };
      });
    }

    return {
      "@context": contextObj,
    };
  }

  getProtocolData() {
    let contexts = {};
    const protocol = {
      data: this.getCompressedSchema(),
      activities: {},
      activityFlows: {}
    };

    this.ref.activities.forEach((activity) => {
      protocol.activities[activity.name] = {
        data: activity.schema,
        items: {},
      };
      activity.items.forEach((item) => {
        protocol.activities[activity.name].items[item.name] = item;
      });
    });

    this.ref.activityFlows.forEach((activityFlow) => {
      protocol.activityFlows[activityFlow.name] = activityFlow;
    })

    return Promise.all(
      protocol.data["@context"].map(
        (contextURL, index) => {
          if (index === protocol.data["@context"].length - 1) {
            return Promise.resolve();
          }
          return api.getSchema(contextURL).then(resp => contexts[contextURL] = resp.data["@context"]);
        }
      )
    ).then(() => {
      const activityContext = this.getContext();
      const activityContextUrl  = protocol.data["@context"][protocol.data["@context"].length - 1];
      contexts[activityContextUrl] = activityContext["@context"];

      return {
        contexts,
        protocol
      }
    });
  }

  static getHistoryTemplate(oldValue, newValue) {
    return {
      'landingPageContent': {
        updated: (field) => `About page was changed}`,
      },
      'skos:prefLabel': {
        updated: (field) => `Applet name was changed to ${_.get(newValue, field)}`,
      },
      'schema:image': {
        updated: (field) => `Applet image was changed to ${_.get(newValue, field)}`,
        removed: (field) => `Applet image was removed`,
        inserted: (field) => `Applet image was added (${_.get(newValue, field)})`
      },
      'schema:watermark': {
        updated: (field) => `Applet watermark was changed to ${_.get(newValue, field)}`,
        removed: (field) => `Applet watermark was removed`,
        inserted: (field) => `Applet watermark was added (${_.get(newValue, field)})`
      },
      'streamEnabled': {
        updated: (field) => `streaming option was changed to ${_.get(newValue, field)}`,
        inserted: (field) => `streaming option was enabled`,
        removed: (field) => `streaming option was disabled`
      },
      'combineReports': {
        updated: (field) => `combine reports was changed to ${_.get(newValue, field)}`,
        inserted: (field) => `combine reports option was enabled`,
        removed: (field) => `combine reports option was disabled`
      },
      'schema:description': {
        updated: (field) => `Applet description was changed to ${_.get(newValue, field)}`,
        removed: (field) => `Applet description was removed`,
        inserted: (field) => `Applet description was added (${_.get(newValue, field)})`
      },
      'ui.order': {
        updated: (field, mapping) => {
          let newOrder = _.get(newValue, field, []);
          let oldOrder = _.get(oldValue, field, []).map(key => mapping[key] || key);

          newOrder = newOrder.filter(order => oldOrder.includes(order));
          oldOrder = oldOrder.filter(order => newOrder.includes(order));

          if (JSON.stringify(oldOrder) != JSON.stringify(newOrder)) {
            return 'order of activities has been updated';
          }

          return [];
        }
      },
      'reportConfigs': {
        updated: (field) => {
          const oldOptions = _.get(oldValue, field, []).map(option => {
            return { value: option['schema:value'], name: option['schema:name'] }
          });

          const newOptions = _.get(newValue, field, []).map(option => {
            return { value: option['schema:value'], name: option['schema:name'] }
          });

          const removedOptions = oldOptions.filter(option => {
            return newOptions.find(newOption => {
              return JSON.stringify(option) === JSON.stringify(newOption)
            }) ? false : true
          });

          const insertedOptions = newOptions.filter(newOption => {
            return oldOptions.find(option => {
              return JSON.stringify(option) === JSON.stringify(newOption)
            }) ? false : true
          });

          return [
            ...removedOptions.map(option => `${option.name} option was removed`),
            ...insertedOptions.map(option => `${option.name} option was inserted`),
          ];
        }
      }
    }
  }

  static getChangeInfo(old, current, getDataUpdates=false) {
    const {
      "data": oldData,
      "activities": oldActivities,
      "activityFlows": oldActivityFlows,
    } = old.protocol;

    const {
      "data": currentData,
      "activities": currentActivities,
      "activityFlows": currentActivityFlows,
    } = current.protocol;

    const logTemplates = Protocol.getHistoryTemplate(oldData, currentData);
    let versionUpgrade = '0.0.0';
    let updates = { activities: {}, activityFlows: {} };
    let removed = { activities: [], items: [], activityFlows: [] };

    const metaInfoChanges = util.compareValues(oldData, currentData, Object.keys(logTemplates));
    const activityChanges = util.compareIDs(oldActivities, currentActivities, 'data._id');
    const activityFlowChanges = util.compareIDs(oldActivityFlows, currentActivityFlows, '_id');
    const changeLog = [];
    Object.keys(metaInfoChanges).forEach(key => {
      let logs = logTemplates[key][metaInfoChanges[key]](key, activityChanges.keyReferences);

      if (!Array.isArray(logs)) {
        logs = [logs];
      }

      logs.forEach(log => {
        changeLog.push({
          name: log,
          type: metaInfoChanges[key],
        })
      })
    });

    const result = [];

    /** log protocol metadata changes */

    if (changeLog.length) {
      result.push({
        name: 'protocol metadata',
        children: changeLog,
      })

      versionUpgrade = '0.0.1';
    }

    const activityLogs = [];
    const activityFlowLogs = [];

    if (activityChanges.inserted.length || activityChanges.removed.length) {
      versionUpgrade = '1.0.0';
    }

    /** display log for updated activities */
    Object.entries(activityChanges.keyReferences).forEach(entry => {
      const changeLog = Activity.getChangeInfo(oldActivities[entry[0]], currentActivities[entry[1]], getDataUpdates);

      if (versionUpgrade < changeLog.upgrade) {
        versionUpgrade = changeLog.upgrade;
      }

      if (changeLog.upgrade !== '0.0.0') {
        activityLogs.push({
          name: `activity ${currentActivities[entry[1]]['data']['skos:prefLabel']} was updated`,
          type: 'updated',
          children: changeLog.log
        });

        if (getDataUpdates) {
          updates.activities[entry[1]] = changeLog.updates;
          removed.items.push(...changeLog.removed);
        }
      }
    });

    if (activityFlowChanges.inserted.length || activityFlowChanges.removed.length) {
      versionUpgrade = '1.0.0';
    }
    /** display log for updated activity flows */
    Object.entries(activityFlowChanges.keyReferences).forEach(entry => {
      const changeLog = ActivityFlow.getChangeInfo(oldActivityFlows[entry[0]], currentActivityFlows[entry[1]], getDataUpdates);
      if (versionUpgrade < changeLog.upgrade) {
        versionUpgrade = changeLog.upgrade;
      }

      if (changeLog.upgrade !== '0.0.0') {
        activityFlowLogs.push({
          name: `Activity Flow ${currentActivityFlows[entry[1]]['name']} was updated`,
          type: 'updated',
          children: changeLog.log
        });

        if (getDataUpdates) {
          updates.activityFlows[entry[1]] = changeLog.updates;
        }
      }
    });

    /** display log for new activities */
    activityChanges.inserted.forEach(id => {
      const changeLog = Activity.getChangeInfo({ data: {}, items: {} }, currentActivities[id], getDataUpdates);

      activityLogs.push({
        name: `activity ${currentActivities[id]['data']['skos:prefLabel']} was inserted`,
        type: 'inserted',
        children: changeLog.log
      });

      if (getDataUpdates) {
        updates.activities[id] = changeLog.updates;
      }
    });

    /** display log for new activity flows */
    activityFlowChanges.inserted.forEach(id => {
      const changeLog = ActivityFlow.getChangeInfo({ data: {}, items: {} }, currentActivityFlows[id], getDataUpdates);

      activityFlowLogs.push({
        name: `Activity Flow ${currentActivityFlows[id]['name']} was inserted`,
        type: 'inserted',
        children: changeLog.log
      });

      if (getDataUpdates) {
        updates.activityFlows[id] = changeLog.updates;
      }
    });

    /** display log for removed activities */
    activityChanges.removed.forEach(id => {
      activityLogs.push({
        name: `activity ${oldActivities[id]['data']['skos:prefLabel']} was removed`,
        type: 'removed',
        children: []
      })

      if (getDataUpdates) {
        removed.activities.push(oldActivities[id].data._id);
        removed.items.push(...Object.values(oldActivities[id].items).map(item => item._id))
      }
    });

    /** display log for removed activities */
    activityFlowChanges.removed.forEach(id => {
      activityFlowLogs.push({
        name: `activity ${oldActivityFlows[id]['name']} was removed`,
        type: 'removed',
        children: []
      })

      if (getDataUpdates) {
        removed.activityFlows.push(oldActivityFlows[id]._id);
      }
    });

    if (versionUpgrade !== '0.0.0' && getDataUpdates) {
      updates.data = currentData;
    }

    /** log activity changes */
    if (activityLogs.length) {
      result.push({
        name: 'activities',
        children: activityLogs
      });
    }

    /** insert id in the result data */
    const que = [result];
    let id = 0;
    while (que.length > 0) {
      const head = que.shift();

      if (!Array.isArray(head)) {
        head.id = id;
        id++;
        if (head.children) {
          que.push(head.children);
        }
      } else {
        head.forEach(value => que.push(value));
      }
    }

    return {
      log: result,
      upgrade: versionUpgrade,
      updates,
      removed
    };
  }

  static async parseJSONLD(applet, protocol) {
    const prefLabel = applet['http://www.w3.org/2004/02/skos/core#prefLabel'];
    const protocolInfo = {
      id: protocol._id.split('/')[1],
      name: _.get(prefLabel, [0, '@value'], 'applet'),
      appletId: applet['_id'].split("/").pop(),
      image: applet['schema:image'],
      watermark: _.get(applet, ['schema:watermark', 0, '@id']),
      streamEnabled: _.get(applet, ['reprolib:terms/streamEnabled', 0, '@value']),
      combineReports: _.get(applet, ['reprolib:terms/combineReports', 0, '@value']),
      description: applet['schema:description'][0]['@value'],
      protocolVersion: _.get(applet, 'schema:schemaVersion[0].@value', this.protocolVersion),
      landingPageType: _.get(applet, ['reprolib:terms/landingPageType', 0, '@value'], 'markdown'),
      activityFlowOrder: _.get(applet, ['reprolib:terms/activityFlowOrder', 0, '@list']).map(orderItem => orderItem['@id']),
      order: _.get(applet, ['reprolib:terms/order', 0, '@list']).map(orderItem => orderItem['@id']),
      reportConfigs: _.get(applet, ['reprolib:terms/reportConfigs', 0, '@list'], []).reduce((configs, option) => {
        const name = _.get(option, ['schema:name', 0, '@value']);
        const type = _.get(option, ['@type', 0]);

        let value = _.get(option, ['schema:value'], []).map(item => item['@value']);
        if (type != 'schema:List') {
          value = value[0];
        }

        if (value !== undefined) {
          return {
            ...configs,
            [name]: value
          }
        }

        return configs;
      }, {
        serverIp: '',
        publicEncryptionKey: '',
        emailRecipients: [],
        includeUserId: false,
        includeCaseId: false,
        emailBody: ''
      })
    };

    const markdownData = _.get(applet, ["reprolib:terms/landingPage", 0, "@value"], "");
    if (markdownData) {
      try {
        protocolInfo.markdownData = (await axios.get(markdownData)).data;
      } catch (e) {
        protocolInfo.markdownData = '';
      }
    } else {
      protocolInfo.markdownData = _.get(applet, ["reprolib:terms/landingPageContent", 0, "@value"], "");
    }

    return protocolInfo;
  }

  static async parseApplet(data) {
    const { applet, activities, activityFlows, items, protocol } = data;
    let initialStoreData = {
      ... await Protocol.parseJSONLD(applet, protocol),
      valid: true,
      activities: [],
      activityFlows: [],
      tokenPrizeModal: false,
    };

    const activityModel = new Activity();
    const activityFlowModel = new ActivityFlow();
    const itemModel = new Item();
    const activityIds = Object.keys(activities);

    initialStoreData.order.map((id, i) => {
      const act = activities[id] || activities[activityIds[i]];

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

    initialStoreData.activityFlowOrder.map((id, i) => {
      const activityFlow = activityFlows[id];
      const activityFlowInfo = ActivityFlow.parseJSONLD(activityFlow);
      const builderData = activityFlowModel.getActivityFlowBuilderData({
        ...activityFlowInfo
      });

      initialStoreData.activityFlows.push(builderData);
    });

    initialStoreData.prizeActivity = initialStoreData.activities.find(activity => activity.isPrize);
    return initialStoreData;
  }

  static formattedProtocol(protocol) {
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
    });
    const activityFlows = protocol.activityFlows.map(activityFlow => {
      const activityFlowModel = new ActivityFlow();

      activityFlowModel.updateReferenceObject({
        ...activityFlow
      });

      return activityFlowModel.getActivityFlowData();
    })

    protocolModel.updateReferenceObject({
      ...protocol,
      activities,
      activityFlows
    });

    return protocolModel.getProtocolData();
  }

  static async getBuilderFormat(applet, upgradeVersion=false) {
    const protocol = await Protocol.parseApplet(applet)
    const builderData = await Protocol.formattedProtocol(protocol);

    if (upgradeVersion) {
      builderData.protocol.data[
        'schema:schemaVersion'
      ] = builderData.protocol.data['schema:version'] = util.upgradeVersion(
        builderData.protocol.data['schema:version'],
        '0.0.1'
      );
    }

    return builderData;
  }

  static checkValidation(protocol) {
    if (!protocol.name) {
      return false;
    }

    return true;
  }
}
