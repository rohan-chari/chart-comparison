<template>
  <div>
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
import { ref } from 'vue'
const chartStore = useChartStore()
const comparisonStocksList = ref([
  { label: 'S&P 500', ticker: 'SPY', value: false },
  { label: 'NASDAQ', ticker: 'QQQ', value: false },
])

const updateChart = (stock) => {
  if (stock.value) {
    chartStore.addStockToCompare(stock)
  } else if (!stock.value) {
    chartStore.removeStockToCompare(stock)
  }
}
</script>
