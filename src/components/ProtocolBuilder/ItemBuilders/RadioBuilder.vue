<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <v-checkbox
      v-model="isMultipleChoice"
      label="Multiple Choice"
      :disabled="!isItemEditable"
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
          <v-list-item-title v-text="option.name" />
        </v-list-item-content>
        <v-list-item-action>
          <v-btn
            icon
            :disabled="!isItemEditable"
            @click="deleteOption(index)"
          >
            <v-icon color="grey lighten-1">
              delete
            </v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
      <v-list-item>
        <v-form>
          <v-text-field
            v-model="nextOptionName"
            :rules="textRules"
            label="Option Text"
            :disabled="!isItemEditable"
            @change="update"
          />
          <v-text-field
            v-model="nextOptionImage"
            label="Option Image"
            :disabled="!isItemEditable"
            @change="update"
          />
          <v-btn
            :disabled="!valid || !isItemEditable"
            @click="addOption"
          >
            Add Option
          </v-btn>
        </v-form>
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
    },
    isItemEditable: {
      type: Boolean,
      default: true,
    },
  },
  data: function () {
    return {
      isMultipleChoice: this.initialItemData.isMultipleChoice || false,
      nextOptionName: this.initialItemData.nextOptionName || '',
      nextOptionImage: this.initialItemData.nextOptionImage || '',
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
      const nextOption = {
        'name': this.nextOptionName,
      };
      if (this.nextOptionImage) {
        nextOption.image = this.nextOptionImage;
      }
      this.options.push(nextOption);
      this.nextOptionName = '';
      this.nextOptionImage = '';
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
        'nextOptionName': this.nextOptionName,
        'nextOptionImage': this.nextOptionImage,
        'options': this.options,
      };
      this.$emit('updateOptions', responseOptions);
    }
  }
}
</script>