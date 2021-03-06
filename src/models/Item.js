import util from '../utilities/util';
export default class Item {
  constructor() {
    this.ref = null;
  }

  static getQuesionInfo(question) {
    const imageRE = new RegExp(/[\r\n]*\!\[.*\]\(.*=.*\)[\r\n]*/i);
    const imageUrlRE = new RegExp(/\http([^ =]+)/i);
    const imageMatch = question.match(imageUrlRE);

    const questionImage = imageMatch && imageMatch[0] || '';  // The image URL.
    const questionText = question.replace(imageRE, '');  // Remove the image from the question.

    return {
      image: questionImage,
      text: questionText
    }
  }

  getItemBuilderData(initialItemData) {
    const question = Item.getQuesionInfo(initialItemData.question || '');
    let inputType = initialItemData.ui ? initialItemData.ui.inputType : '';

    if (inputType == 'radio' && initialItemData.options.isMultipleChoice) {
      inputType = 'checkbox';
    }

    if (inputType == 'stackedRadio' && initialItemData.options.isMultipleChoice) {
      inputType = 'stackedCheckbox';
    }

    const parsedData = {
      id: initialItemData._id || null,
      name: initialItemData.name || '',
      question,
      description: initialItemData.description || '',
      correctAnswer: initialItemData.correctAnswer || '',
      valueType: initialItemData.valueType || '',
      inputType,
      options: initialItemData.options || {},
      allow: initialItemData.ui && initialItemData.ui.allow
        && (initialItemData.ui.allow.includes("dontKnow")
          || initialItemData.ui.allow.includes("dont_know_answer")),
      responseOptions: initialItemData.responseOptions || {},
      inputOptions: initialItemData.inputOptions || [],
      media: initialItemData.media || {},
      cumulativeScores: initialItemData.cumulativeScores  || [],
      allowEdit: initialItemData.allowEdit === undefined ? true : initialItemData.allowEdit,
      markdownText: (initialItemData.question || ''),
      valid: initialItemData.valid === undefined ? true : initialItemData.valid,
      isOptionalText: initialItemData.isOptionalText || false,
    };

    const model = new Item();
    model.updateReferenceObject(parsedData);

    parsedData.responseOptions = model.getResponseOptions()

    return parsedData;
  }

  updateReferenceObject(ref) {
    this.ref = ref;
  }

