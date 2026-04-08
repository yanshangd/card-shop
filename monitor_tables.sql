-- ========================================
-- 监控端数据库表扩展
-- 为发卡商城系统添加监控功能
-- ========================================

-- 1. 创建监控设备表（用于管理监控端设备）
CREATE TABLE IF NOT EXISTS monitor_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- 设备标识信息
    device_id VARCHAR(255) NOT NULL UNIQUE,            -- 设备唯一ID（Android设备ID）
    device_name VARCHAR(255),                          -- 设备名称（用户自定义）
    device_model VARCHAR(100),                         -- 设备型号
    android_version VARCHAR(50),                       -- Android版本
    app_version VARCHAR(50),                           -- App版本
    
    -- 设备状态信息
    is_active BOOLEAN DEFAULT TRUE,                    -- 设备是否激活
    last_online TIMESTAMPTZ,                           -- 最后在线时间
    connection_count INT DEFAULT 0,                    -- 连接次数
    total_monitor_time BIGINT DEFAULT 0,               -- 总监控时长（秒）
    
    -- 监控配置信息
    notification_enabled BOOLEAN DEFAULT TRUE,         -- 通知监听是否启用
    accessibility_enabled BOOLEAN DEFAULT FALSE,       -- 无障碍服务是否启用
    foreground_service_enabled BOOLEAN DEFAULT TRUE,   -- 前台服务是否启用
    auto_restart_monitor BOOLEAN DEFAULT TRUE,         -- 是否自动重启监控
    
    -- 性能统计
    total_notifications_received INT DEFAULT 0,        -- 接收通知总数
    total_payments_detected INT DEFAULT 0,            -- 检测到支付总数
    total_notifications_sent INT DEFAULT 0,           -- 发送通知总数
    total_errors INT DEFAULT 0,                       -- 错误总数
    
    -- 网络配置（如果监控端需要直接发送通知）
    callback_url TEXT,                                 -- 回调URL（备用，通常使用系统全局配置）
    
    -- 元数据
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 关联信息
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL  -- 所属管理员
);

