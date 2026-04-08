/**
 * 简化版监控API
 * 监控端只需要调用 vmq-notify Edge Function 发送支付通知
 * 不需要额外的设备管理、日志记录等功能
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://umvcqkigklidfaomvnwd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// 调用Edge Function的通用函数
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

// 监控端API（供Android监控app调用）
export const monitorSimpleApi = {
  /**
   * 发送支付通知
   * V免签监控端发送的通知格式：
   * t=支付时间&m=支付金额&o=订单号（可选）&r=随机字符串（可选）
   * 
   * @param {Object} params 支付参数
   * @param {string} params.t 支付时间（时间戳）
   * @param {number|string} params.m 支付金额
   * @param {string} params.o 订单号（可选）
   * @param {string} params.r 随机字符串（可选）
   * @returns {Promise<Object>} 处理结果
   */
  sendPaymentNotify: async (params) => {
    try {
      const result = await callFunction('vmq-notify', params)
      return result
    } catch (error) {
      console.error('发送支付通知失败:', error)
      return { code: -1, msg: error.message }
    }
  },

  /**
   * 获取监控配置信息
   * 监控端需要知道回调URL、V免签密钥等信息
   * 
   * @returns {Promise<Object>} 配置信息
   */
  getMonitorConfig: async () => {
    try {
      // 从系统设置中获取监控相关配置
      const response = await fetch(`${supabaseUrl}/rest/v1/settings?key=in.("vmq_enabled","vmq_key","vmq_callback_url","vmq_notification_format")&select=key,value`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`获取配置失败: ${response.status}`)
      }

      const settings = await response.json()
      
      // 转换为对象格式
      const config = {}
      settings.forEach(setting => {
        config[setting.key] = setting.value
      })

      // 如果没有vmq_callback_url，使用默认的Edge Function URL
      if (!config.vmq_callback_url) {
        config.vmq_callback_url = `${supabaseUrl}/functions/v1/vmq-notify`
      }

      return {
        success: true,
        data: config
      }
    } catch (error) {
      console.error('获取监控配置失败:', error)
      return { 
        success: false, 
        message: error.message,
        // 返回默认配置，让监控端至少可以尝试调用
        data: {
          vmq_enabled: 'true',
          vmq_callback_url: `${supabaseUrl}/functions/v1/vmq-notify`,
          vmq_notification_format: 't={pay_time}&m={pay_amount}&o={order_no}'
        }
      }
    }
  },

  /**
   * 验证监控配置
   * 检查V免签功能是否启用
   * 
   * @returns {Promise<Object>} 验证结果
   */
  validateMonitorConfig: async () => {
    try {
      const configResult = await monitorSimpleApi.getMonitorConfig()
      if (!configResult.success) {
        return configResult
      }

      const config = configResult.data
      
      if (config.vmq_enabled !== 'true') {
        return {
          success: false,
          message: 'V免签功能未启用',
          data: config
        }
      }

      return {
        success: true,
        message: '监控配置正常',
        data: config
      }
    } catch (error) {
      console.error('验证监控配置失败:', error)
      return { 
        success: false, 
        message: error.message 
      }
    }
  },

  /**
   * 测试支付通知
   * 发送一个测试支付通知，用于验证监控端和服务器连接
   * 
   * @param {Object} testData 测试数据
   * @returns {Promise<Object>} 测试结果
   */
  testPaymentNotify: async (testData = {}) => {
    try {
      const testParams = {
        t: testData.pay_time || Date.now().toString(),
        m: testData.pay_amount || '0.01',
        o: testData.order_no || `TEST-${Date.now()}`,
        r: testData.random_str || Math.random().toString(36).substring(2),
        test: true // 标记为测试，让服务器知道不要真正处理
      }

      console.log('发送测试支付通知:', testParams)
      
      // 实际调用vmq-notify
      const result = await monitorSimpleApi.sendPaymentNotify(testParams)
      
      return {
        success: true,
        message: '测试通知发送成功',
        testParams,
        result
      }
    } catch (error) {
      console.error('测试支付通知失败:', error)
      return {
        success: false,
        message: error.message,
        testParams: testData
      }
    }
  },

  /**
   * 获取收款码信息（供监控端显示）
   * 监控端可能需要显示收款码信息给用户
   * 
   * @param {string} payType 支付类型（alipay, wechat等）
   * @returns {Promise<Object>} 收款码信息
   */
  getQrCodes: async (payType = null) => {
    try {
      let url = `${supabaseUrl}/rest/v1/vmq_qrcodes?select=*&order=created_at.desc&limit=10`
      
      if (payType) {
        url += `&pay_type=eq.${payType}`
      }

      const response = await fetch(url, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`获取收款码失败: ${response.status}`)
      }

      const qrCodes = await response.json()
      
      return {
        success: true,
        data: qrCodes
      }
    } catch (error) {
      console.error('获取收款码失败:', error)
      return { 
        success: false, 
        message: error.message 
      }
    }
  },

  /**
   * 获取系统状态
   * 监控端可以检查系统是否正常运行
   * 
   * @returns {Promise<Object>} 系统状态
   */
  getSystemStatus: async () => {
    try {
      // 检查数据库连接
      const dbResponse = await fetch(`${supabaseUrl}/rest/v1/settings?limit=1`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      })

      if (!dbResponse.ok) {
        throw new Error(`数据库连接失败: ${dbResponse.status}`)
      }

      // 检查Edge Function是否可用
      const efResponse = await fetch(`${supabaseUrl}/functions/v1/vmq-notify`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      })

      const edgeFunctionAvailable = efResponse.ok

      return {
        success: true,
        data: {
          database: '正常',
          edge_function: edgeFunctionAvailable ? '正常' : '异常',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      }
    } catch (error) {
      console.error('获取系统状态失败:', error)
      return {
        success: false,
        message: error.message,
        data: {
          database: '异常',
          edge_function: '未知',
          timestamp: new Date().toISOString(),
          error: error.message
        }
      }
    }
  },

  /**
   * 生成监控端配置URL
   * 用于生成监控端可以直接导入的配置URL
   * 
   * @param {Object} config 配置信息
   * @returns {string} 配置URL
   */
  generateConfigUrl: (config = {}) => {
    const baseConfig = {
      callback_url: `${supabaseUrl}/functions/v1/vmq-notify`,
      notification_format: 't={pay_time}&m={pay_amount}&o={order_no}',
      enabled: true
    }

    const mergedConfig = { ...baseConfig, ...config }
    
    // 将配置转换为URL参数
    const params = new URLSearchParams()
    Object.keys(mergedConfig).forEach(key => {
      if (mergedConfig[key] !== null && mergedConfig[key] !== undefined) {
        params.append(key, mergedConfig[key])
      }
    })

    return `vmqmonitor://configure?${params.toString()}`
  },

  /**
   * 解析监控端配置
   * 从URL或字符串解析监控配置
   * 
   * @param {string} configStr 配置字符串或URL
   * @returns {Object} 解析后的配置
   */
  parseConfig: (configStr) => {
    try {
      let params = configStr
      
      // 如果是URL，提取查询参数
      if (configStr.includes('?')) {
        const url = new URL(configStr)
        params = url.search.substring(1)
      }

      const config = {}
      const searchParams = new URLSearchParams(params)
      
      for (const [key, value] of searchParams) {
        config[key] = value
      }

      return {
        success: true,
        data: config
      }
    } catch (error) {
      console.error('解析配置失败:', error)
      return {
        success: false,
        message: error.message,
        data: {}
      }
    }
  }
}

