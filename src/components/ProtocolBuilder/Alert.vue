<template>
  <v-dialog 
    v-model="show"
    persistent
    width="400"
    @click="show = false"
  >

    <v-card 
      class="pt-5 pb-6"
      v-if="isLoading"
    >
      <v-progress-circular 
        class="d-block mx-auto mt-2" 
        color="primary" 
        indeterminate 
        :size="50"
      >
      </v-progress-circular>
    </v-card>
    <!-- Loading -->

    <v-alert
      v-if="isNotify"
      style="margin-bottom: 0px;"
      border="left"
      colored-border
      :type="notify.type"
      elevation="2"
    >
      <h3>{{notify.message}}</h3>
    </v-alert>
    <!-- Notify -->

  </v-dialog>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    notify: {
      type: Object,
      required: true,
    },
  },
  data() {
    return { 
      show: false,
      isLoading: false,
      isNotify: false,
    }
  },
  watch: {

    loading() {
      this.isLoading = this.loading;
      if(!this.isNotify) this.show = this.loading;
    },

    notify() {
      this.isNotify = true;
      this.show = true;
      setTimeout(() => {
        this.show = false;
        this.isNotify = false;
      }, 5000);
    },

  },
}
</script>