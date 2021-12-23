import api from '../utilities/api';
import util from '../utilities/util';
import Activity from './Activity';
import Item from './Item';
import _ from 'lodash';

export default class Protocol {
  constructor() {
    this.ref = null;
  }

  updateReferenceObject(ref) {
    this.ref = ref;
  }

  getVariableMap() {
    const variableMap = this.ref.activities.map((activity) => ({
      variableName: `${activity.name}_schema`,
      isAbout: `${activity.name}_schema`,
      prefLabel: activity.name,
      isVis: true,
    }));
    return variableMap;
  }

  getActivityOrder() {
    const activityNamesArray = this.ref.activities.map(
      (activity) => activity.name
    );
    return activityNamesArray;
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

  getCompressedSchema() {
    const variableMap = this.getVariableMap();
    const activityOrder = this.getActivityOrder();
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
      landingPageContent: this.ref.markdownData, //point to the readme of protocol
      landingPage: "",
      // variableMap: variableMap,
      ui: {
        addProperties: variableMap,
        order: activityOrder,
        shuffle: false,
      },
    };
    return schema;
  }

  getContext() {
    const contextObj = {
      "@version": 1.1,
      activity_path:
      "https://raw.githubusercontent.com/ReproNim/reproschema/master/activities/",
    };
    // this.ref.activities.forEach(function(activity) {
    //   contextObj[activity.name] = {
    //     "@id": `activity_path:${activity.name}/${activity.name}_schema`,
    //     "@type": "@id",
    //   };
    // });
    return {
      "@context": contextObj,
    };
  }

  getProtocolData() {
    let contexts = {};
    const protocol = {
      data: this.getCompressedSchema(),
      activities: {},
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
      'schema:description': {
        updated: (field) => `Applet description was changed to ${_.get(newValue, field)}`,
        removed: (field) => `Applet description was removed`,
        inserted: (field) => `Applet description was added (${_.get(newValue, field)})`
      },
    }
  }

  static getChangeInfo(old, current, getDataUpdates=false) {
    const {
      "data": oldData,
      "activities": oldActivities
    } = old.protocol;

    const {
      "data": currentData,
      "activities": currentActivities
    } = current.protocol;

    const logTemplates = Protocol.getHistoryTemplate(oldData, currentData);
    let versionUpgrade = '0.0.0';
    let updates = { activities: {} };
    let removed = {activities: [], items: []};

    const metaInfoChanges = util.compareValues(oldData, currentData, Object.keys(logTemplates));
    const activityChanges = util.compareIDs(oldActivities, currentActivities, 'data._id');

    const changeLog = Object.keys(metaInfoChanges).map(key => {
      return {
        name: logTemplates[key][metaInfoChanges[key]](key),
        type: metaInfoChanges[key],
      }
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
    })

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
      description: applet['schema:description'][0]['@value'],
      protocolVersion: _.get(applet, 'schema:schemaVersion[0].@value', this.protocolVersion)
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
    const { applet, activities, items, protocol } = data;

    let initialStoreData = {
      ... await Protocol.parseJSONLD(applet, protocol),
      valid: true,
      activities: [],
      tokenPrizeModal: false,
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
    })

    protocolModel.updateReferenceObject({
      ...protocol,
      activities
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
