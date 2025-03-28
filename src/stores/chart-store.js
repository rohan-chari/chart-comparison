import { defineStore, acceptHMRUpdate } from 'pinia'

export const useChartStore = defineStore('chart', {
  state: () => ({
    timeframe: {},
    comparisonStocks: [],
    chartData: {},
    followedUsers: [],
    userPortfolio: {},
  }),

  getters: {
    getTimeFrame: (state) => state.timeframe,
    getChartData: (state) => state.chartData,
    getFollowedUsers: (state) => state.followedUsers,
    getUserPortfolio: (state) => state.userPortfolio,
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
      const exists = this.comparisonStocks.some((s) => s.ticker === stock.ticker)
      if (!exists) {
        this.comparisonStocks.push(stock)
        this.applyChartFilters()
      }
    },
    removeStockToCompare(stock) {
      this.comparisonStocks = this.comparisonStocks.filter((s) => s.ticker !== stock.ticker)
      this.applyChartFilters()
    },
    setPortfolio(portfolio) {
      this.userPortfolio = portfolio
      this.timeframe = { from: portfolio.startDate, to: portfolio.endDate }
    },
    setTimeFrame(timeframe) {
      this.timeframe = timeframe
      this.applyChartFilters()
    },
    getComparisonStocks() {
      return this.comparisonStocks
    },
    setComparisonStocks(comparisonStocks) {
      this.comparisonStocks = comparisonStocks || []
    },
    async saveComparisonStocksToPortfolio(userId, token) {
      const payload = {
        comparisonStocks: this.comparisonStocks,
        userId: userId,
      }
      const response = await fetch(`${process.env.REQUEST_IP}/portfolio/save-comparison-stocks`, {
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
    async addFollowedUser(user, userId, token) {
      this.followedUsers.push({
        followedUserDisplayName: user.followedUserDisplayName,
        followedUserUserId: user.followedUserUserId,
        checked: false,
      })
      const payload = {
        followedUsers: this.followedUsers,
        userId: userId,
      }
      const response = await fetch(`${process.env.REQUEST_IP}/portfolio/save-followed-user`, {
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
    async updateFollowedUser(followedUser, userId, token) {
      const payload = {
        followedUser: followedUser,
        userId: userId,
      }
      const response = await fetch(`${process.env.REQUEST_IP}/portfolio/update-followed-user`, {
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
    setFollowedUsers(followedUsers) {
      this.followedUsers = followedUsers || []
    },
    handleLogout() {
      this.timeframe = {}
      this.comparisonStocks = []
      this.chartData = {}
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useChartStore, import.meta.hot))
}
