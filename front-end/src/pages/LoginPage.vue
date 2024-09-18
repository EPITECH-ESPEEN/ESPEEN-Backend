<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="submitLogin">
      <div class="form-group">
        <label for="username">Username:</label>
        <input
            type="text"
            id="username"
            v-model="username"
            placeholder="Enter your username"
            required
        />
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            required
        />
      </div>

      <button type="submit">Login</button>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    async submitLogin() {
      try {
        const response = await axios.post('http://127.0.0.1:3000/login', {
          username: this.username,
          password: this.password,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.data.message === 'Login successful') {
          localStorage.setItem('isAuthenticated', true);
          this.$router.push({ name: 'Home' });
        } else {
          this.errorMessage = response.data.message;
        }
      } catch (error) {
        console.error('Login failed:', error);
        this.errorMessage = 'An error occurred. Please try again.';
      }
    },
  },
};
</script>
