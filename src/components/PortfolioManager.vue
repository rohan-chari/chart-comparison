<template>
  <div class="portfolio-manager-container" v-if="portfolio.length">
    <div v-for="(stock, index) in portfolio" :key="index">
      <div class="portfolio-stock" @click="showModal = true">
        <p class="stock-text">{{ stock.label }}</p>
      </div>
    </div>
  </div>
  <div v-else>No stocks found.</div>

  <q-dialog v-model="showModal" fullscreen transition-hide="fade">
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6">This is a Modal!</div>
      </q-card-section>

      <q-card-section> Some content inside the popup. </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" @click="showModal = false" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { usePortfolioStore } from 'src/stores/portfolio-store'
import { computed, ref } from 'vue'

const portfolioStore = usePortfolioStore()
const showModal = ref(false)

const portfolio = computed(() => portfolioStore.getSearchedStocks)
</script>
<style scoped>
.portfolio-stock {
  display: flex;
  justify-content: center;
  background-color: rgb(224, 224, 224);
  padding: 10px;
  width: 230px;
  border-radius: 15px;
  transition: transform 0.1s ease-in-out;
}
.portfolio-stock:hover {
  transform: scale(1.1);
  cursor: pointer;
}
.portfolio-manager-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.stock-text {
  margin: 0;
}
</style>
