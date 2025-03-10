<template>
  <div>
    <q-select
      class="add-stock-input q-ml-md"
      rounded
      v-model="text"
      label="Add a stock to the chart"
      outlined
      use-input
      clearable
      :options="stockSearchOptions"
      @filter="searchForStockInfoDelay"
      @update:model-value="handleStockSelection"
    />
    <p v-if="errorMessage" class="q-mt-md text-negative">{{ errorMessage }}</p>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { usePortfolioStore } from 'src/stores/portfolio-store'

const text = ref('')
const stockData = ref(null)
const errorMessage = ref('')
const stockSearchOptions = ref([])
const portfolioStore = usePortfolioStore()

const searchForStockInfo = async (val, update, abort) => {
  try {
    const response = await fetch(
      `${process.env.REQUEST_IP}/stocks?stockInfo=${encodeURIComponent(val)}`,
    )

    if (!response.ok) {
      abort()
      throw new Error('Failed to fetch stocks')
    }

    const data = await response.json()

    update(() => {
      stockSearchOptions.value = data.map((stock) => ({
        label: `${stock.ticker} - ${stock.company_name}`,
        value: stock.ticker,
      }))
    })
  } catch (error) {
    console.error('Stock search error:', error)
    abort()
  }
}

const fetchStockDetails = async (ticker) => {
  if (!ticker) {
    stockData.value = null
    errorMessage.value = ''
    return
  }
  stockData.value = ticker
  try {
    portfolioStore.addStock(stockData.value)
  } catch (error) {
    console.error('Error fetching stock details:', error)
    stockData.value = null
    errorMessage.value = error.message
  }
}

const handleStockSelection = (ticker) => {
  fetchStockDetails(ticker)
}

// Debounce function to prevent excessive API calls
const debounce = (func, delay) => {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

// Use debounce for filtering stock search
const searchForStockInfoDelay = debounce(searchForStockInfo, 500)
</script>
