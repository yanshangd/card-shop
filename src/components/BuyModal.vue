
<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-title">确认下单</div>
      <div class="modal-item">商品：{{ goods?.name }}</div>
      <div class="modal-price">价格：¥{{ goods?.price.toFixed(2) }}</div>
      <div class="modal-item">
        <label style="display:block;margin-bottom:8px;">接收邮箱：</label>
        <input
          v-model="email"
          type="email"
          class="search-input email-input"
          placeholder="请输入接收卡密的邮箱"
        >
      </div>
      <div class="modal-item">
        <label style="display:block;margin-bottom:8px;">支付方式：</label>
        <div class="payment-options">
          <!-- 易支付选项 -->
          <label class="payment-option" :class="{ active: paymentMethod === 'wxpay' }" v-if="epayEnabled">
            <input type="radio" v-model="paymentMethod" value="wxpay">
            <svg class="payment-icon wechat-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3588" width="200" height="200"><path d="M849.92 51.2H174.08c-67.8656 0-122.88 55.0144-122.88 122.88v675.84c0 67.8656 55.0144 122.88 122.88 122.88h675.84c67.8656 0 122.88-55.0144 122.88-122.88V174.08c0-67.8656-55.0144-122.88-122.88-122.88z m-337.92 701.76768a363.2896 363.2896 0 0 1-100.27008-14.03904 30.99136 30.99136 0 0 0-9.03168-1.35168c-5.89824 0-11.25376 1.80224-16.31232 4.73088l-67.25632 38.81984c-1.87392 1.08032-3.6864 1.89952-5.9136 1.89952a10.24 10.24 0 0 1-10.24512-10.24c0-2.52928 1.01376-5.05856 1.65888-7.48032l13.84448-51.64032c0.5888-2.16064 1.0752-4.2496 1.0752-6.51776a20.48512 20.48512 0 0 0-8.59648-16.6912C246.18496 643.53792 204.8 574.11072 204.8 496.96256c0-141.38368 137.53344-256 307.2-256 103.68 0 195.30752 42.8544 250.9312 108.41088l-310.35904 138.1376a30.4896 30.4896 0 0 1-27.28448-3.1232l-65.99168-46.98112a10.24 10.24 0 0 0-16.36864 8.21248c0 1.46432 0.37376 2.9696 0.97792 4.31104l55.92576 122.71104 1.34144 2.94912a20.44928 20.44928 0 0 0 27.07968 8.2688l2.24256-1.30048 353.71008-204.21632C806.51264 413.81376 819.2 454.14912 819.2 496.96256c0 141.3888-137.53856 256.00512-307.2 256.00512z" fill="#24B340" p-id="3589"></path></svg>
            <span>微信支付</span>
          </label>
          <label class="payment-option" :class="{ active: paymentMethod === 'alipay' }" v-if="epayEnabled">
            <input type="radio" v-model="paymentMethod" value="alipay">
            <svg class="payment-icon alipay-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path d="M1024.0512 701.0304V196.864A196.9664 196.9664 0 0 0 827.136 0H196.864A196.9664 196.9664 0 0 0 0 196.864v630.272A196.9152 196.9152 0 0 0 196.864 1024h630.272a197.12 197.12 0 0 0 193.8432-162.0992c-52.224-22.6304-278.528-120.32-396.4416-176.64-89.7024 108.6976-183.7056 173.9264-325.3248 173.9264s-236.1856-87.2448-224.8192-194.048c7.4752-70.0416 55.552-184.576 264.2944-164.9664 110.08 10.3424 160.4096 30.8736 250.1632 60.5184 23.1936-42.5984 42.496-89.4464 57.1392-139.264H248.064v-39.424h196.9152V311.1424H204.8V267.776h240.128V165.632s2.1504-15.9744 19.8144-15.9744h98.4576V267.776h256v43.4176h-256V381.952h208.8448a805.9904 805.9904 0 0 1-84.8384 212.6848c60.672 22.016 336.7936 106.3936 336.7936 106.3936zM283.5456 791.6032c-149.6576 0-173.312-94.464-165.376-133.9392 7.8336-39.3216 51.2-90.624 134.4-90.624 95.5904 0 181.248 24.4736 284.0576 74.5472-72.192 94.0032-160.9216 150.016-253.0816 150.016z" fill="#009FE8"/>
            </svg>
            <span>支付宝支付</span>
          </label>

          <!-- V免签选项 -->
          <label class="payment-option" :class="{ active: paymentMethod === 'vmq_wxpay' }" v-if="vmqWxEnabled">
            <input type="radio" v-model="paymentMethod" value="vmq_wxpay">
            <svg class="payment-icon wechat-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3588" width="200" height="200"><path d="M849.92 51.2H174.08c-67.8656 0-122.88 55.0144-122.88 122.88v675.84c0 67.8656 55.0144 122.88 122.88 122.88h675.84c67.8656 0 122.88-55.0144 122.88-122.88V174.08c0-67.8656-55.0144-122.88-122.88-122.88z m-337.92 701.76768a363.2896 363.2896 0 0 1-100.27008-14.03904 30.99136 30.99136 0 0 0-9.03168-1.35168c-5.89824 0-11.25376 1.80224-16.31232 4.73088l-67.25632 38.81984c-1.87392 1.08032-3.6864 1.89952-5.9136 1.89952a10.24 10.24 0 0 1-10.24512-10.24c0-2.52928 1.01376-5.05856 1.65888-7.48032l13.84448-51.64032c0.5888-2.16064 1.0752-4.2496 1.0752-6.51776a20.48512 20.48512 0 0 0-8.59648-16.6912C246.18496 643.53792 204.8 574.11072 204.8 496.96256c0-141.38368 137.53344-256 307.2-256 103.68 0 195.30752 42.8544 250.9312 108.41088l-310.35904 138.1376a30.4896 30.4896 0 0 1-27.28448-3.1232l-65.99168-46.98112a10.24 10.24 0 0 0-16.36864 8.21248c0 1.46432 0.37376 2.9696 0.97792 4.31104l55.92576 122.71104 1.34144 2.94912a20.44928 20.44928 0 0 0 27.07968 8.2688l2.24256-1.30048 353.71008-204.21632C806.51264 413.81376 819.2 454.14912 819.2 496.96256c0 141.3888-137.53856 256.00512-307.2 256.00512z" fill="#24B340" p-id="3589"></path></svg>
            <span>微信支付</span>
          </label>
          <label class="payment-option" :class="{ active: paymentMethod === 'vmq_alipay' }" v-if="vmqAliEnabled">
            <input type="radio" v-model="paymentMethod" value="vmq_alipay">
            <svg class="payment-icon alipay-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path d="M1024.0512 701.0304V196.864A196.9664 196.9664 0 0 0 827.136 0H196.864A196.9664 196.9664 0 0 0 0 196.864v630.272A196.9152 196.9152 0 0 0 196.864 1024h630.272a197.12 197.12 0 0 0 193.8432-162.0992c-52.224-22.6304-278.528-120.32-396.4416-176.64-89.7024 108.6976-183.7056 173.9264-325.3248 173.9264s-236.1856-87.2448-224.8192-194.048c7.4752-70.0416 55.552-184.576 264.2944-164.9664 110.08 10.3424 160.4096 30.8736 250.1632 60.5184 23.1936-42.5984 42.496-89.4464 57.1392-139.264H248.064v-39.424h196.9152V311.1424H204.8V267.776h240.128V165.632s2.1504-15.9744 19.8144-15.9744h98.4576V267.776h256v43.4176h-256V381.952h208.8448a805.9904 805.9904 0 0 1-84.8384 212.6848c60.672 22.016 336.7936 106.3936 336.7936 106.3936zM283.5456 791.6032c-149.6576 0-173.312-94.464-165.376-133.9392 7.8336-39.3216 51.2-90.624 134.4-90.624 95.5904 0 181.248 24.4736 284.0576 74.5472-72.192 94.0032-160.9216 150.016-253.0816 150.016z" fill="#009FE8"/>
            </svg>
            <span>支付宝支付</span>
          </label>

          <!-- 无支付方式提示 -->
          <div v-if="!hasAnyPayment" class="no-payment-hint">
            <p>暂无可用支付方式，请联系管理员</p>
          </div>
        </div>
      </div>
      <div class="modal-item">发货方式：自动发卡</div>
      <div class="modal-btns">
        <button class="modal-btn btn-cancel" @click="handleClose" :disabled="loading">取消</button>
        <button class="modal-btn btn-pay" @click="handlePay" :disabled="!email || !hasAnyPayment || loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '处理中...' : '立即支付' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useOrderStore } from '@/stores/order'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  goods: {
    type: Object,
    default: null
  },
  email: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'pay'])

