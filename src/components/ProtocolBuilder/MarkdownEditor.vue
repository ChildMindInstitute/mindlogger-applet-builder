<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      max-width="750px"
      persistent
    >
      <v-card>
        <v-card-title class="primary white--text">
          <span class="headline">About Page</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <Editor 
              class="p-markdown mt-5"
              ref="markdownEditor"
              :initialValue="markdownText"
              :options="editorOptions"
              previewStyle="vertical"
            />
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
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
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/vue-editor'

export default {
  name: 'MarkdownEditor',
  components: {
    Editor,
  },
  props: {
    visibility: {
      type: Boolean,
      default: false,
    },
    markdownText: {
      type: String,
      default: "",
    }
  },
  data() {
    return {
      dialog: false,
      editorOptions: {
        hideModeSwitch: false
      }
    }
  },
  methods: {
    /**
     * Submit markdown dialog
     * @param {}
     * @returns {void} 
     */
    onSubmit() {
      const markdownData = this.$refs.markdownEditor.invoke("getMarkdown")
      this.$emit("submit", markdownData)
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
  },
  watch: {
    visibility: function (vis) {
      this.dialog = vis
    }
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