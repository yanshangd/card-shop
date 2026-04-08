<template>
  <div class="detail-container">
    <div class="back" @click="goBack">← 返回商城首页</div>

    <TheCard>
      <div class="card-title"><span class="icon">📋</span>我的订单</div>
      <div style="color:#666;text-align:center;padding:40px;">
        订单查询功能开发中...
      </div>
    </TheCard>
  </div>

  <div class="footer">© 2026 {{ siteName }} 版权所有 | 24小时自助下单平台</div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import TheCard from '@/components/TheCard.vue'
import { useSettingsStore } from '@/stores/settings'

const router = useRouter()
const settingsStore = useSettingsStore()

const siteName = computed(() => settingsStore.settings.site_name || '自动发卡商城')

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  settingsStore.fetchSettings()
})
</script>
