import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

export function useAuth() {
  const userStore = useUserStore()
  const router = useRouter()

  async function login(username: string, password: string) {
    await userStore.login(username, password)
    await userStore.getUserInfo()
    router.push('/dashboard')
  }

  async function logout() {
    userStore.logout()
    router.push('/login')
  }

  return { login, logout, userInfo: userStore.userInfo }
}
