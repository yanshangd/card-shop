<template>
  <div class="detail-container">
    <div class="back" @click="goBack">← 返回商城首页</div>

    <TheCard>
      <div class="card-title"><span class="icon">👤</span>用户中心</div>
      <div style="color:#666;text-align:center;padding:40px;">
        用户中心功能开发中...
      </div>
    </TheCard>
  </div>

  <div class="footer">© 2026 自动发卡商城 版权所有 | 24小时自助下单平台</div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import TheCard from '@/components/TheCard.vue'

const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>
