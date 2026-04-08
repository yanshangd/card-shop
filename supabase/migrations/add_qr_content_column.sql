-- 为 vmq_qrcodes 表添加 qr_content 字段
-- 如果该字段不存在，则添加

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vmq_qrcodes' 
        AND column_name = 'qr_content'
    ) THEN
        -- 添加 qr_content 字段，允许为空（兼容旧数据）
        ALTER TABLE vmq_qrcodes ADD COLUMN qr_content TEXT;
        
        -- 修改 image_url 字段为可选
        ALTER TABLE vmq_qrcodes ALTER COLUMN image_url DROP NOT NULL;
    END IF;
END $$;

-- 添加注释
COMMENT ON COLUMN vmq_qrcodes.qr_content IS '解析后的二维码内容，支付时根据此内容动态生成二维码';
