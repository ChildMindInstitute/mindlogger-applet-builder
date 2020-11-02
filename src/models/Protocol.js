import api from '../utilities/api';
import util from '../utilities/util';
import Activity from './Activity';
import _ from 'lodash';
import { version } from 'core-js';

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
    const activityDisplayNames = this.getActivityDisplayNames();
    const activityOrder = this.getActivityOrder();
    const activityVisibility = this.getActivityVisibility();
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
      "schema:schemaVersion": this.ref.protocolVersion,
      "schema:version": this.ref.protocolVersion,
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
        updated: (field) => `Protocol name was changed to ${_.get(newValue, field)}`,
      },
      'schema:description': {
        updated: (field) => `Protocol description was changed to ${_.get(newValue, field)}`,
        removed: (field) => `Protocol description was removed`,
        inserted: (field) => `Protocol description was added (${_.get(newValue, field)})`
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
}
