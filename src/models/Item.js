import util from '../utilities/util';
export default class Item {
  constructor() {
    this.ref = null;
  }

  static getQuesionInfo(question) {
    const imageRE = new RegExp(/[\r\n]*\!\[.*\]\((.*)=.*\)[\r\n]*/i);
    const imageMatch = question.match(imageRE);

    const questionImage = imageMatch && imageMatch[1] || '';  // The image URL.
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
      isVis: initialItemData.isVis || false,
      inputType,
      options: initialItemData.options || {},
      allow: initialItemData.ui && initialItemData.ui.allow
        && (initialItemData.ui.allow.includes("dontKnow")
          || initialItemData.ui.allow.includes("dont_know_answer")),
      responseOptions: initialItemData.responseOptions || {},
      header: initialItemData.header || "",
      section: initialItemData.section || "",
      inputOptions: initialItemData.inputOptions || [],
      media: initialItemData.media || {},
      cumulativeScores: initialItemData.cumulativeScores  || [],
      allowEdit: initialItemData.allowEdit === undefined ? true : initialItemData.allowEdit,
      markdownText: (initialItemData.question || ''),
      valid: initialItemData.valid === undefined ? true : initialItemData.valid,
      isOptionalText: initialItemData.isOptionalText || false,
      timer: initialItemData.timer || 0
    };

    const model = new Item();
    model.updateReferenceObject(parsedData);

    parsedData.responseOptions = model.getResponseOptions()
    parsedData.timestamp = Date.now();

