<template>
  <div class="pt-2 pb-6">
    <div class="score-id">
      {{ scoreId }}
    </div>

    <div class="d-flex align-center">
      <div
        v-if="!expanded"
      >
        <v-btn
          class="move-icon dragging-handle"
          icon
        >
          <img class="px-2 drag-indicator" :src="baseImageURL + 'drag_indicator.png'" />
        </v-btn>
      </div>

      <div
        :style="expanded ? 'padding-left: 20px;' : ''"
        class="section-name"
      >
        {{ name }}
      </div>

      <v-btn
        @click="$emit('deleteReport')"
        color="white"
        class="mx-4"
      >
        <v-icon color="black">
          mdi-delete
        </v-icon>
      </v-btn>

      <v-btn
        v-if="expanded"
        icon
        @click="$emit('setExpanded', false)"
        class="mx-4"
      >
        <v-icon>
          mdi-chevron-up
        </v-icon>
      </v-btn>

      <v-btn
        v-else
        icon
        @click="$emit('setExpanded', true)"
        class="mx-4"
      >
        <v-icon>
          mdi-chevron-down
        </v-icon>
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
  .score-id {
    height: 32px;
    line-height: 22px;
    font-size: 16px;
    color: #6F7070;
    padding: 5px 20px;
  }

  .move-icon {
    cursor: move;
  }

  .section-name {
    text-align: left;
    flex-grow: 1;
    font-size: 22px;
  }
</style>

<script>
import config from '../../../config';
import { mapGetters } from 'vuex';

export default {
  props: {
    name: {
      type: String,
      required: true
    },
    expanded: {
      type: Boolean,
      required: true
    },
    scoreId: {
      type: String,
      required: true
    }
  },

  computed: {
    ...mapGetters(config.MODULE_NAME,
      [
        'baseImageURL',
      ]
    ),
  }
}
</script>
