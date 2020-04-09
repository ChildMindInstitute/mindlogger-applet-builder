<template>
  <v-card>
    <v-card-title
      class="headline grey lighten-2"
      primary-title
    >
      <v-icon left>
        mdi-pencil
      </v-icon>
      Upload from URL
    </v-card-title>
    <v-card-text>
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
      >
        <v-combobox
          v-model="url"
          :rules="textRules"
          :items="sampleItems"
          label="URL"
          required
          @change="resetError"
        />
      </v-form>
      <v-alert
        v-if="error !== ''"
        type="error"
      >
        {{ error }}
      </v-alert>
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-btn
        outlined
        color="primary"
        @click="onDiscardItem"
      >
        Close
      </v-btn>
      <v-spacer />
      <v-btn
        color="primary"
        @click="onUploadItem"
      >
        Upload
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>

import api from '../../utilities/api.vue';

export default {
  data: function () {
    return {
      url: '',
      textRules: [
        v => !!v || 'URL is required',
        v => (v && v.includes('raw.githubusercontent.com')) || 'Invalid item URL. URL should contain \'raw.githubusercontent.com/...\'',
      ],
      sampleItems: [
        'https://raw.githubusercontent.com/ReproNim/reproschema/master/activities/MindLoggerDemo/items/radio',
        'https://raw.githubusercontent.com/ReproNim/reproschema/master/activities/MindLoggerDemo/items/radio-multi',
        'https://raw.githubusercontent.com/ReproNim/reproschema/master/activities/MindLoggerDemo/items/slider',
        'https://raw.githubusercontent.com/ReproNim/reproschema/master/activities/MindLoggerDemo/items/text',
        'https://raw.githubusercontent.com/ReproNim/reproschema/master/activities/MindLoggerDemo/items/audio-stimulus',
        'https://raw.githubusercontent.com/ReproNim/reproschema/master/activities/MindLoggerDemo/items/time-range',
      ],
      fetchedSchema: {},
      error: '',
    };
  },
  methods: {
    validate() {
      return this.$refs.form.validate();
    },
    onUploadItem() {
      if (this.validate()) {
        api.getSchema(this.url).then(resp => {
          this.fetchedSchema = resp.data;
          const transformedSchema = this.transformSchema();
          this.$emit('uploadItem', transformedSchema);
        }).catch(e => {
          console.log(e);
          this.error = 'Item not found. Make sure URL points to a raw, unprocessed item schema.';
        });
      }
    },
    onDiscardItem() {
      this.$emit('uploadItem', null);
    },
    transformSchema() {
      const compressedSchema = this.fetchedSchema;
      const simplifiedSchema = {};
      simplifiedSchema.options = {};
      simplifiedSchema.isItemEditable = false;
      simplifiedSchema.iri = this.url;

      if (compressedSchema['skos:prefLabel']) {
        simplifiedSchema.name = compressedSchema['skos:prefLabel'];
      } else if (compressedSchema['skos:altLabel']) {
        simplifiedSchema.name = compressedSchema['skos:altLabel'];
      }

      if (compressedSchema.ui && compressedSchema.ui.inputType) {
        simplifiedSchema.inputType = compressedSchema.ui.inputType;
      }

      if (compressedSchema['schema:description']) {
        simplifiedSchema.description = compressedSchema['schema:description'];
      }

      if (compressedSchema['question']) {
        simplifiedSchema.question = compressedSchema['question'];
      }

      if (compressedSchema.responseOptions) {
        if ('multipleChoice' in compressedSchema.responseOptions) {
          simplifiedSchema.options.multipleChoice = compressedSchema.responseOptions.multipleChoice;
        }
        if (simplifiedSchema.inputType && simplifiedSchema.inputType === 'radio') {
          if ('choices' in compressedSchema.responseOptions && Array.isArray(compressedSchema.responseOptions.choices)) {
            simplifiedSchema.options.options = compressedSchema.responseOptions.choices.map(choice => {
              const optionSchema = {
                'name': choice['schema:name'],
              };
              if (choice['schema:image']) {
                optionSchema.image = choice['schema:image'];
              }
              return optionSchema;
            });
          }
        }

        if (simplifiedSchema.inputType && simplifiedSchema.inputType === 'slider') {
          if ('schema:minValue' in compressedSchema.responseOptions) {
            simplifiedSchema.options.minValue = compressedSchema.responseOptions['schema:minValue'];
          }
          if ('schema:maxValue' in compressedSchema.responseOptions) {
            simplifiedSchema.options.maxValue = compressedSchema.responseOptions['schema:maxValue'];
          }
          if ('choices' in compressedSchema.responseOptions && Array.isArray(compressedSchema.responseOptions.choices)) {
            simplifiedSchema.options.options = compressedSchema.responseOptions.choices.map(choice => {
              const optionSchema = {};
              if (choice['schema:name']) {
                optionSchema.name = choice['schema:name'];
              }
              if (choice['schema:value']) {
                optionSchema.value = choice['schema:value'];
              }
              if (choice['schema:image']) {
                optionSchema.image = choice['schema:image'];
              }
              return optionSchema;
            });
            simplifiedSchema.options.numOptions = simplifiedSchema.options.options.length;
          }
        }

        
      }

      if (compressedSchema.inputOptions) {
        const inputOptions = compressedSchema.inputOptions;
        if (simplifiedSchema.inputType && simplifiedSchema.inputType === 'audioStimulus') {
          let i;
          let currentOption;
          let mediaUrl;
          for (i = 0; i < inputOptions.length; i++) {
            currentOption = inputOptions[i];
            if ('@type' in currentOption && currentOption['@type'] === 'schema:URL') {
              mediaUrl = currentOption['schema:contentUrl'];
            }
          }
          if (typeof mediaUrl !== 'undefined') {
            simplifiedSchema.options.url = mediaUrl;
          }
        }
      }

      simplifiedSchema.schema = compressedSchema;
      return simplifiedSchema;
    },
    resetError() {
      this.error = '';
    },
  },
};
</script>

