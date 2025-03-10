<template>
  <div>
    <h2>SPY Stock Price History</h2>
    <LineChart v-if="chartData" :chart-data="chartData" :chart-options="chartOptions" />
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { LineChart } from 'vue-chart-3'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  LineController,
  PointElement,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineController,
)

export default defineComponent({
  components: { LineChart },
  setup() {
    const chartData = ref(null)
    const chartOptions = ref({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'Stock Price (USD)' } },
      },
    })

    async function fetchStockData() {
      try {
        const response = await fetch(`${process.env.REQUEST_IP}/stocks/historical/SPY`)
        const data = await response.json()

        // Extract date and closing prices
        const labels = data.historicalData.map((entry) => new Date(entry.date).toLocaleDateString())
        const prices = data.historicalData.map((entry) => entry.close)

        chartData.value = {
          labels,
          datasets: [
            {
              label: 'SPY Closing Price',
              data: prices,
              borderColor: 'blue',
              backgroundColor: 'rgba(0, 0, 255, 0.1)',
              borderWidth: 1,
              pointRadius: 1,
            },
          ],
        }
      } catch (error) {
        console.error('Error fetching stock data:', error)
      }
    }

    onMounted(fetchStockData)

    return { chartData, chartOptions }
  },
})
</script>

<style scoped>
h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style>
