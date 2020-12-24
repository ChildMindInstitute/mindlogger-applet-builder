import util from '../utilities/util';
export default class Item {
  constructor() {
    this.ref = null;
  }

  static getQuesionInfo(question) {
    const imageRE = new RegExp(/[\r\n]*\!\[.*\]\(.*=.*\)[\r\n]*/i);
    const imageMatch = question.match(imageRE);
    
    const questionImage = imageMatch && imageMatch[0] || '';  // The image URL.
    const questionText = question.replace(imageRE, '');  // Remove the image from the question.

    return {
      image: questionImage,
      text: questionText
    }
  }

  getItemBuilderData(initialItemData) {
    return {
        id: initialItemData._id || null,
        name: initialItemData.name || '',
        question: Item.getQuesionInfo(initialItemData.question || ''),
        description: initialItemData.description || '',
        correctAnswer: initialItemData.correctAnswer || '',
        valueType: initialItemData.valueType || '',
        inputType: initialItemData.ui ? initialItemData.ui.inputType : '',
        options: initialItemData.options || [],
        allow: initialItemData.ui && initialItemData.ui.allow
          && (initialItemData.ui.allow.includes("dontKnow")
            || initialItemData.ui.allow.includes("dont_know_answer")),
        responseOptions: initialItemData.responseOptions || {},
        inputOptions: initialItemData.inputOptions || {},
        media: initialItemData.media || {},
        cumulativeScores: initialItemData.cumulativeScores  || [],
        textRules: [v => !!v || "This field is required"],
        nameRules: [
          v =>
            /^[a-zA-Z0-9-_]+$/.test(v) ||
            "Item name must be contain only alphanumeric symbols or underscore"
        ],
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
          "audioStimulus",
          "cumulativeScore"
        ],
        allowEdit: initialItemData.allowEdit === undefined ? true : initialItemData.allowEdit,
    };
  }

  updateReferenceObject(ref) {
    this.ref = ref;
  }

  getSliderChoices() {
    const choices = [];
    for (let i = 1; i <= this.ref.options.numOptions; i++) {
      let obj = {
        "schema:name": i.toString(),
        "schema:value": i
      };

      if (this.ref.options.hasScoreValue) {
        obj["schema:score"] = this.ref.options.scores[i-1];
      }

      choices.push(obj);
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
                "schema:value": option.value,
            };

            if (this.ref.options.hasScoreValue) {
              choiceSchema["schema:score"] = (option.score || 0);
            }

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
        "valueType": (this.ref.valueType.includes("token") || this.ref.options.isTokenValue) ? "xsd:token" : "xsd:anyURI",
        "scoring": this.ref.options.hasScoreValue,
        "multipleChoice": this.ref.options.isMultipleChoice,
        "schema:minValue": 1,
        "schema:maxValue": choices.length,
        choices: choices
      };
    }
    if (this.ref.inputType === "text") {
      return {
        'valueType': this.ref.options.type,
      }
      return this.ref.options;
    }
    if (this.ref.inputType === "slider") {
      const choices = this.getSliderChoices();
      return {
        "valueType": "xsd:integer",
        "scoring": this.ref.options.hasScoreValue,
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

  getCumulativeScores() {
    if (this.ref.inputType === 'cumulativeScore') {
      return this.ref.cumulativeScores.map(({ compute, messages }) => ({ compute, messages }));
    }
    return [];
  }

  getCompressedSchema() {
    const responseOptions = this.getResponseOptions();
    const inputOptions = this.getInputOptions();
    const media = this.getMedia();
    const cumulativeScores = this.getCumulativeScores();

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
          inputType: this.ref.inputType,
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

    if (this.ref.inputType === 'cumulativeScore') {
      schema['cumulativeScores'] = cumulativeScores;
    }
    if (this.ref.inputType === 'radio') {
      if (this.ref.options.isMultipleChoice) {
        schema["ui"] = {
          "inputType": this.ref.inputType
        };
      } else {
        schema["ui"] = {
            inputType: this.ref.inputType,
            allow: [
              "autoAdvance"
            ]
        };
      }
    } else {
      schema["ui"] = {
        inputType: this.ref.inputType
      };

      if (this.ref.inputType === "cumulativeScore") {
        schema["ui"]["allow"] = schema["ui"]["allow"] || [];
        schema["ui"]["allow"].push("disableBack");
      }
    }

    if (this.ref.id) {
        schema["_id"] = this.ref.id;
    }

    if (this.ref.allow) {
      if (!schema["ui"]["allow"]) {
        schema["ui"]["allow"] = []
      }
      schema["ui"]["allow"].push("dontKnow")
    }

    return schema;
  }

  getItemData() {
    const schema = this.getCompressedSchema();
    const itemObj = {
      name: this.ref.name,
      question: this.ref.question.image + this.ref.question.text,
      description: this.ref.description,
      options: this.ref.options,
      allowEdit: this.ref.allowEdit,
      ...schema
    };

    if (
      (this.ref.inputType === "radio" ||
        this.ref.inputType === "audioRecord" ||
        this.ref.inputType === "audioImageRecord" ||
        this.ref.inputType === "geolocation") &&
      Object.keys(this.ref.responseOptions).length
    ) {
      itemObj.responseOptions = itemObj.responseOptions || this.ref.responseOptions;
    } else if (this.ref.inputType === "audioStimulus") {
      itemObj.inputOptions = this.inputOptions;
      itemObj.media = this.ref.media;
    } else if (this.ref.inputType === "text") {
      itemObj.responseOptions = itemObj.responseOptions || this.ref.responseOptions;
      itemObj.correctAnswer = this.ref.correctAnswer;
    } else if (this.ref.inputType === "slider") {
      itemObj.options.minValue = itemObj.options.minValue || "Min";
      itemObj.options.maxValue = itemObj.options.maxValue || "Max";
      itemObj.options.numOptions = itemObj.options.numOptions || 5;
      itemObj.options.hasScoreValue = itemObj.options.hasScoreValue || false;
    }

    return itemObj;
  }

  static getHistoryTemplate(oldValue, newValue) {
    const radioOptionListUpdate = (field) => {
      const oldOptions = _.get(oldValue, field, []).map(({ name, value, score }) => {
        return {
          name,
          value,
          score
        }
      });
      const newOptions = _.get(newValue, field, []).map(({ name, value, score }) => {
        return {
          name,
          value,
          score
        }
      });

      const removedOptions = oldOptions.filter(option => {
        return newOptions.find(newOption => {
          return option.name === newOption.name && option.value === newOption.value && option.score === newOption.score
        }) ? false : true
      });
      const insertedOptions = newOptions.filter(newOption => {
        return oldOptions.find(option => {
          return option.name === newOption.name && option.value === newOption.value && option.score === newOption.score
        }) ? false : true
      });

      return [
        ...removedOptions.map(option => `${option.name} | ${option.value} option was removed`),
        ...insertedOptions.map(option => `${option.name} | ${option.value} option was inserted`)
      ];
    };

    const scoreUpdate = (field) => {
      const oldScore = _.get(oldValue, field, []);
      const newScore = _.get(newValue, field, []);

      const updates = [];

      let i;
      for ( i = 0; i < oldScore.length && newScore.length; i++) {
        if (oldScore[i] != newScore[i]) {
          updates.push(`score for ${i+1} is updated to ${newScore[i]}`);
        }
      }

      for ( ;i < oldScore.length || i< newScore.length; i++) {
        if (i < oldScore.length) {
          updates.push(`score for ${i+1} was removed`);
        }
        if (i < newScore.length) {
          updates.push(`score for ${i+1} was set to ${newScore[i]}`);
        }
      }

      return updates;
    }

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
        inserted: (field) => `Item description was set (${_.get(newValue, field)})`
      }, 
      'question': {
        updated: (field) => `Item Question was changed to ${this.getQuesionInfo(_.get(newValue, field)).text}`,
        removed: (field) => `Item Question was removed`,
        inserted: (field) => `Item Question was set to ${this.getQuesionInfo(_.get(newValue, field)).text}`,
      },
      'correctAnswer': {
        updated: (field) => `Correct answer was changed`
      }, 
      'ui.inputType': {
        updated: valueUpdate('Input type'),
        inserted: valueInsert('Input type'),
      },
      'ui.allow': {
        updated: optionUpdate('Skippable option'),
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
      'options.hasScoreValue': {
        updated: optionUpdate('Scoring option'),
      },
      'options.scores': {
        updated: scoreUpdate,
      },
      'options.maxLength': {
        updated: valueUpdate('maxLength'),
        inserted: valueInsert('maxLength'),
      },
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
