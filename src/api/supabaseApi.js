
import { supabase } from './supabase'

export const goodsApi = {
  getGoods: async (params = {}) => {
    try {
      let query = supabase.from('goods').select('*', { count: 'exact' })
      
      if (params.categoryId && params.categoryId !== 'all') {
        query = query.eq('category_id', params.categoryId)
      }
      if (params.status) {
        query = query.eq('status', params.status)
      }
      if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
      }
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { success: true, data, total: count || 0 }
    } catch (error) {
      console.error('获取商品列表失败:', error)
      return { success: false, message: error.message }
    }
  },

  getGoodsById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('goods')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('获取商品详情失败:', error)
      return { success: false, message: error.message }
    }
  },

  createGoods: async (data) => {
    try {
      const { data: result, error } = await supabase
        .from('goods')
        .insert([data])
        .select()
      
      if (error) throw error
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('创建商品失败:', error)
      return { success: false, message: error.message }
    }
  },

  updateGoods: async (id, data) => {
    try {
      const { data: result, error } = await supabase
        .from('goods')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
      
      if (error) throw error
      return { success: true, data: result && result.length > 0 ? result[0] : null }
    } catch (error) {
      console.error('更新商品失败:', error)
      return { success: false, message: error.message }
    }
  },

  deleteGoods: async (id) => {
    try {
      const { error } = await supabase
        .from('goods')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('删除商品失败:', error)
      return { success: false, message: error.message }
    }
  }
}

export const categoriesApi = {
  getCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('获取分类列表失败:', error)
      return { success: false, message: error.message }
    }
  },

  createCategory: async (data) => {
    try {
      const { data: result, error } = await supabase
        .from('categories')
        .insert([data])
        .select()
      
      if (error) throw error
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('创建分类失败:', error)
      return { success: false, message: error.message }
    }
  },

  updateCategory: async (id, data) => {
    try {
      const { data: result, error } = await supabase
        .from('categories')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
      
      if (error) throw error
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('更新分类失败:', error)
      return { success: false, message: error.message }
    }
  },

  deleteCategory: async (id) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('删除分类失败:', error)
      return { success: false, message: error.message }
    }
  }
}

export const cardsApi = {
  getCards: async (filter = {}) => {
    try {
      let query = supabase.from('cards').select('*')
      
      if (filter.goodsId) {
        query = query.eq('goods_id', filter.goodsId)
      }
      if (filter.used !== undefined) {
        query = query.eq('used', filter.used)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('获取卡密列表失败:', error)
      return { success: false, message: error.message }
    }
  },

  getAvailableCard: async (goodsId) => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('goods_id', goodsId)
        .eq('used', false)
        .limit(1)
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('获取可用卡密失败:', error)
      return { success: false, message: error.message }
    }
  },

  updateCard: async (id, data) => {
    try {
      if (id === null) {
        const { data: result, error } = await supabase
          .from('cards')
          .insert([data])
          .select()
        
        if (error) throw error
        return { success: true, data: result[0] }
      } else {
        const { data: result, error } = await supabase
          .from('cards')
          .update(data)
          .eq('id', id)
          .select()
        
        if (error) throw error
        return { success: true, data: result[0] }
      }
    } catch (error) {
      console.error('更新卡密失败:', error)
      return { success: false, message: error.message }
    }
  },

  deleteCard: async (id) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('删除卡密失败:', error)
      return { success: false, message: error.message }
    }
  }
}

export const ordersApi = {
  createOrder: async (data) => {
    try {
      const { data: result, error } = await supabase
        .from('orders')
        .insert([{
          ...data,
          order_no: 'ORD' + Date.now(),
          status: 'pending'
        }])
        .select()
      
      if (error) throw error
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('创建订单失败:', error)
      return { success: false, message: error.message }
    }
  },

  getOrders: async (filter = {}) => {
    try {
      let query = supabase.from('orders').select('*')
      
      if (filter.userId) {
        query = query.eq('user_id', filter.userId)
      }
      if (filter.email) {
        query = query.eq('email', filter.email)
      }
      if (filter.status) {
        query = query.eq('status', filter.status)
      }
      if (filter.keyword) {
        query = query.or(`order_no.ilike.%${filter.keyword}%,email.ilike.%${filter.keyword}%`)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('获取订单列表失败:', error)
      return { success: false, message: error.message }
    }
  },

  updateOrder: async (id, data) => {
    try {
      const { data: result, error } = await supabase
        .from('orders')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
      
      if (error) throw error
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('更新订单失败:', error)
      return { success: false, message: error.message }
    }
  },

  deleteOrder: async (id) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('删除订单失败:', error)
      return { success: false, message: error.message }
    }
  }
}

