<template>
  <v-container>
    <v-layout
      wrap
      column
    >
      <v-form
        ref="form"
        :lazy-validation="lazy"
      >
        <v-text-field
          v-model="name"
          :rules="textRules"
          label="Activity Set Name"
          required
        ></v-text-field>
        <v-text-field
          v-model="description"
          :rules="textRules"
          label="Activity Set Description"
          required
        ></v-text-field>
        <v-list>
          <v-subheader>
            Activities
          </v-subheader>
          <v-list-item v-for="(activity, index) in activities" v-bind:key="activity.id">
            <v-list-item-content>
              <v-list-item-title v-text="activity.name"></v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon @click="deleteActivity(index)">
                <v-icon color="grey lighten-1">mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-list-item @click="addActivity">
            <v-icon color="grey lighten-1">mdi-plus</v-icon>
          </v-list-item>
        </v-list>
      </v-form>
      <v-btn style="margin: 10px;" color="primary">Save Activity Set</v-btn>
    </v-layout>
    <v-dialog
      v-model="dialog"
      width="800"
    >
      <ActivityBuilder v-on:closeModal="onCloseActivityModal"/>
      
    </v-dialog>
  </v-container>
</template>

<script>

import ActivityBuilder from './ActivityBuilder.vue';

export default {
  components: {
    ActivityBuilder
  },
  data: () => ({
      name: '',
      description: '',
      activities: [],
      textRules: [
        v => !!v || 'This field is required',
      ],
      lazy: false,
      dialog: false
    }),

    methods: {
      validate () {
        if (this.$refs.form.validate()) {
          this.snackbar = true
        }
      },
      addActivity () {
        this.dialog = true;
      },
      onCloseActivityModal(response) {
        this.dialog = false;
        if (response) {
          this.onNewActivity(response)
        }
      },
      onNewActivity(activity) {
        this.activities.push(activity)
      },
      deleteActivity(index) {
        this.activities.splice(index, 1);
      }
    },
};
</script>
