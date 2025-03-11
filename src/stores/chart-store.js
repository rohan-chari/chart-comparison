import { defineStore, acceptHMRUpdate } from 'pinia'

export const useChartStore = defineStore('chart', {
  state: () => ({
    timeframe: {},
    comparisonStocks: {},
  }),

  getters: {
    getTimeFrame: (state) => state.timeframe,
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

        const data = await response.json()
        console.log(data)
      } catch (error) {
        console.error('Error updating chart:', error)
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useChartStore, import.meta.hot))
}
