<template>
  <q-select
    class="add-stock-input q-ml-md q-mb-md"
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
  <div class="portfolio-manager-container" v-if="portfolio.length">
    <div v-for="(stock, index) in portfolio" :key="index">
      <div class="portfolio-stock" @click="showModalStock(stock)">
        <p class="stock-text">{{ stock.label }}</p>
      </div>
    </div>
    <q-table dense hide-bottom title="Portfolio" :rows="portfolio" :columns="tableColumns" />
    <q-btn color="primary" label="Build Portfolio" @click="buildPortfolio" />
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
import { useChartStore } from 'src/stores/chart-store'
import { computed, ref } from 'vue'

const portfolioStore = usePortfolioStore()
const chartStore = useChartStore()
const stockSearchOptions = ref([])
let showModal = ref(false)
const modalHeader = ref('')
const stockData = ref(null)

const selectedStock = ref(null)

const stockQuantity = ref(null)
const stockCostBasis = ref(null)

const portfolio = computed(() => portfolioStore.getSearchedStocks)

const timeframe = computed(() => chartStore.getTimeFrame)

const text = ref('')
const errorMessage = ref('')

const handleStockSelection = (ticker) => {
  fetchStockDetails(ticker)
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

const tableColumns = [
  {
    name: 'ticker',
    required: true,
    label: 'Stock',
    align: 'left',
    field: (row) => row.value,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'quantity',
    required: true,
    label: 'Quantity',
    align: 'left',
    field: (row) => (row.quantity ? row.quantity : '--'),
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'costBasis',
    required: true,
    label: 'Cost Basis',
    align: 'left',
    field: (row) => (row.costBasis ? row.costBasis : '--'),
    format: (val) => `$${val}`,
    sortable: true,
  },
]

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

const buildPortfolio = async () => {
  await portfolioStore.buildPortfolio(timeframe)
  const portfolioStats = await portfolioStore.performPortfolioCalculations(timeframe)
  portfolioStore.setPorfolioStatistics(portfolioStats)
}

const showModalStock = (stock) => {
  selectedStock.value = stock
  modalHeader.value = stock.label
  stockQuantity.value = stock.quantity || null
  stockCostBasis.value = stock.costBasis || null
  showModal.value = true
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

// Use debounce for filtering stock search
const searchForStockInfoDelay = debounce(searchForStockInfo, 500)
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
