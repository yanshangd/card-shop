
<template>
  <div class="goods-item" @click="goToDetail">
    <div class="goods-name">{{ goods.name }}</div>
    <div class="goods-stock" :class="{ empty: availableCount <= 0 }">
      库存：{{ availableCount }}
    </div>
    <div class="goods-price">¥{{ goods.price.toFixed(2) }}</div>
    <button 
      class="buy-btn" 
      :class="{ disabled: availableCount <= 0 }"
      :disabled="availableCount <= 0"
      @click.stop="handleBuy"
    >
      {{ availableCount > 0 ? '立即购买' : '库存不足' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { cardsApi } from '@/api/supabaseApi'

const props = defineProps({
  goods: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['buy'])

const router = useRouter()
const availableCount = ref(0)

onMounted(async () => {
  // 获取可用卡密数量
  const result = await cardsApi.getCards({ goodsId: props.goods.id, used: false })
  if (result.success) {
    availableCount.value = result.data.length
  }
})

const goToDetail = () => {
  router.push(`/detail/${props.goods.id}`)
}

const handleBuy = () => {
  emit('buy', props.goods)
}
</script>
