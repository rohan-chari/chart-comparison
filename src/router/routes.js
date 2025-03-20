import { useUserStore } from 'src/stores/user-store'

const isAuthenticated = () => {
  const userStore = useUserStore()
  return userStore.getUser && userStore.getUser.email ? true : false
}

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },
  {
    path: '/login',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
    beforeEnter: (to, from, next) => {
      if (isAuthenticated()) {
        next('/')
      } else {
        next()
      }
    },
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
