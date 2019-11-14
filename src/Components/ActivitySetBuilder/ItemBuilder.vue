<template>
  <v-card>
    <v-card-title
      class="headline grey lighten-2"
      primary-title
    >
      Edit Item
    </v-card-title>
    <v-card-text>
      <v-form
        ref="form"
        :lazy-validation="false"
      >
        <v-text-field
          v-model="name"
          label="Item Name"
          required
        />
        <v-text-field
          v-model="description"
          label="Description"
          required
        />
        <v-text-field
          v-model="question"
          label="Question"
          required
        />
        <v-select
          v-model="inputType"
          :items="inputTypes"
          label="Input Type"
        />
        <RadioBuilder
          v-if="inputType === 'radio'"
          @updateOptions="updateOptions"
          @updateMultipleChoice="updateMultipleChoice"
        />
        <TextBuilder
          v-if="inputType === 'text'"
          @update="updateResponseOptions"
        />
      </v-form>
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-btn
        outline
        color="primary"
        @click="onDiscardItem"
      >
        Discard
      </v-btn>
      <v-spacer />
      <v-btn
        color="primary"
        text
        @click="onSaveItem"
      >
        Save Item
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import RadioBuilder from './ItemBuilders/RadioBuilder.vue';
import TextBuilder from './ItemBuilders/TextBuilder.vue';

export default {
  components: {
    RadioBuilder,
    TextBuilder
  },
  props: {
    initialItemData: {
      type: Object,
      required: true
    }
  },
  data: function () {
    return {
      name: this.initialItemData.name || '',
      question: this.initialItemData.question || '',
      description: this.initialItemData.description || '',
      inputType: this.initialItemData.inputType || '',
      multipleChoice: this.initialItemData.multipleChoice || false,
      options: this.initialItemData.options || [],
      responseOptions: this.initialItemData.responseOptions || {},
      textRules: [
        v => !!v || 'This field is required',
      ],
      inputTypes: ['radio', 'text']
    };
  },
  methods: {
    validate () {
      if (this.$refs.form.validate()) {
        this.snackbar = true
      }
    },
    updateResponseOptions(options) {
      this.responseOptions = options;
    },
    updateMultipleChoice() {
      this.multipleChoice = !this.isMultipleChoice;
    },
    updateOptions(newOptions) {
      this.options = newOptions;
    },
    getChoices() {
      const choices = this.options.map((option, index) => ({
        "@type": "schema:Boolean",
        "schema:name": option,
        "schema:value": index
      }));
      
      return choices;
    },
    getResponseOptions() {
      if (this.inputType === 'radio') {
        const choices = this.getChoices();
        return {
            "@type": "xsd:anyURI",
            "multipleChoice": this.multipleChoice,
            "schema:minValue": 0,
            "schema:maxValue": this.options.length - 1,
            "choices": choices
        };
      }
      if (this.inputType === 'text') {
        return this.responseOptions;
      }
    },
    getSchema() {
      const responseOptions = this.getResponseOptions();
      return {
        "@context": [ "https://raw.githubusercontent.com/ReproNim/reproschema/master/contexts/generic",
            "https://raw.githubusercontent.com/YOUR-ACTIVITY-CONTEXT-FILE"
        ],
        "@type": "reproschema:Field",
        "@id": this.name,
        "skos:prefLabel": this.name,
        "skos:altLabel": this.name,
        "schema:description": this.description,
        "schema:schemaVersion": "0.0.1",
        "schema:version": "0.0.1",
        "question": this.question,
        "ui": {
            "inputType": this.inputType
        },
        "responseOptions": responseOptions
      };
    },
    onSaveItem() {
      const schema = this.getSchema();
      this.$emit('closeItemModal', {
        'name': this.name,
        'question': this.question,
        'description': this.description,
        'inputType': this.inputType,
        'multipleChoice': this.multipleChoice,
        'options': this.options,
        'responseOptions': this.responseOptions,
        'schema': schema
      })
    },
    onDiscardItem() {
      this.$emit('closeItemModal', null)
    }
  },
};
</script>

