<template>
  <v-dialog
    v-model="show"
    width="400"
    persistent
    @click:outside="close"
  >
    <v-alert
      style="margin-bottom: 0px;"
      border="left"
      colored-border
      :type="notify.type"
      elevation="2"
    >
      <h3>{{notify.message}}</h3>
    </v-alert>
  </v-dialog>
</template>

<script>
// notify: {
//   type: '', // error, success, warning
//   message: '', // message
//   duration: 300, // 300, 1000, 2000
// }

export default {
  props: {
    notify: {
      type: Object,
      required: true,
    },
  },
  data: () => {
    return {
      show: false,
    }
  },
  watch: {
    notify() {
      this.show = true;
      if(this.notify.duration) {
        setTimeout(() => {
          this.show = false;
        }, this.notify.duration);
      }
    },
  },
  methods: {
    close() {
      this.show = false;
    },
  },
}
</script>