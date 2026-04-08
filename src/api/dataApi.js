
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_MONGODB_DATA_API_URL
const API_KEY = import.meta.env.VITE_MONGODB_API_KEY
const DATA_SOURCE = import.meta.env.VITE_MONGODB_DATA_SOURCE || 'Cluster0'
const DATABASE = import.meta.env.VITE_MONGODB_DATABASE || 'card_goods'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'api-key': API_KEY
  }
})

const makeRequest = async (action, collection, payload = {}) =&gt; {
  try {
    const response = await api.post(`/action/${action}`, {
      dataSource: DATA_SOURCE,
      database: DATABASE,
      collection,
      ...payload
    })
    return response.data
  } catch (error) {
    console.error(`Data API Error [${action}]:`, error)
    throw error
  }
}

export const goodsApi = {
  findGoods: (filter = {}, sort = {}, limit = 100) =&gt; 
    makeRequest('find', 'goods', { filter, sort, limit }),
  
  findOneGoods: (filter) =&gt; 
    makeRequest('findOne', 'goods', { filter }),
  
  insertGoods: (document) =&gt; 
    makeRequest('insertOne', 'goods', { document }),
  
  updateGoods: (filter, update) =&gt; 
    makeRequest('updateOne', 'goods', { filter, update }),
  
  deleteGoods: (filter) =&gt; 
    makeRequest('deleteOne', 'goods', { filter })
}

export const cardsApi = {
  findCards: (filter = {}) =&gt; 
    makeRequest('find', 'cards', { filter }),
  
  findOneCard: (filter) =&gt; 
    makeRequest('findOne', 'cards', { filter }),
  
  insertCard: (document) =&gt; 
    makeRequest('insertOne', 'cards', { document }),
  
  updateCard: (filter, update) =&gt; 
    makeRequest('updateOne', 'cards', { filter, update }),
  
  deleteCard: (filter) =&gt; 
    makeRequest('deleteOne', 'cards', { filter }),
  
  deleteManyCards: (filter) =&gt; 
    makeRequest('deleteMany', 'cards', { filter })
}

export const ordersApi = {
  findOrders: (filter = {}, sort = { createdAt: -1 }, limit = 100) =&gt; 
    makeRequest('find', 'orders', { filter, sort, limit }),
  
  findOneOrder: (filter) =&gt; 
    makeRequest('findOne', 'orders', { filter }),
  
  insertOrder: (document) =&gt; 
    makeRequest('insertOne', 'orders', { document }),
  
  updateOrder: (filter, update) =&gt; 
    makeRequest('updateOne', 'orders', { filter, update }),
  
  aggregateOrders: (pipeline) =&gt; 
    makeRequest('aggregate', 'orders', { pipeline })
}

export const usersApi = {
  findUsers: (filter = {}) =&gt; 
    makeRequest('find', 'users', { filter }),
  
  findOneUser: (filter) =&gt; 
    makeRequest('findOne', 'users', { filter }),
  
  insertUser: (document) =&gt; 
    makeRequest('insertOne', 'users', { document }),
  
  updateUser: (filter, update) =&gt; 
    makeRequest('updateOne', 'users', { filter, update })
}

export default api