export const settingsApi = {
  getSettings: async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('key', { ascending: true })
      
      if (error) throw error
      const settingsObj = {}
      data.forEach(item => {
        let value = item.value
        if (item.type === 'boolean') {
          value = value === 'true'
        } else if (item.type === 'json') {
          try {
            value = JSON.parse(value)
          } catch {
            value = item.value
          }
        } else if (item.type === 'number') {
          value = Number(value)
        }
        settingsObj[item.key] = value
      })
      return { success: true, data: settingsObj, raw: data }
    } catch (error) {
      console.error('获取设置失败:', error)
      return { success: false, message: error.message }
    }
  },

  updateSettings: async (updates) => {
    try {
      const promises = []
      for (const key in updates) {
        let value = updates[key]
        const type = typeof value === 'boolean' ? 'boolean' : 
                    typeof value === 'number' ? 'number' : 
                    Array.isArray(value) || typeof value === 'object' ? 'json' : 'string'
        
        if (type === 'json') {
          value = JSON.stringify(value)
        } else if (type === 'boolean') {
          value = value ? 'true' : 'false'
        }
        
        promises.push(
          supabase
            .from('settings')
            .upsert({ 
              key, 
              value: String(value),
              type,
              updated_at: new Date().toISOString()
            }, { onConflict: 'key' })
            .select()
        )
      }
      
      const results = await Promise.all(promises)
      for (const result of results) {
        if (result.error) throw result.error
      }
      
      return { success: true }
    } catch (error) {
      console.error('更新设置失败:', error)
      return { success: false, message: error.message }
    }
  },

  sendEmail: async (emailConfig) => {
    try {
      const { 
        to, 
        subject, 
        html, 
        smtpConfig 
      } = emailConfig

      if (!smtpConfig?.host || !smtpConfig?.user || !smtpConfig?.pass) {
        return { 
          success: false, 
          message: '请先配置完整的SMTP信息' 
        }
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://umvcqkigklidfaomvnwd.supabase.co'
      const functionUrl = `${supabaseUrl}/functions/v1/send-email`

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
        },
        body: JSON.stringify({
          to,
          subject,
          html,
          smtpConfig
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`请求失败: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('发送邮件失败:', error)
      return { 
        success: false, 
        message: error.message || '邮件发送失败' 
      }
    }
  }
}

export const authApi = {
  register: async (data) => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email || data.username + '@example.com',
        password: data.password
      })
      
      if (error) throw error
      return { 
        success: true, 
        data: { 
          ...authData.user, 
          token: authData.session?.access_token,
          username: data.username 
        } 
      }
    } catch (error) {
      console.error('注册失败:', error)
      return { success: false, message: error.message }
    }
  },

  login: async (data) => {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email || data.username + '@example.com',
        password: data.password
      })
      
      if (error) throw error
      return { 
        success: true, 
        data: { 
          ...authData.user, 
          token: authData.session?.access_token,
          username: data.username 
        } 
      }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, message: error.message }
    }
  },

  getMe: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) throw error
      return { success: true, data: user }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return { success: false, message: error.message }
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('登出失败:', error)
      return { success: false, message: error.message }
    }
  },

  adminLogout: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('管理员登出失败:', error)
      return { success: false, message: error.message }
    }
  },

  adminLogin: async (data) => {
    try {
      const { email, password } = data
      
      if (!email || !password) {
        return { success: false, message: '邮箱和密码不能为空' }
      }
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      const adminData = {
        id: authData.user.id,
        email: authData.user.email,
        role: 'superadmin',
        token: authData.session?.access_token
      }
      return { success: true, data: adminData }
    } catch (error) {
      console.error('管理员登录失败:', error)
      return { success: false, message: error.message }
    }
  }
}
