<template>
  <div class="vmq-payment-overlay" v-if="visible" @click.self="handleClose">
    <div class="vmq-payment-modal">
      <div class="payment-header">
        <h3>扫码支付</h3>
        <button class="close-btn" @click="handleClose">&times;</button>
      </div>

      <div class="payment-content">
        <!-- 支付信息 -->
        <div class="payment-info">
          <div class="goods-name">{{ goodsName }}</div>
          <div class="pay-amount">
            <span class="currency">&yen;</span>
            <span class="amount">{{ payAmount }}</span>
          </div>
          <div class="order-no">订单号：{{ orderNo }}</div>
        </div>

        <!-- 支付状态 -->
        <div v-if="status === 'pending'" class="payment-qr">
          <div class="qr-code-box">
            <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="收款码" class="qr-image" />
            <div v-else class="qr-placeholder">
              <div class="loading-spinner"></div>
              <p>加载收款码中...</p>
            </div>
          </div>

          <div class="payment-type">
            <div class="type-icon" :class="payType">
              <span v-if="payType === 'wxpay'">微信支付</span>
              <span v-else>支付宝</span>
            </div>
          </div>

          <div class="payment-tips">
            <p>请使用{{ payType === 'wxpay' ? '微信' : '支付宝' }}扫描上方二维码</p>
            <p class="highlight">支付金额必须完全一致：&yen;{{ payAmount }}</p>
          </div>

          <div class="countdown">
            <div class="countdown-label">支付剩余时间</div>
            <div class="countdown-time">{{ countdownText }}</div>
          </div>
        </div>

        <!-- 支付成功 -->
        <div v-else-if="status === 'completed'" class="payment-success">
          <div class="success-icon">&check;</div>
          <h4>支付成功！</h4>
          <div v-if="cardInfo" class="card-info">
            <div class="card-item">
              <label>卡密：</label>
              <div class="card-code">{{ cardInfo.code }}</div>
            </div>
            <div v-if="cardInfo.password" class="card-item">
              <label>密码：</label>
              <div class="card-code">{{ cardInfo.password }}</div>
            </div>
          </div>
          <p class="tip">卡密已发送至您的邮箱，请查收</p>
          <button class="confirm-btn" @click="handleClose">确定</button>
        </div>

        <!-- 支付过期 -->
        <div v-else-if="status === 'expired'" class="payment-expired">
          <div class="expired-icon">!</div>
          <h4>订单已过期</h4>
          <p>支付超时，请重新下单</p>
          <button class="confirm-btn" @click="handleClose">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import QRCode from 'qrcode'
import { vmqApi } from '@/api/vmqApi'

const router = useRouter()

const props = defineProps({
  visible: Boolean,
  orderId: String,
  orderNo: String,
  payAmount: Number,
  goodsName: String,
  payType: String,
  expireTime: String,
  qrCode: Object
})

const emit = defineEmits(['close', 'query'])

const status = ref('pending')
const cardInfo = ref(null)
const countdown = ref(300) // 5分钟倒计时
const queryTimer = ref(null)
const countdownTimer = ref(null)
const generatedQrUrl = ref('')

const qrCodeUrl = computed(() => {
  // 如果有动态生成的二维码URL则使用
  if (generatedQrUrl.value) {
    return generatedQrUrl.value
  }
  return props.qrCode?.imageUrl || ''
})

// 生成二维码
const generateQrCode = async (qrContent) => {
  if (!qrContent) return
  
  try {
    const dataUrl = await QRCode.toDataURL(qrContent, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
    generatedQrUrl.value = dataUrl
  } catch (error) {
    console.error('生成二维码失败:', error)
  }
}

const countdownText = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// 开始倒计时
const startCountdown = () => {
  if (props.expireTime) {
    const expire = new Date(props.expireTime).getTime()
    const now = Date.now()
    countdown.value = Math.max(0, Math.floor((expire - now) / 1000))
  }

  countdownTimer.value = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      status.value = 'expired'
      clearInterval(countdownTimer.value)
      clearInterval(queryTimer.value)
    }
  }, 1000)
}

