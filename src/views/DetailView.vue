<template>
  <div class="detail-container">
    <div class="back" @click="goBack">← 返回商城首页</div>

    <DetailSkeleton v-if="loading" />
    <div v-else-if="!goods" class="loading">商品不存在</div>
    <template v-else>
      <TheCard>
        <div class="goods-cover">🎁</div>
        <div class="goods-name">{{ goods.name }}</div>
        <div class="goods-price">¥{{ goods.price.toFixed(2) }}</div>
        <div class="goods-info">
          <div>库存：{{ availableCardCount }}</div>
        </div>

        <button class="buy-main" @click="handleBuy" :disabled="availableCardCount <= 0 || goods.status !== 'active'">
          {{ goods.status !== 'active' ? '商品已下架' : availableCardCount <= 0 ? '库存不足' : '立即购买' }}
        </button>

        <div class="section-title">商品介绍</div>
        <div class="desc">
          {{ goods.description || '暂无商品介绍' }}
        </div>

        <div class="section-title">购买须知</div>
        <div class="tip">
          1. 下单前请确认账号正确<br>
          2. 卡密一经售出，不支持退换<br>
          3. 未到账请联系在线客服处理
        </div>
      </TheCard>

      <TheCard>
        <div class="section-title">售后与客服</div>
        <div style="color:#666;line-height:1.8">
          QQ客服：24小时在线<br>
          处理时间：1-5分钟<br>
          未收到卡密请先查看订单详情
        </div>
      </TheCard>

      <BuyModal
        v-model="showBuyModal"
        :goods="goods"
        @pay="handlePay"
      />

      <!-- V免签支付弹窗 -->
      <VmqPayment
        :visible="showVmqPayment"
        :order-id="vmqOrderData.orderId"
        :order-no="vmqOrderData.orderNo"
        :pay-amount="vmqOrderData.payAmount"
        :goods-name="vmqOrderData.goodsName"
        :pay-type="vmqOrderData.payType"
        :expire-time="vmqOrderData.expireTime"
        :qr-code="vmqOrderData.qrCode"
        @close="handleVmqClose"
        @query="handleVmqQuery"
      />
    </template>

    <div class="footer">© 2026 {{ siteName }} 版权所有 | 24小时自助下单平台</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import TheCard from '@/components/TheCard.vue'
import BuyModal from '@/components/BuyModal.vue'
import DetailSkeleton from '@/components/DetailSkeleton.vue'
import VmqPayment from '@/components/VmqPayment.vue'
import { goodsApi, cardsApi } from '@/api/supabaseApi'
import { useSettingsStore } from '@/stores/settings'
import { useOrderStore } from '@/stores/order'

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const orderStore = useOrderStore()

const goods = ref(null)
const loading = ref(true)
const showBuyModal = ref(false)
const availableCardCount = ref(0)

// V免签支付相关
const showVmqPayment = ref(false)
const vmqOrderData = ref({
  orderId: '',
  orderNo: '',
  payAmount: 0,
  goodsName: '',
  payType: '',
  expireTime: '',
  qrCode: null
})

const siteName = computed(() => settingsStore.settings.site_name || '自动发卡商城')

const fetchGoodsDetail = async () => {
  try {
    loading.value = true
    const goodsId = route.params.id
    const result = await goodsApi.getGoodsById(goodsId)
    if (result.success) {
      goods.value = result.data
      // 获取可用卡密数量
      const cardsResult = await cardsApi.getCards({ goodsId: goodsId, used: false })
      if (cardsResult.success) {
        availableCardCount.value = cardsResult.data.length
      }
    } else {
      ElMessage.error(result.message || '商品不存在')
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/')
}

const formatSales = (sales) => {
  if (!sales) return '0+'
  if (sales >= 10000) {
    return (sales / 10000).toFixed(1) + 'w+'
  }
  return sales + '+'
}

const handleBuy = () => {
  if (!goods.value || availableCardCount.value <= 0 || goods.value.status !== 'active') {
    return
  }
  showBuyModal.value = true
}

const handlePay = async (email, paymentMethod) => {
  try {
    // 判断是否为V免签支付
    if (paymentMethod === 'vmq_wxpay' || paymentMethod === 'vmq_alipay') {
      const result = await orderStore.createOrder(goods.value.id, email, paymentMethod)
      
      console.log('V免签订单创建结果:', result)

      if (result && result.isVmq) {
        // 显示V免签支付弹窗
        vmqOrderData.value = {
          orderId: result.orderId,
          orderNo: result.orderNo,
          payAmount: result.payAmount,
          goodsName: result.goodsName,
          payType: result.payType,
          expireTime: result.expireTime,
          qrCode: result.qrCode
        }
        showVmqPayment.value = true
      } else if (result && result.needRedirect) {
        // 易支付跳转
        return
      } else if (result) {
        // 直接购买成功
        ElMessage.success('购买成功！卡密已自动发送！')
        fetchGoodsDetail()
      } else {
        console.error('创建订单返回null')
      }
    } else {
      // 易支付或其他方式
      const result = await orderStore.createOrder(goods.value.id, email, paymentMethod)
      if (result && !result.needRedirect) {
        ElMessage.success('购买成功！卡密已自动发送！')
        fetchGoodsDetail()
      }
    }
  } catch (error) {
    console.error('支付失败:', error)
    ElMessage.error('支付失败，请重试')
  }
}

// V免签支付弹窗关闭
const handleVmqClose = () => {
  showVmqPayment.value = false
  fetchGoodsDetail()
}

// V免签订单查询
const handleVmqQuery = async (orderId, callback) => {
  const result = await orderStore.queryVmqOrder(orderId)
  callback(result)
}

onMounted(() => {
  fetchGoodsDetail()
  settingsStore.fetchSettings()
})
</script>

<style scoped>
.goods-info {
  margin-top: 8px;
  margin-bottom: 8px;
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
}

.section-title {
  margin-top: 16px;
  margin-bottom: 8px;
}

.desc {
  margin-bottom: 4px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
