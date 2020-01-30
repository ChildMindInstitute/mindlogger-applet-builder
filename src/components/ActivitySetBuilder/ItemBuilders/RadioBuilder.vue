<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <v-switch
      v-model="isMultipleChoice"
      label="Multiple Choice"
      @change="update"
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
          @change="update"
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
    initialItemData: {
      type: Object,
      required: true
    }
  },
  data: function () {
    return {
      isMultipleChoice: this.initialItemData.isMultipleChoice || false,
      nextOption: this.initialItemData.nextOption || '',
      options: this.initialItemData.options || [],
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
      this.nextOption = '';
      this.resetValidation();
      this.update();
    },
    deleteOption(index) {
      this.options.splice(index, 1);
      this.update();
    },
    update() {
      const responseOptions = {
        'isMultipleChoice': this.isMultipleChoice,
        'nextOption': this.nextOption,
        'options': this.options,
      };
      this.$emit('updateOptions', responseOptions);
    }
  }
}
</script>