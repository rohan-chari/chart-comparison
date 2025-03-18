<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md" style="width: 400px">
      <q-card-section>
        <q-input v-model="email" label="Email" type="email" />
        <q-input v-model="password" label="Password" type="password" />
      </q-card-section>
      <q-card-actions align="center">
        <q-btn label="Login" color="primary" @click="handleLogin" />
        <q-btn label="Register" flat color="secondary" @click="handleRegister" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { login, register } from '../composables/useAuth'

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  await login(email.value, password.value)
}

const handleRegister = async () => {
  await register(email.value, password.value)
}
</script>
