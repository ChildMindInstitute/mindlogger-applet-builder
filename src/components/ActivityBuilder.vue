<template>
  <v-card>
    <v-card-title
      class="headline grey lighten-2"
      primary-title
    >
      New Activity
    </v-card-title>

    <v-card-text>
      Hello
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        text
        @click="onSave"
      >
        Save Activity
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>

export default {
  data: () => ({
      name: '',
      description: '',
      items: [],
      textRules: [
        v => !!v || 'This field is required',
      ],
      lazy: false,
    }),

    methods: {
      validate () {
        if (this.$refs.form.validate()) {
          this.snackbar = true
        }
      },
      reset () {
        this.$refs.form.reset()
      },
      resetValidation () {
        this.$refs.form.resetValidation()
      },
      addItem () {
        console.log('clicked')
        this.dialog = true;
        this.items.push(5)
      },
      onSave() {
        this.$emit('closeModal', 'hello')
      }
    },
};
</script>

