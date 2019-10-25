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
        <RadioBuilder v-if="inputType === 'radio'"/>
        <TextBuilder v-if="inputType === 'text'"/>
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
    items: [],
    textRules: [
      v => !!v || 'This field is required',
    ],
    lazy: false,
    inputTypes: ['radio', 'text']
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
        'description': this.description
      })
    },
    onDiscardItem() {
      this.$emit('closeItemModal', null)
    }
  },
};
</script>

