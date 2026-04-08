<template>
  <div class="goods-skeleton">
    <div class="skeleton-cover"></div>
    <div class="skeleton-name"></div>
    <div class="skeleton-price"></div>
    <div class="skeleton-stock"></div>
    <div class="skeleton-btn"></div>
  </div>
</template>

<style scoped>
.goods-skeleton {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.skeleton-cover {
  width: 120px;
  height: 120px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 12px;
  margin: 0 auto 12px;
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-name {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
  width: 80%;
  margin-left: auto;
  margin-right: auto;
}

.skeleton-price {
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
  width: 50%;
  margin-left: auto;
  margin-right: auto;
}

.skeleton-stock {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 12px;
  width: 40%;
  margin-left: auto;
  margin-right: auto;
}

.skeleton-btn {
  height: 40px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 20px;
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
