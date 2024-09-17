<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <NameInput/>
</template>

<script>
import NameInput from "@/components/NameInput.vue";

export default {
  name: 'App',
  components: {
    NameInput,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
