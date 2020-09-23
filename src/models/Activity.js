export default class Activity {
  constructor() {
    this.ref = null;
  }

  getActivityBuilderData(initialActivityData) {
    return {
        name: initialActivityData.name || '',
        description: initialActivityData.description || '',
        preamble: initialActivityData.preamble || '',
        shuffleActivityOrder: initialActivityData.shuffle || false,
        isSkippable: initialActivityData.isSkippable || false,
        items: initialActivityData.items || [],
        id: initialActivityData._id || null,
        textRules: [
          v => !!v || 'This field is required',
        ],
        editItemDialog: false,
        urlDialog: false,
        error: '',
        componentKey: 0,
        initialItemData: {
          options: {},
        },
        isItemEditable: true,
        editIndex: -1
    }
  }

  updateReferenceObject(ref) {
    this.ref = ref;
  }

  getItemVisibility() {
    const visibilityObj = {};
    this.ref.items.forEach(function(item) {
      visibilityObj[item.name] = true;
    });
    return visibilityObj;
  }

  getAddProperties() {
    const addProperties = [];
    this.ref.items.forEach(function(item) {
        const property = {
            "variableName": item.name,
            "isAbout": item.name,
            "isVis": true
        };
        addProperties.push(property);
    });
    return addProperties;
  }

  getItemOrder() {
    const itemNamesArray = this.ref.items.map(item => item.name)
    return itemNamesArray;
  }

  getAllowed() {
    return this.ref.isSkippable ? ["skipped"] : [];
  }

  getCompressedSchema() {
    const addProperties = this.getAddProperties();
    const visibility = this.getItemVisibility();
    const itemOrder = this.getItemOrder();
    const allowed = this.getAllowed();
    return {
        "@context": [ "https://raw.githubusercontent.com/jj105/reproschema-context/master/context.json"
        ],
        "@type": "reproschema:Activity",
        "_id": this.ref.id,
        "@id": this.ref.name,
        "skos:prefLabel": this.ref.name,
        "skos:altLabel": this.ref.name,
        "schema:description": this.ref.description,
        "schema:schemaVersion": "0.0.1",
        "schema:version": "0.0.1",
        "preamble": this.ref.preamble,
        "scoringLogic": {
        },
        "repronim:timeUnit": "yearmonthdate",
        "ui": {
            "order": itemOrder,
            "shuffle": this.ref.shuffleActivityOrder,
            "addProperties": addProperties,
            "allow": allowed
        }
    };
  }

  getContext() {
    const activityName = this.ref.name;
    const contextObj = {
        "@version": 1.1
    };
    var isPrefixNeeded = false;
    this.ref.items.forEach(function(item) {
        if ('iri' in item) {
        contextObj[item.name] = {
            '@id': item.iri,
            '@type': '@id',
        };
        } else {
        contextObj[item.name] = {
            '@id': `${activityName}:${item.name}`,
            '@type': '@id',
        };
        isPrefixNeeded = true;
        }
    });
    if (isPrefixNeeded) {
        contextObj[activityName] = `https://raw.githubusercontent.com/YOUR-PATH-TO-ITEM-FOLDER`;
    }

    return {
        "@context": contextObj
    };
  }

  getActivityData() {
    const schema = this.getCompressedSchema();
    const context = this.getContext();
    const items = this.ref.items;
    return {
      'name': this.ref.name,
      'description': this.ref.description,
      'preamble': this.ref.preamble,
      'shuffle': this.ref.shuffleActivityOrder,
      'isSkippable': this.ref.isSkippable,
      'schema': schema,
      'context': context,
      'items': items
    };
  }
};
