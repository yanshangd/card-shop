-- V免签支付系统数据库表结构
-- 请在Supabase SQL编辑器中执行

-- 1. 创建V免签收款码表
CREATE TABLE IF NOT EXISTS vmq_qrcodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    pay_type VARCHAR(50) NOT NULL CHECK (pay_type IN ('wxpay', 'alipay')),
    image_url TEXT,
    qr_content TEXT NOT NULL,  -- 解析后的二维码内容，支付时根据此内容生成二维码
    is_active BOOLEAN DEFAULT true,
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 为orders表添加V免签相关字段（如果还不存在）
DO $$
BEGIN
    -- 添加支付金额字段（用于存储带随机小数的实际支付金额）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'pay_amount') THEN
        ALTER TABLE orders ADD COLUMN pay_amount DECIMAL(10, 2);
    END IF;

    -- 添加过期时间字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'expire_time') THEN
        ALTER TABLE orders ADD COLUMN expire_time TIMESTAMP WITH TIME ZONE;
    END IF;

    -- 添加支付时间字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'paid_at') THEN
        ALTER TABLE orders ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_vmq_qrcodes_pay_type ON vmq_qrcodes(pay_type);
CREATE INDEX IF NOT EXISTS idx_vmq_qrcodes_is_active ON vmq_qrcodes(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_pay_amount ON orders(pay_amount) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_orders_expire_time ON orders(expire_time);

-- 4. 设置RLS策略
ALTER TABLE vmq_qrcodes ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户读取启用的收款码
CREATE POLICY "Allow anonymous read active qrcodes" ON vmq_qrcodes
    FOR SELECT USING (is_active = true);

-- 允许认证用户完全访问（管理员）
CREATE POLICY "Allow authenticated full access" ON vmq_qrcodes
    FOR ALL USING (auth.role() = 'authenticated');

-- 5. 添加V免签设置项到settings表
INSERT INTO settings (key, value, type, description) VALUES
    ('vmq_enabled', 'false', 'boolean', '是否启用V免签支付'),
    ('vmq_wxpay_enabled', 'false', 'boolean', '是否启用V免签微信支付'),
    ('vmq_alipay_enabled', 'false', 'boolean', '是否启用V免签支付宝支付'),
    ('vmq_key', '', 'string', 'V免签通信密钥')
ON CONFLICT (key) DO NOTHING;

-- 6. 创建触发器函数，自动更新updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为vmq_qrcodes表创建触发器
DROP TRIGGER IF EXISTS update_vmq_qrcodes_updated_at ON vmq_qrcodes;
CREATE TRIGGER update_vmq_qrcodes_updated_at
    BEFORE UPDATE ON vmq_qrcodes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
