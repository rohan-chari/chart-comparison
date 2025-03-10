<template>
  <div class="portfolio-manager-container" v-if="portfolio.length">
    <div v-for="(stock, index) in portfolio" :key="index">
      <div class="portfolio-stock" @click="showModalStock(stock)">
        <p class="stock-text">{{ stock.label }}</p>
      </div>
    </div>
  </div>
  <div v-else>No stocks found.</div>
  <q-dialog v-model="showModal" fullscreen transition-hide="fade">
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6">{{ modalHeader }}</div>
      </q-card-section>

      <q-card-section>
        <div class="row">
          <q-input
            class="q-ml-md"
            rounded
            v-model="stockQuantity"
            label="Quantity"
            outlined
            clearable
          />
          <q-input
            class="q-ml-md"
            rounded
            prefix="$"
            v-model="stockCostBasis"
            label="Cost Basis"
            outlined
            clearable
          />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" @click="showModal = false" />
        <q-btn flat label="Save Changes" color="primary" @click="saveStockChanges" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { usePortfolioStore } from 'src/stores/portfolio-store'
import { computed, ref } from 'vue'

const portfolioStore = usePortfolioStore()
let showModal = ref(false)
const modalHeader = ref('')

const selectedStock = ref(null)

const stockQuantity = ref(null)
const stockCostBasis = ref(null)

const portfolio = computed(() => portfolioStore.getSearchedStocks)

const saveStockChanges = () => {
  if (selectedStock.value) {
    portfolioStore.updateStock({
      label: selectedStock.value.label,
      quantity: stockQuantity.value,
      costBasis: stockCostBasis.value,
    })
  }
  showModal.value = false
}

const showModalStock = (stock) => {
  selectedStock.value = stock
  modalHeader.value = stock.label
  stockQuantity.value = stock.quantity || null
  stockCostBasis.value = stock.costBasis || null
  showModal.value = true
}
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
