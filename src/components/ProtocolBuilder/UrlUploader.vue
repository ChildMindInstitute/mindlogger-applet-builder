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
        :lazy-validation="false"
      >
        <v-text-field
          v-model="url"
          label="URL"
          required
        />
      </v-form>
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
        v => !!v || 'This field is required',
      ],
      fetchedSchema: {},
    };
  },
  methods: {
    onUploadItem() {
      api.getSchema(this.url).then(resp => {
        this.fetchedSchema = resp.data;
        const transformedSchema = this.transformSchema();
        this.$emit('uploadItem', transformedSchema);
      });
    },
    onDiscardItem() {
      this.$emit('closeItemModal', null);
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

    }

  },
};
</script>

