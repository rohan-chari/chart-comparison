<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title> Quasar App </q-toolbar-title>
        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above elevated>
      <q-list>
        <!--Profile Section-->
        <div class="sidebar-item-container">
          <div class="welcome-container row justify-around">
            <q-icon v-if="user" size="2.5rem" name="account_circle" />
            <h6 v-if="!user" header>Welcome</h6>
            <div v-if="user" class="name-email-container">
              <p>{{ user.email }}</p>
              <p>{{ user.displayName }}</p>
            </div>
          </div>
          <div class="row justify-center">
            <q-btn
              color="primary"
              class="login-button"
              v-if="!user"
              label="Login"
              @click="goToLoginPage"
            />
            <q-btn
              color="secondary"
              class="logout-button"
              v-if="user"
              label="Logout"
              @click="logout"
            />
          </div>
        </div>
        <q-separator />
        <!-- Chart Manager Section -->
        <div class="sidebar-item-container">
          <div class="label-and-expansion justify-center" @click="toggleSection('chartManager')">
            <div class="sidebar-option">Timeframe</div>
          </div>
          <q-slide-transition>
            <div v-show="chartManagerisExpanded">
              <ChartManager />
            </div>
          </q-slide-transition>
        </div>

        <q-separator />

        <!-- Portfolio Manager Section -->
        <div class="sidebar-item-container">
          <div
            class="label-and-expansion justify-center"
            @click="toggleSection('portfolioManager')"
          >
            <div class="sidebar-option">My Investments</div>
          </div>
          <q-slide-transition>
            <div v-show="portManagerisExpanded"><PortfolioManager /></div>
          </q-slide-transition>
        </div>

        <q-separator />

        <div class="sidebar-item-container">
          <div
            class="label-and-expansion justify-center"
            @click="toggleSection('comparisonManager')"
          >
            <div class="sidebar-option">Market Benchmarks</div>
          </div>
          <q-slide-transition>
            <div v-show="comparisonManagerisExpanded"><ComparisonManager /></div>
          </q-slide-transition>
        </div>
        <q-separator />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ChartManager from 'src/components/ChartManager.vue'
import PortfolioManager from 'src/components/PortfolioManager.vue'
import ComparisonManager from 'src/components/ComparisonManager.vue'
//import { useChartStore } from 'src/stores/chart-store'
import { logout } from 'src/composables/useAuth'
import { useUserStore } from 'src/stores/user-store'

const leftDrawerOpen = ref(false)
const activeSection = ref(null)
//const chartStore = useChartStore()
const router = useRouter()
const userStore = useUserStore()

const chartManagerisExpanded = computed(() => activeSection.value === 'chartManager')
const portManagerisExpanded = computed(() => activeSection.value === 'portfolioManager')
const comparisonManagerisExpanded = computed(() => activeSection.value === 'comparisonManager')

const user = computed(() => userStore.getUser)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
function goToLoginPage() {
  router.push('/login')
}
function toggleSection(section) {
  activeSection.value = activeSection.value === section ? null : section
}
</script>

<style scoped>
.label-and-expansion {
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
  padding: 8px;
}

.line {
  flex-grow: 1;
  height: 0.5px;
  background-color: grey;
}

.toggle-line:hover {
  .line {
    flex-grow: 1;
    height: 0.5px;
    background-color: rgb(150, 151, 255);
  }
}

.q-icon {
  transition: transform 0.3s ease-in-out;
}

.rotated {
  transform: rotate(90deg);
}
.welcome-container {
  margin-top: 2rem;
  h6 {
    color: black;
    margin-left: 0.5 rem;
    margin-bottom: 1rem;
    margin-top: 0;
  }
  margin-left: 1rem;
  align-items: center;
}
.name-email-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  p {
    margin: 0;
  }
}
.login-button {
  width: 80%;
  margin-bottom: 1rem;
}
.logout-button {
  width: 80%;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}
.sidebar-option {
  width: 90%;
  border-radius: 10px;
  font-size: 1.15rem;
  text-align: center;
  padding: 10px;
  transition: transform 0.3s ease-in-out;
}
.sidebar-option:hover {
  background-color: rgba(233, 233, 233, 0.784);
  transform: scale(1.1);
}
</style>