  getSliderChoices(slider, hasScoreValue) {
    const choices = [];
    for (let i = slider.minSliderTick; i <= slider.maxSliderTick; i++) {
      let obj = {
        "schema:name": i.toString(),
        "schema:value": i
      };

      if (hasScoreValue) {
        obj["schema:score"] = slider.scores[i - slider.minSliderTick];
      }

      if (slider.minValueImg && i === 1)
        obj["schema:image"] = slider.minValueImg;
      
      if(slider.maxValueImg && i == slider.maxSliderTick)
        obj["schema:image"] = slider.maxValueImg;

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
    if (this.ref.inputType === 'stackedRadio' || this.ref.inputType === 'stackedCheckbox') {
      return {
        "valueType": (this.ref.valueType.includes("token") || this.ref.options.isTokenValue) ? "xsd:token" : "xsd:anyURI",
        "scoring": this.ref.options.hasScoreValue,
        "responseAlert": this.ref.options.hasResponseAlert,
        "multipleChoice": this.ref.options.isMultipleChoice,
        "responseAlertMessage": this.ref.options.responseAlertMessage,
        "options": this.ref.options.options.map(option => ({
          "schema:description": option.description,
          "schema:image": option.image,
          "schema:name": option.name
        })),
        "itemList": this.ref.options.itemList && this.ref.options.itemList.map(item => ({
          "schema:description": item.description,
          "schema:image": item.image,
          "schema:name": item.name
        })) || [],
        "itemOptions": this.ref.options.choices && this.ref.options.choices.map(choices => choices.map(choice => {
          const info = {};
          if (this.ref.options.isTokenValue) {
            info['schema:value'] = Number(choice.value);
          }
          if (this.ref.options.hasScoreValue) {
            info['schema:score'] = Number(choice.score);
          }

          return info;
        })) || []
      }
    }
    if (this.ref.inputType === "radio" || this.ref.inputType === "prize" || this.ref.inputType === "checkbox") {
      const choices = this.getRadioChoices();
      return {
        "valueType": (this.ref.valueType.includes("token") || this.ref.options.isTokenValue) ? "xsd:token" : "xsd:anyURI",
        "enableNegativeTokens": this.ref.options.enableNegativeTokens,
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
      const choices = this.getSliderChoices(this.ref.options, this.ref.options.hasScoreValue);
      return {
        "valueType": "xsd:integer",
        "scoring": this.ref.options.hasScoreValue,
        "responseAlert": this.ref.options.hasResponseAlert,
        "continousSlider": this.ref.options.continousSlider,
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
    if (this.ref.inputType === 'stackedSlider') {
      return {
        "valueType": "xsd:integer",
        "scoring": this.ref.options.hasScoreValue,
        "responseAlert": this.ref.options.hasResponseAlert,
        "responseAlertMessage": this.ref.options.responseAlertMessage,
        "sliderOptions": (this.ref.options.sliderOptions || []).map(slider => ({
          "schema:minValue": slider.minValue,
          "schema:maxValue": slider.maxValue,
          "schema:minValueImg": slider.minValueImg,
          "schema:maxValueImg": slider.maxValueImg,
          "schema:sliderLabel": slider.sliderLabel,
          "choices": this.getSliderChoices(slider, this.ref.options.hasScoreValue)
        }))
      }
    }
    if (this.ref.inputType === "date") {
      return {
        valueType: "xsd:date",
        requiredValue: true,
        "schema:maxValue": "new Date()",
        "isOptionalTextRequired": this.ref.responseOptions.isOptionalTextRequired,
      };
    }
    if (this.ref.inputType === "audioImageRecord" || this.ref.inputType === "drawing" || this.ref.inputType === "geolocation" || this.ref.inputType === "photo" || this.ref.inputType === "video" || this.ref.inputType === "timeRange") {
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

    if (this.ref.inputType === 'radio' || this.ref.inputType === 'checkbox' || this.ref.inputType === 'prize' || this.ref.inputType == 'stackedRadio' || this.ref.inputType == 'stackedCheckbox') {
      let inputType = this.ref.inputType;

      if (this.ref.inputType == 'radio' || this.ref.inputType == 'checkbox') {
        inputType = 'radio';
      } else if (this.ref.inputType == 'stackedRadio' || this.ref.inputType == 'stackedCheckbox') {
        inputType = 'stackedRadio';
      } else {
        inputType = 'prize';
      }

      if (this.ref.options.isMultipleChoice) {
        schema["ui"] = {
          inputType
        };
      } else {
        schema["ui"] = {
          inputType,
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
        this.ref.inputType === "checkbox" ||
        this.ref.inputType === "prize" ||
        this.ref.inputType === "stackedRadio" ||
        this.ref.inputType === "stackedCheckbox" ||
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
      itemObj.options.minSliderTick = itemObj.options.minSliderTick || 0;
      itemObj.options.maxSliderTick = itemObj.options.maxSliderTick || 0;
      itemObj.options.continousSlider = itemObj.options.continousSlider || false;
      itemObj.options.hasScoreValue = itemObj.options.hasScoreValue || false;
      itemObj.options.hasResponseAlert = itemObj.options.hasResponseAlert || false;
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
        return { value: option['schema:value'], name: option['schema:name'] }
      });

      const newOptions = _.get(newValue, field, []).map(option => {
        return { value: option['schema:value'], name: option['schema:name'] }
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
        ...removedOptions.map(option => `${option.name}: ${option.value} option was removed`),
        ...insertedOptions.map(option => `${option.name}: ${option.value} option was inserted`),
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
      'options.sliderOptions': {
        updated: (field) =>'sliderOptions are updated',
      },
      'options.itemList': {
        updated: (field) =>'itemList is updated',
      },
      'options.choices': {
        updated: (field) =>'choices are updated',
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
      'options.minSliderTick': {
        updated: valueUpdate('Slider Min Value'),
        inserted: valueInsert('Slider Min Value'),
      },
      'options.maxSliderTick': {
        updated: valueUpdate('Slider Max Value'),
        inserted: valueInsert('Slider Max Value'),
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
      'options.continousSlider': {
        updated: valueUpdate('Continous Slider'),
      },
      'options.scores': {
        updated: scoreUpdate,
      },
      'options.maxLength': {
        updated: valueUpdate('maxLength'),
        inserted: valueInsert('maxLength'),
      },
      'options.isTokenValue': {
        updated: optionUpdate('Token Value option'),
      },
      'options.enableNegativeTokens': {
        updated: optionUpdate('Enable Negative Tokens'),
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

  static parseJSONLD(item) {
    let allow = _.get(item, ['reprolib:terms/allow', 0, '@list'], [])
            .map(item => item['@id'].substr(15));

    let itemContent = {
      _id: item['_id'] && item['_id'].split('/')[1],
      name: item['@id'],
      question:
        _.get(item, ['schema:question', 0, '@value']),
      description:
        _.get(item, ['schema:description', 0, '@value']),
      ui: {
        allow,
        inputType:
          _.get(item, ['reprolib:terms/inputType', 0, '@value']),
      },
      allowEdit:
        _.get(item, ['reprolib:terms/allowEdit', 0, '@value'], true),
      isOptionalText:
        _.get(item, ['reprolib:terms/isOptionalText', 0, '@value'], false),
    };

    let responseOptions = item['reprolib:terms/responseOptions'];

    let itemType = itemContent.ui.inputType;

    if (responseOptions) {
      itemContent.responseOptions = {};

      let isOptionalTextRequired =
        _.get(responseOptions, [0, 'reprolib:terms/isOptionalTextRequired']);

      let multipleChoice =
        _.get(responseOptions, [0, 'reprolib:terms/multipleChoice']);
      let valueType = 
        _.get(responseOptions, [0, 'reprolib:terms/valueType']);

      let enableNegativeTokens = 
        _.get(responseOptions, [0, 'reprolib:terms/enableNegativeTokens']);

      let scoring = 
        _.get(responseOptions, [0, 'reprolib:terms/scoring']);

      let continousSlider =
        _.get(responseOptions, [0, 'reprolib:terms/continousSlider']);

      let showTickMarks =
        _.get(responseOptions, [0, 'reprolib:terms/showTickMarks']);

      let responseAlert =
        _.get(responseOptions, [0, 'reprolib:terms/responseAlert']);

      let responseAlertMessage = 
        _.get(responseOptions, [0, 'reprolib:terms/responseAlertMessage']);

      let itemOptions = 
        _.get(responseOptions, [0, 'reprolib:terms/itemOptions'], []);

      let itemList = 
        _.get(responseOptions, [0, 'reprolib:terms/itemList'], []);
      let options = 
        _.get(responseOptions, [0, 'reprolib:terms/options'], []);

      if (isOptionalTextRequired) {
        itemContent.responseOptions.isOptionalTextRequired = 
          _.get(isOptionalTextRequired, [0, '@value']);
      }

      if (multipleChoice) {
        itemContent.multipleChoice = _.get(multipleChoice, [0, '@value']);
      }

      if (enableNegativeTokens) {
        itemContent.enableNegativeTokens = _.get(enableNegativeTokens, [0, '@value']);
      }

      if (scoring) {
        itemContent.scoring = 
          _.get(scoring, [0, '@value']);
      }

      if (continousSlider) {
        itemContent.continousSlider = 
          continousSlider[0] && continousSlider[0]['@value'];
      }

      if (showTickMarks) {
        itemContent.showTickMarks = 
          showTickMarks[0] && showTickMarks[0]['@value'];
      }

      if (responseAlert) {
        itemContent.responseAlert = 
          _.get(responseAlert, [0, '@value']);
      }

      if (responseAlertMessage) {
        itemContent.responseAlertMessage = 
          responseAlertMessage[0] && responseAlertMessage[0]['@value'];
      }

      if (valueType) {
        itemContent.valueType =
          valueType[0] && valueType[0]['@id'];
      }

      if (itemType === 'radio') {
        itemContent.options = {
          isMultipleChoice: itemContent.multipleChoice || false,
          enableNegativeTokens: itemContent.enableNegativeTokens || false,
          hasScoreValue: itemContent.scoring || false,
          hasResponseAlert: itemContent.responseAlert || false,
          responseAlertMessage: itemContent.responseAlertMessage || '',
          options:
            responseOptions[0] &&
            responseOptions[0]['schema:itemListElement'] &&
            responseOptions[0]['schema:itemListElement'].map(
              (itemListElement) => {
                const image = itemListElement['schema:image'];
                const name = itemListElement["schema:name"];
                const value = itemListElement["schema:value"];
                const score = itemListElement["schema:score"];
                const description = itemListElement["schema:description"];

                return {
                  image: 
                    typeof image === 'string' && image ||
                    Array.isArray(image) && image[0] && image[0]['@value'].toString(),
                  name:
                    typeof name == "string" && name ||
                    Array.isArray(name) && name[0] && name[0]['@value'].toString(),
                  value:
                    Array.isArray(value) && value[0] && value[0]['@value'],
                  score:
                    Array.isArray(score) && score[0] && score[0]['@value'],
                  description:
                    typeof description == 'string' && description ||
                    Array.isArray(description) && description[0] && description[0]['@value'].toString(),
                };
              }
            ),
        };
      }

      if (itemType === 'stackedRadio') {
        let parsedItemOptions = [];
        for (let i = 0; i < itemList.length; i++) {
          const data = [];
  
          for (let j = 0; j < options.length; j++) {
            data.push({
              score: _.get(itemOptions[options.length*i + j], ['schema:score', 0, '@value'], ''),
              value: _.get(itemOptions[options.length*i + j], ['schema:value', 0, '@value'], '')
            })
          }
  
          parsedItemOptions.push(data);
        }

        itemContent.options = {
          isMultipleChoice: itemContent.multipleChoice || false,
          hasScoreValue: itemContent.scoring || false,
          hasResponseAlert: itemContent.responseAlert || false,
          itemList: itemList.map(item => {
            const image = item['schema:image'];

            return {
              name: _.get(item, ['schema:name', 0, '@value'], ''),
              image: 
                typeof image === 'string' && image ||
                Array.isArray(image) && image[0] && image[0]['@value'].toString(),
              description: _.get(item, ['schema:description', 0, '@value'], '')
            }
          }),
          options: options.map(option => {
            const image = option['schema:image'];

            return {
              name: _.get(option, ['schema:name', 0, '@value'], ''),
              image: 
                typeof image === 'string' && image ||
                Array.isArray(image) && image[0] && image[0]['@value'].toString(),
              description: _.get(option, ['schema:description', 0, '@value'], '')
            }
          }),
          choices: parsedItemOptions
        };
      }

      if (itemType === 'prize') {
        itemContent.options = {
          isMultipleChoice: itemContent.multipleChoice || false,
          hasScoreValue: itemContent.scoring || true,
          nextOptionImage: '',
          nextOptionName: '',
          options:
            responseOptions[0] &&
            responseOptions[0]['schema:itemListElement'] &&
            responseOptions[0]['schema:itemListElement'].map(
              (itemListElement) => {
                const name = itemListElement["schema:name"];
                const value = itemListElement["schema:value"];
                const price = itemListElement["schema:price"];
                const description = itemListElement["schema:description"];

                return {
                  name:
                    typeof name == "string" && name ||
                    Array.isArray(name) && name[0] && name[0]['@value'].toString(),
                  value:
                    Array.isArray(value) && value[0] && value[0]['@value'],
                  price:
                    Array.isArray(price) && price[0] && price[0]['@value'],
                  description:
                    typeof description == "string" && description ||
                    Array.isArray(description) && description[0] && description[0]['@value'].toString(),
                };
              }
            ),
        };
      }

      if (itemType === 'text') {
        itemContent.options = {
          requiredValue:
            _.get(responseOptions, [0, 'reprolib:terms/requiredValue', 0, '@value']),
          // TODO: add 'maximum response length' value which is absent for now
        };
        if (item['schema:correctAnswer'] &&
          item['schema:correctAnswer'][0] &&
          item['schema:correctAnswer'][0]['@value']) {
          itemContent.correctAnswer = item['schema:correctAnswer'][0]['@value']
        }
      }
      if (itemType === 'slider') {
        itemContent.options = {
          hasScoreValue: itemContent.scoring || false,
          hasResponseAlert: itemContent.responseAlert || false,
          continousSlider: itemContent.continousSlider || false,
          responseAlertMessage: itemContent.responseAlertMessage || '',
          maxValue:
            _.get(responseOptions, [0, 'schema:maxValue', 0, '@value']),
          minValue:
            _.get(responseOptions, [0, 'schema:minValue', 0, '@value']),
          maxValueImg:
            _.get(responseOptions, [0, 'schema:maxValueImg', 0, '@value']),
          minValueImg:
            _.get(responseOptions, [0, 'schema:minValueImg', 0, '@value']),
          maxSliderTick:
            Math.max(..._.get(responseOptions, '0.schema:itemListElement', []).map(item => _.get(item, 'schema:value.0.@value'))),
          minSliderTick:
            Math.min(..._.get(responseOptions, '0.schema:itemListElement', []).map(item => _.get(item, 'schema:value.0.@value'))),
          showTickMarks: itemContent.showTickMarks || false,
          scores: itemContent.scoring && responseOptions[0] &&
            responseOptions[0]['schema:itemListElement'] &&
            responseOptions[0]['schema:itemListElement'].map(
              (itemListElement) => {
                const score = itemListElement["schema:score"];
                return Array.isArray(score) && score[0] && score[0]['@value']
              }
            )
        };
      }
      if (itemType === 'stackedSlider') {
        itemContent.options = {
          hasScoreValue: itemContent.scoring || false,
          hasResponseAlert: itemContent.responseAlert || false,
          responseAlertMessage: itemContent.responseAlertMessage || '',
          sliderOptions: _.get(responseOptions, [0, 'reprolib:terms/sliderOptions'], []).map(slider => ({
            sliderLabel: 
              _.get(slider, ['schema:sliderLabel', 0, '@value'], ''),
            maxValue:
              _.get(slider, ['schema:maxValue', 0, '@value']),
            minValue:
              _.get(slider, ['schema:minValue', 0, '@value']),
            maxValueImg:
              _.get(slider, ['schema:maxValueImg', 0, '@value']),
            minValueImg:
              _.get(slider, ['schema:minValueImg', 0, '@value']),
            maxSliderTick:
              Math.max(..._.get(slider, 'schema:itemListElement', []).map(item => _.get(item, 'schema:value.0.@value'))),
            minSliderTick:
              Math.min(..._.get(slider, 'schema:itemListElement', []).map(item => _.get(item, 'schema:value.0.@value'))),
            scores: itemContent.scoring && _.get(slider, ['schema:itemListElement'], []).map(
                (itemListElement) => {
                  const score = itemListElement["schema:score"];
                  return Array.isArray(score) && score[0] && score[0]['@value']
                }
              )
          })),
        };
        itemContent.options.sliderOptions.forEach(slider => {
          if (!isFinite(slider.minValue)) {
            slider.minValue = 0;
          }
          if (!isFinite(slider.maxValue)) {
            slider.maxValue = 5;
          }
        })
      }
      if (itemType === 'audioRecord' || itemType === 'audioImageRecord') {
        itemContent.options = {
          requiredValue:
            _.get(responseOptions, [0, 'reprolib:terms/requiredValue', 0, '@value']),
          'schema:maxValue':
            _.get(responseOptions, [0, 'schema:maxValue', 0, '@value']),
          'schema:minValue':
            _.get(responseOptions, [0, 'schema:minValue', 0, '@value']),
        };
      }

    }

    const inputOptions = item['reprolib:terms/inputs'];
    if(inputOptions && inputOptions.length > 0) {
      itemContent.inputOptions = [];

      const NAME = 'schema:name';
      const VALUE = 'schema:value';
      const CONTENT_URL = 'schema:contentUrl';

      inputOptions.forEach(option => {
        const modifiedOption = {};

        const name = _.get(option, [NAME, 0, '@value']);
        const value = _.get(option, [VALUE, 0, '@value']);
        const contentUrl = option[CONTENT_URL];
        
        if(name)
          modifiedOption[NAME] = name;
        
        if(value)
          modifiedOption[VALUE] = value;
          
        if(contentUrl)
          modifiedOption[CONTENT_URL] = contentUrl;
  
        if(!_.isEmpty(modifiedOption))
          itemContent.inputOptions.push(modifiedOption);
      });

    }

    const media = item['reprolib:terms/media'];
    if(media && media.length > 0) {
      itemContent.media = {};

      const NAME = 'schema:name';
      const TRANSCRIPT = 'schema:transcript';
      const CONTENT_URL = 'schema:contentUrl';

      media.forEach(obj => {
        const mediaObj = Object.entries(obj)[0][1];
        const modifiedmMediaObj = {};

        const name = _.get(mediaObj, [0, NAME, 0, '@value']);
        const transcript = _.get(mediaObj, [0, TRANSCRIPT, 0, '@value']);
        const contentUrl = _.get(mediaObj, [0, CONTENT_URL]);
        
        if(name)
          modifiedmMediaObj[NAME] = name;
        
        if(transcript)
          modifiedmMediaObj[TRANSCRIPT] = transcript;
          
        if(contentUrl) {
          modifiedmMediaObj[CONTENT_URL] = contentUrl;
          itemContent.media[contentUrl] = modifiedmMediaObj;
        }
      });

    }

    if (itemContent.ui.inputType == 'markdown-message') {
      itemContent.ui.inputType = 'markdownMessage';
    }

    itemContent.valid = true;

    // TODO: compare with new structure and delete !!!!!
    const responseOptions2 = item['reprolib:terms/responseOptions'];
    if(responseOptions2 && responseOptions2.length > 0) {
      if(
        itemType === 'audioImageRecord'
        || itemType === 'drawing'
        || itemType === 'geolocation'
      ) {
        itemContent.responseOptions = this.responseOptionsModifier(itemType, responseOptions2);
      }
    }

    return itemContent;
  }

  static responseOptionsModifier(itemType, options) {
    const responseOptions = options[0];
    const modifiedResponseOptions = {};

    const valueType = responseOptions['reprolib:terms/valueType'];
    if(valueType)
      modifiedResponseOptions['valueType'] = valueType[0]['@id'];

    const minValue = responseOptions['schema:minValue'];
    if(minValue)
      modifiedResponseOptions['schema:minValue'] = minValue[0]['@value'];

    const maxValue = responseOptions['schema:maxValue'];
    if(maxValue)
      modifiedResponseOptions['schema:maxValue'] = maxValue[0]['@value'];

    const image = responseOptions['schema:image'];
    if(image)
      modifiedResponseOptions['schema:image'] = image;

    const multipleChoice = responseOptions['reprolib:terms/multipleChoice'];
    if(multipleChoice)
      modifiedResponseOptions['multipleChoice'] = multipleChoice[0]['@value'];

    const requiredValue = responseOptions['reprolib:terms/requiredValue'];
    if(requiredValue)
      modifiedResponseOptions['requiredValue'] = requiredValue[0]['@value'];

    const isOptionalTextRequired = 
      responseOptions['reprolib:terms/isOptionalTextRequired'];
    if(isOptionalTextRequired)
      modifiedResponseOptions['isOptionalTextRequired'] = isOptionalTextRequired[0]['@value'];

    return modifiedResponseOptions;
  }

  static checkValidation (item) {
    if (!item.name || !item.inputType || item.question && !item.question.text) {
      return false;
    }

    if (item.cumulativeScores) {
      for (let i = 0; i < item.cumulativeScores.length; i++) {
        if (!item.cumulativeScores[i].valid) {
          return false;
        }
      }
    }

    if (item.options && Array.isArray(item.options.options)) {
      for (let option of item.options.options) {
        if (option.valid === false) {
          return false;
        }
      }
    }

    return true;
  }
}
