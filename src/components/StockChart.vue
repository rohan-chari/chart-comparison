<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { defineComponent, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import moment from 'moment/moment'
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

    // Function to create the chart
    function createChart(data) {
      if (chartInstance) {
        chartInstance.destroy()
      }
      if (!data || Object.keys(data).length === 0) {
        return
      }

      const labels = data.length
        ? data[0].historicalData.map((entry) => moment.utc(entry.date).format('MM-DD-YYYY'))
        : []
      const datasets = data.map((stock, index) => ({
        label: stock.ticker,
        data: stock.historicalData.map((entry) => entry.percentChange),
        borderColor: generateLineColor(index),
        backgroundColor: 'rgba(0, 0, 255, 0.1)',
        borderWidth: 1,
        pointRadius: 1,
        pointHoverRadius: 2,
        tension: 0.2,
      }))

      chartInstance = new ChartJS(chartCanvas.value, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true },
            tooltip: { enabled: true },
          },
          scales: {
            x: { title: { display: true, text: 'Date' } },
            y: { title: { display: true, text: 'Percent (%) Gain' } },
          },
        },
      })
    }

    const generateLineColor = (index) => {
      let colors = ['blue', 'red', 'green']

      return colors[index]
    }

    // Watch for chart data updates
    watch(
      () => chartStore.chartData,
      (newData) => {
        createChart(newData)
      },
      { deep: true, immediate: true },
    )

    onMounted(() => {
      if (chartStore.chartData.length) {
        createChart(chartStore.chartData)
      }
    })

    onBeforeUnmount(() => {
      if (chartInstance) {
        chartInstance.destroy()
      }
    })

    return { chartCanvas }
  },
})
</script>

<style scoped>
.chart-container {
  width: 800px;
  height: 500px;
}
</style>
