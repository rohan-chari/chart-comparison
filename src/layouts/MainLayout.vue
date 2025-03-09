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
        <!-- Chart Manager Section -->
        <div class="sidebar-item-container">
          <div class="label-and-expansion" @click="isExpanded = !isExpanded">
            <q-item-label header> Chart Manager </q-item-label>
            <div class="toggle-line">
              <div class="line"></div>
              <q-icon name="keyboard_arrow_right" :class="{ rotated: isExpanded }" />
            </div>
          </div>
          <q-slide-transition>
            <div v-show="isExpanded">
              <StockAdder />
            </div>
          </q-slide-transition>
        </div>

        <!-- Portfolio Manager Section -->
        <div class="sidebar-item-container">
          <div class="label-and-expansion" @click="isExpanded = !isExpanded">
            <q-item-label header> Portfolio Manager </q-item-label>
            <div class="toggle-line">
              <div class="line"></div>
              <q-icon name="keyboard_arrow_right" :class="{ rotated: isExpanded }" />
            </div>
          </div>
          <q-slide-transition>
            <div v-show="isExpanded"></div>
          </q-slide-transition>
        </div>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import StockAdder from 'components/StockAdder.vue'

const leftDrawerOpen = ref(false)
const isExpanded = ref(true)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
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

.toggle-line {
  display: flex;
  align-items: center;
  flex-grow: 1;
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
</style>
