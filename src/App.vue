<template>
  <v-app>
    <activity-set-builder />
  </v-app>
</template>

<style>

.primary {
    background-color: #005fa3 !important;
    border-color: #005fa3 !important;
}

.bg {
    z-index: 0;
    min-height: calc(100% - 72px);
    border-top-style: solid;
    border-top-width: 1px;
    border-top-color: #e1e1e1;
}

.bog {
    background-color: #ffffff;
    background-image: url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80), -moz-linear-gradient(0deg, rgba(255, 255, 255, 0.5) 5%, rgba(255, 255, 255, 1)), url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80);
    background-image: url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80), -webkit-linear-gradient(0deg, rgba(255, 255, 255, 0.5) 5%, rgba(255, 255, 255, 1)), url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80);
    background-image: url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80), -ms-linear-gradient(0deg, rgba(255, 255, 255, 0.5) 5%, rgba(255, 255, 255, 1)), url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80);
    background-image: url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80), linear-gradient(0deg, rgba(255, 255, 255, 0.5) 5%, rgba(255, 255, 255, 1)), url(https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80);
    background-repeat: no-repeat,	no-repeat,	no-repeat, no-repeat;
    background-size: 0px 0px, cover,	cover;
    background-position: top left,	center center, bottom center;
    background-attachment: fixed,	fixed,	fixed;
}
</style>


<script>
import ActivitySetBuilder from './Components/ActivitySetBuilder/ActivitySetBuilder.vue';


export default {

  name: 'App',
  components: {
    ActivitySetBuilder
  },
}
</script>

<style lang="scss">
  @import url('https://fonts.googleapis.com/css?family=IBM+Plex+Sans:300,400');
</style>

<style>

body, html, #app, #dayspan {
  font-family: 'IBM Plex Sans', sans-serif !important;
  width: 100%;
  height: 100%;
}

.v-btn--flat,
.v-text-field--solo .v-input__slot {
  background-color: #f5f5f5 !important;
  margin-bottom: 8px !important;
}

</style>
