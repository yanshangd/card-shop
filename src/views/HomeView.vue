
<template>
  <div class="container">
    <div class="main-content">
      <div class="carousel">🔥 24小时自动发卡 | 下单秒出卡密 | 全天售后在线</div>

      <TheCard>
        <div class="card-title"><span class="icon">📢</span>商城公告</div>
        <div v-if="settingsLoading" class="skeleton-notice">
          <SkeletonLoader height="20px" />
          <SkeletonLoader height="20px" style="margin-top:8px;" />
        </div>
        <div v-else class="notice" v-html="storeNotice"></div>
      </TheCard>

      <TheCard>
        <div class="card-title"><span class="icon">🛒</span>全部商品</div>
        <div class="search-bar">
          <input 
            type="text" 
            class="search-input" 
            placeholder="输入商品名称搜索..." 
            v-model="searchKeyword"
            @keyup.enter="handleSearch"
          >
          <button class="search-btn" @click="handleSearch">搜索</button>
        </div>
        <div class="category-list">
          <div 
            v-if="goodsStore.loading"
            class="category-item skeleton-category"
            v-for="i in 5"
            :key="i"
          ></div>
          <template v-else>
            <div 
              class="category-item" 
              :class="{ active: selectedCategoryId === 'all' }"
              @click="handleCategoryChange('all')"
            >
              全部
            </div>
            <div 
              v-for="cate in categoriesList" 
              :key="cate.id"
              class="category-item" 
              :class="{ active: selectedCategoryId === cate.id }"
              @click="handleCategoryChange(cate.id)"
            >
              {{ cate.name }}
            </div>
          </template>
        </div>

        <div class="goods-list">
          <GoodsSkeleton v-for="i in 6" :key="i" v-if="goodsStore.loading" />
          <GoodsItem 
            v-for="goods in goodsList" 
            :key="goods.id" 
            :goods="goods"
            @buy="handleBuy"
            v-else
          />
        </div>
      </TheCard>
    </div>

    <div class="side-content">
      <TheCard>
        <div class="particle-group">
          <div class="particle lg"></div><div class="particle md"></div><div class="particle sm"></div>
        </div>
      </TheCard>

      <!-- <TheCard>
        <div class="card-title"><span class="icon">👤</span>用户中心</div>
        <div v-if="userStore.user" class="user-info">
          <div style="margin-bottom:8px;">欢迎您：{{ userStore.user.username }}</div>
          <button class="login-btn" @click="userStore.logout">退出登录</button>
          <button class="login-btn" style="margin-top:8px;" @click="queryOrders">我的订单</button>
        </div>
        <div v-else>
          <input v-model="loginForm.username" type="text" class="search-input" placeholder="输入用户名">
          <input v-model="loginForm.password" type="password" class="search-input" placeholder="输入密码" style="margin-top:8px;">
          <button class="login-btn" @click="handleLogin" style="margin-top:8px;">登录</button>
          <button class="login-btn" @click="handleRegister" style="margin-top:8px;background:#0088ff;">注册</button>
        </div>
      </TheCard> -->

      <TheCard>
        <div class="card-title"><span class="icon">🔍</span>订单查询</div>
        <div class="order-query-box">
          <input v-model="orderQuery" type="email" class="search-input order-search-input" placeholder="输入邮箱查询订单">
          <button class="login-btn" @click="queryOrders" style="margin-top:8px;">查询订单</button>
        </div>
      </TheCard>

      <TheCard>
        <div class="card-title"><span class="icon">💳</span>支付方式</div>
        <div class="pay-list">
          <div class="pay-item">
            <svg class="pay-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M849.92 51.2H174.08c-67.8656 0-122.88 55.0144-122.88 122.88v675.84c0 67.8656 55.0144 122.88 122.88 122.88h675.84c67.8656 0 122.88-55.0144 122.88-122.88V174.08c0-67.8656-55.0144-122.88-122.88-122.88z m-337.92 701.76768a363.2896 363.2896 0 0 1-100.27008-14.03904 30.99136 30.99136 0 0 0-9.03168-1.35168c-5.89824 0-11.25376 1.80224-16.31232 4.73088l-67.25632 38.81984c-1.87392 1.08032-3.6864 1.89952-5.9136 1.89952a10.24 10.24 0 0 1-10.24512-10.24c0-2.52928 1.01376-5.05856 1.65888-7.48032l13.84448-51.64032c0.5888-2.16064 1.0752-4.2496 1.0752-6.51776a20.48512 20.48512 0 0 0-8.59648-16.6912C246.18496 643.53792 204.8 574.11072 204.8 496.96256c0-141.38368 137.53344-256 307.2-256 103.68 0 195.30752 42.8544 250.9312 108.41088l-310.35904 138.1376a30.4896 30.4896 0 0 1-27.28448-3.1232l-65.99168-46.98112a10.24 10.24 0 0 0-16.36864 8.21248c0 1.46432 0.37376 2.9696 0.97792 4.31104l55.92576 122.71104 1.34144 2.94912a20.44928 20.44928 0 0 0 27.07968 8.2688l2.24256-1.30048 353.71008-204.21632C806.51264 413.81376 819.2 454.14912 819.2 496.96256c0 141.3888-137.53856 256.00512-307.2 256.00512z" fill="#24B340"></path></svg>
          </div>
          <div class="pay-item">
            <svg class="pay-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M1024.0512 701.0304V196.864A196.9664 196.9664 0 0 0 827.136 0H196.864A196.9664 196.9664 0 0 0 0 196.864v630.272A196.9152 196.9152 0 0 0 196.864 1024h630.272a197.12 197.12 0 0 0 193.8432-162.0992c-52.224-22.6304-278.528-120.32-396.4416-176.64-89.7024 108.6976-183.7056 173.9264-325.3248 173.9264s-236.1856-87.2448-224.8192-194.048c7.4752-70.0416 55.552-184.576 264.2944-164.9664 110.08 10.3424 160.4096 30.8736 250.1632 60.5184 23.1936-42.5984 42.496-89.4464 57.1392-139.264H248.064v-39.424h196.9152V311.1424H204.8V267.776h240.128V165.632s2.1504-15.9744 19.8144-15.9744h98.4576V267.776h256v43.4176h-256V381.952h208.8448a805.9904 805.9904 0 0 1-84.8384 212.6848c60.672 22.016 336.7936 106.3936 336.7936 106.3936zM283.5456 791.6032c-149.6576 0-173.312-94.464-165.376-133.9392 7.8336-39.3216 51.2-90.624 134.4-90.624 95.5904 0 181.248 24.4736 284.0576 74.5472-72.192 94.0032-160.9216 150.016-253.0816 150.016z" fill="#009FE8"/></svg>
          </div>
        </div>
        <div style="margin-top:12px;font-size:14px;color:#666">支持微信 / 支付宝支付</div>
      </TheCard>

      <TheCard>
        <div class="card-title"><span class="icon">ℹ️</span>商城信息</div>
        <div class="card-section">
          <div class="section-header"><span class="section-title">在线客服</span></div>
          <div v-if="settingsLoading">
            <SkeletonLoader height="20px" width="60%" />
          </div>
          <div v-else>{{ customerService }}</div>
        </div>
        <!-- <div class="card-section">
          <div class="section-header"><span class="section-title">今日销量</span></div>
          <div>1289 单</div>
        </div> -->
        <div class="card-section">
          <div class="section-header"><span class="section-title">运营状态</span></div>
          <div style="color:#00c48c">✅ 正常营业中</div>
        </div>
      </TheCard>
    </div>
  </div>

  <BuyModal
    v-model="showBuyModal"
    :goods="selectedGoods"
    :loading="isPaying"
    @pay="handlePay"
  />

  <VmqPayment
    :visible="showVmqPayment"
    :order-id="vmqOrder.orderId"
    :order-no="vmqOrder.orderNo"
    :pay-amount="vmqOrder.payAmount"
    :goods-name="vmqOrder.goodsName"
    :pay-type="vmqOrder.payType"
    :expire-time="vmqOrder.expireTime"
    :qr-code="vmqOrder.qrCode"
    @close="handleVmqClose"
  />

  <OrderModal
    v-model="showOrderModal"
    :orders="queriedOrders"
  />

  <div class="footer">© 2026 {{ siteName }} 版权所有</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useGoodsStore } from '@/stores/goods'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'
