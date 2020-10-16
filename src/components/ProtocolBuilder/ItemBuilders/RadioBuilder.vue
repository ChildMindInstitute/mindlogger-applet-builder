<template>
  <v-form
    ref="form"
    v-model="valid"
  >
    <v-row>
      <v-col 
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="isTokenValue"
          label="Token Value"
          :disabled="!isItemEditable"
          @change="update"
        />
      </v-col>
      <v-col 
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="isSkippable"
          label="Skippable Item"
          :disabled="!isItemEditable"
          @change="updateAllow"
        />
      </v-col>
      <v-col 
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="isMultipleChoice"
          label="Multiple Choice"
          :disabled="!isItemEditable"
          @change="update"
        />      
      </v-col>
      <v-col 
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              class="deep-orange"
              color="primary"
              dark
              v-bind="attrs"
              v-on="on"
            >
              Slide X Transition
            </v-btn>
          </template>

          <v-list>
            <v-list-item
              v-for="(item, i) in items"
              :key="i"
            >
              <v-list-item-title>{{ item.text }} | {{ item.value }}</v-list-item-title>
              <v-btn
                icon
                color="grey darken-1 ml-2"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>
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
      <v-list-item class="d-block">
        <v-form>
          <v-row>
            <v-col 
              cols="12"
              sm="6"
            >
              <v-text-field
                v-model="nextOptionName"
                :rules="textRules"
                label="Option Text"
                counter="55"
                maxlength="55"
                :disabled="!isItemEditable"
                @change="update"
              />
            </v-col>
            <v-col 
              cols="12"
              sm="6"
            >
              <v-text-field
                v-if="isTokenValue"
                v-model="nextOptionValue"
                :rules="textRules"
                label="Option Value"
                counter="5"
                maxlength="5"
                :disabled="!isItemEditable"
                @change="update"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col 
              cols="12"
              sm="12"
            >
              <v-text-field
                v-model="nextOptionImage"
                label="Option Image"
                :disabled="!isItemEditable"
                @change="update"
              />
            </v-col>
          </v-row>
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
    isSkippableItem: {
      type: Boolean,
      default: false,
    },
    responseOptions: {
      type: Object,
    },
    isItemEditable: {
      type: Boolean,
      default: true,
    },
  },
  data: function () {
    return {
      isTokenValue: Object.keys(this.responseOptions).length ? (this.responseOptions.valueType.includes("token") ? true : false) : false,
      isMultipleChoice: this.initialItemData.isMultipleChoice || false,
      isSkippable: this.isSkippableItem || false,
      nextOptionName: this.initialItemData.nextOptionName || '',
      nextOptionValue: this.initialItemData.nextOptionValue || '',
      nextOptionImage: this.initialItemData.nextOptionImage || '',
      options: this.initialItemData.options || [],
      valid: true,
      textRules: [
        v => !!v || 'Radio options cannot be empty',
      ],
      items: [
        { 
          text: "Lied to parents",
          value: "-3"
        },
        { 
          text: "Yelled at teacher",
          value: "-5"
        },
        { 
          text: "Missed class",
          value: "-2"
        }
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
        'value': this.nextOptionValue,
      };
      if (this.nextOptionImage) {
        nextOption.image = this.nextOptionImage.toString();
      }
      this.options.push(nextOption);
      this.nextOptionName = '';
      this.nextOptionValue = '';
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
        'isTokenValue': this.isTokenValue,
        'isMultipleChoice': this.isMultipleChoice,
        'isSkippableItem': this.isSkippableItem,
        'nextOptionName': this.nextOptionName,
        'nextOptionValue': this.nextOptionValue,
        'nextOptionImage': this.nextOptionImage,
        'options': this.options,
      };
      this.$emit('updateOptions', responseOptions);
    },
    updateAllow() {
      const allow = this.isSkippable
      this.$emit('updateAllow', allow);
    }
  }
}
</script>