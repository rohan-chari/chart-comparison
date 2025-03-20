<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md" style="width: 400px">
      <q-card-section>
        <q-input v-model="email" label="Email" type="email" />
        <q-input v-model="displayName" label="Username" type="text" />
        <q-input v-model="password" label="Password" type="password" />
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
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
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const email = ref('')
const displayName = ref('')
const password = ref('')
const $q = useQuasar()

const errorMessage = ref('')
const router = useRouter()

const handleLogin = async () => {
  errorMessage.value = ''
  const loginSuccess = await login(email.value, password.value)
  if (loginSuccess.success) {
    $q.notify({
      message: loginSuccess.message,
      type: 'positive',
      position: 'top',
      timeout: 3000,
    })
    router.push('/')
  } else {
    errorMessage.value = loginSuccess.message
  }
}

const handleRegister = async () => {
  errorMessage.value = ''

  if (!email.value || !displayName.value || !password.value) {
    errorMessage.value = 'Please fill out all required fields'
    return
  }
  const registration = await register(email.value, displayName.value, password.value)
  if (!registration.registered) {
    errorMessage.value = registration.message
  }
  $q.notify({
    message: registration.message,
    type: registration.registered ? 'positive' : 'negative',
    position: 'top',
    timeout: 3000,
  })
}
</script>
<style scoped>
.error-message {
  color: red;
  font-style: italic;
}
</style>
