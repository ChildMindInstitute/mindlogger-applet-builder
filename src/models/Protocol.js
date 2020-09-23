import api from "../utilities/api";

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

  getCompressedSchema(version="1.0.0") {
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
      "schema:schemaVersion": version,
      "schema:version": version,
      landingPage: this.ref.description, //point to the readme of protocol
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
}