const orderStore = useOrderStore()
const email = ref(props.email)
const paymentMethod = ref('wxpay')

const epayEnabled = computed(() => orderStore.epaySettings?.enabled || false)
const vmqWxEnabled = computed(() => orderStore.vmqSettings?.enabled && orderStore.vmqSettings?.wxpayEnabled)
const vmqAliEnabled = computed(() => orderStore.vmqSettings?.enabled && orderStore.vmqSettings?.alipayEnabled)

const hasAnyPayment = computed(() => {
  return epayEnabled.value || vmqWxEnabled.value || vmqAliEnabled.value
})

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

watch(() => props.email, (newVal) => {
  email.value = newVal
})

watch(() => props.modelValue, async (newVal) => {
  if (newVal) {
    await orderStore.fetchEpaySettings()
    await orderStore.fetchVmqSettings()
    // 设置默认支付方式
    if (epayEnabled.value) {
      paymentMethod.value = 'wxpay'
    } else if (vmqWxEnabled.value) {
      paymentMethod.value = 'vmq_wxpay'
    } else if (vmqAliEnabled.value) {
      paymentMethod.value = 'vmq_alipay'
    }
  }
})

const handleClose = () => {
  visible.value = false
}

const handlePay = () => {
  visible.value = false
  emit('pay', email.value, paymentMethod.value)
}
</script>

<style scoped>
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-option:hover {
  border-color: #1677ff;
  background: rgba(22, 119, 255, 0.05);
}

.payment-option.active {
  border-color: #1677ff;
  background: rgba(22, 119, 255, 0.1);
}

.payment-option input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: #1677ff;
}

.payment-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.payment-icon.manual-icon {
  font-size: 20px;
  width: auto;
  height: auto;
}

.disabled-hint {
  color: #999;
  font-size: 12px;
}

.email-input {
  width: 100%;
  box-sizing: border-box;
}

.no-payment-hint {
  text-align: center;
  padding: 20px;
  color: #999;
  background: #f5f7fa;
  border-radius: 8px;
}

.no-payment-hint p {
  margin: 0;
}

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
