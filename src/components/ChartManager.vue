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
    <div class="q-mt-sm">
      <q-input
        v-model="timeframeString"
        label="Enter a timeframe"
        clearable
        rounded
        outlined
        class="add-stock-input q-ml-md"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date
                v-model="timeframeDates"
                mask="MM/DD/YYYY"
                range
                @update:model-value="updateFormattedTimeframe"
              >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>

    <p v-if="errorMessage" class="q-mt-md text-negative">{{ errorMessage }}</p>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { usePortfolioStore } from 'src/stores/portfolio-store'
import { useChartStore } from 'src/stores/chart-store'

const text = ref('')
const stockData = ref(null)
const errorMessage = ref('')
const stockSearchOptions = ref([])
const portfolioStore = usePortfolioStore()
const chartStore = useChartStore()

const timeframeDates = ref(null)
const timeframeString = ref('')

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
const updateFormattedTimeframe = async () => {
  if (timeframeDates.value.from && timeframeDates.value.to) {
    timeframeString.value = `${timeframeDates.value.from} - ${timeframeDates.value.to}`
    chartStore.timeframe.from = timeframeDates.value.from
    chartStore.timeframe.to = timeframeDates.value.to
  } else {
    timeframeString.value = ''
  }
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
