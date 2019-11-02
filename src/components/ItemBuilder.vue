<template>
  <v-card>
    <v-card-title
      class="headline grey lighten-2"
      primary-title
    >
      New Item
    </v-card-title>
    <v-card-text>
      <v-form
        ref="form"
        :lazy-validation="lazy"
      >
        <v-text-field
          v-model="name"
          label="Item Name"
          required
        ></v-text-field>
        <v-text-field
          v-model="question"
          label="Question"
          required
        ></v-text-field>
        <v-select
          v-model="inputType"
          :items="inputTypes"
          label="Input Type"
        ></v-select>
        <RadioBuilder v-if="inputType === 'radio'" v-on:updateOptions="updateOptions" />
        <TextBuilder v-if="inputType === 'text'" v-on:update="updateResponseOptions"/>
      </v-form>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-btn
        color="danger"
        text
        @click="onDiscardItem"
      >
        Discard
      </v-btn>
      <v-spacer></v-spacer>
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
  data: () => ({
    name: '',
    question: '',
    description: '',
    inputType: '',
    options: [],
    textRules: [
      v => !!v || 'This field is required',
    ],
    lazy: false,
    inputTypes: ['radio', 'text'],
    responseOptions: {}
  }),
  methods: {
    validate () {
      if (this.$refs.form.validate()) {
        this.snackbar = true
      }
    },
    onSaveItem() {
      this.$emit('closeItemModal', {
        'name': this.name,
        'description': this.description,
        'inputType': this.inputType
      })
    },
    updateResponseOptions(options) {
      this.responseOptions = options;
    },
    updateOptions(newOptions) {
      this.options = newOptions;
      console.log(this.options);
    },
    buildItemSchema() {
      return {
        "@type": [
          "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/schemas/Field"
        ],
        "http://schema.org/question": [
          {
            "@language": "en",
            "@value": this.question
          }
        ],
        "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/terms/valueconstraints": [
          {
            "@type": [
              "http://www.w3.org/2001/XMLSchema#anyURI"
            ],
            "http://schema.org/itemListElement": [
              {
                "@list": this.options
              }
            ],
            "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/terms/multipleChoice": [
              {
                "@type": "http://schema.org/Boolean",
                "@value": false
              }
            ],
            "http://schema.org/maxValue": [
              {
                "@value": 1
              }
            ],
            "http://schema.org/minValue": [
              {
                "@value": 0
              }
            ]
          }
        ],
        "http://schema.org/description": [
          {
            "@language": "en",
            "@value": this.question
          }
        ],
        "http://schema.org/schemaVersion": [
          {
            "@language": "en",
            "@value": "0.0.1"
          }
        ],
        "http://schema.org/version": [
          {
            "@language": "en",
            "@value": "0.0.1"
          }
        ],
        "http://www.w3.org/2004/02/skos/core#altLabel": [
          {
            "@language": "en",
            "@value": this.question
          }
        ],
        "http://www.w3.org/2004/02/skos/core#prefLabel": [
          {
            "@language": "en",
            "@value": "Nightmares"
          }
        ],
        "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/terms/inputType": [
          {
            "@type": "http://www.w3.org/2001/XMLSchema#string",
            "@value": this.inputType
          }
        ]
      };
    },
    onDiscardItem() {
      this.$emit('closeItemModal', null)
    }
  },
};
</script>