import { useSettingsStore } from '@/stores/settings'
import { goodsApi, cardsApi, ordersApi, categoriesApi } from '@/api/supabaseApi'
import { ElMessage } from 'element-plus'
import TheCard from '@/components/TheCard.vue'
import GoodsItem from '@/components/GoodsItem.vue'
import BuyModal from '@/components/BuyModal.vue'
import VmqPayment from '@/components/VmqPayment.vue'
import OrderModal from '@/components/OrderModal.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import GoodsSkeleton from '@/components/GoodsSkeleton.vue'

const goodsStore = useGoodsStore()
const userStore = useUserStore()
const orderStore = useOrderStore()
const settingsStore = useSettingsStore()

const searchKeyword = ref('')
const loginForm = ref({
  username: '',
  password: ''
})
const orderQuery = ref('')
const showBuyModal = ref(false)
const showOrderModal = ref(false)
const showVmqPayment = ref(false)
const selectedGoods = ref(null)
const queriedOrders = ref([])
const isPaying = ref(false)
const vmqOrder = ref({
  orderId: '',
  orderNo: '',
  payAmount: 0,
  goodsName: '',
  payType: '',
  expireTime: '',
  qrCode: null
})

const goodsList = computed(() => goodsStore.goodsList)
const categoriesList = computed(() => goodsStore.categoriesList)
const selectedCategoryId = computed(() => goodsStore.selectedCategoryId)
const storeNotice = computed(() => settingsStore.settings.site_notice ? settingsStore.settings.site_notice.replace(/\n/g, '<br>') : '本店24小时自动发卡，下单后立即显示卡密<br>未收到邮件请检查垃圾箱，客服全天在线处理售后')
const customerService = computed(() => settingsStore.settings.customer_service || 'QQ：24小时在线')
const siteName = computed(() => settingsStore.settings.site_name || '自动发卡商城')
const settingsLoading = computed(() => settingsStore.loading)

