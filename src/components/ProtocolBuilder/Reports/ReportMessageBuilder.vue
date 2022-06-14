<template>
  <div>
    <v-switch
      v-model="showMessage"
      @input="updateShowMessage"
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
      @input="updateShowItems"
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
          :key="item.identifier"
          @click="invertSelection(index)"
        >
          <v-list-item-action>
            <v-checkbox
              v-model="selection[item.identifier]"
              color="primary"
              disabled
            />
          </v-list-item-action>

          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
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
      this.$set(this.selection, item.identifier, this.printItems.includes(item));
    }
  },

  methods: {
    updateShowMessage (value) {
      this.$emit('update', this.getChanges(true, this.showMessage, this.showItems));
    },

    updateShowItems (value) {
      this.$emit('update', this.getChanges(false, this.showMessage, this.showItems));
    },

    invertSelection (index) {
      const id = this.itemList[index].identifier;
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
        printItems: showItems ? this.itemList.filter(item => this.selection[item.identifier]) : [],
      };

      if (messageInitialized) {
        changes.initialized = true;
      }

      return changes;
    }
  }
}
</script>
