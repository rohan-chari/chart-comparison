import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'

export const useChartStore = defineStore('chart', {
  state: () => ({
    timeframe: {},
    comparisonStocks: ref([]),
    chartData: {},
  }),

  getters: {
    getTimeFrame: (state) => state.timeframe,
    getChartData: (state) => state.chartData,
  },

  actions: {
    async applyChartFilters() {
      const payload = {
        timeframeStartDate: this.timeframe.from,
        timeframeEndDate: this.timeframe.to,
        comparisonStocks: this.comparisonStocks,
      }

      try {
        const response = await fetch(`${process.env.REQUEST_IP}/chart/historical`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        this.chartData = await response.json()
      } catch (error) {
        console.error('Error updating chart:', error)
      }
    },
    addStockToCompare(stock) {
      this.comparisonStocks.push(stock)
      this.applyChartFilters()
    },
    removeStockToCompare(stock) {
      this.comparisonStocks = this.comparisonStocks.filter((s) => s != stock)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useChartStore, import.meta.hot))
}
