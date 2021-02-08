<template>
  <v-app>
    <Builder />
  </v-app>
</template>

<style>

.primary {
  background-color: #005fa3 !important;
  border-color: #005fa3 !important;
}

.v-application--wrap {
  background: rgb(239,239,243);
}

</style>

<script>
import Builder from './components/ProtocolBuilder/Builder';

export default {
  name: 'App',
  components: {
    Builder
  }
}
</script>

<style lang="scss">
  @import url('https://fonts.googleapis.com/css?family=IBM+Plex+Sans:300,400');
</style>

<style>

body, html, #app {
  font-family: 'IBM Plex Sans', sans-serif !important;
  width: 100%;
  height: 100%;
}

</style>
