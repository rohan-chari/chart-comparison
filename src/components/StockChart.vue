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
      if (portfolioStats.length && portfolioStats[0].followedUsers) {
        portfolioStats[0].followedUsers.map((fuPortfolio) => {
          let tempUserName = chartStore.getFollowedUsers.find(
            (u) => u.followedUserUserId == fuPortfolio.userId,
          ).followedUserDisplayName
          result.push({
            ticker: `${tempUserName}'s Portfolio`,
            historicalData: fuPortfolio.historicalData,
            isPortfolio: false,
          })
        })
      }

      if (stockData.length) {
        result = result.concat(stockData)
      }
      return result
    })

    const generateLineColor = (index, alpha = 1) => {
      const hue = (index * 60) % 360
      const saturation = 40
      const lightness = 50
      const [r, g, b] = hslToRgb(hue, saturation, lightness)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    const hslToRgb = (h, s, l) => {
      s /= 100
      l /= 100

      const k = (n) => (n + h / 30) % 12
      const a = s * Math.min(l, 1 - l)
      const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))

      return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))]
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
        borderColor: stock.isPortfolio ? 'purple' : generateLineColor(index, 1),
        backgroundColor: stock.isPortfolio
          ? 'rgba(128, 0, 128, 0.25)'
          : generateLineColor(index, 0.25),
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
