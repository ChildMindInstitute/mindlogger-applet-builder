import util from '../utilities/util';
export default class Item {
  constructor() {
    this.ref = null;
  }

  getItemBuilderData(initialItemData) {
    return {
        id: initialItemData._id || null,
        name: initialItemData.name || '',
        question: initialItemData.question || '',
        description: initialItemData.description || '',
        inputType: initialItemData.ui ? initialItemData.ui.inputType : '',
        options: initialItemData.options || [],
        responseOptions: initialItemData.responseOptions || {},
        inputOptions: initialItemData.inputOptions || {},
        media: initialItemData.media || {},
        textRules: [v => !!v || "This field is required"],
        inputTypes: [
          "radio",
          "text",
          "slider",
          "photo",
          "video",
          "timeRange",
          "date",
          "drawing",
          "audioRecord",
          "audioImageRecord",
          "geolocation",
          "audioStimulus"
        ]
    };
  }

  updateReferenceObject(ref) {
    this.ref = ref;
  }

  getSliderChoices() {
    const choices = [];
    for (let i = 1; i <= this.ref.options.numOptions; i++) {
        choices.push({
        "schema:name": i.toString(),
        "schema:value": i
        });
    }
    return choices;
  }

  getRadioChoices() {
    const choices =
        this.ref.options && this.ref.options.options
        ? this.ref.options.options.map((option, index) => {
            const choiceSchema = {
                "@type": "schema:option",
                "schema:name": option.name,
                "schema:value": index + 1
            };
            if (option.image) {
                choiceSchema["schema:image"] = option.image;
            }
            return choiceSchema;
            })
        : [];
    return choices;
  }

  getResponseOptions() {
    if (this.ref.inputType === "radio") {
        const choices = this.getRadioChoices();
        return {
        "@valueType": "xsd:anyURI",
        "multipleChoice": this.ref.options.isMultipleChoice,
        "schema:minValue": 1,
        "schema:maxValue": choices.length,
        choices: choices
        };
    }
    if (this.ref.inputType === "text") {
        return this.ref.options;
    }
    if (this.ref.inputType === "slider") {
        const choices = this.getSliderChoices();
        return {
        "@valueType": "xsd:integer",
        "schema:minValue": this.ref.options.minValue,
        "schema:maxValue": this.ref.options.maxValue,
        choices: choices
        };
    }
    if (this.ref.inputType === "date") {
        return {
        valueType: "xsd:date",
        requiredValue: true,
        "schema:maxValue": "new Date()"
        };
    }
    if (
        this.ref.inputType === "audioRecord" ||
        this.ref.inputType === "audioImageRecord"
    ) {
        return this.ref.options;
    } else {
        return {};
    }
  }

  getInputOptions() {
    if (this.ref.inputType === "audioStimulus") {
        return this.ref.inputOptions;
    }
    return {};
  }

  getMedia() {
    if (this.ref.inputType === "audioStimulus") {
        return this.ref.media;
    }
    return {};
  }

  getCompressedSchema() {
    const responseOptions = this.getResponseOptions();
    const inputOptions = this.getInputOptions();
    const media = this.getMedia();
    const schema = {
        "@context": [
        "https://raw.githubusercontent.com/jj105/reproschema-context/master/context.json"
        ],
        "@type": "reproschema:Field",
        "@id": this.ref.name,
        "skos:prefLabel": this.ref.name,
        "skos:altLabel": this.ref.name,
        "schema:description": this.ref.description,
        "schema:schemaVersion": "0.0.1",
        "schema:version": "0.0.1",
        ui: {
        inputType: this.ref.inputType
        },
    };
    if (Object.keys(responseOptions).length !== 0) {
        schema["responseOptions"] = responseOptions;
    }
    if (this.ref.inputType === "audioStimulus") {
        schema["inputOptions"] = inputOptions;
    }
    if (this.ref.inputType === "audioStimulus") {
        schema["media"] = media;
    }
    if (this.ref.inputType === 'radio') {
        if (this.ref.options.isMultipleChoice) {
        schema["ui"] = {
            "inputType": this.ref.inputType
        };
        } else {
        schema["ui"] = {
            "inputType": this.ref.inputType,
            "allow": [
            "autoAdvance"
            ]
        };
        }
    } else {
        schema["ui"] = {
        inputType: this.ref.inputType
        };
    }

    if (this.ref.id) {
        schema["_id"] = this.ref.id;
    }

    return schema;
  }

