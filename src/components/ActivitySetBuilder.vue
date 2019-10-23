<template>
  <v-container>
    <v-layout
      wrap
    >
      <v-form
        ref="form"
        :lazy-validation="lazy"
      >
        <v-text-field
          v-model="name"
          :rules="textRules"
          label="Name"
          required
        ></v-text-field>
        <v-text-field
          v-model="description"
          :rules="textRules"
          label="Description"
          required
        ></v-text-field>
        <ul>
          <li v-for="activity in activities" v-bind:key="activity.id">
            {{ activity.name }}
          </li>
          <v-btn @click="addActivity">New Activity</v-btn>
        </ul>
      </v-form>
    </v-layout>
    <v-dialog
      v-model="dialog"
      width="500"
    >
      <ActivityBuilder v-on:closeModal="onCloseModal"/>
      
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
      dialog: true
    }),

    methods: {
      validate () {
        if (this.$refs.form.validate()) {
          this.snackbar = true
        }
      },
      reset () {
        this.$refs.form.reset()
      },
      resetValidation () {
        this.$refs.form.resetValidation()
      },
      addActivity () {
        console.log('clicked')
        this.dialog = true;
        this.activities.push(5)
      },
      onCloseModal() {
        console.log('recieved close')
        this.dialog = false;
      }
    },
};
</script>
