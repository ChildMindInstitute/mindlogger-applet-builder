<template>
  <div>
    <v-switch
      v-model="showMessage"
      @change="updateShowMessage"
      inset
      hide-details
    >
      <template v-slot:label>
        <span class="mr-1">Show message</span>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon v-bind="attrs" v-on="on" class="pb-1" small>mdi-help-circle</v-icon>
          </template>

          <div class="tooltip-text">
            To print the value of the score, surround the Score ID in [[   ]] or select it using the add variable button below:

            i.e. You scored [[{{ scoreId }}]] on the Happiness scale.
          </div>
        </v-tooltip>
      </template>
    </v-switch>

    <MarkDownEditor
      v-if="showMessage"
      class="my-4"
      v-model="message"
      @input="onChangeMessage"
    />

    <v-switch
      v-model="showItems"
      @change="updateShowItems"
      label="Print Items"
      inset
      hide-details
    />

    <v-card
      v-if="showItems"
      class="item-list my-4"
    >
      <v-list>
        <v-list-item
          v-for="(item, index) in itemList"
          :key="index"
          @click="invertSelection(index)"
        >
          <v-list-item-action>
            <v-checkbox
              v-model="selection[getIdentifier(item)]"
              color="primary"
              disabled
            />
          </v-list-item-action>

          <v-list-item-title>{{ item.name }}: {{ getQuestion(item.question.text) }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>

    <div class="mt-4 error-message" v-if="!scoreId && !showMessage && !showItems">
      You must show a message or print items to publish this report
    </div>
  </div>
</template>

<style scoped>
.tooltip-text {
  max-width: 270px;
}

.item-list {
  height: 250px;
  overflow: auto;
}
.error-message {
  color: rgb(255, 82, 82);
}
</style>

<script>
import MarkDownEditor from '../MarkDownEditor';

export default {
  components: {
    MarkDownEditor,
  },
  props: {
    container: {
      type: Object,
      required: true
    },
    itemList: {
      type: Array,
      required: true
    },
    scoreId: {
      type: String,
      required: false,
      default: ''
    }
  },

  data () {
    return {
      message: this.container.message,
      showMessage: this.container.showMessage,
      showItems: this.container.showItems,
      printItems: this.container.printItems,
      selection: {}
    }
  },

  beforeMount () {
    for (const item of this.itemList) {
      this.$set(this.selection, this.getIdentifier(item), this.printItems.includes(item.name));
    }
  },

  methods: {
    getIdentifier (item) {
      return `${item.timestamp}-${item.id || 0}`;
    },

    updateShowMessage () {
      this.$emit('update', this.getChanges(true, this.showMessage, this.showItems));
    },

    updateShowItems () {
      this.$emit('update', this.getChanges(false, this.showMessage, this.showItems));
    },

    invertSelection (index) {
      const id = this.getIdentifier(this.itemList[index]);
      const value = !this.selection[id];

      this.$set(this.selection, id, value);
      this.$emit('update', this.getChanges(false, this.showMessage, this.showItems));
    },

    onChangeMessage () {
      this.$emit('update', {
        message: this.message,
        initialized: true
      });
    },

    getChanges (messageInitialized, showMessage, showItems) {
      const changes = {
        showMessage,
        showItems,
        message: showMessage ? this.message : '',
        printItems: showItems ? this.itemList.filter(item => this.selection[this.getIdentifier(item)]).map(item => item.name) : [],
      };

      if (messageInitialized) {
        changes.initialized = true;
      }

      return changes;
    },

    getQuestion (text) {
      return text.replace(/[#*]/g, '').replace(/\!\[.*?\]\(.*?\)/g, '');
    }
  }
}
</script>
