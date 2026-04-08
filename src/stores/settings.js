import { defineStore } from 'pinia'
import { ref } from 'vue'
import { settingsApi } from '@/api/supabaseApi'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({
    site_name: '自动发卡商城',
    site_notice: '',
    customer_service: '',
    payment_methods: [],
    epay_enabled: false,
    epay_app_id: '',
    epay_app_secret: '',
    epay_gateway: '',
    email_enabled: false,
    email_smtp_host: '',
    email_smtp_port: '587',
    email_username: '',
    email_password: '',
    email_send_from: '',
    auto_send_card_email: false,
    email_subject: '您的卡密已发货',
    email_template: ''
  })
  const loading = ref(false)

  const fetchSettings = async () => {
    try {
      loading.value = true
      const res = await settingsApi.getSettings()
      if (res.success) {
        settings.value = { ...settings.value, ...res.data }
      }
    } catch (error) {
      console.error('获取设置失败:', error)
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (updates) => {
    try {
      loading.value = true
      const res = await settingsApi.updateSettings(updates)
      if (res.success) {
        settings.value = { ...settings.value, ...updates }
      }
      return res
    } catch (error) {
      console.error('更新设置失败:', error)
      return { success: false, message: error.message }
    } finally {
      loading.value = false
    }
  }

  return {
    settings,
    loading,
    fetchSettings,
    updateSettings
  }
})
