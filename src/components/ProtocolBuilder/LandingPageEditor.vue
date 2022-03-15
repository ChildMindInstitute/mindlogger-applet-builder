<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      max-width="750px"
      persistent
    >
      <v-card>
        <v-card-title class="primary white--text">
          <span class="headline">{{headText}}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <MarkDownEditor
              v-if="inputType == 'markdown'"
              v-model="markdownData"
            />
            <v-textarea
              v-else
              v-model="markdownData"
              solo
            ></v-textarea>
          </v-container>
          <div v-if="headText === 'Text'" class="text-right mr-4">
            {{ markdownData.length }} / 75
          </div>
        </v-card-text>
        <v-card-actions>
          <div
            v-if="markdownData.length > 75 && headText === 'Text'"
            class="ml-4 text-caption red--text"
          >
            * Visibility decreases over 75 characters
          </div>
          <v-spacer />
          <v-btn
            color="blue darken-1"
            text
            @click="closeDialog"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="onSubmit"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>


<script>
import MarkDownEditor from './MarkDownEditor';

export default {
  name: 'LandingPageEditor',
  components: {
    MarkDownEditor,
  },
  props: {
    headText: {
      type: String,
      default: "",
    },
    visibility: {
      type: Boolean,
      default: false,
    },
    markdownText: {
      type: String,
      default: "",
    },
    inputType: {
      type: String,
      default: 'markdown'
    }
  },
  data() {
    return {
      dialog: false,
      editorOptions: {
        hideModeSwitch: false
      },
      markdownData: this.markdownText,
    }
  },
  watch: {
    visibility: function (vis) {
      this.dialog = vis
    }
  },
  methods: {
    /**
     * Submit markdown dialog
     * @param {}
     * @returns {void}
     */
    onSubmit() {
      this.$emit("submit", this.markdownData);
    },

    /**
     * Close form dialog
     * @param {}
     * @returns {void}
     */
    closeDialog(status = false) {
      this.dialog = false;
      this.$emit("close");
    },
  }
}
</script>


<style lang="scss" scoped>

.dialog-container{
  width: 750px !important;
  height: 550px;
  max-width: 90%;
}

.p-markdown {
  height: 405px !important;
}
</style>

<style lang="scss">
// .v-card__text {
//   padding: 16px !important;
// }
</style>