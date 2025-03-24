<template>
  <div class="checkbox-list">
    <q-checkbox
      v-model="stock.value"
      v-for="stock in comparisonStocksList"
      :key="stock.ticker"
      :label="stock.label"
      @update:model-value="updateChart(stock)"
    />
  </div>
</template>

<script setup>
import { useChartStore } from 'src/stores/chart-store'
import { useUserStore } from 'src/stores/user-store'
import { ref, watch } from 'vue'
const chartStore = useChartStore()
const userStore = useUserStore()
const comparisonStocksList = ref([
  { label: 'S&P 500', ticker: 'SPY', value: false },
  { label: 'NASDAQ', ticker: 'QQQ', value: false },
])

const updateChart = async (stock) => {
  if (stock.value) {
    chartStore.addStockToCompare(stock)
  } else if (!stock.value) {
    chartStore.removeStockToCompare(stock)
  }
  await chartStore.saveComparisonStocksToPortfolio(userStore.getUser.uid, userStore.getToken)
}

watch(
  () => chartStore.comparisonStocks,
  (newData) => {
    const tickersInStore = newData.map((s) => s.ticker)
    comparisonStocksList.value = comparisonStocksList.value.map((stock) => ({
      ...stock,
      value: tickersInStore.includes(stock.ticker),
    }))
  },
  { deep: true, immediate: true },
)
</script>
<style scoped></style>
