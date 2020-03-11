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
        <v-text-field
          v-model="url"
          :rules="textRules"
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
        Discard
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

      return simplifiedSchema;

    },
    resetError() {
      this.error = '';
    },
  },
};
</script>

