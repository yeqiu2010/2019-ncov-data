<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  export default {
    name: 'App'
  };
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }

  @media only screen and (max-width: 720px) {
    html {
      font-size: 52.5%;
    }
  }

  @media only screen and (max-width: 320px) {
    html {
      font-size: 45%;
    }
  }
</style>
