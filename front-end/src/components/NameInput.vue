<template>
  <div>
    <label for="name">Entrez votre nom :</label>
    <input type="text" id="name" v-model="name" @blur="fetchGreeting">
    <p>{{ message }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      name: '',
      message: 'En attente de votre nom...'
    };
  },
  methods: {
    async fetchGreeting() {
      try {
        const response = await axios.get(`http://127.0.0.1:3000/hello/${this.name}`);
        this.message = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération du message :', error);
        this.message = 'Erreur lors de la récupération du message.';
      }
    }
  }
};
</script>

<style scoped>
label {
  margin-right: 10px;
}

input {
  margin-bottom: 10px;
}

p {
  font-weight: bold;
}
</style>
