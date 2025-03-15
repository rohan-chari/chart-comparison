<template>
  <div>
    <LineChart
      class="chart"
      v-if="chartData"
      :chart-data="chartData"
      :chart-options="chartOptions"
    />
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
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
import { useChartStore } from 'src/stores/chart-store'

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

    const chartStore = useChartStore()

    async function fetchStockData() {
      try {
        const data = chartStore.getChartData
        const labels = ref([])
        const dataset = ref([])
        if (chartData.value && chartData.value.datasets) {
          chartData.value = null
        }
        if (data[0]) {
          labels.value = data[0].historicalData.map((entry) => new Date(entry.date).toISOString())
        } else {
          labels.value = []
        }
        for (let i = 0; i < data.length; i++) {
          if (data[i] && data[i].historicalData.map((entry) => entry.percentChange)) {
            console.log('pushing,', i)
            dataset.value.push({
              label: i,
              data: data[i].historicalData.map((entry) => entry.percentChange),
              borderColor: 'blue',
              backgroundColor: 'rgba(0, 0, 255, 0.1)',
              borderWidth: 3,
              pointRadius: 1,
              pointHoverRadius: 5,
              tension: 0.2,
            })
          }
        }

        chartData.value = {
          labels,
          datasets: dataset,
        }
      } catch (error) {
        console.error('Error fetching stock data:', error)
      }
    }

    watch(
      () => chartStore.chartData,
      () => {
        console.log('WATCHING')
        fetchStockData()
      },
    )

    return { chartData, chartOptions }
  },
})
</script>

<style scoped>
h2 {
  text-align: center;
  margin-bottom: 20px;
}
.chart {
  width: 800px;
  height: 500px;
}
</style>
