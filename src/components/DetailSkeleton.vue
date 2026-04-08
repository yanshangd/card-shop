<template>
  <TheCard>
    <div class="detail-skeleton">
      <div class="skeleton-cover"></div>
      <div class="skeleton-name"></div>
      <div class="skeleton-price"></div>
      <div class="skeleton-info"></div>
      <div class="skeleton-btn"></div>
      <div class="skeleton-section-title"></div>
      <div class="skeleton-desc"></div>
      <div class="skeleton-desc"></div>
      <div class="skeleton-desc"></div>
    </div>
  </TheCard>
</template>

<script setup>
import TheCard from './TheCard.vue'
</script>

<style scoped>
.detail-skeleton {
  text-align: center;
}

.skeleton-cover {
  width: 160px;
  height: 160px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 12px;
  margin: 0 auto 16px;
  font-size: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-name {
  height: 28px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 12px;
  width: 70%;
  margin-left: auto;
  margin-right: auto;
}

.skeleton-price {
  height: 36px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 12px;
  width: 40%;
  margin-left: auto;
  margin-right: auto;
}

.skeleton-info {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 16px;
  width: 30%;
  margin-left: auto;
  margin-right: auto;
}

.skeleton-btn {
  height: 48px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 24px;
  margin-bottom: 24px;
}

.skeleton-section-title {
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 12px;
  width: 30%;
}

.skeleton-desc {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-desc:nth-child(8) {
  width: 90%;
}

.skeleton-desc:nth-child(9) {
  width: 80%;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
