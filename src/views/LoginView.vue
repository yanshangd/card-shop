<template>
  <div class="login-container">
    <div class="login-box">
      <TheCard>
        <div class="card-title">
          <span class="icon">🔐</span>
          后台管理登录
        </div>
        
        <div class="login-form">
          <div class="form-item">
            <label class="form-label">邮箱</label>
            <input 
              v-model="loginForm.email" 
              type="email" 
              class="search-input" 
              placeholder="请输入邮箱"
              @keyup.enter="handleLogin"
            >
          </div>
          
          <div class="form-item">
            <label class="form-label">密码</label>
            <input 
              v-model="loginForm.password" 
              type="password" 
              class="search-input" 
              placeholder="请输入密码"
              @keyup.enter="handleLogin"
            >
          </div>
          
          <button 
            class="login-btn" 
            :class="{ 'loading': loading }"
            @click="handleLogin"
          >
            <span v-if="loading">登录中...</span>
            <span v-else>登 录</span>
          </button>
          
          <div class="back-link" @click="goHome">
            ← 返回商城首页
          </div>
        </div>
      </TheCard>
    </div>
  </div>

  <div class="footer">© 2026 自动发卡商城 - 后台管理系统</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import TheCard from '@/components/TheCard.vue'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)

const loginForm = ref({
  email: '',
  password: ''
})

const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    ElMessage.warning('请输入邮箱和密码')
    return
  }
  
  loading.value = true
  try {
    const success = await userStore.adminLogin(loginForm.value)
    if (success) {
      ElMessage.success('登录成功！')
      router.push('/admin')
    } else {
      ElMessage.error('邮箱或密码错误')
    }
  } catch (error) {
    ElMessage.error('登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.login-container {
  min-height: calc(100vh - 100px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 500px;
}

.login-form {
  margin-top: 20px;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.search-input {
  width: 100%;
}

.back-link {
  margin-top: 20px;
  text-align: center;
  color: #1677ff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.25s ease;
}

.back-link:hover {
  color: #0d63d8;
}

.login-btn.loading {
  background: linear-gradient(135deg, #d9d9d9 0%, #bfbfbf 100%);
  cursor: not-allowed;
  box-shadow: none;
}
</style>
