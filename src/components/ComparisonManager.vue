<template>
  <div>
    <q-checkbox v-model="chartStore.comparisonStocks.SPY" label="S&P 500" />
  </div>
</template>

<script setup>
import { useChartStore } from 'src/stores/chart-store'

const chartStore = useChartStore()
</script>
