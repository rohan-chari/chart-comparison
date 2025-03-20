import { defineStore, acceptHMRUpdate } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {},
    token: '',
  }),

  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
  },

  actions: {
    setUser(user) {
      this.user = user
    },
    setToken(token) {
      this.token = token
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