onMounted(() => {
  goodsStore.fetchCategories()
  goodsStore.fetchGoods()
  settingsStore.fetchSettings()
  orderStore.fetchEpaySettings()
  if (userStore.token) {
    userStore.fetchUserInfo()
  }
})

const handleCategoryChange = (cate) => {
  goodsStore.setCategory(cate)
}

const handleSearch = () => {
  goodsStore.setSearchKeyword(searchKeyword.value)
}

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  const success = await userStore.login(loginForm.value)
  if (success) {
    ElMessage.success('登录成功')
    loginForm.value = { username: '', password: '' }
  }
}

const handleRegister = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  const success = await userStore.register(loginForm.value)
  if (success) {
    ElMessage.success('注册成功')
    loginForm.value = { username: '', password: '' }
  }
}

const handleBuy = (goods) => {
  selectedGoods.value = goods
  showBuyModal.value = true
}

const handlePay = async (email, paymentMethod) => {
  console.log('handlePay 被调用:', { email, paymentMethod })
  console.log('易支付设置:', orderStore.epaySettings)

  const order = await orderStore.createOrder(selectedGoods.value.id, email, paymentMethod)
  if (order) {
    if (order.isVmq) {
      // V免签支付 - 显示支付弹窗
      showBuyModal.value = false
      vmqOrder.value = {
        orderId: order.orderId,
        orderNo: order.orderNo,
        payAmount: order.payAmount,
        goodsName: order.goodsName,
        payType: order.payType,
        expireTime: order.expireTime,
        qrCode: order.qrCode
      }
      showVmqPayment.value = true
    } else if (!order.needRedirect) {
      showBuyModal.value = false
      await goodsStore.fetchGoods()
    }
  }
}

const handleVmqClose = () => {
  showVmqPayment.value = false
  goodsStore.fetchGoods()
}

const queryOrders = async () => {
  // 如果输入了邮箱，则按邮箱查询；否则如果登录了，查询当前用户的订单
  if (orderQuery.value) {
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(orderQuery.value)) {
      ElMessage.warning('请输入正确的邮箱格式')
      return
    }
    await orderStore.fetchOrders(orderQuery.value)
  } else if (userStore.user) {
    await orderStore.fetchOrders()
  } else {
    ElMessage.warning('请输入邮箱或登录后查询')
    return
  }
  queriedOrders.value = orderStore.orders
  showOrderModal.value = true
}
</script>
