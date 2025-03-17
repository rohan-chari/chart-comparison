import { defineStore, acceptHMRUpdate } from 'pinia'

export const usePortfolioStore = defineStore('portfolio', {
  state: () => ({
    searchedStocks: [],
  }),

  getters: {
    getSearchedStocks: (state) => state.searchedStocks,
  },

  actions: {
    addStock(stock) {
      if (!this.searchedStocks.some((s) => s.value === stock.value)) {
        this.searchedStocks.push(stock)
      }
    },

    removeStock(ticker) {
      this.searchedStocks = this.searchedStocks.filter((stock) => stock.ticker !== ticker)
    },
    updateStock(updatedStock) {
      const stockIndex = this.searchedStocks.findIndex((s) => s.label === updatedStock.label)
      if (stockIndex !== -1) {
        this.searchedStocks[stockIndex] = { ...this.searchedStocks[stockIndex], ...updatedStock }
      } else {
        this.searchedStocks.push(updatedStock)
      }
    },
    async buildPortfolio(timeframe) {
      let tickers = this.searchedStocks.map((ss) => ss.value)
      const encodedTickers = encodeURIComponent(tickers)
      const timeframeFrom = timeframe.value.from
      const timeframeTo = timeframe.value.to
      await fetch(
        `${process.env.REQUEST_IP}/stocks/historical?tickers=${encodedTickers}&start=${timeframeFrom}&end=${timeframeTo}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePortfolioStore, import.meta.hot))
}
