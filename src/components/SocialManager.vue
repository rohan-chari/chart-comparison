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
      @update:model-value="updateFollowedUser(user)"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from 'src/stores/user-store'
import { useChartStore } from 'src/stores/chart-store'
import { usePortfolioStore } from 'src/stores/portfolio-store'
import { useQuasar } from 'quasar'

const userStore = useUserStore()
const chartStore = useChartStore()
const portfolioStore = usePortfolioStore()
const selectedUser = ref({})
const loading = ref(false)
const userSearchOptions = ref([])

const $q = useQuasar()

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

const handleUserSelection = async (user) => {
  if (user.followedUserUserId == userStore.getUser.uid) {
    $q.notify({
      message: `Cannot follow yourself!`,
      type: 'negative',
      position: 'top',
      timeout: 3000,
    })
    return
  }
  if (!followedUsers.value.some((fu) => user.followedUserUserId == fu.followedUserUserId)) {
    await chartStore.addFollowedUser(user, userStore.getUser.uid, userStore.getToken)
  }
}

const updateFollowedUser = async (followedUser) => {
  if (followedUser.followedUserUserId && followedUser.followedUserDisplayName) {
    await chartStore.updateFollowedUser(followedUser, userStore.getUser.uid, userStore.getToken)
    if (followedUser.checked) {
      const portfolio = await portfolioStore.getPortfolio(userStore.getUser.uid, userStore.getToken)
      const portfolioStatistics = await portfolioStore.performPortfolioCalculations(
        ref({
          from: portfolio.startDate,
          to: portfolio.endDate,
        }),
        portfolio.followedUserPortfolios,
      )
      portfolioStore.setPorfolioStatistics(portfolioStatistics)
    } else if (!followedUser.checked) {
      portfolioStore.unfollowFollowedUser(followedUser.followedUserUserId)
    }
  }
}
</script>

<style scoped></style>