-- 2. 创建监控日志表（记录监控端活动）
CREATE TABLE IF NOT EXISTS monitor_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- 关联信息
    device_id UUID NOT NULL REFERENCES monitor_devices(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    -- 日志信息
    log_type VARCHAR(50) NOT NULL,                     -- 日志类型：info, error, warning, success, test
    log_level VARCHAR(20) DEFAULT 'info',              -- 日志级别：debug, info, warning, error, critical
    
    -- 内容信息
    title VARCHAR(255) NOT NULL,                       -- 日志标题
    content TEXT,                                      -- 详细内容
    extra_info TEXT,                                   -- 额外信息（JSON格式）
    
    -- 性能信息
    response_time_ms INT,                              -- 响应时间（毫秒）
    data_size_bytes INT,                               -- 数据大小（字节）
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建监控统计表（汇总统计信息）
CREATE TABLE IF NOT EXISTS monitor_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- 时间范围
    date DATE NOT NULL,                                -- 统计日期
    hour INT,                                          -- 统计小时（0-23），NULL表示全天统计
    
    -- 统计信息
    device_id UUID REFERENCES monitor_devices(id) ON DELETE CASCADE,
    
    -- 数量统计
    notifications_received INT DEFAULT 0,              -- 接收通知数
    payments_detected INT DEFAULT 0,                   -- 检测到支付数
    notifications_sent INT DEFAULT 0,                  -- 发送通知数
    notifications_success INT DEFAULT 0,               -- 成功通知数
    notifications_failed INT DEFAULT 0,                -- 失败通知数
    
    -- 金额统计
    total_amount DECIMAL(15, 2) DEFAULT 0.00,          -- 总金额
    avg_response_time_ms INT DEFAULT 0,                -- 平均响应时间
    
    -- 设备状态
    online_minutes INT DEFAULT 0,                      -- 在线时长（分钟）
    error_count INT DEFAULT 0,                         -- 错误次数
    
    -- 唯一约束
    UNIQUE(date, hour, device_id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 创建监控配置表（系统全局配置）
CREATE TABLE IF NOT EXISTS monitor_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- 配置键值
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string',                 -- 配置类型：string, number, boolean, json, array
    description TEXT,                                  -- 配置描述
    
    -- 分组信息
    category VARCHAR(50) DEFAULT 'general',           -- 配置分类：general, notification, security, performance
    is_public BOOLEAN DEFAULT FALSE,                  -- 是否公开给监控端
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 创建监控收款码关联表（监控端与收款码的关联）
CREATE TABLE IF NOT EXISTS monitor_qrcode_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- 关联信息
    device_id UUID NOT NULL REFERENCES monitor_devices(id) ON DELETE CASCADE,
    qrcode_id UUID NOT NULL REFERENCES vmq_qrcodes(id) ON DELETE CASCADE,
    
    -- 分配信息
    assignment_type VARCHAR(50) DEFAULT 'primary',     -- 分配类型：primary, backup, test
    priority INT DEFAULT 0,                            -- 优先级（数字越大优先级越高）
    
    -- 使用统计
    use_count INT DEFAULT 0,                           -- 使用次数
    last_used_at TIMESTAMPTZ,                          -- 最后使用时间
    
    -- 状态信息
    is_active BOOLEAN DEFAULT TRUE,                    -- 是否激活
    enabled_from TIMESTAMPTZ,                          -- 启用开始时间
    enabled_until TIMESTAMPTZ,                         -- 启用结束时间
    
    -- 配置信息
    rotation_interval_minutes INT DEFAULT 0,           -- 轮换间隔（分钟），0表示不轮换
    max_use_count INT DEFAULT 0,                       -- 最大使用次数，0表示无限制
    
    -- 唯一约束
    UNIQUE(device_id, qrcode_id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 创建监控报警表（异常报警记录）
CREATE TABLE IF NOT EXISTS monitor_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- 关联信息
    device_id UUID REFERENCES monitor_devices(id) ON DELETE SET NULL,
    
    -- 报警信息
    alert_type VARCHAR(50) NOT NULL,                   -- 报警类型：offline, error, security, performance
    alert_level VARCHAR(20) NOT NULL,                  -- 报警级别：info, warning, error, critical
    alert_code VARCHAR(100),                           -- 报警代码
    
    -- 内容信息
    title VARCHAR(255) NOT NULL,                       -- 报警标题
    message TEXT NOT NULL,                             -- 报警消息
    details TEXT,                                      -- 详细信息（JSON格式）
    
    -- 状态信息
    is_resolved BOOLEAN DEFAULT FALSE,                 -- 是否已解决
    resolved_at TIMESTAMPTZ,                           -- 解决时间
    resolved_by UUID REFERENCES admins(id) ON DELETE SET NULL,  -- 解决人
    resolution_notes TEXT,                             -- 解决说明
    
    -- 触发信息
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,                       -- 确认时间
    acknowledged_by UUID REFERENCES admins(id) ON DELETE SET NULL,  -- 确认人
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- 插入默认监控配置
-- ========================================

-- 插入默认监控配置
INSERT INTO monitor_settings (key, value, type, description, category, is_public) VALUES
-- 通用配置
('monitor_enabled', 'true', 'boolean', '是否启用监控功能', 'general', true),
('monitor_auto_register', 'true', 'boolean', '是否允许监控端自动注册', 'general', true),
('monitor_heartbeat_interval', '300', 'number', '心跳间隔（秒）', 'general', true),
('monitor_data_retention_days', '30', 'number', '数据保留天数', 'general', false),

-- 通知配置
('notification_check_interval', '5', 'number', '通知检查间隔（秒）', 'notification', true),
('notification_retry_count', '3', 'number', '通知重试次数', 'notification', true),
('notification_retry_delay', '10', 'number', '通知重试延迟（秒）', 'notification', true),
('notification_timeout', '30', 'number', '通知超时时间（秒）', 'notification', true),

-- 安全配置
('device_auth_required', 'true', 'boolean', '设备认证是否必需', 'security', true),
('device_auth_token_expiry', '86400', 'number', '设备认证令牌有效期（秒）', 'security', false),
('max_devices_per_admin', '10', 'number', '每个管理员最大设备数', 'security', false),
('allow_remote_config', 'false', 'boolean', '是否允许远程配置', 'security', false),

-- 性能配置
('max_logs_per_device', '1000', 'number', '每个设备最大日志数', 'performance', false),
('statistics_cleanup_days', '90', 'number', '统计信息清理天数', 'performance', false),
('alert_retention_days', '180', 'number', '报警记录保留天数', 'performance', false),

-- V免签相关配置
('vmq_monitor_key', '', 'string', 'V免签监控密钥', 'vmq', false),
('vmq_callback_url', '', 'string', 'V免签回调URL（全局）', 'vmq', true),
('vmq_notification_format', 't={pay_time}&m={pay_amount}&o={order_no}', 'string', 'V免签通知格式', 'vmq', true),
('vmq_amount_match_tolerance', '0.01', 'number', '金额匹配容差（元）', 'vmq', true)
ON CONFLICT (key) DO NOTHING;

-- ========================================
-- 创建索引
-- ========================================

-- monitor_devices 表索引
CREATE INDEX IF NOT EXISTS idx_monitor_devices_device_id ON monitor_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_monitor_devices_admin_id ON monitor_devices(admin_id);
CREATE INDEX IF NOT EXISTS idx_monitor_devices_is_active ON monitor_devices(is_active);
CREATE INDEX IF NOT EXISTS idx_monitor_devices_last_online ON monitor_devices(last_online);

-- monitor_logs 表索引
CREATE INDEX IF NOT EXISTS idx_monitor_logs_device_id ON monitor_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_monitor_logs_order_id ON monitor_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_monitor_logs_log_type ON monitor_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_monitor_logs_created_at ON monitor_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_monitor_logs_device_created ON monitor_logs(device_id, created_at);

-- monitor_statistics 表索引
CREATE INDEX IF NOT EXISTS idx_monitor_statistics_date ON monitor_statistics(date);
CREATE INDEX IF NOT EXISTS idx_monitor_statistics_device_date ON monitor_statistics(device_id, date);
CREATE INDEX IF NOT EXISTS idx_monitor_statistics_date_hour ON monitor_statistics(date, hour);

-- monitor_settings 表索引
CREATE INDEX IF NOT EXISTS idx_monitor_settings_key ON monitor_settings(key);
CREATE INDEX IF NOT EXISTS idx_monitor_settings_category ON monitor_settings(category);
CREATE INDEX IF NOT EXISTS idx_monitor_settings_is_public ON monitor_settings(is_public);

-- monitor_qrcode_assignments 表索引
CREATE INDEX IF NOT EXISTS idx_monitor_qrcode_assignments_device ON monitor_qrcode_assignments(device_id);
CREATE INDEX IF NOT EXISTS idx_monitor_qrcode_assignments_qrcode ON monitor_qrcode_assignments(qrcode_id);
CREATE INDEX IF NOT EXISTS idx_monitor_qrcode_assignments_active ON monitor_qrcode_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_monitor_qrcode_assignments_priority ON monitor_qrcode_assignments(priority);

-- monitor_alerts 表索引
CREATE INDEX IF NOT EXISTS idx_monitor_alerts_device_id ON monitor_alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_monitor_alerts_alert_type ON monitor_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_monitor_alerts_alert_level ON monitor_alerts(alert_level);
CREATE INDEX IF NOT EXISTS idx_monitor_alerts_is_resolved ON monitor_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS idx_monitor_alerts_triggered_at ON monitor_alerts(triggered_at);

-- ========================================
-- 启用行级安全策略 (RLS)
-- ========================================

ALTER TABLE monitor_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_qrcode_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_alerts ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 创建RLS策略
-- ========================================

-- monitor_devices 策略
-- 管理员只能查看和管理自己的设备
CREATE POLICY "Admin can manage own devices" ON monitor_devices
    FOR ALL USING (admin_id = auth.uid());

-- 监控端设备可以查看自己的信息（通过设备认证）
CREATE POLICY "Device can view own info" ON monitor_devices
    FOR SELECT USING (device_id = current_setting('request.headers.device-id', true));

-- monitor_logs 策略
-- 管理员可以查看关联设备的日志
CREATE POLICY "Admin can view device logs" ON monitor_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM monitor_devices md 
            WHERE md.id = monitor_logs.device_id 
            AND md.admin_id = auth.uid()
        )
    );

-- 监控端可以查看和添加自己的日志
CREATE POLICY "Device can manage own logs" ON monitor_logs
    FOR ALL USING (
        device_id IN (
            SELECT id FROM monitor_devices 
            WHERE device_id = current_setting('request.headers.device-id', true)
        )
    );

-- monitor_settings 策略
-- 所有人可以查看公开配置
CREATE POLICY "Anyone can view public settings" ON monitor_settings
    FOR SELECT USING (is_public = true);

-- 仅管理员可以管理所有配置
CREATE POLICY "Admin can manage all settings" ON monitor_settings
    FOR ALL USING (auth.role() = 'authenticated' AND auth.uid() IN (SELECT id FROM admins));

-- 其他表的策略类似，根据业务需求设置...

-- ========================================
-- 创建函数和触发器
-- ========================================

-- 更新设备最后在线时间的函数
CREATE OR REPLACE FUNCTION update_device_last_online()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE monitor_devices 
    SET last_online = NOW(),
        updated_at = NOW(),
        connection_count = connection_count + 1
    WHERE device_id = NEW.device_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 设备心跳触发器
CREATE TRIGGER device_heartbeat_trigger
AFTER INSERT ON monitor_logs
FOR EACH ROW
WHEN (NEW.log_type = 'heartbeat')
EXECUTE FUNCTION update_device_last_online();

-- 自动清理旧日志的函数
CREATE OR REPLACE FUNCTION cleanup_old_monitor_logs()
RETURNS void AS $$
DECLARE
    retention_days INT;
BEGIN
    SELECT value::INT INTO retention_days 
    FROM monitor_settings 
    WHERE key = 'monitor_data_retention_days';
    
    IF retention_days IS NULL THEN
        retention_days := 30;
    END IF;
    
    DELETE FROM monitor_logs 
    WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;