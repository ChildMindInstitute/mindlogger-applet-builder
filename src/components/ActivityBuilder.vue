<template>
  <div>
    <v-card>
      <v-card-title
        class="headline grey lighten-2"
        primary-title
      >
        New Activity
      </v-card-title>
      <v-card-text>
        <v-form
          ref="form"
          :lazy-validation="lazy"
        >
          <v-text-field
            v-model="name"
            :rules="textRules"
            label="Activity Name"
            required
          ></v-text-field>
          <v-text-field
            v-model="description"
            :rules="textRules"
            label="Activity Description"
            required
          ></v-text-field>
          Items
          <ul>
            <li v-for="item in items" v-bind:key="item.id">
              {{ item.name }}
            </li>
            <li style="text-decoration: underline;" @click="addItem">Add new item</li>
          </ul>
        </v-form>
        <v-alert
          style="margin-top: 12px;"
          v-if="this.error"
          type="error"
        >
          {{this.error}}
        </v-alert>
      </v-card-text>
      <v-divider></v-divider>

      <v-card-actions>
        <v-btn
          color="danger"
          text
          @click="onDiscardActivity"
        >
          Discard
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          text
          @click="onClickSaveActivity"
        >
          Save Activity
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog
      v-model="dialog"
      width="800"
    >
      <ItemBuilder v-on:closeItemModal="onCloseItemModal"/>
      
    </v-dialog>
  </div>
</template>

<script>

import ItemBuilder from './ItemBuilder.vue';

export default {
  components: {
    ItemBuilder
  },
  data: () => ({
      name: '',
      description: '',
      items: [],
      textRules: [
        v => !!v || 'This field is required',
      ],
      lazy: false,
      dialog: false,
      error: ''
    }),

    methods: {
      validate () {
        if (this.$refs.form.validate()) {
          this.snackbar = true
        }
      },
      addItem () {
        this.dialog = true;
      },
      onCloseItemModal(response) {
        this.dialog = false;
        if (response) {
          this.onNewItem(response)
        }
      },
      onNewItem(item) {
        this.items.push(item)
      },
      onClickSaveActivity() {
        if (this.isActivityValid()) {
          this.saveActivity();
        }
      },
      isActivityValid() {
        if (!this.name) {
          this.error = 'Activity Name is required';
          return false;
        } else if (!this.description) {
          this.error = 'Activity Description is required';
          return false;
        } else if (this.items.length == 0) {
          this.error = 'Activities must contain at least one item';
          return false;
        } else {
          this.error = '';
        }
        return true;
      },
      saveActivity() {
        this.$emit('closeModal', {
          'name': this.name,
          'description': this.description,
          'items': this.items
        })
      },
      onDiscardActivity() {
        this.$emit('closeModal', null)
      }
    },
};
</script>