// 查询订单状态
const queryOrderStatus = async () => {
  if (!props.orderId) {
    console.log('没有orderId，跳过查询')
    return
  }

  console.log('查询订单状态:', props.orderId)
  
  try {
    const result = await vmqApi.queryOrder(props.orderId)
    console.log('订单查询结果:', result)
    
    if (result.success && result.data) {
      const { status: orderStatus, cardInfo: card } = result.data
      
      if (orderStatus === 'paid' || orderStatus === 'completed') {
        status.value = 'completed'
        cardInfo.value = card
        
        clearInterval(queryTimer.value)
        clearInterval(countdownTimer.value)
        
        // 2秒后跳转到支付成功页面
        setTimeout(() => {
          emit('close')
          router.push({
            path: '/payment/success',
            query: {
              orderNo: props.orderNo,
              goodsName: props.goodsName,
              cardCode: card?.code || '',
              cardPassword: card?.password || ''
            }
          })
        }, 2000)
      } else if (orderStatus === 'expired' || result.data.isExpired) {
        status.value = 'expired'
        clearInterval(queryTimer.value)
        clearInterval(countdownTimer.value)
      }
    }
  } catch (error) {
    console.error('查询订单状态失败:', error)
  }
}

// 关闭弹窗
const handleClose = () => {
  clearInterval(queryTimer.value)
  clearInterval(countdownTimer.value)
  status.value = 'pending'
  cardInfo.value = null
  emit('close')
}

// 监听visible变化
watch(() => props.visible, (newVal) => {
  console.log('VmqPayment visible changed:', newVal)
  if (newVal) {
    status.value = 'pending'
    cardInfo.value = null
    generatedQrUrl.value = ''
    
    // 如果传入了二维码内容，动态生成二维码
    if (props.qrCode?.qr_content) {
      generateQrCode(props.qrCode.qr_content)
    }
    
    startCountdown()
    queryOrderStatus()
    console.log('启动轮询，每3秒查询一次')
    // 每3秒查询一次订单状态
    queryTimer.value = setInterval(queryOrderStatus, 3000)
  } else {
    console.log('停止轮询')
    clearInterval(queryTimer.value)
    clearInterval(countdownTimer.value)
  }
}, { immediate: true })

onUnmounted(() => {
  clearInterval(queryTimer.value)
  clearInterval(countdownTimer.value)
})
</script>

<style scoped>
.vmq-payment-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.vmq-payment-modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.payment-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: #666;
}

.payment-content {
  padding: 24px;
}

.payment-info {
  text-align: center;
  margin-bottom: 24px;
}

.goods-name {
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
}

.pay-amount {
  margin: 12px 0;
}

.currency {
  font-size: 24px;
  color: #ff4d4f;
  font-weight: 500;
}

.amount {
  font-size: 36px;
  color: #ff4d4f;
  font-weight: 700;
}

.order-no {
  font-size: 13px;
  color: #999;
}

.payment-qr {
  text-align: center;
}

.qr-code-box {
  width: 200px;
  height: 200px;
  margin: 0 auto 20px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-placeholder {
  text-align: center;
  color: #999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top-color: #1677ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.payment-type {
  margin-bottom: 16px;
}

.type-icon {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.type-icon.wxpay {
  background: #e6f7ed;
  color: #07c160;
}

.type-icon.alipay {
  background: #e6f4ff;
  color: #1677ff;
}

.payment-tips {
  margin-bottom: 20px;
}

.payment-tips p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.payment-tips .highlight {
  color: #ff4d4f;
  font-weight: 600;
  font-size: 15px;
}

.countdown {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 16px;
}

.countdown-label {
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
}

.countdown-time {
  font-size: 24px;
  font-weight: 600;
  color: #ff4d4f;
  font-family: monospace;
}

.payment-success,
.payment-expired {
  text-align: center;
  padding: 20px 0;
}

.success-icon,
.expired-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 16px;
}

.success-icon {
  background: #e6f7ed;
  color: #07c160;
}

.expired-icon {
  background: #fff2f0;
  color: #ff4d4f;
}

.payment-success h4,
.payment-expired h4 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #333;
}

.payment-success p,
.payment-expired p {
  color: #666;
  margin: 0 0 20px;
}

.card-info {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: left;
}

.card-item {
  margin-bottom: 12px;
}

.card-item:last-child {
  margin-bottom: 0;
}

.card-item label {
  font-size: 13px;
  color: #999;
  display: block;
  margin-bottom: 4px;
}

.card-code {
  font-family: monospace;
  font-size: 14px;
  color: #333;
  background: #fff;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  word-break: break-all;
}

.tip {
  font-size: 13px;
  color: #999;
  margin-bottom: 20px;
}

.confirm-btn {
  background: #1677ff;
  color: #fff;
  border: none;
  padding: 12px 40px;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.confirm-btn:hover {
  background: #4096ff;
}
</style>
