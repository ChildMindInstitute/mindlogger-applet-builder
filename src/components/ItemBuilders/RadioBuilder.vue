<template>
  <v-list>
    <v-subheader>
      Options
    </v-subheader>
    <v-list-item v-for="(option, index) in options" v-bind:key="index">
      <v-list-item-content>
        <v-list-item-title v-text="option"></v-list-item-title>
      </v-list-item-content>
      <v-list-item-action>
        <v-btn icon @click="deleteOption(index)">
          <v-icon color="grey lighten-1">mdi-delete</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
    <v-list-item>
      <v-form
        v-model="valid"
        ref="form"
      >
        <v-text-field
          v-model="nextOption"
          :rules="textRules"
          label="Option Text"
        />
      </v-form>
      <v-icon
        color="grey lighten-1"
        @click="addOption"
        :disabled="!valid"
      >
        mdi-plus
      </v-icon>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  data: () => ({
    nextOption: '',
    options: [],
    valid: true,
    textRules: [
      v => !!v || 'Radio options cannot be empty',
    ],
  }),
  methods: {
    resetValidation () {
      this.$refs.form.resetValidation()
    },
    addOption() {
      this.options.push(this.nextOption);
      this.$emit('updateOptions', this.options)
      this.nextOption = '';
      this.resetValidation();
    },
    deleteOption(index) {
      this.options.splice(index, 1);
    }
  }
}
</script>