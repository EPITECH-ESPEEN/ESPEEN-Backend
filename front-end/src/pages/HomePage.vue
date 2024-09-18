<template>
  <div>
    <h1>Welcome to the Home Page</h1>
    <p>This is the page you see after logging in.</p>
    <button @click="logout">Logout</button>
  </div>
  <NameInput/>
</template>

<script>
import NameInput from "@/components/NameInput.vue";

export default {
  components: {NameInput},
  methods: {
    logout() {
      localStorage.removeItem('isAuthenticated');
      this.$router.push({ name: 'Login' });
    }
  }
};
</script>
