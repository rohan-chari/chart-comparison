<template>
  <q-page class="flex flex-center">
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    />
  </q-page>
  <StockChart />
</template>

<script setup>
import StockChart from 'src/components/StockChart.vue'
</script>
