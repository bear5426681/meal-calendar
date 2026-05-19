import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'stores/auth'

export default function () {
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createWebHashHistory()
  })

  Router.beforeEach(async (to) => {
    const auth = useAuthStore()
    if (auth.loading) await auth.init()
    if (to.name === 'login' && auth.isLoggedIn) return { name: 'home' }
    return true
  })

  return Router
}
