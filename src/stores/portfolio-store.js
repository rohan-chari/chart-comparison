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
      this.portfolioStatistics = []
      this.portfolioStatistics.push(portfolioStatistics)
    },
    async saveTimeframePortfolio(startDate, endDate, userId, token) {
      const payload = {
        startDate: startDate,
        endDate: endDate,
        userId: userId,
      }
      const response = await fetch(`${process.env.REQUEST_IP}/portfolio/save-timeframe`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      return data
    },
    async saveStocksPortfolio(userId, token) {
      const payload = {
        userId: userId,
        token: token,
        portfolioStocks: this.searchedStocks,
      }
      const response = await fetch(`${process.env.REQUEST_IP}/portfolio/save-stocks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      return data
    },
    async getPortfolio(userId, token) {
      const response = await fetch(
        `${process.env.REQUEST_IP}/portfolio/get-portfolio?userId=${userId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      const data = await response.json()
      return data
    },
    setPortfolio(portfolio) {
      if (portfolio.portfolioStocks) {
        this.searchedStocks = portfolio.portfolioStocks
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePortfolioStore, import.meta.hot))
}
