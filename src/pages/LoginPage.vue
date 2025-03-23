<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md" style="width: 400px">
      <q-card-section class="text-center">
        <div class="text-h6 q-mb-md">{{ isRegistering ? 'Register' : 'Login' }}</div>
        <q-input v-model="email" label="Email" type="email" class="q-mb-sm" />

        <q-input
          v-if="isRegistering"
          v-model="displayName"
          label="Username"
          type="text"
          class="q-mb-sm"
        />

        <q-input v-model="password" label="Password" type="password" class="q-mb-sm" />

        <p v-if="errorMessage" class="error-message q-mt-sm">{{ errorMessage }}</p>
      </q-card-section>

      <q-card-actions align="center" class="q-gutter-sm justify-center">
        <q-btn
          :label="isRegistering ? 'Register' : 'Login'"
          color="primary"
          @click="isRegistering ? handleRegister() : handleLogin()"
        />
        <q-btn
          :label="isRegistering ? 'Have an account? Login' : 'Need an account? Register'"
          flat
          color="secondary"
          @click="toggleMode"
        />
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
const router = useRouter()

const errorMessage = ref('')
const isRegistering = ref(false)

const toggleMode = () => {
  errorMessage.value = ''
  isRegistering.value = !isRegistering.value
}

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
    errorMessage.value = 'Please fill out all fields'
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
