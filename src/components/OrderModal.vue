
<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content" style="max-width:600px;max-height:80vh;overflow-y:auto;">
      <div class="modal-title">我的订单</div>
      <div v-if="orders.length === 0" style="text-align:center;padding:20px;color:#666;">
        暂无订单
      </div>
      <div v-else>
        <div v-for="order in orders" :key="order.id || order._id" class="order-item">
          <div class="order-header">
            <span class="order-no">订单号：{{ order.order_no }}</span>
            <span class="order-status" :style="{ color: order.status === 'completed' ? '#00c48c' : '#ff6b6b' }">
              {{ order.status === 'completed' ? '已完成' : '处理中' }}
            </span>
          </div>
          <div class="order-info">
            <div>商品：{{ order.goods_name }}</div>
            <div>价格：¥{{ order.total_amount.toFixed(2) }}</div>
            <div>邮箱：{{ order.email }}</div>
            <div style="color:#999;font-size:12px;margin-top:8px;">
              {{ new Date(order.created_at).toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
      <div class="modal-btns" style="margin-top:20px;">
        <button class="modal-btn btn-cancel" @click="handleClose">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  orders: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.order-item {
  background: rgba(0,0,0,0.03);
  border-radius:8px;
  padding:16px;
  margin-bottom:12px;
}
.order-header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:12px;
}
.order-no {
  font-weight:600;
  color:#333;
}
.order-status {
  font-size:14px;
}
.order-info {
  color:#555;
  font-size:14px;
  line-height:1.8;
}
</style>
