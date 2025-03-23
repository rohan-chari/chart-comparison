<template>
  <q-select
    v-model="selectedUser"
    class="add-stock-input q-mb-md"
    rounded
    :loading="loading"
    label="Search by username"
    outlined
    dense
    clearable
    use-input
    hide-selected
    :options="userSearchOptions"
    @filter="searchForUsersDelay"
    @update:model-value="handleUserSelection"
  >
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <span><strong>Username:</strong> {{ scope.opt.label }}</span>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from 'src/stores/user-store'

const userStore = useUserStore()
const selectedUser = ref({})
const loading = ref(false)
const userSearchOptions = ref([])

const searchForUsers = async (val, update, abort) => {
  try {
    if (!val) {
      update(() => {
        userSearchOptions.value = []
      })
      return
    }

    loading.value = true
    const results = await userStore.getUserByUsername(val)
    update(() => {
      userSearchOptions.value = results.map((user) => ({
        label: user.username,
        value: user.uid,
      }))
    })
    loading.value = false
  } catch (err) {
    console.error('User search error:', err)
    abort()
    loading.value = false
  }
}

const debounce = (func, delay) => {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

const searchForUsersDelay = debounce(searchForUsers, 1000)

const handleUserSelection = () => {
  // Implement logic when user is selected
}
</script>

<style scoped></style>
