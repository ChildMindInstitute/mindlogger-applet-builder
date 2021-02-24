import util from '../utilities/util';
export default class Item {
  constructor() {
    this.ref = null;
  }

  static getQuesionInfo(question) {
    const imageRE = new RegExp(/[\r\n]*\!\[.*\]\(.*=.*\)[\r\n]*/i);
    const imageUrlRE = new RegExp(/\h([^ =]+)/i);
    const imageMatch = question.match(imageUrlRE);

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
        inputOptions: initialItemData.inputOptions || [],
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
          "markdownMessage",
          "cumulativeScore"
        ],
        allowEdit: initialItemData.allowEdit === undefined ? true : initialItemData.allowEdit,
        markdownText: (initialItemData.question || ''),
        isOptionalText: initialItemData.isOptionalText || false,
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

      if (this.ref.options.minValueImg && i === 1)
        obj["schema:image"] = this.ref.options.minValueImg;
      
      if(this.ref.options.maxValueImg && i === this.ref.options.numOptions)
        obj["schema:image"] = this.ref.options.maxValueImg;

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
                "schema:description": option.description,
            };

            if(this.ref.inputType === "prize")
              choiceSchema["schema:price"] = option.price;

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
    if (this.ref.inputType === "radio" || this.ref.inputType === "prize") {
      const choices = this.getRadioChoices();
      return {
        "valueType": (this.ref.valueType.includes("token") || this.ref.options.isTokenValue) ? "xsd:token" : "xsd:anyURI",
        "scoring": this.ref.options.hasScoreValue,
        "responseAlert": this.ref.options.hasResponseAlert,
        "multipleChoice": this.ref.options.isMultipleChoice,
        "responseAlertMessage": this.ref.options.responseAlertMessage,
        "schema:minValue": 1,
        "schema:maxValue": choices.length,
        "isOptionalTextRequired": this.ref.responseOptions.isOptionalTextRequired,
        choices: choices
      };
    }
    if (this.ref.inputType === "text") {
      return {
        'valueType': this.ref.options.valueType || this.ref.valueType,
        'requiredValue': this.ref.options.requiredValue,
      }
    }
    if (this.ref.inputType === "slider") {
      const choices = this.getSliderChoices();
      return {
        "valueType": "xsd:integer",
        "scoring": this.ref.options.hasScoreValue,
        "responseAlert": this.ref.options.hasResponseAlert,
        "responseAlertMessage": this.ref.options.responseAlertMessage,
        "schema:minValue": this.ref.options.minValue,
        "schema:maxValue": this.ref.options.maxValue,
        "schema:minValueImg": this.ref.options.minValueImg,
        "schema:maxValueImg": this.ref.options.maxValueImg,
        "showTickMarks": this.ref.options.showTickMarks,
        "isOptionalTextRequired": this.ref.responseOptions.isOptionalTextRequired,
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
    if (this.ref.inputType === "audioImageRecord" || this.ref.inputType === "drawing" || this.ref.inputType === "geolocation" || this.ref.inputType === "photo") {
      return this.ref.responseOptions;
    }
    if (this.ref.inputType === "audioRecord") {
        this.ref.options.isOptionalTextRequired = this.ref.responseOptions.isOptionalTextRequired;
        return this.ref.options;
    } else {
        return {};
    }
  }

  getCumulativeScores() {
    if (this.ref.inputType === 'cumulativeScore') {
      return this.ref.cumulativeScores.map(({ compute, messages }) => ({ compute, messages }));
    }
    return [];
  }

  getCompressedSchema() {
    const responseOptions = this.getResponseOptions();
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

    if (this.ref.inputType === 'cumulativeScore') {
      schema['cumulativeScores'] = cumulativeScores;
    }
    if (this.ref.inputType === 'radio' || this.ref.inputType === 'prize') {
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
    const schema = this.getCompressedSchema()
    const itemObj = {
      name: this.ref.name,
      question: 
        this.ref.inputType !== 'markdownMessage'
        ? this.ref.question.image ? `\r\n\r\n![''](${this.ref.question.image} =250x250)\r\n\r\n${this.ref.question.text}` : this.ref.question.text
        : this.ref.markdownText,
      description: this.ref.description,
      options: this.ref.options,
      isOptionalText: this.ref.isOptionalText,
      allowEdit: this.ref.allowEdit,
      ...schema
    };

    if (
      (this.ref.inputType === "radio" ||
        this.ref.inputType === "prize" ||
        this.ref.inputType === "audioRecord") &&
      Object.keys(this.ref.responseOptions).length
    ) {
      itemObj.responseOptions = itemObj.responseOptions || this.ref.responseOptions;
    }

    else if(this.ref.inputType === "drawing") {
      itemObj.inputOptions = this.ref.inputOptions;
    }

    else if(this.ref.inputType === "audioImageRecord") {
      if(!itemObj.responseOptions['schema:image']) {
        // default image
        itemObj.responseOptions['schema:image'] = 'https://www.dropbox.com/s/wgtjq3bgqlfhbzd/map3g.png?raw=1';
      }
    }

    else if (this.ref.inputType === "audioStimulus") {
      itemObj.inputOptions = this.ref.inputOptions;
      itemObj.media = this.ref.media;
    }
    else if (this.ref.inputType === "text") {
      itemObj.responseOptions = itemObj.responseOptions || this.ref.responseOptions;
      itemObj.correctAnswer = this.ref.correctAnswer;
    } else if (this.ref.inputType === "slider") {
      itemObj.options.minValue = itemObj.options.minValue || "Min";
      itemObj.options.minValueImg = itemObj.options.minValueImg || "";
      itemObj.options.maxValue = itemObj.options.maxValue || "Max";
      itemObj.options.showTickMarks = itemObj.options.showTickMarks || false;
      itemObj.options.maxValueImg = itemObj.options.maxValueImg || "";
      itemObj.options.numOptions = itemObj.options.numOptions || 5;
      itemObj.options.hasScoreValue = itemObj.options.hasScoreValue || false;
      itemObj.options.hasResponseAlert = itemObj.options.hasResponseAlert || false;
    }

    console.log(itemObj);
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

    const allowListUpdate = (field) => {
      const oldAllowList = _.get(oldValue, field, []);
      const newAllowList = _.get(newValue, field, []);

      const updates = [];

      oldAllowList.forEach(oldAllow => {
        if (newAllowList.indexOf(oldAllow) < 0) {
          updates.push(
            `${oldAllow == 'dontKnow' ? 'Skippable Option' : oldAllow} was disabled`
          )
        }
      });

      newAllowList.forEach(newAllow => {
        if (oldAllowList.indexOf(newAllow) < 0) {
          updates.push(
            `${newAllow == 'dontKnow' ? 'Skippable Option' : newAllow} was enabled`
          )
        }
      });

      return updates;
    }

    const optionUpdate = name => field => 
          `${name} was ${_.get(newValue, field) ? 'enabled' : 'disabled'}`;
    const valueUpdate = name => field =>
          `${name} was updated to ${_.get(newValue, field)}`

    const valueInsert = name => field =>
          `${name} was set to ${_.get(newValue, field)}`;

    const inputOptionsListUpdate = (field) => {

      const oldOptions = _.get(oldValue, field, []).map(option => {
        return { value: option['schema:value'] }
      });

      const newOptions = _.get(newValue, field, []).map(option => {
        return { value: option['schema:value'] }
      });

      const removedOptions = oldOptions.filter(option => {
        return newOptions.find(newOption => {
          return option.value === newOption.value
        }) ? false : true
      });

      const insertedOptions = newOptions.filter(newOption => {
        return oldOptions.find(option => {
          return option.value === newOption.value
        }) ? false : true
      });

      return [
        ...removedOptions.map(option => `${option.value} option was removed`),
        ...insertedOptions.map(option => `${option.value} option was inserted`)
      ];
    };

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
        updated: (field) => 
          _.get(newValue, 'ui.inputType') !== 'markdownMessage'
            ? `Item Question was changed to ${this.getQuesionInfo(_.get(newValue, field)).text}`
            : `Markdown message was updated`,
        removed: (field) => `Item Question was removed`,
        inserted: (field) => 
          _.get(newValue, 'ui.inputType') !== 'markdownMessage'
            ? `Item Question was set to ${this.getQuesionInfo(_.get(newValue, field)).text}`
            : `Markdown message was inserted`,
      },
      'correctAnswer': {
        updated: (field) => `Correct answer was changed`
      }, 
      'isOptionalText': {
        updated: optionUpdate('Optional text option'),
      }, 
      'ui.inputType': {
        updated: valueUpdate('Input type'),
        inserted: valueInsert('Input type'),
      },
      'ui.allow': {
        updated: allowListUpdate,
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
      'options.minValueImg': {
        updated: valueUpdate('minValueImg'),
        inserted: valueInsert('minValueImg'),
      },
      'options.maxValueImg': {
        updated: valueUpdate('maxValueImg'),
        inserted: valueInsert('maxValueImg'),
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
      'options.hasResponseAlert': {
        updated: optionUpdate('Response Alert'),
      },
      'options.responseAlertMessage': {
        updated: valueUpdate('Alert Message'),
      },
      'options.scores': {
        updated: scoreUpdate,
      },
      'options.maxLength': {
        updated: valueUpdate('maxLength'),
        inserted: valueInsert('maxLength'),
      },
      'responseOptions.requiredValue': {
        updated: optionUpdate('Required option'),
      },
      'responseOptions.isOptionalTextRequired': {
        updated: optionUpdate('Optional text required option'),
      },
      'responseOptions.showTickMarks': {
        updated: optionUpdate('Show tick marks'),
      },
      'responseOptions.schema:minValue': {
        updated: valueUpdate('minValue'),
        inserted: valueInsert('minValue'),
      },
      'responseOptions.schema:maxValue': {
        updated: valueUpdate('maxValue'),
        inserted: valueInsert('maxValue'),
      },
      'responseOptions.schema:image': {
        updated: valueUpdate('Image'),
        inserted: valueInsert('Image'),
      },
      'inputOptions': {
        updated: inputOptionsListUpdate
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