// Android监控app配置指南
export const monitorConfigGuide = {
  // 监控端需要配置的信息
  requiredConfig: {
    callback_url: 'V免签回调URL，格式：https://your-supabase-url/functions/v1/vmq-notify',
    notification_format: '通知格式，默认：t={pay_time}&m={pay_amount}&o={order_no}',
    enabled: '是否启用监控，true/false'
  },

  // 监控端发送的通知格式
  notificationFormat: {
    description: 'V免签监控端发送的支付通知格式',
    params: {
      t: '支付时间（时间戳）',
      m: '支付金额（数字）',
      o: '订单号（可选）',
      r: '随机字符串（可选，防重放）'
    },
    example: {
      t: '1617189123',
      m: '10.50',
      o: 'ORDER123456',
      r: 'abc123'
    }
  },

  // 服务器响应格式
  responseFormat: {
    success: {
      code: 1,
      msg: 'success'
    },
    error: {
      code: -1,
      msg: '错误信息'
    }
  },

  // 集成步骤
  integrationSteps: [
    '1. 在Android监控app中配置回调URL',
    '2. 设置通知监听权限和无障碍服务权限',
    '3. 监控端监听到支付通知后，提取支付信息',
    '4. 将支付信息按格式发送到回调URL',
    '5. 服务器处理支付通知，自动发货'
  ],

  // 错误处理
  errorHandling: {
    network_error: '网络错误，检查网络连接',
    invalid_response: '服务器响应格式错误',
    order_not_found: '未找到匹配的订单',
    no_card_available: '没有可用卡密',
    already_processed: '订单已处理'
  }
}

export default monitorSimpleApi