    return parsedData;
  }

  updateReferenceObject(ref) {
    this.ref = ref;
  }

  getSliderChoices(slider, hasScoreValue, hasResponseAlert) {
    const choices = [];
    for (let i = slider.minSliderTick; i <= slider.maxSliderTick; i++) {
      let obj = {
        "schema:name": i.toString(),
        "schema:value": i
      };

      if (hasScoreValue && slider.scores) {
        obj["schema:score"] = slider.scores[i - slider.minSliderTick];
      }

      if (hasResponseAlert && slider.alerts) {
        obj["schema:alert"] = slider.alerts[i - slider.minSliderTick];
      }

      if (slider.minValueImg && i === slider.minSliderTick)
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
                "reprolib:terms/isVis": option.isVis,
                "schema:color": option.color,
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

            if (this.ref.options.hasResponseAlert) {
              choiceSchema["schema:alert"] = option.alert || '';
            }
            return choiceSchema;
          })
        : [];
    return choices;
  }

  getResponseOptions() {
    if (this.ref.inputType === 'stackedRadio' || this.ref.inputType === 'stackedCheckbox') {
      return {
        "valueType": (this.ref.options.valueType && this.ref.options.valueType.includes("token") || this.ref.options.isTokenValue) ? "xsd:token" : "xsd:anyURI",
        "scoring": this.ref.options.hasScoreValue,
        "removeBackOption": this.ref.options.removeBackOption,
        "responseAlert": this.ref.options.hasResponseAlert,
        "multipleChoice": this.ref.options.isMultipleChoice,
        "options": this.ref.options.options.map(option => ({
          "schema:description": option.description,
          "schema:color": option.color,
          "schema:image": option.image || '',
          "schema:name": option.name || '',
          "schema:alert": option.alert || '',
        })),
        "itemList": this.ref.options.itemList && this.ref.options.itemList.map(item => ({
          "schema:description": item.description,
          "schema:color": item.color,
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

          if (this.ref.options.hasResponseAlert) {
            info['schema:alert'] = choice.alert || '';
          }

          return info;
        })) || [],
      }
    }
    if (this.ref.inputType === "radio" || this.ref.inputType === "prize" || this.ref.inputType === "checkbox" || this.ref.inputType === "dropdownList") {
      const choices = this.getRadioChoices();
      return {
        "valueType": (this.ref.options.valueType && this.ref.options.valueType.includes("token") || this.ref.options.isTokenValue) ? "xsd:token" : "xsd:anyURI",
        "enableNegativeTokens": this.ref.options.enableNegativeTokens,
        "scoring": this.ref.options.hasScoreValue,
        "responseAlert": this.ref.options.hasResponseAlert,
        "randomizeOptions": this.ref.options.randomizeOptions,
        "removeBackOption": this.ref.options.removeBackOption,
        "colorPalette": this.ref.options.colorPalette,
        "multipleChoice": this.ref.options.isMultipleChoice,
        "schema:minValue": 1,
        "schema:maxValue": choices.length,
        "isOptionalTextRequired": this.ref.responseOptions.isOptionalTextRequired,
        choices: choices,
      };
    }
    if (this.ref.inputType === "text") {
      return {
        'valueType': this.ref.options.valueType || this.ref.valueType,
        "removeBackOption": this.ref.options.removeBackOption,
        'requiredValue': this.ref.options.requiredValue,
        'isResponseIdentifier': this.ref.options.isResponseIdentifier,
        'maxLength': this.ref.options.maxLength,
      }
    }
    if (this.ref.inputType === "drawing") {
      return {
        ...this.ref.responseOptions,
        "removeBackOption": this.ref.options.removeBackOption,
        "removeUndoOption": this.ref.options.removeUndoOption,
        "topNavigationOption": this.ref.options.topNavigationOption,
      }
    }
    if (this.ref.inputType === "slider") {
      const choices = this.getSliderChoices(this.ref.options, this.ref.options.hasScoreValue, this.ref.options.hasResponseAlert);
      let responseOptions = {
        "valueType": "xsd:integer",
        "scoring": this.ref.options.hasScoreValue,
        "removeBackOption": this.ref.options.removeBackOption,
        "responseAlert": this.ref.options.hasResponseAlert,
        "continousSlider": this.ref.options.continousSlider,
        'tickLabel': this.ref.options.tickLabel,
        'textAnchors': this.ref.options.textAnchors,
        'tickMark': this.ref.options.tickMark,
        "schema:minValue": this.ref.options.minValue,
        "schema:maxValue": this.ref.options.maxValue,
        "schema:minValueImg": this.ref.options.minValueImg,
        "schema:maxValueImg": this.ref.options.maxValueImg,
        "isOptionalTextRequired": this.ref.responseOptions.isOptionalTextRequired,
        choices: choices,
      };
      if (this.ref.options.continousSlider && this.ref.options.hasResponseAlert) {
        Object.assign(responseOptions, {
          "minAlertValue": this.ref.options.minAlertValue,
          "maxAlertValue": this.ref.options.maxAlertValue,
          "responseAlertMessage": this.ref.options.responseAlertMessage,
        })
      }

      return responseOptions;
    }

    if (this.ref.inputType === 'pastBehaviorTracker' || this.ref.inputType == 'futureBehaviorTracker') {
      const data = {
        positiveBehaviors: (this.ref.options.positiveBehaviors || []).map(option => ({
          "schema:name": option.name,
          "schema:image": option.image,
          "schema:value": Number(option.value)
        })),
        negativeBehaviors: (this.ref.options.negativeBehaviors || []).map(option => ({
          "schema:name": option.name,
          "schema:image": option.image,
          "schema:value": Number(option.value),
          "schema:rate": option.rate,
          "schema:startTime": option.startTime,
          "schema:endTime": option.endTime
        }))
      }

      if (this.ref.inputType == 'futureBehaviorTracker') {
        data.timeScreen = this.ref.options.timeScreen;
      }

      return data;
    }

    if (this.ref.inputType === "ageSelector") {
      return {
        "schema:minAge": this.ref.options.minAge,
        "schema:maxAge": this.ref.options.maxAge,
        "removeBackOption": this.ref.options.removeBackOption,
      }
    }
    if (this.ref.inputType === 'stackedSlider') {
      return {
        "valueType": "xsd:integer",
        "scoring": this.ref.options.hasScoreValue,
        "responseAlert": this.ref.options.hasResponseAlert,
        "removeBackOption": this.ref.options.removeBackOption,
        "sliderOptions": (this.ref.options.sliderOptions || []).map(slider => ({
          "schema:minValue": slider.minValue,
          "schema:maxValue": slider.maxValue,
          "schema:minValueImg": slider.minValueImg,
          "schema:maxValueImg": slider.maxValueImg,
          "schema:sliderLabel": slider.sliderLabel,
          "choices": this.getSliderChoices(slider, this.ref.options.hasScoreValue, this.ref.options.hasResponseAlert)
        }))
      }
    }
    if (this.ref.inputType === "date") {
      return {
        valueType: "xsd:date",
        requiredValue: true,
        "schema:maxValue": "new Date()",
        "removeBackOption": this.ref.options.removeBackOption,
        "isOptionalTextRequired": this.ref.responseOptions.isOptionalTextRequired,
      };
    }
    if (this.ref.inputType === "duration") {
      return {
        "isOptionalTextRequired": this.ref.responseOptions.isOptionalTextRequired,
        "timeDuration": this.ref.options.timeDuration,
      }
    }

    if (this.ref.inputType === "audioImageRecord"
      || this.ref.inputType === "geolocation"
      || this.ref.inputType === "audioStimulus"
      || this.ref.inputType === "photo"
      || this.ref.inputType === "markdownMessage"
      || this.ref.inputType === "video"
      || this.ref.inputType === "timeRange") {
      return {
        "removeBackOption": this.ref.options.removeBackOption,
      }
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
        isVis: this.ref.isVis,
        "schema:schemaVersion": "0.0.1",
        "schema:version": "0.0.1",
        "header": this.ref.header,
        "section": this.ref.section,
        ui: {
          inputType: this.ref.inputType,
        },
        baseAppletId: this.ref.baseAppletId,
        baseItemId: this.ref.baseItemId,
    };
    if (Object.keys(responseOptions).length !== 0) {
      schema["responseOptions"] = responseOptions;
    }

    if (this.ref.inputType === 'cumulativeScore') {
      schema['cumulativeScores'] = cumulativeScores;
    }

    if (this.ref.inputType === 'radio' || this.ref.inputType === 'checkbox' || this.ref.inputType === 'prize' || this.ref.inputType == 'stackedRadio' || this.ref.inputType == 'stackedCheckbox' || this.ref.inputType == 'dropdownList') {
      let inputType = this.ref.inputType;

      if (this.ref.inputType == 'radio' || this.ref.inputType == 'checkbox') {
        inputType = 'radio';
      } else if (this.ref.inputType == 'stackedRadio' || this.ref.inputType == 'stackedCheckbox') {
        inputType = 'stackedRadio';
      } else if (this.ref.inputType == 'dropdownList') {
        inputType = 'dropdownList';
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
      isVis: this.ref.isVis,
      options: this.ref.options,
      isOptionalText: this.ref.isOptionalText,
      timer: this.ref.timer,
      allowEdit: this.ref.allowEdit,
      ...schema
    };

    if (
      (this.ref.inputType === "radio" ||
        this.ref.inputType === "checkbox" ||
        this.ref.inputType === "prize" ||
        this.ref.inputType === "stackedRadio" ||
        this.ref.inputType === "stackedCheckbox" ||
        this.ref.inputType === "dropdownList" ||
        this.ref.inputType === "audioRecord") &&
      Object.keys(this.ref.responseOptions).length
    ) {
      itemObj.responseOptions = itemObj.responseOptions || this.ref.responseOptions;
    }

    else if (this.ref.inputType === "drawing") {
      itemObj.responseOptions = itemObj.responseOptions || this.ref.responseOptions;
      itemObj.inputOptions = this.ref.inputOptions;
    }

    else if(this.ref.inputType === "audioImageRecord") {
      if(!itemObj.responseOptions['schema:image']) {
        // default image
        itemObj.responseOptions['schema:image'] = 'https://www.dropbox.com/s/wgtjq3bgqlfhbzd/map3g.png?raw=1';
      }
    }

    else if (this.ref.inputType === "audioStimulus") {
      itemObj.responseOptions = itemObj.responseOptions || this.ref.responseOptions;
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
      itemObj.options.maxValueImg = itemObj.options.maxValueImg || "";
      itemObj.options.minSliderTick = itemObj.options.minSliderTick || 0;
      itemObj.options.maxSliderTick = itemObj.options.maxSliderTick || 0;
      itemObj.options.continousSlider = itemObj.options.continousSlider || false;
      itemObj.options.textAnchors = itemObj.options.textAnchors || false;
      itemObj.options.tickLabel = itemObj.options.tickLabel || false;
      itemObj.options.tickMark = itemObj.options.tickMark || false;
      itemObj.options.hasScoreValue = itemObj.options.hasScoreValue || false;
      itemObj.options.hasResponseAlert = itemObj.options.hasResponseAlert || false;
    }

    return itemObj;
  }

  static getHistoryTemplate(oldValue, newValue) {
    const radioOptionListUpdate = (field) => {
      const oldOptions = _.get(oldValue, field, []).map(({ name, value, score, isVis }) => {
        return {
          name,
          value,
          score,
          isVis,
        }
      });
      const newOptions = _.get(newValue, field, []).map(({ name, value, score, isVis }) => {
        return {
          name,
          value,
          score,
          isVis,
        }
      });

      const removedOptions = oldOptions.filter(option => {
        return newOptions.find(newOption => {
          return option.name === newOption.name && option.value === newOption.value && option.score === newOption.score && option.isVis === newOption.isVis
        }) ? false : true
      });
      const insertedOptions = newOptions.filter(newOption => {
        return oldOptions.find(option => {
          return option.name === newOption.name && option.value === newOption.value && option.score === newOption.score && option.isVis === newOption.isVis
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
      'header': {
        updated: (field) => `Item header was changed`
      },
      'section': {
        updated: (field) => `Item section was changed`
      },
      'timer': {
        updated: field => {
          const newTimeLimit = _.get(newValue, field);
          if (newTimeLimit < 0) {
            return 'Response time limit option has been disabled'
          }

          return `Response time limit was updated to ${_.get(newValue, field) / 1000} seconds`
        }
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
      'isVis': {
        updated: (field) =>
          `Item visibility is ${
          _.get(newValue, field, false) ? 'disabled' : 'enabled'
          }`,
      },
      'options.isMultipleChoice': {
        updated: optionUpdate('Multiple choice option'),
      },
      'options.sliderOptions': {
        updated: (field) => {
          const oldOptions = _.get(oldValue, field, []);
          const newOptions = _.get(newValue, field, []);

          if (JSON.stringify(oldOptions) != JSON.stringify(newOptions)) {
            return ['sliderOptions are updated'];
          }
          return [];
        },
      },
      'options.timeDuration': {
        updated: (field) => 'timeDuration is updated',
      },
      'options.itemList': {
        updated: (field) => {
          const oldList = _.get(oldValue, field, []);
          const newList = _.get(newValue, field, []);

          if (JSON.stringify(oldList) != JSON.stringify(newList)) {
            return ['itemList is updated'];
          }
          return [];
        },
      },
      'options.choices': {
        updated: (field) => {
          const oldChoices = _.get(oldValue, field, []);
          const newChoices = _.get(newValue, field, []);

          if (JSON.stringify(oldChoices) != JSON.stringify(newChoices)) {
            return ['choices are updated'];
          }
          return [];
        }
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
      'options.minAge': {
        updated: valueUpdate('minAge'),
        inserted: valueInsert('minAge'),
      },
      'options.maxAge': {
        updated: valueUpdate('maxAge'),
        inserted: valueInsert('maxAge'),
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
      'options.colorPalette': {
        updated: optionUpdate('Color Palette'),
      },
      'options.topNavigationOption': {
        updated: optionUpdate('Navigation Buttons'),
      },
      'options.removeUndoOption': {
        updated: optionUpdate('Remove Undo Option'),
      },
      'options.removeBackOption': {
        updated: optionUpdate('Remove Back Option'),
      },
      'options.continousSlider': {
        updated: valueUpdate('Continous Slider'),
      },
      'options.tickLabel': {
        updated: valueUpdate('Tick Labels'),
      },
      'options.textAnchors': {
        updated: valueUpdate('Text Anchors'),
      },
      'options.tickMark': {
        updated: valueUpdate('Tick Mark'),
      },
      'options.scores': {
        updated: scoreUpdate,
      },
      'options.positiveBehaviors': {
        updated: (field) => {
          const oldBehaviors = _.get(oldValue, field, []);
          const newBehaviors = _.get(newValue, field, []);

          if (JSON.stringify(oldBehaviors) != JSON.stringify(newBehaviors)) {
            return ['positive behaviors were been updated']
          }
          return []
        }
      },
      'options.negativeBehaviors': {
        updated: (field) => {
          const oldBehaviors = _.get(oldValue, field, []);
          const newBehaviors = _.get(newValue, field, []);

          if (JSON.stringify(oldBehaviors) != JSON.stringify(newBehaviors)) {
            return ['negative behaviors were updated']
          }
          return []
        }
      },
      'options.maxLength': {
        updated: valueUpdate('maxLength'),
        inserted: valueInsert('maxLength'),
      },
      'options.isResponseIdentifier': {
        updated: optionUpdate('Response data identifier'),
        inserted: optionUpdate('Response data identifier')
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
      'responseOptions.schema:minValue': {
        updated: valueUpdate('minValue'),
        inserted: valueInsert('minValue'),
      },
      'responseOptions.schema:maxValue': {
        updated: valueUpdate('maxValue'),
        inserted: valueInsert('maxValue'),
      },
      'responseOptions.minAlertValue': {
        updated: valueUpdate('Minimum value for alert range'),
        inserted: valueUpdate('Minimum value for alert range'),
      },
      'responseOptions.maxAlertValue': {
        updated: valueUpdate('Maximum value for alert range'),
        inserted: valueUpdate('Maximum value for alert range'),
      },
      'responseOptions.responseAlertMessage': {
        updated: valueUpdate('Response alert message'),
        inserted: valueUpdate('Response alert message'),
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
      isVis: _.get(item, ['reprolib:terms/isVis', 0, '@value']),
      header: _.get(item, ['schema:header', 0, '@value']),
      section: _.get(item, ['schema:section', 0, '@value']),
      ui: {
        allow,
        inputType:
          _.get(item, ['reprolib:terms/inputType', 0, '@value']),
      },
      allowEdit:
        _.get(item, ['reprolib:terms/allowEdit', 0, '@value'], true),
      isOptionalText:
        _.get(item, ['reprolib:terms/isOptionalText', 0, '@value'], false),
      timer:
        _.get(item, ['reprolib:terms/timer', 0, '@value'], 0)
    };

    let responseOptions = item['reprolib:terms/responseOptions'];

    let itemType = itemContent.ui.inputType;

    if (responseOptions) {
      itemContent.responseOptions = {};
      let positiveBehaviors =
        _.get(responseOptions, [0, 'reprolib:terms/positiveBehaviors'], []);

      let negativeBehaviors =
        _.get(responseOptions, [0, 'reprolib:terms/negativeBehaviors'], []);

      let timeScreen =
        _.get(responseOptions, [0, 'reprolib:terms/timeScreen']);

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
      let randomizeOptions =
        _.get(responseOptions, [0, 'reprolib:terms/randomizeOptions']);

      let removeBackOption =
        _.get(responseOptions, [0, 'reprolib:terms/removeBackOption']);

      let removeUndoOption =
        _.get(responseOptions, [0, 'reprolib:terms/removeUndoOption']);

      let continousSlider =
        _.get(responseOptions, [0, 'reprolib:terms/continousSlider']);

      let tickLabel =
        _.get(responseOptions, [0, 'reprolib:terms/tickLabel']);

      let textAnchors =
        _.get(responseOptions, [0, 'reprolib:terms/textAnchors']);

      let tickMark =
        _.get(responseOptions, [0, 'reprolib:terms/tickMark']);

      let responseAlert =
        _.get(responseOptions, [0, 'reprolib:terms/responseAlert']);

      let colorPalette =
        _.get(responseOptions, [0, 'reprolib:terms/colorPalette']);

      let timeDuration =
        _.get(responseOptions, [0, 'schema:timeDuration']);

      let topNavigationOption =
        _.get(responseOptions, [0, 'reprolib:terms/topNavigationOption']);

      let itemOptions =
        _.get(responseOptions, [0, 'reprolib:terms/itemOptions'], []);

      let itemList =
        _.get(responseOptions, [0, 'reprolib:terms/itemList'], []);
      let options =
        _.get(responseOptions, [0, 'reprolib:terms/options'], []);
      let drawingImage =
        _.get(responseOptions, [0, 'schema:image']);

      if (drawingImage) {
        itemContent.responseOptions['schema:image'] = drawingImage;
      }

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

      if (randomizeOptions) {
        itemContent.randomizeOptions =
          _.get(randomizeOptions, [0, '@value']);
      }

      if (removeBackOption) {
        itemContent.removeBackOption =
          _.get(removeBackOption, [0, '@value']);
      }

      if (removeUndoOption) {
        itemContent.removeUndoOption =
          _.get(removeUndoOption, [0, '@value']);
      }

      if (tickLabel) {
        itemContent.tickLabel =
          tickLabel[0] && tickLabel[0]['@value'];
      } else {
        itemContent.tickLabel = true;
      }

      if (textAnchors) {
        itemContent.textAnchors =
          textAnchors[0] && textAnchors[0]['@value'];
      } else {
        itemContent.textAnchors = true;
      }

      if (tickMark) {
        itemContent.tickMark =
          tickMark[0] && tickMark[0]['@value'];
      } else {
        itemContent.tickMark = true;
      }

      if (continousSlider) {
        itemContent.continousSlider =
          continousSlider[0] && continousSlider[0]['@value'];
      }

      if (responseAlert) {
        itemContent.responseAlert =
          _.get(responseAlert, [0, '@value']);
      }

      if (colorPalette) {
        itemContent.colorPalette =
          _.get(colorPalette, [0, '@value']);
      }

      if (timeDuration) {
        itemContent.timeDuration =
          _.get(timeDuration, [0, '@value']);
      }

      if (topNavigationOption) {
        itemContent.topNavigationOption =
          _.get(topNavigationOption, [0, '@value']);
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
          removeBackOption: itemContent.removeBackOption || false,
          colorPalette: itemContent.colorPalette || false,
          randomizeOptions: itemContent.randomizeOptions || false,
          valueType: itemContent.valueType,
          options:
            responseOptions[0] &&
            responseOptions[0]['schema:itemListElement'] &&
            responseOptions[0]['schema:itemListElement'].map(
              (itemListElement) => {
                const image = itemListElement['schema:image'];
                const name = itemListElement["schema:name"];
                const value = itemListElement["schema:value"];
                const color = itemListElement["schema:color"];
                const score = itemListElement["schema:score"];
                const alert = itemListElement["schema:alert"];
                const isVis = itemListElement["reprolib:terms/isVis"];
                const description = itemListElement["schema:description"];

                return {
                  image:
                    typeof image === 'string' && image ||
                    Array.isArray(image) && image[0] && image[0]['@value'].toString(),
                  name:
                    typeof name == "string" && name ||
                    Array.isArray(name) && name[0] && name[0]['@value'].toString(),
                  color:
                    typeof color == "string" && color ||
                    Array.isArray(color) && color[0] && color[0]['@value'].toString(),
                  value:
                    Array.isArray(value) && value[0] && value[0]['@value'],
                  score:
                    Array.isArray(score) && score[0] && score[0]['@value'],
                  isVis:
                    Array.isArray(isVis) && isVis[0] && isVis[0]['@value'],
                  alert:
                    Array.isArray(alert) && alert[0] && alert[0]['@value'],
                  description:
                    typeof description == 'string' && description ||
                    Array.isArray(description) && description[0] && description[0]['@value'].toString(),
                };
              }
            ),
        };
      }

      if (itemType === 'pastBehaviorTracker' || itemType == 'futureBehaviorTracker') {
        itemContent.options = {
          positiveBehaviors: positiveBehaviors.map(behavior => ({
            image: _.get(behavior, ['schema:image'], ''),
            name: _.get(behavior, ['schema:name', 0, '@value'], ''),
            value: _.get(behavior, ['schema:value', 0, '@value'], ''),
            valid: true
          })),

          negativeBehaviors: negativeBehaviors.map(behavior => ({
            image: _.get(behavior, ['schema:image'], ''),
            name: _.get(behavior, ['schema:name', 0, '@value'], ''),
            value: _.get(behavior, ['schema:value', 0, '@value'], ''),
            rate: _.get(behavior, ['schema:rate', 0, '@value'], 0),
            startTime: _.get(behavior, ['schema:startTime', 0, '@value'], ''),
            endTime: _.get(behavior, ['schema:endTime', 0, '@value'], ''),
            valid: true
          })),

          valid: true
        }

        if (itemType == 'futureBehaviorTracker') {
          itemContent.options.timeScreen = _.get(timeScreen, [0, '@value'])
        }
      }

      if (itemType === 'stackedRadio') {
        let parsedItemOptions = [];
        for (let i = 0; i < itemList.length; i++) {
          const data = [];

          for (let j = 0; j < options.length; j++) {
            data.push({
              score: _.get(itemOptions[options.length*i + j], ['schema:score', 0, '@value'], ''),
              value: _.get(itemOptions[options.length*i + j], ['schema:value', 0, '@value'], ''),
              alert: _.get(itemOptions[options.length*i + j], ['schema:alert', 0, '@value'], '')
            })
          }

          parsedItemOptions.push(data);
        }

        itemContent.options = {
          isMultipleChoice: itemContent.multipleChoice || false,
          hasScoreValue: itemContent.scoring || false,
          hasResponseAlert: itemContent.responseAlert || false,
          removeBackOption: itemContent.removeBackOption || false,
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

      if (itemType === 'dropdownList') {
        itemContent.options = {
          isMultipleChoice: itemContent.multipleChoice || false,
          enableNegativeTokens: itemContent.enableNegativeTokens || false,
          hasScoreValue: itemContent.scoring || false,
          hasResponseAlert: itemContent.responseAlert || false,
          colorPalette: itemContent.colorPalette || false,
          randomizeOptions: itemContent.randomizeOptions || false,
          valueType: itemContent.valueType,
          options:
            responseOptions[0] &&
            responseOptions[0]['schema:itemListElement'] &&
            responseOptions[0]['schema:itemListElement'].map(
              (itemListElement) => {
                const image = itemListElement['schema:image'];
                const name = itemListElement["schema:name"];
                const value = itemListElement["schema:value"];
                const color = itemListElement["schema:color"];
                const score = itemListElement["schema:score"];
                const alert = itemListElement["schema:alert"];
                const description = itemListElement["schema:description"];

                return {
                  image:
                    typeof image === 'string' && image ||
                    Array.isArray(image) && image[0] && image[0]['@value'].toString(),
                  name:
                    typeof name == "string" && name ||
                    Array.isArray(name) && name[0] && name[0]['@value'].toString(),
                  color:
                    typeof color == "string" && color ||
                    Array.isArray(color) && color[0] && color[0]['@value'].toString(),
                  value:
                    Array.isArray(value) && value[0] && value[0]['@value'],
                  score:
                    Array.isArray(score) && score[0] && score[0]['@value'],
                  alert:
                    Array.isArray(alert) && alert[0] && alert[0]['@value'],
                  description:
                    typeof description == 'string' && description ||
                    Array.isArray(description) && description[0] && description[0]['@value'].toString(),
                };
              }
            ),
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
          removeBackOption: itemContent.removeBackOption || false,
          isResponseIdentifier:
            _.get(responseOptions, [0, 'reprolib:terms/isResponseIdentifier', 0, '@value']),
          maxLength:
            _.get(responseOptions, [0, 'reprolib:terms/maxLength', 0, '@value'])
        };
        if (item['schema:correctAnswer'] &&
          item['schema:correctAnswer'][0] &&
          item['schema:correctAnswer'][0]['@value']) {
          itemContent.correctAnswer = item['schema:correctAnswer'][0]['@value']
        }
      }
      if (itemType === 'ageSelector') {
        itemContent.options = {
          removeBackOption: itemContent.removeBackOption || false,
          maxAge:
            _.get(responseOptions, [0, 'schema:maxAge', 0, '@value']),
          minAge:
            _.get(responseOptions, [0, 'schema:minAge', 0, '@value']),
        }
      }
      if (itemType === 'slider') {
        itemContent.options = {
          hasScoreValue: itemContent.scoring || false,
          hasResponseAlert: itemContent.responseAlert || false,
          continousSlider: itemContent.continousSlider || false,
          tickLabel: itemContent.tickLabel || false,
          textAnchors: itemContent.textAnchors || false,
          tickMark: itemContent.tickMark || false,
          removeBackOption: itemContent.removeBackOption || false,
          maxValue:
            _.get(responseOptions, [0, 'schema:maxValue', 0, '@value']),
          minValue:
            _.get(responseOptions, [0, 'schema:minValue', 0, '@value']),
          maxValueImg:
            _.get(responseOptions, [0, 'schema:maxValueImg', 0, '@value']),
          minValueImg:
            _.get(responseOptions, [0, 'schema:minValueImg', 0, '@value']),
          minAlertValue:
            _.get(responseOptions, [0, 'schema:minAlertValue', 0, '@value']),
          maxAlertValue:
            _.get(responseOptions, [0, 'schema:maxAlertValue', 0, '@value']),
          responseAlertMessage:
            _.get(responseOptions, [0, 'schema:responseAlertMessage', 0, '@value']),
          maxSliderTick:
            Math.max(..._.get(responseOptions, '0.schema:itemListElement', []).map(item => _.get(item, 'schema:value.0.@value'))),
          minSliderTick:
            Math.min(..._.get(responseOptions, '0.schema:itemListElement', []).map(item => _.get(item, 'schema:value.0.@value'))),
          scores: itemContent.scoring && responseOptions[0] &&
            responseOptions[0]['schema:itemListElement'] &&
            responseOptions[0]['schema:itemListElement'].map(
              (itemListElement) => {
                const score = itemListElement["schema:score"];
                return Array.isArray(score) && score[0] && score[0]['@value']
              }
            ),
          alerts: itemContent.responseAlert && responseOptions[0] &&
            responseOptions[0]['schema:itemListElement'] &&
            responseOptions[0]['schema:itemListElement'].map(
              (itemListElement) => {
                const alert = itemListElement["schema:alert"];
                return Array.isArray(alert) && alert[0] && alert[0]['@value']
              }
            ),
        };
      }
      if (itemType === 'stackedSlider') {
        itemContent.options = {
          hasScoreValue: itemContent.scoring || false,
          hasResponseAlert: itemContent.responseAlert || false,
          removeBackOption: itemContent.removeBackOption || false,
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
              ),
            alerts: itemContent.responseAlert && _.get(slider, ['schema:itemListElement'], []).map(
              (itemListElement) => {
                const alert = itemListElement["schema:alert"];
                return Array.isArray(alert) && alert[0] && alert[0]['@value']
              }
            ),
          })),
        };
        itemContent.options.sliderOptions.forEach(slider => {
          if (!isFinite(slider.minSliderTick)) {
            slider.minSliderTick = 0;
          }
          if (!isFinite(slider.maxSliderTick)) {
            slider.maxSliderTick = 5;
          }
        })
      }
      if (itemType === 'audioRecord' || itemType === 'audioImageRecord') {
        itemContent.options = {
          requiredValue:
            _.get(responseOptions, [0, 'reprolib:terms/requiredValue', 0, '@value']),
          removeBackOption: itemContent.removeBackOption || false,
          'schema:maxValue':
            _.get(responseOptions, [0, 'schema:maxValue', 0, '@value']),
          'schema:minValue':
            _.get(responseOptions, [0, 'schema:minValue', 0, '@value']),
        };
      }
      if (itemType === 'drawing') {
        itemContent.options = {
          topNavigationOption: itemContent.topNavigationOption || false,
          removeBackOption: itemContent.removeBackOption || false,
          removeUndoOption: itemContent.removeUndoOption || false,
        };
      }

      if (itemType === 'audioStimulus'
        || itemType === 'geolocation'
        || itemType === 'date'
        || itemType === 'video'
        || itemType === 'markdownMessage'
        || itemType === 'photo'
        || itemType === 'timeRange') {
        itemContent.options = {
          removeBackOption: itemContent.removeBackOption || false
        };
      }

      if (itemType === 'duration') {
        itemContent.options = {
          timeDuration: itemContent.timeDuration || {},
        };
      }
    }

    const inputOptions = item['reprolib:terms/inputs'];
    if(inputOptions && inputOptions.length > 0) {
      itemContent.inputOptions = [];

      const NAME = 'schema:name';
      const VALUE = 'schema:value';
      const CONTENT_URL = 'schema:contentUrl';
      const TYPE = '@type';

      inputOptions.forEach(option => {
        const modifiedOption = {};

        const type = _.get(option, [TYPE, 0]);
        const name = _.get(option, [NAME, 0, '@value']);
        const value = _.get(option, [VALUE, 0, '@value']);
        const contentUrl = option[CONTENT_URL];

        if(name)
          modifiedOption[NAME] = name;

        if(value)
          modifiedOption[VALUE] = value;

        if(contentUrl)
          modifiedOption[CONTENT_URL] = contentUrl;

        if (type)
          modifiedOption[TYPE] = type;

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
        if (!Object.keys(obj).length) {
          return ;
        }

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

  static checkValidation(item) {
    if (!item.name
      || !item.inputType
      || (item.options && item.options.valid === false)
      || !item.question
      || (item.inputType !== "markdownMessage"
        && item.inputType !== "cumulativeScore"
        && !item.question.text)) {
      return false;
    }
    if (item.inputType === "ageSelector"
      && (item.options.minAge === "" || item.options.maxAge === "")) {
      return false;
    }

    if (item.inputType == "pastBehaviorTracker" || item.inputType == "futureBehaviorTracker") {
      if (
        (!item.options.positiveBehaviors || !item.options.positiveBehaviors.length) &&
        (!item.options.negativeBehaviors || !item.options.negativeBehaviors.length)
      ) {
        return false;
      }
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

    if (item.timer && item.timer < 0 ) {
      return false;
    }

    return true;
  }
}
