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
}
