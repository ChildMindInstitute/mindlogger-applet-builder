<template>
  <v-card>
    <v-card-title>
      SubScales
    </v-card-title>

    <div>
      <SubScaleBuilder
        v-for="(subScale, index) in currentActivity.subScales"
        :key="index"
        :sub-scale-index="index"
        :sub-scale="subScale"
        :items="currentActivity.items"
        :has-lookup-table="!!subScale.lookupTable"
        class="ma-4"
        @onCreateLookupTable="onCreateLookupTable"
        @onDeleteLookupTable="onDeleteLookupTable"
      />
      <FinalSubScaleBuilder
        :sub-scale="currentActivity.finalSubScale"
        @onCreateLookupTable="onCreateLookupTable(-1)"
        @onDeleteLookupTable="onDeleteLookupTable(-1)"
      />
    </div>
    <v-btn
      color="primary"
      class="mx-4 my-2"
      rounded
      @click="onAddSubScale"
    >
      Add Sub-Scale
    </v-btn>

    <v-dialog
      v-model="subScaleAlert"
      width="350"
    >
      <v-card>
        <v-card-title class="grey lighten-2">
          Sub Scale Alert
        </v-card-title>
        <v-card-text class="pa-4">
          Please insert two or more items with scoring option to add sub-scale.
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="lookupTableDialog"
      persistent
    >
      <LookUpTableUploader
        :key="`lookup-table-${lookupTableUploadDlgKey}`"
        :sub-scale="subScaleEditIndex >= 0 ? currentActivity.subScales[subScaleEditIndex] : currentActivity.finalSubScale"
        :is-final-subscale="subScaleEditIndex < 0"
        @closeLookupTableModal="onCloseLookUpTableModal"
      />
    </v-dialog>
  </v-card>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import config from '../../../config';
import SubScaleBuilder from './SubScaleBuilder';
import { ageScreen, genderScreen } from './lookupTable';
import LookUpTableUploader from './LookUpTableUploader';
import FinalSubScaleBuilder from './FinalSubScaleBuilder';

export default {
  components: {
    SubScaleBuilder,
    LookUpTableUploader,
    FinalSubScaleBuilder,
  },
  data () {
    return {
      subScaleAlert: false,

      lookupTableDialog: false,
      subScaleEditIndex: -1,
      lookupTableUploadDlgKey: 0,
    }
  },
  computed: {
    config () {
      return config;
    },
    ...mapGetters(config.MODULE_NAME,
      [
        'currentActivity'
      ]
    ),
    items() {
      return this.currentActivity && this.currentActivity.items;
    }
  },

  methods: {
    ...mapMutations(config.MODULE_NAME,
      [
        'addSubScale',
        'updateSubScaleData',
        'updateFinalSubScale',
        'deleteItem',
        'addItem'
      ]
    ),

    onAddSubScale () {
      if (!this.subScaleAvailable()) {
        this.subScaleAlert = true;
        return ;
      }
      this.addSubScale();
    },

    subScaleAvailable() {
      let itemsWithScoring = 0;

      for (let item of this.items) {
        if (item.inputType === 'radio' || item.inputType === 'checkbox' || item.inputType === 'prize' || item.inputType === 'slider') {
          if (item.options.hasScoreValue) {
            itemsWithScoring =+ 1;
          }
        }
      }

      return itemsWithScoring >= 1;
    },

    onCreateLookupTable (index) {
      this.lookupTableDialog = true;
      this.subScaleEditIndex = index;
      this.lookupTableUploadDlgKey++;
    },

    onDeleteLookupTable (index) {
      if (index < 0) {
        this.updateFinalSubScale({
          ...this.currentActivity.finalSubScale,
          lookupTable: null
        });

        return ;
      }

      let updatedSubScale = {...this.currentActivity.subScales[index], lookupTable: null};

      this.updateSubScaleData({
        index,
        obj: updatedSubScale
      });

      if (this.currentActivity.subScales.every((subScale) => !subScale['lookupTable'])) {
        const itemCount = this.currentActivity.items.length;

        for (let i = itemCount - 1; i >= 0; i--) {
          if (!this.currentActivity.items[i].allowEdit) {
            this.deleteItem(i);
          }
        }
      }
    },

    onCloseLookUpTableModal(lookupTable) {
      this.lookupTableDialog = false;

      if (!lookupTable) {
        return ;
      }

      if (this.subScaleEditIndex == -1) {
        this.updateFinalSubScale({
          ...this.currentActivity.finalSubScale,
          lookupTable
        });

        return;
      }


      if (!this.currentActivity.subScales.find((subScale) => !!subScale['lookupTable'])) {
        for (let screen of [ageScreen, genderScreen]) {
          this.addItem(screen);
        }
      }

      this.updateSubScaleData({
        index: this.subScaleEditIndex,
        obj: {
          ...this.currentActivity.subScales[this.subScaleEditIndex],
          lookupTable
        }
      })
    },
  }
}
</script>
