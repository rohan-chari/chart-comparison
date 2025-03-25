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
          <span><strong>Username:</strong> {{ scope.opt.followedUserDisplayName }}</span>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
  <div class="checkbox-list">
    <q-checkbox
      v-model="user.checked"
      v-for="user in followedUsers"
      :key="user.followedUserUserId"
      :label="user.followedUserDisplayName"
      @update:model-value="s"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from 'src/stores/user-store'
import { useChartStore } from 'src/stores/chart-store'

const userStore = useUserStore()
const chartStore = useChartStore()
const selectedUser = ref({})
const loading = ref(false)
const userSearchOptions = ref([])

const followedUsers = computed(() => chartStore.getFollowedUsers)

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
        followedUserDisplayName: user.username,
        followedUserUserId: user.userId,
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

const handleUserSelection = (user) => {
  if (!followedUsers.value.some((fu) => user.followedUserUserId == fu.followedUserUserId)) {
    chartStore.addFollowedUser(user, userStore.getUser.uid, userStore.getToken)
  }
}
</script>

<style scoped></style>
