import { defineStore, acceptHMRUpdate } from 'pinia'

export const usePortfolioStore = defineStore('portfolio', {
  state: () => ({
    searchedStocks: [],
    portfolioStatistics: [],
  }),

  getters: {
    getSearchedStocks: (state) => state.searchedStocks,
    getPortfolioStatistics: (state) => state.portfolioStatistics,
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
    async performPortfolioCalculations(timeframe) {
      const payload = {
        portfolioStocks: this.searchedStocks.map((ss) => ({
          ticker: ss.value,
          quantity: ss.quantity,
          costBasis: ss.costBasis,
        })),
        start: timeframe.value.from,
        end: timeframe.value.to,
      }
      const response = await fetch(`${process.env.REQUEST_IP}/portfolio/calculation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      return data
    },
    setPorfolioStatistics(portfolioStatistics) {
      this.portfolioStatistics.push(portfolioStatistics)
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePortfolioStore, import.meta.hot))
}
