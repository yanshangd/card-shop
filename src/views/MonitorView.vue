<template>
  <div class="monitor-dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>监控管理</h1>
      <p class="subtitle">实时监控设备状态和支付情况</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon" style="background: #e6f7ff;">
            <el-icon size="24" color="#1890ff">
              <TrendCharts />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ dashboardData.activeDevices || 0 }}</div>
            <div class="stat-label">活跃设备</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon" style="background: #f6ffed;">
            <el-icon size="24" color="#52c41a">
              <Check />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ dashboardData.todaySuccess || 0 }}</div>
            <div class="stat-label">今日成功</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon" style="background: #fff7e6;">
            <el-icon size="24" color="#fa8c16">
              <Warning />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ dashboardData.todayAlerts || 0 }}</div>
            <div class="stat-label">今日报警</div>
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon" style="background: #f9f0ff;">
            <el-icon size="24" color="#722ed1">
              <TrendCharts />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ totalAmount || '0.00' }}</div>
            <div class="stat-label">总金额(元)</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 快捷操作 -->
    <el-card class="quick-actions" shadow="never">
      <template #header>
        <div class="card-header">
          <span>快捷操作</span>
        </div>
      </template>
      <div class="actions-grid">
        <el-button @click="refreshDashboard">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
    </el-card>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <span>支付趋势 (最近7天)</span>
              </div>
            </template>
            <div v-if="trendData.length > 0" class="chart-container">
              <div ref="trendChart" style="height: 300px;"></div>
            </div>
            <div v-else class="empty-chart">
              <el-empty description="暂无数据" />
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <span>设备状态分布</span>
              </div>
            </template>
            <div class="device-status">
              <div v-if="loading" class="loading-status">
                <el-skeleton :rows="3" animated />
              </div>
              <div v-else-if="devices.length > 0" class="status-list">
                <div v-for="device in devices.slice(0, 5)" :key="device.id" class="status-item">
                  <div class="device-info">
                    <span class="device-name">{{ device.device_name || device.device_id }}</span>
                    <span class="device-model">{{ device.device_model }}</span>
                  </div>
                  <div class="device-status">
                    <el-tag :type="getDeviceStatusType(device)" size="small">
                      {{ getDeviceStatusText(device) }}
                    </el-tag>
                    <span class="last-online">
                      {{ formatLastOnline(device.last_online) }}
                    </span>
                  </div>
                </div>
  
              </div>
              <div v-else class="empty-devices">
                <el-empty description="暂无设备" />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 最近报警 -->
    <el-card class="recent-alerts" shadow="never">
      <template #header>
        <div class="card-header">
          <span>最近报警</span>
        </div>
      </template>
      <el-table v-if="alerts.length > 0" :data="alerts" style="width: 100%">
        <el-table-column prop="alert_type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getAlertTypeTag(row.alert_type)" size="small">
              {{ getAlertTypeText(row.alert_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="alert_level" label="级别" width="80">
          <template #default="{ row }">
            <el-tag :type="getAlertLevelTag(row.alert_level)" size="small">
              {{ row.alert_level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="device.device_name" label="设备" width="120" />
        <el-table-column prop="triggered_at" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.triggered_at) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.is_resolved ? 'success' : 'warning'" size="small">
              {{ row.is_resolved ? '已解决' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleAlertAction(row)">
              {{ row.is_resolved ? '查看' : '处理' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-else class="empty-alerts">
        <el-empty description="暂无报警记录" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'
import { monitorApi } from '@/api/monitorApi'
import { 
  Check, 
  Warning, 
  TrendCharts, 
  Refresh 
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const dashboardData = ref({})
const devices = ref([])
const alerts = ref([])
const trendData = ref([])
const totalAmount = ref('0.00')
const loading = ref(false)
const trendChart = ref(null)

// 获取仪表板数据
const fetchDashboardData = async () => {
  loading.value = true
  try {
    // 获取仪表板数据
    const dashboardResult = await monitorApi.getDashboardData()
    if (dashboardResult.success) {
      dashboardData.value = dashboardResult.data
      trendData.value = dashboardResult.data.trends || []
      
      // 计算总金额
      const total = trendData.value.reduce((sum, item) => {
        return sum + (parseFloat(item.total_amount) || 0)
      }, 0)
      totalAmount.value = total.toFixed(2)
    }

    // 获取设备列表
    const devicesResult = await monitorApi.getDevices({ 
      is_active: true,
      pageSize: 10 
    })
    if (devicesResult.success) {
      devices.value = devicesResult.data || []
    }

    // 获取最近报警
    const alertsResult = await monitorApi.getAlerts({ 
      is_resolved: false,
      pageSize: 5 
    })
    if (alertsResult.success) {
      alerts.value = alertsResult.data || []
    }
  } catch (error) {
    console.error('获取仪表板数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 刷新仪表板
const refreshDashboard = () => {
  fetchDashboardData()
}

// 初始化图表
const initTrendChart = () => {
  if (!trendChart.value || trendData.value.length === 0) return
  
  const chart = echarts.init(trendChart.value)
  
  const dates = trendData.value.map(item => {
    const date = new Date(item.date)
    return `${date.getMonth() + 1}/${date.getDate()}`
  })
  
  const amounts = trendData.value.map(item => parseFloat(item.total_amount) || 0)
  const counts = trendData.value.map(item => item.notifications_sent || 0)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = `${params[0].name}<br/>`
        params.forEach(param => {
          result += `${param.marker} ${param.seriesName}: ${param.value}`
          if (param.seriesIndex === 0) {
            result += ' 元'
          }
          result += '<br/>'
        })
        return result
      }
    },
    legend: {
      data: ['支付金额', '通知数量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: [
      {
        type: 'value',
        name: '金额(元)',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '数量',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '支付金额',
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        data: amounts,
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: '#1890ff'
        }
      },
      {
        name: '通知数量',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: counts,
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: '#52c41a'
        }
      }
    ]
  }
  
  chart.setOption(option)
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 设备状态相关函数
const getDeviceStatusType = (device) => {
  if (!device.last_online) return 'info'
  const lastOnline = new Date(device.last_online)
  const now = new Date()
  const diffMinutes = (now - lastOnline) / (1000 * 60)
  
  if (diffMinutes < 5) return 'success'
  if (diffMinutes < 30) return 'warning'
  return 'danger'
}

const getDeviceStatusText = (device) => {
  if (!device.last_online) return '离线'
  const lastOnline = new Date(device.last_online)
  const now = new Date()
  const diffMinutes = (now - lastOnline) / (1000 * 60)
  
  if (diffMinutes < 5) return '在线'
  if (diffMinutes < 30) return '最近在线'
  return '离线'
}

const formatLastOnline = (timestamp) => {
  if (!timestamp) return '从未在线'
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  if (diffMinutes < 24 * 60) return `${Math.floor(diffMinutes / 60)}小时前`
  return `${Math.floor(diffMinutes / (24 * 60))}天前`
}

// 报警相关函数
const getAlertTypeTag = (type) => {
  const map = {
    offline: 'warning',
    error: 'danger',
    security: 'danger',
    performance: 'info'
  }
  return map[type] || 'info'
}

const getAlertTypeText = (type) => {
  const map = {
    offline: '离线',
    error: '错误',
    security: '安全',
    performance: '性能'
  }
  return map[type] || type
}

const getAlertLevelTag = (level) => {
  const map = {
    info: 'info',
    warning: 'warning',
    error: 'danger',
    critical: 'danger'
  }
  return map[level] || 'info'
}

const formatDateTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-')
}

const handleAlertAction = (alert) => {
  if (alert.is_resolved) {
    // 查看已解决的报警
    console.log('查看报警:', alert.id)
  } else {
    // 处理未解决的报警
    console.log('处理报警:', alert.id)
    // 这里可以弹出一个对话框来处理报警
  }
}

// 生命周期钩子
onMounted(() => {
  fetchDashboardData().then(() => {
    nextTick(() => {
      initTrendChart()
    })
  })
})

// 监听趋势数据变化，重新渲染图表
watch(trendData, () => {
  nextTick(() => {
    if (trendChart.value) {
      initTrendChart()
    }
  })
}, { deep: true })
</script>

<style scoped>
.monitor-dashboard {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  color: #333;
}

.page-header .subtitle {
  margin: 8px 0 0;
  color: #666;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.quick-actions {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.charts-section {
  margin-bottom: 24px;
}

.chart-container {
  height: 300px;
}

.empty-chart,
.empty-devices,
.empty-alerts {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-status {
  height: 300px;
  overflow-y: auto;
}

.loading-status {
  padding: 20px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.status-item:last-child {
  border-bottom: none;
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.device-name {
  font-weight: 500;
  color: #333;
}

.device-model {
  font-size: 12px;
  color: #666;
}

.device-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.last-online {
  font-size: 12px;
  color: #666;
}

.more-devices {
  margin-top: 12px;
  text-align: center;
}

.recent-alerts {
  margin-bottom: 24px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header-wrapper) {
  border-bottom: 1px solid #f0f0f0;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-section .el-col {
    width: 100%;
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    flex-direction: column;
  }
  
  .actions-grid .el-button {
    width: 100%;
  }
}
</style>