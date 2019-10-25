<template>
  <v-list>
    <v-subheader>
      Options
    </v-subheader>
    <v-list-item v-for="(option, index) in options" v-bind:key="index">
      <v-list-item-content>
        <v-list-item-title v-text="option.name"></v-list-item-title>
      </v-list-item-content>
      <v-list-item-action>
        <v-btn icon @click="deleteOption(index)">
          <v-icon color="grey lighten-1">mdi-delete</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
    <v-list-item>
      <v-form>
        <v-text-field
          v-model="nextOption"
          label="Option Text"
          required
        />
      </v-form>
      <v-icon color="grey lighten-1" @click="addOption">mdi-plus</v-icon>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  data: () => ({
    nextOption: '',
    options: []
  }),
  methods: {
    addOption() {
      this.options.push({'name': this.nextOption});
      this.nextOption = '';
    },
    deleteOption(index) {
      this.options.splice(index, 1);
    }
  }
}
</script>