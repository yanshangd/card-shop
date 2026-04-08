<template>
  <div class="success-container">
    <div class="back" @click="goHome">← 返回商城首页</div>
    
    <TheCard>
      <div class="success-header">
        <div class="success-icon">✓</div>
        <h1 class="success-title">支付成功</h1>
      </div>
      
      <div class="order-info">
        <div class="info-item">
          <span class="label">订单号</span>
          <span class="value">{{ orderNo }}</span>
        </div>
        <div class="info-item">
          <span class="label">商品名称</span>
          <span class="value">{{ goodsName }}</span>
        </div>
      </div>
    </TheCard>
    
    <TheCard v-if="cardCode">
      <div class="section-title">卡密信息</div>
      <div class="card-item">
        <label>卡密：</label>
        <div class="card-code">
          <span>{{ cardCode }}</span>
          <button class="copy-btn" @click="copyToClipboard(cardCode)">复制</button>
        </div>
      </div>
      <div class="card-item" v-if="cardPassword">
        <label>密码：</label>
        <div class="card-code">
          <span>{{ cardPassword }}</span>
          <button class="copy-btn" @click="copyToClipboard(cardPassword)">复制</button>
        </div>
      </div>
    </TheCard>
    
    <TheCard>
      <div class="tips">
        <p>卡密已发送至您的邮箱，请注意查收</p>
        <p>如有问题，请联系在线客服处理</p>
      </div>
      
      <div class="actions">
        <button class="btn-primary" @click="goHome">返回首页</button>
        <!-- <button class="btn-secondary" @click="goOrder">查看订单</button> -->
      </div>
    </TheCard>
    
    <div class="footer">© 2026 {{ siteName }} 版权所有 | 24小时自助下单平台</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import TheCard from '@/components/TheCard.vue'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()

const orderNo = ref('')
const goodsName = ref('')
const cardCode = ref('')
const cardPassword = ref('')

const siteName = computed(() => settingsStore.settings.site_name || '自动发卡商城')

onMounted(() => {
  orderNo.value = route.query.orderNo || ''
  goodsName.value = route.query.goodsName || ''
  cardCode.value = route.query.cardCode || ''
  cardPassword.value = route.query.cardPassword || ''
  settingsStore.fetchSettings()
})

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const goHome = () => {
  router.push('/')
}

const goOrder = () => {
  router.push('/order')
}
</script>

<style scoped>
.success-container {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #1677ff;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 10px;
}

.success-header {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #fff;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(82, 196, 26, 0.3);
}

.success-title {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.order-info {
  background: rgba(22, 119, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.info-item:not(:last-child) {
  border-bottom: 1px solid rgba(22, 119, 255, 0.1);
}

.info-item .label {
  color: #999;
  font-size: 14px;
}

.info-item .value {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.section-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
}

.card-item {
  margin-bottom: 16px;
}

.card-item:last-child {
  margin-bottom: 0;
}

.card-item label {
  display: block;
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.card-code {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(22, 119, 255, 0.05);
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid rgba(22, 119, 255, 0.1);
}

.card-code span {
  flex: 1;
  font-family: monospace;
  font-size: 14px;
  color: #333;
  word-break: break-all;
}

.copy-btn {
  background: #1677ff;
  color: #fff;
  border: none;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s ease;
}

.copy-btn:hover {
  background: #0d63d8;
}

.tips {
  color: #666;
  font-size: 14px;
  line-height: 1.8;
  margin-bottom: 20px;
}

.tips p {
  margin: 4px 0;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
  border: none;
  transition: all 0.25s ease;
  font-weight: 500;
}

.btn-primary {
  background: linear-gradient(135deg, #1677ff 0%, #0d63d8 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.6);
  color: #666;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.8);
}

.footer {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
  margin-top: 30px;
}
</style>
