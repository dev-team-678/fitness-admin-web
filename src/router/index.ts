import { createRouter, createWebHistory } from 'vue-router'
import { staticRoutes } from './static-routes'
import { setupRouterGuards } from './guards'

const router = createRouter({
  history: createWebHistory(),
  routes: staticRoutes,
  scrollBehavior: () => ({ top: 0 }),
})

setupRouterGuards(router)

export default router
