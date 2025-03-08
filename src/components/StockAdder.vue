<template>
  <div>
    <q-input
      class="add-stock-input q-ml-md"
      rounded
      v-model="text"
      label="Add a stock to the chart"
      outlined
      @update:model-value="searchForStockInfo"
    />
    <div v-if="stockData" class="q-mt-md">
      <p><strong>Ticker:</strong> {{ stockData.ticker }}</p>
      <p><strong>Company:</strong> {{ stockData.company_name }}</p>
      <p><strong>Exchange:</strong> {{ stockData.exchange }}</p>
      <p><strong>Sector:</strong> {{ stockData.sector }}</p>
    </div>
    <p v-if="errorMessage" class="q-mt-md text-negative">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const text = ref('')
const stockData = ref(null)
const errorMessage = ref('')

const searchForStockInfo = async () => {
  if (text.value.trim() === '') {
    stockData.value = null
    errorMessage.value = ''
    return
  }

  try {
    const response = await fetch(
      `${process.env.REQUEST_IP}/stocks?stockInfo=${encodeURIComponent(text.value)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Stock not found')
    }

    const data = await response.json()
    stockData.value = data
    errorMessage.value = ''
  } catch (error) {
    console.error('Error fetching stock info:', error)
    stockData.value = null
    errorMessage.value = error.message
  }
}
</script>
