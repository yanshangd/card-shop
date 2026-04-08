import { supabase } from './supabase'

// 监控设备管理API
export const monitorApi = {
  // 获取监控设备列表
  getDevices: async (params = {}) => {
    try {
      let query = supabase
        .from('monitor_devices')
        .select(`
          *,
          admin:admins(username, email)
        `)

      // 添加过滤条件
      if (params.is_active !== undefined) {
        query = query.eq('is_active', params.is_active)
      }

      if (params.admin_id) {
        query = query.eq('admin_id', params.admin_id)
      }

      if (params.search) {
        query = query.or(`device_name.ilike.%${params.search}%,device_id.ilike.%${params.search}%`)
      }

      // 排序
      const orderBy = params.orderBy || 'created_at'
      const orderDirection = params.orderDirection || 'desc'
      query = query.order(orderBy, { ascending: orderDirection === 'asc' })

      // 分页
      if (params.page && params.pageSize) {
        const start = (params.page - 1) * params.pageSize
        const end = start + params.pageSize - 1
        query = query.range(start, end)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { success: true, data, count }
    } catch (error) {
      console.error('获取监控设备列表失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 获取单个设备信息
  getDevice: async (id) => {
    try {
      const { data, error } = await supabase
        .from('monitor_devices')
        .select(`
          *,
          admin:admins(username, email)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('获取设备信息失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 创建设备（监控端自动注册）
  createDevice: async (deviceData) => {
    try {
      const { data, error } = await supabase
        .from('monitor_devices')
        .insert([{
          ...deviceData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('创建设备失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 更新设备信息
  updateDevice: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('monitor_devices')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('更新设备失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 删除设备
  deleteDevice: async (id) => {
    try {
      const { error } = await supabase
        .from('monitor_devices')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('删除设备失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 更新设备在线状态
  updateDeviceOnlineStatus: async (deviceId, status = true) => {
    try {
      const { error } = await supabase
        .from('monitor_devices')
        .update({
          last_online: status ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('device_id', deviceId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('更新设备在线状态失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 获取设备日志
  getDeviceLogs: async (deviceId, params = {}) => {
    try {
      let query = supabase
        .from('monitor_logs')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false })

      // 添加过滤条件
      if (params.log_type) {
        query = query.eq('log_type', params.log_type)
      }

      if (params.log_level) {
        query = query.eq('log_level', params.log_level)
      }

      if (params.start_date) {
        query = query.gte('created_at', params.start_date)
      }

      if (params.end_date) {
        query = query.lte('created_at', params.end_date)
      }

      // 分页
      if (params.page && params.pageSize) {
        const start = (params.page - 1) * params.pageSize
        const end = start + params.pageSize - 1
        query = query.range(start, end)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { success: true, data, count }
    } catch (error) {
      console.error('获取设备日志失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 添加设备日志
  addDeviceLog: async (logData) => {
    try {
      const { data, error } = await supabase
        .from('monitor_logs')
        .insert([{
          ...logData,
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('添加设备日志失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 获取设备统计信息
  getDeviceStatistics: async (deviceId, period = 'daily') => {
    try {
      let query = supabase
        .from('monitor_statistics')
        .select('*')
        .eq('device_id', deviceId)

      // 根据时间段过滤
      const now = new Date()
      if (period === 'daily') {
        const today = now.toISOString().split('T')[0]
        query = query.eq('date', today)
      } else if (period === 'weekly') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        query = query.gte('date', weekAgo.toISOString().split('T')[0])
      } else if (period === 'monthly') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        query = query.gte('date', monthAgo.toISOString().split('T')[0])
      }

      query = query.order('date', { ascending: true })
      if (period !== 'daily') {
        query = query.order('hour', { ascending: true })
      }

      const { data, error } = await query

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('获取设备统计信息失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 获取监控报警列表
  getAlerts: async (params = {}) => {
    try {
      let query = supabase
        .from('monitor_alerts')
        .select(`
          *,
          device:monitor_devices(device_name, device_id),
          resolved_by_admin:admins!resolved_by(username),
          acknowledged_by_admin:admins!acknowledged_by(username)
        `)

      // 添加过滤条件
      if (params.is_resolved !== undefined) {
        query = query.eq('is_resolved', params.is_resolved)
      }

      if (params.alert_level) {
        query = query.eq('alert_level', params.alert_level)
      }

      if (params.alert_type) {
        query = query.eq('alert_type', params.alert_type)
      }

      if (params.device_id) {
        query = query.eq('device_id', params.device_id)
      }

      // 时间范围
      if (params.start_date) {
        query = query.gte('triggered_at', params.start_date)
      }

      if (params.end_date) {
        query = query.lte('triggered_at', params.end_date)
      }

      // 排序
      query = query.order('triggered_at', { ascending: false })

      // 分页
      if (params.page && params.pageSize) {
        const start = (params.page - 1) * params.pageSize
        const end = start + params.pageSize - 1
        query = query.range(start, end)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { success: true, data, count }
    } catch (error) {
      console.error('获取监控报警失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 更新报警状态
  updateAlert: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('monitor_alerts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('更新报警失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 获取监控配置
  getMonitorSettings: async (category = null) => {
    try {
      let query = supabase
        .from('monitor_settings')
        .select('*')
        .order('category')
        .order('key')

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('获取监控配置失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 更新监控配置
  updateMonitorSetting: async (key, value) => {
    try {
      const { data, error } = await supabase
        .from('monitor_settings')
        .update({
          value,
          updated_at: new Date().toISOString()
        })
        .eq('key', key)
        .select()

      if (error) throw error
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('更新监控配置失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 获取监控仪表板数据
  getDashboardData: async () => {
    try {
      // 获取活跃设备数量
      const { data: activeDevices, error: devicesError } = await supabase
        .from('monitor_devices')
        .select('id', { count: 'exact' })
        .eq('is_active', true)

      if (devicesError) throw devicesError

      // 获取今日报警数量
      const today = new Date().toISOString().split('T')[0]
      const { data: todayAlerts, error: alertsError } = await supabase
        .from('monitor_alerts')
        .select('id', { count: 'exact' })
        .gte('triggered_at', `${today}T00:00:00`)
        .lte('triggered_at', `${today}T23:59:59`)

      if (alertsError) throw alertsError

      // 获取今日成功支付数量（通过监控通知）
      const { data: todayLogs, error: logsError } = await supabase
        .from('monitor_logs')
        .select('id', { count: 'exact' })
        .eq('log_type', 'success')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)

      if (logsError) throw logsError

      // 获取最近7天的统计趋势
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const startDate = sevenDaysAgo.toISOString().split('T')[0]

      const { data: trends, error: trendsError } = await supabase
        .from('monitor_statistics')
        .select('date, notifications_sent, total_amount')
        .gte('date', startDate)
        .is('hour', null) // 只获取每日汇总
        .order('date', { ascending: true })

      if (trendsError) throw trendsError

      return {
        success: true,
        data: {
          activeDevices: activeDevices.length,
          todayAlerts: todayAlerts.length,
          todaySuccess: todayLogs.length,
          trends
        }
      }
    } catch (error) {
      console.error('获取仪表板数据失败:', error)
      return { success: false, message: error.message }
    }
  }
}

// 监控端API（供Android监控app调用）
export const monitorClientApi = {
  // 设备注册
  registerDevice: async (deviceInfo) => {
    try {
      // 检查设备是否已存在
      const { data: existingDevice } = await supabase
        .from('monitor_devices')
        .select('id')
        .eq('device_id', deviceInfo.device_id)
        .single()

      if (existingDevice) {
        // 设备已存在，更新信息
        const result = await monitorApi.updateDevice(existingDevice.id, {
          device_name: deviceInfo.device_name,
          device_model: deviceInfo.device_model,
          android_version: deviceInfo.android_version,
          app_version: deviceInfo.app_version,
          last_online: new Date().toISOString()
        })
        return result
      } else {
        // 新设备注册
        const result = await monitorApi.createDevice({
          ...deviceInfo,
          is_active: true
        })
        return result
      }
    } catch (error) {
      console.error('设备注册失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 发送心跳
  sendHeartbeat: async (deviceId) => {
    try {
      // 更新设备在线状态
      const result = await monitorApi.updateDeviceOnlineStatus(deviceId, true)
      
      if (result.success) {
        // 记录心跳日志
        await monitorApi.addDeviceLog({
          device_id: deviceId,
          log_type: 'heartbeat',
          log_level: 'info',
          title: '设备心跳',
          content: '设备发送心跳信号',
          extra_info: JSON.stringify({ timestamp: Date.now() })
        })
      }
      
      return result
    } catch (error) {
      console.error('发送心跳失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 获取设备配置
  getDeviceConfig: async (deviceId) => {
    try {
      // 获取设备信息
      const deviceResult = await monitorApi.getDevice(deviceId)
      if (!deviceResult.success) {
        return deviceResult
      }

      // 获取公开的监控配置
      const settingsResult = await monitorApi.getMonitorSettings()
      if (!settingsResult.success) {
        return settingsResult
      }

      // 过滤出公开配置
      const publicSettings = settingsResult.data.filter(setting => setting.is_public)

      return {
        success: true,
        data: {
          device: deviceResult.data,
          settings: publicSettings.reduce((acc, setting) => {
            acc[setting.key] = setting.value
            return acc
          }, {})
        }
      }
    } catch (error) {
      console.error('获取设备配置失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 上报监控日志
  reportLog: async (logData) => {
    try {
      const result = await monitorApi.addDeviceLog(logData)
      return result
    } catch (error) {
      console.error('上报监控日志失败:', error)
      return { success: false, message: error.message }
    }
  },

  // 上报支付通知
  reportPayment: async (paymentData) => {
    try {
      const { device_id, order_no, pay_amount, pay_time, ...extra } = paymentData
      
      // 记录支付日志
      const logResult = await monitorApi.addDeviceLog({
        device_id,
        log_type: 'payment',
        log_level: 'info',
        title: '支付通知',
        content: `检测到支付：订单 ${order_no}，金额 ${pay_amount}元`,
        extra_info: JSON.stringify({
          order_no,
          pay_amount,
          pay_time,
          ...extra
        })
      })

      // 更新设备统计信息
      if (logResult.success) {
        await supabase.rpc('increment_device_payment_count', {
          p_device_id: device_id
        })
      }

      return logResult
    } catch (error) {
      console.error('上报支付通知失败:', error)
      return { success: false, message: error.message }
    }
  }
}

export default monitorApi