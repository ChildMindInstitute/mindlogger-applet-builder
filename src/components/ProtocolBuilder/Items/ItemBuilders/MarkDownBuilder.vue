<template>
  <div>
    Message:
    <MarkDownEditor
      :value="markdown"
      @input="onUpdateMarkdown"
    />

    <v-divider
      class="my-4"
    />

    <ItemTimerOption
      colClasses="d-flex align-center py-0 px-3"
      @update="updateTimerOption"
      :responseTimeLimit="timer"
    />
    <v-row>
      <v-col
        class="d-flex align-center"
        cols="12"
        sm="3"
      >
        <v-checkbox
          v-model="removeBackOption"
          label="Remove ability to go back to the previous item"
          @change="update"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ItemTimerOption from '../../Partial/ItemTimerOption';
import MarkDownEditor from "../../MarkDownEditor";

export default {
  components: {
    ItemTimerOption,
    MarkDownEditor,
  },
  props: {
    initialItemData: {
      type: Object,
      required: true
    },
    markdownText: {
      type: String,
      default: "",
    },
    timer: {
      type: Number,
      required: false
    },
  },
  data: function () {
    return {
      markdown: this.markdownText || "",
      removeBackOption: this.initialItemData.removeBackOption,
    };
  },

  computed: {
    isSkippable: {
      get() {
        return this.isSkippableItem === 1 || false;
      },
      set(value) {
        this.$emit('updateAllow', value);
      }
    }
  },

  methods: {
    updateTimerOption(option) {
      this.$emit('updateTimer', option.responseTimeLimit)
    },
    onUpdateMarkdown (markdownText) {
      this.$emit('onUpdateMarkdown', markdownText);
    },
    update () {
      const responseOptions = {
        'removeBackOption': this.removeBackOption,
      };
      this.$emit('updateOptions', responseOptions);
    },
    updateAnswer() {
      const { correctAnswer, requiredAnswer } = this;

      if (!requiredAnswer) {
        this.$emit('updateAnswer', "");
      } else {
        this.$emit('updateAnswer', correctAnswer);
      }
    },
  }
}
</script>
