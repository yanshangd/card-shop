
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/supabaseApi'

export const useUserStore = defineStore('user', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || '')
  const admin = ref(JSON.parse(localStorage.getItem('admin') || 'null'))
  const adminToken = ref(localStorage.getItem('adminToken') || '')

  const isAdminLoggedIn = computed(() => !!admin.value && !!adminToken.value)

  const login = async (data) => {
    const res = await authApi.login(data)
    if (res.success) {
      user.value = res.data
      token.value = res.data.token
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data))
      return true
    }
    return false
  }

  const register = async (data) => {
    const res = await authApi.register(data)
    if (res.success) {
      user.value = res.data
      token.value = res.data.token
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data))
      return true
    }
    return false
  }

  const logout = async () => {
    await authApi.logout()
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const fetchUserInfo = async () => {
    if (!token.value) return
    try {
      const res = await authApi.getMe()
      if (res.success) {
        user.value = res.data
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  const adminLogin = async (data) => {
    const res = await authApi.adminLogin(data)
    if (res.success) {
      admin.value = res.data
      adminToken.value = res.data.token
      localStorage.setItem('adminToken', res.data.token)
      localStorage.setItem('admin', JSON.stringify(res.data))
      return true
    }
    return false
  }

  const adminLogout = async () => {
    await authApi.adminLogout()
    admin.value = null
    adminToken.value = ''
    localStorage.removeItem('adminToken')
    localStorage.removeItem('admin')
  }

  return {
    user,
    token,
    admin,
    adminToken,
    isAdminLoggedIn,
    login,
    register,
    logout,
    fetchUserInfo,
    adminLogin,
    adminLogout
  }
})
