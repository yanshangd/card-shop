import axios from 'axios'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('请求失败，请稍后重试')
    }
    return Promise.reject(error)
  }
)

export const goodsApi = {
  getGoods: (params) => api.get('/goods', { params }),
  getGoodsById: (id) => api.get(`/goods/${id}`),
  createGoods: (data) => api.post('/goods', data),
  updateGoods: (id, data) => api.put(`/goods/${id}`, data),
  deleteGoods: (id) => api.delete(`/goods/${id}`)
}

export const orderApi = {
  createOrder: (data) => api.post('/orders', data),
  getOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  payOrder: (id) => api.put(`/orders/${id}/pay`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`)
}

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
}

export default api
