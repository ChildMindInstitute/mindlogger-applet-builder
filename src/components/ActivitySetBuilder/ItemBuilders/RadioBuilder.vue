<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <v-switch
      v-model="isMultipleChoice"
      label="Multiple Choice"
      @change="updateMultipleChoice"
    />
    <v-list>
      <v-subheader>
        Options
      </v-subheader>
      <v-list-item
        v-for="(option, index) in options"
        :key="index"
      >
        <v-list-item-content>
          <v-list-item-title v-text="option" />
        </v-list-item-content>
        <v-list-item-action>
          <v-btn
            icon
            @click="deleteOption(index)"
          >
            <v-icon color="grey lighten-1">
              delete
            </v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
      <v-list-item>
        <v-text-field
          v-model="nextOption"
          :rules="textRules"
          label="Option Text"
        />
        <v-icon
          color="grey lighten-1"
          :disabled="!valid"
          @click="addOption"
        >
          add
        </v-icon>
      </v-list-item>
    </v-list>
  </v-form>
</template>

<script>
export default {
  props: {
    initialOptions: {
      type: Array,
      required: true
    }
  },
  data: function () {
    return {
      isMultipleChoice: false,
      nextOption: '',
      options: this.initialOptions || [],
      valid: true,
      textRules: [
        v => !!v || 'Radio options cannot be empty',
      ]
    };
  },
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
    },
    updateMultipleChoice() {
      this.$emit('updateMultipleChoice', null);
    },
  }
}
</script>