  getItemData() {
    const schema = this.getCompressedSchema();
    const itemObj = {
      name: this.ref.name,
      question: this.ref.question,
      description: this.ref.description,
      options: this.ref.options,
      isItemEditable: this.ref.isItemEditable,
      ...schema
    };

    if (
      (this.ref.inputType === "radio" ||
        this.ref.inputType === "text" ||
        this.ref.inputType === "slider" ||
        this.ref.inputType === "audioRecord" ||
        this.ref.inputType === "audioImageRecord" ||
        this.ref.inputType === "geolocation") &&
      Object.keys(this.ref.responseOptions).length
    ) {
      itemObj.responseOptions = this.ref.responseOptions;
    } else if (this.ref.inputType === "audioStimulus") {
      itemObj.inputOptions = this.inputOptions;
      itemObj.media = this.ref.media;
    }

    return itemObj;
  }

  static getHistoryTemplate(oldValue, newValue) {
    const radioOptionListUpdate = (field) => {
      const oldOptions = _.get(oldValue, field, []).map(option => option.name);
      const newOptions = _.get(newValue, field, []).map(option => option.name);

      const removedOptions = oldOptions.filter(option => newOptions.indexOf(option) < 0);
      const insertedOptions = newOptions.filter(option => oldOptions.indexOf(option) < 0);

      return [
        ...removedOptions.map(option => `${option} option was removed`),
        ...insertedOptions.map(option => `${option} option was inserted`)
      ];
    };
    const optionUpdate = name => field => 
          `${name} was ${_.get(newValue, field) ? 'enabled' : 'disabled'}`;
    const valueUpdate = name => field =>
          `${name} was updated to ${_.get(newValue, field)}`

    const valueInsert = name => field =>
          `${name} was set to ${_.get(newValue, field)}`;

    return {
      'skos:prefLabel': {
        updated: valueUpdate('Item name'),
        inserted: valueInsert('Item name')
      },
      'schema:description': {
        updated: (field) => `Item description was changed to ${_.get(newValue, field)}`,
        removed: (field) => `Item description was removed`,
        inserted: (field) => `Item description was added (${_.get(newValue, field)})`
      }, 
      'ui.inputType': {
        updated: valueUpdate('Input type'),
        inserted: valueInsert('Input type'),
      },
      'options.isMultipleChoice': {
        updated: optionUpdate('Multiple choice option'),
      },
      'options.options': {
        updated: radioOptionListUpdate,
      },
      'options.schema:minValue': {
        updated: valueUpdate('minValue'),
        inserted: valueInsert('minValue'),
      },
      'options.schema:maxValue': {
        updated: valueUpdate('maxValue'),
        inserted: valueInsert('maxValue'),
      },
      'options.minValue': {
        updated: valueUpdate('minValue'),
        inserted: valueInsert('minValue'),
      },
      'options.maxValue': {
        updated: valueUpdate('maxValue'),
        inserted: valueInsert('maxValue'),
      },
      'options.requiredValue': {
        updated: optionUpdate('Required option'),
      },
      'options.numOptions': {
        updated: valueUpdate('Scale value'),
        inserted: valueInsert('Scale value'),
      },
      'options.maxLength': {
        updated: valueUpdate('maxLength'),
        inserted: valueInsert('maxLength'),
      }
    }
  }

  static getChangeInfo(old, current) {
    const logTemplates = Item.getHistoryTemplate(old, current);
    const changeInfo = util.compareValues(old, current, Object.keys(logTemplates));

    const changeLog = [];

    Object.keys(changeInfo).forEach(key => {
      const changeType = changeInfo[key];
      let logs = [];

      if (logTemplates[key][changeType]) {
        logs = logTemplates[key][changeType](key);
      } else {
        logs = logTemplates[key]['updated'](key);
      }
      
      if (!Array.isArray(logs)) {
        logs = [logs];
      }

      logs.forEach(log => {
        changeLog.push({
          name: log,
          type: changeInfo[key]
        })
      })
    });

    return {
      log: changeLog,
      upgrade: changeLog.length ? '0.0.1' : '0.0.0',
    };
  }
}
