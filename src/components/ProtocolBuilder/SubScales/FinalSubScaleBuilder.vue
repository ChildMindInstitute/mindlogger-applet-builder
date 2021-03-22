<template>
  <v-card class="ma-4">
    <v-card-title
      class="px-2 py-0"
    >
      (<v-icon
        :color="!hasLookupTable ? 'grey' : 'primary'"
      >
        mdi-table-search
      </v-icon>)

      <span> Total Score Calculation: </span>

      <v-checkbox
        v-model="isSum"
        label="Sum Of Item Scores"
        class="mx-4"
        @change="isSum ? isAverage = false : ''; saveSubScale()"
      />
      <v-checkbox
        v-model="isAverage"
        label="Average of Item Scores"
        class="mx-4"
        @change="isAverage ? isSum = false: ''; saveSubScale()"
      />

      <v-spacer />
      <v-card-actions>
        <v-menu bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
            >
              <v-icon color="grey lighten-1">
                mdi-table-search
              </v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item
              @click="$emit('onCreateLookupTable')"
            >
              <v-list-item-title>
                {{ !!hasLookupTable ? 'Replace Lookup Table' : 'Set Lookup Table' }}
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              :disabled="!hasLookupTable"
              @click="$emit('onDeleteLookupTable')"
            >
              <v-list-item-title>Delete Lookup Table</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-card-actions>
    </v-card-title>
  </v-card>
</template>

<script>
import { mapMutations } from 'vuex';
import config from '../../../config';

export default {
  props: {
    subScale: {
      type: Object,
      required: true
    }
  },
  data: function () {
    return {
      hasLookupTable: !!this.subScale.lookupTable,
      isSum: this.subScale.isAverageScore === false ? true : false,
      isAverage: this.subScale.isAverageScore || false,
    };
  },
  computed: {
    config () {
      return config;
    },
  },
  watch: {
    subScale: {
      deep: true,
      handler() {
        this.hasLookupTable = !!this.subScale.lookupTable;
      }
    }
  },
  methods: {
    ...mapMutations(config.MODULE_NAME, 
      [
        'updateFinalSubScale'
      ]
    ),
    saveSubScale () {
      if (!this.isSum && !this.isAverage) {
        this.updateFinalSubScale({
          variableName: '',
          isAverageScore: null
        });
      } else {
        this.updateFinalSubScale({
          variableName: 'Final SubScale Score',
          isAverageScore: this.isAverage
        });
      }
    }
  },
};
</script>

