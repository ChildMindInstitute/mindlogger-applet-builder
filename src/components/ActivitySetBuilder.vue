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
              <v-list-item-subtitle v-text="activity.description"></v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon @click="editActivity(index)">
                <v-icon color="grey lighten-1">mdi-pencil</v-icon>
              </v-btn>
            </v-list-item-action>
            <v-list-item-action>
              <v-btn icon @click="duplicateActivity(index)">
                <v-icon color="grey lighten-1">mdi-content-copy</v-icon>
              </v-btn>
            </v-list-item-action>
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
      <v-alert
        style="margin-top: 12px;"
        v-if="this.error"
        type="error"
      >
        {{this.error}}
      </v-alert>
      <v-btn style="margin-top: 18px;" color="primary" @click="onClickSaveActivitySet">Save Activity Set</v-btn>
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
      dialog: false,
      error: ''
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
    editActivity(index) {
      return index;
    },
    duplicateActivity(index) {
      this.activities.push(this.activities[index]);
    },
    deleteActivity(index) {
      this.activities.splice(index, 1);
    },
    onClickSaveActivitySet() {
      if (this.isActivitySetValid()) {
        this.getSchema();
      }
    },
    isActivitySetValid() {
      if (!this.name) {
        this.error = 'Activity Set Name is required';
        return false;
      } else if (!this.description) {
        this.error = 'Activity Set Description is required';
        return false;
      } else if (this.activities.length == 0) {
        this.error = 'Activity Set must contain at least one activity';
        return false;
      } else {
        this.error = '';
      }
      return true;
    },
    getSchema() {
      const schema = {
        "@id": "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activity-sets/ema-hbn/ema-hbn_schema", 
        "@type": [
          "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/schemas/ActivitySet"
        ],
        "http://schema.org/description": [
          {
            "@language": "en",
            "@value": this.description
          }
        ],
        "http://schema.org/schemaVersion": [
          {
            "@language": "en",
            "@value": "0.0.1"
          }
        ],
        "http://schema.org/version": [
          {
            "@language": "en",
            "@value": "0.0.1"
          }
        ],
        "http://www.w3.org/2004/02/skos/core#altLabel": [
          {
            "@language": "en",
            "@value": this.name
          }
        ],
        "http://www.w3.org/2004/02/skos/core#prefLabel": [
          {
            "@language": "en",
            "@value": this.name
          }
        ],
        "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/terms/variableMap": [
          {
            "@list": [
              {
                "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/terms/isAbout": [
                  {
                    "@id": "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/ema_morning_schema"
                  }
                ],
                "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/terms/variableName": [
                  {
                    "@language": "en",
                    "@value": "ema_morning"
                  }
                ]
              },
              {
                "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/terms/isAbout": [
                  {
                    "@id": "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNEvening/ema_evening_schema"
                  }
                ],
                "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/terms/variableName": [
                  {
                    "@language": "en",
                    "@value": "ema_evening"
                  }
                ]
              }
            ]
          }
        ],
        "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/terms/activity_display_name": [
          {
            "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNEvening/ema_evening_schema": [
              {
                "@id": "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activity-sets/ema-hbn/Evening"
              }
            ],
            "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/ema_morning_schema": [
              {
                "@id": "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activity-sets/ema-hbn/Morning"
              }
            ]
          }
        ],
        "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/terms/order": [
          {
            "@list": [
              {
                "@id": "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNMorning/ema_morning_schema"
              },
              {
                "@id": "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/activities/EmaHBNEvening/ema_evening_schema"
              }
            ]
          }
        ],
        "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/terms/shuffle": [
          {
            "@type": "http://schema.org/Boolean",
            "@value": false
          }
        ],
        "https://raw.githubusercontent.com/ReproNim/schema-standardization/master/terms/visibility": [
          {
            "@value": true,
            "@index": "ema_evening"
          },
          {
            "@value": true,
            "@index": "ema_morning"
          }
        ]
      };
      console.log(schema);
    }
  }
}

</script>
