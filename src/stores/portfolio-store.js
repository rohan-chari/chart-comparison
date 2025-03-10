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
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePortfolioStore, import.meta.hot))
}
