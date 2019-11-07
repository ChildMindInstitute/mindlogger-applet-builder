<template>
  <v-app>
    <v-content>
      <ActivitySetBuilder/>
    </v-content>
  </v-app>
</template>

<script>
import ActivitySetBuilder from './components/ActivitySetBuilder';

export default {
  name: 'App',
  components: {
    ActivitySetBuilder,
  },
  data: () => ({
    //
  }),
};
</script>
