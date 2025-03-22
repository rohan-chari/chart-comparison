<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { defineComponent, onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import moment from 'moment'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineController,
} from 'chart.js'
import { useChartStore } from 'src/stores/chart-store'
import { usePortfolioStore } from 'src/stores/portfolio-store'

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
  setup() {
    const chartCanvas = ref(null)
    let chartInstance = null

    const chartStore = useChartStore()
    const portfolioStore = usePortfolioStore()

    // Combine chartStore and portfolioStore data into one array
    const combinedChartData = computed(() => {
      const stockData = chartStore.getChartData || []
      const portfolioStats = portfolioStore.getPortfolioStatistics || []
      let result = []

      if (portfolioStats.length) {
        result.push({
          ticker: 'Your Portfolio',
          historicalData: portfolioStats[0].historicalData,
          isPortfolio: true,
        })
      }

      if (stockData.length) {
        result = result.concat(stockData)
      }

      return result
    })

    const generateLineColor = (index) => {
      const hue = (index * 60) % 360
      return `hsl(${hue}, 40%, 50%)`
    }

    function createChart(data) {
      if (chartInstance) {
        chartInstance.destroy()
      }

      if (!data || data.length === 0 || !data[0].historicalData) return

      const labels = data[0].historicalData.map((entry) =>
        moment.utc(entry.date).format('MM-DD-YYYY'),
      )

      const datasets = data.map((stock, index) => ({
        label: stock.isPortfolio ? 'Your Portfolio' : stock.ticker,
        data: stock.historicalData.map((entry) => entry.percentChange),
        borderColor: stock.isPortfolio ? 'purple' : generateLineColor(index),
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        pointRadius: 1,
        pointHoverRadius: 2,
        tension: 0.2,
      }))

      chartInstance = new ChartJS(chartCanvas.value, {
        type: 'line',
        data: {
          labels,
          datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            tooltip: { enabled: true },
          },
          scales: {
            x: {
              title: { display: true, text: 'Date' },
            },
            y: {
              title: { display: true, text: 'Percent (%) Gain' },
            },
          },
        },
      })
    }

    watch(
      combinedChartData,
      (newData) => {
        createChart(newData)
      },
      { deep: true, immediate: true },
    )

    onMounted(() => {
      createChart(combinedChartData.value)
    })

    onBeforeUnmount(() => {
      if (chartInstance) {
        chartInstance.destroy()
      }
    })

    return {
      chartCanvas,
    }
  },
})
</script>

<style scoped>
.chart-container {
  width: 800px;
  height: 500px;
}
</style>
