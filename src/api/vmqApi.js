import { supabase } from './supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://umvcqkigklidfaomvnwd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// 调用Edge Function
const callFunction = async (functionName, body) => {
  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`请求失败: ${response.status} ${response.statusText} - ${errorText}`)
  }

  return await response.json()
}

export const vmqApi = {
  // 查询订单状态
  queryOrder: async (orderId) => {
    try {
      const result = await callFunction('vmq-query-order', { orderId })
      return result
    } catch (error) {
      console.error('查询订单失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 发送支付通知（供监控端调用）
  sendNotify: async (params) => {
    try {
      const result = await callFunction('vmq-notify', params)
      return result
    } catch (error) {
      console.error('发送支付通知失败:', error)
      return { success: false, message: error.message }
    }
  }
}

// V免签收款码管理API
export const vmqQrCodeApi = {
  // 获取收款码列表
  getQrCodes: async (payType = null) => {
    try {
      let query = supabase.from('vmq_qrcodes').select('*')

      if (payType) {
        query = query.eq('pay_type', payType)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('获取收款码列表失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 添加收款码
  createQrCode: async (data) => {
    try {
      const { data: result, error } = await supabase
        .from('vmq_qrcodes')
        .insert([{
          name: data.name,
          pay_type: data.pay_type,
          qr_content: data.qr_content,
          image_url: data.image_url || '',
          use_count: 0,
          is_active: true,
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('添加收款码失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 更新收款码
  updateQrCode: async (id, data) => {
    try {
      const { data: result, error } = await supabase
        .from('vmq_qrcodes')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error
      return { success: true, data: result[0] }
    } catch (error) {
      console.error('更新收款码失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 删除收款码
  deleteQrCode: async (id) => {
    try {
      const { error } = await supabase
        .from('vmq_qrcodes')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('删除收款码失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 增加使用次数
  incrementUseCount: async (id) => {
    try {
      const { data: qrCode } = await supabase
        .from('vmq_qrcodes')
        .select('use_count')
        .eq('id', id)
        .single()

      const { error } = await supabase
        .from('vmq_qrcodes')
        .update({
          use_count: (qrCode?.use_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('更新使用次数失败:', error)
      return { success: false, message: error.message }
    }
  }
}

export default vmqApi
