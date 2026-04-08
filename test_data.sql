-- ========================================
-- 卡片商店测试数据
-- Supabase SQL Editor 执行
-- ========================================

-- 插入测试商品数据
-- 先获取分类ID
WITH cats AS (
    SELECT id, name FROM categories ORDER BY sort_order LIMIT 4
)
INSERT INTO goods (name, description, price, category_id, stock, status) VALUES
-- 游戏点卡分类
('王者荣耀 60点券', '王者荣耀60点券充值卡密', 6.00, (SELECT id FROM cats WHERE name = '游戏点卡'), 50, 'active'),
('王者荣耀 300点券', '王者荣耀300点券充值卡密', 28.50, (SELECT id FROM cats WHERE name = '游戏点卡'), 30, 'active'),
('和平精英 60点券', '和平精英60点券充值卡密', 6.00, (SELECT id FROM cats WHERE name = '游戏点卡'), 45, 'active'),
('原神 60创世结晶', '原神60创世结晶充值卡密', 6.00, (SELECT id FROM cats WHERE name = '游戏点卡'), 60, 'active'),
-- 会员充值分类
('腾讯视频VIP月卡', '腾讯视频VIP会员1个月', 19.90, (SELECT id FROM cats WHERE name = '会员充值'), 20, 'active'),
('爱奇艺VIP季卡', '爱奇艺VIP会员3个月', 49.90, (SELECT id FROM cats WHERE name = '会员充值'), 15, 'active'),
('网易云音乐月卡', '网易云音乐黑胶VIP会员1个月', 15.00, (SELECT id FROM cats WHERE name = '会员充值'), 35, 'active'),
('芒果TV月卡', '芒果TV会员1个月', 12.90, (SELECT id FROM cats WHERE name = '会员充值'), 25, 'active'),
-- 软件激活分类
('Office 2021 激活码', 'Microsoft Office 2021 专业版激活码', 99.00, (SELECT id FROM cats WHERE name = '软件激活'), 10, 'active'),
('Windows 11 激活码', 'Windows 11 专业版激活码', 199.00, (SELECT id FROM cats WHERE name = '软件激活'), 8, 'active'),
('Adobe Photoshop CC激活码', 'Adobe Photoshop CC 激活码', 299.00, (SELECT id FROM cats WHERE name = '软件激活'), 5, 'active');

-- 插入测试卡密数据
-- 为每个商品生成对应的卡密
WITH game_goods AS (
    SELECT id FROM goods WHERE name LIKE '王者荣耀%' OR name LIKE '和平精英%' OR name LIKE '原神%'
),
vip_goods AS (
    SELECT id FROM goods WHERE name LIKE '%VIP%' OR name LIKE '%会员%'
),
software_goods AS (
    SELECT id FROM goods WHERE name LIKE 'Office%' OR name LIKE 'Windows%' OR name LIKE 'Adobe%'
)
INSERT INTO cards (goods_id, code, password, used) VALUES
-- 王者荣耀 60点券卡密
((SELECT id FROM goods WHERE name = '王者荣耀 60点券'), 'WZRY-60-2025-A1B2C3', NULL, FALSE),
((SELECT id FROM goods WHERE name = '王者荣耀 60点券'), 'WZRY-60-2025-D4E5F6', NULL, FALSE),
((SELECT id FROM goods WHERE name = '王者荣耀 60点券'), 'WZRY-60-2025-G7H8I9', NULL, FALSE),
((SELECT id FROM goods WHERE name = '王者荣耀 60点券'), 'WZRY-60-2025-J0K1L2', NULL, FALSE),
((SELECT id FROM goods WHERE name = '王者荣耀 60点券'), 'WZRY-60-2025-M3N4O5', NULL, FALSE),
-- 王者荣耀 300点券卡密
((SELECT id FROM goods WHERE name = '王者荣耀 300点券'), 'WZRY-300-2025-P6Q7R8', NULL, FALSE),
((SELECT id FROM goods WHERE name = '王者荣耀 300点券'), 'WZRY-300-2025-S9T0U1', NULL, FALSE),
((SELECT id FROM goods WHERE name = '王者荣耀 300点券'), 'WZRY-300-2025-V2W3X4', NULL, FALSE),
-- 和平精英 60点券卡密
((SELECT id FROM goods WHERE name = '和平精英 60点券'), 'HPJY-60-2025-Y5Z6A7', NULL, FALSE),
((SELECT id FROM goods WHERE name = '和平精英 60点券'), 'HPJY-60-2025-B8C9D0', NULL, FALSE),
((SELECT id FROM goods WHERE name = '和平精英 60点券'), 'HPJY-60-2025-E1F2G3', NULL, FALSE),
-- 原神 60创世结晶卡密
((SELECT id FROM goods WHERE name = '原神 60创世结晶'), 'YS-60-2025-H4I5J6', NULL, FALSE),
((SELECT id FROM goods WHERE name = '原神 60创世结晶'), 'YS-60-2025-K7L8M9', NULL, FALSE),
((SELECT id FROM goods WHERE name = '原神 60创世结晶'), 'YS-60-2025-N0O1P2', NULL, FALSE),
-- 腾讯视频VIP月卡
((SELECT id FROM goods WHERE name = '腾讯视频VIP月卡'), 'TXSP-VIP-2025-Q3R4S5', 'txsp2025', FALSE),
((SELECT id FROM goods WHERE name = '腾讯视频VIP月卡'), 'TXSP-VIP-2025-T6U7V8', 'txsp2025', FALSE),
((SELECT id FROM goods WHERE name = '腾讯视频VIP月卡'), 'TXSP-VIP-2025-W9X0Y1', 'txsp2025', FALSE),
-- 爱奇艺VIP季卡
((SELECT id FROM goods WHERE name = '爱奇艺VIP季卡'), 'AQY-VIP-2025-Z2A3B4', 'aqy2025', FALSE),
((SELECT id FROM goods WHERE name = '爱奇艺VIP季卡'), 'AQY-VIP-2025-C5D6E7', 'aqy2025', FALSE),
-- 网易云音乐月卡
((SELECT id FROM goods WHERE name = '网易云音乐月卡'), 'WY-YY-2025-F8G9H0', 'wyy2025', FALSE),
((SELECT id FROM goods WHERE name = '网易云音乐月卡'), 'WY-YY-2025-I1J2K3', 'wyy2025', FALSE),
((SELECT id FROM goods WHERE name = '网易云音乐月卡'), 'WY-YY-2025-L4M5N6', 'wyy2025', FALSE),
-- 芒果TV月卡
((SELECT id FROM goods WHERE name = '芒果TV月卡'), 'MGTV-VIP-2025-O7P8Q9', 'mgtv2025', FALSE),
((SELECT id FROM goods WHERE name = '芒果TV月卡'), 'MGTV-VIP-2025-R0S1T2', 'mgtv2025', FALSE),
-- Office 2021激活码
((SELECT id FROM goods WHERE name = 'Office 2021 激活码'), 'OFF2025-XXXX-YYYY-ZZZZ', 'office2025', FALSE),
((SELECT id FROM goods WHERE name = 'Office 2021 激活码'), 'OFF2025-AAAA-BBBB-CCCC', 'office2025', FALSE),
-- Windows 11激活码
((SELECT id FROM goods WHERE name = 'Windows 11 激活码'), 'WIN11-2025-XXXX-YYYY', 'win112025', FALSE),
-- Adobe Photoshop CC激活码
((SELECT id FROM goods WHERE name = 'Adobe Photoshop CC激活码'), 'PSCC-2025-XXXX-YYYY-ZZZZ', 'pscc2025', FALSE);

-- 更新商品库存（根据卡密数量）
UPDATE goods 
SET stock = (SELECT COUNT(*) FROM cards WHERE cards.goods_id = goods.id AND used = FALSE)
WHERE EXISTS (SELECT 1 FROM cards WHERE cards.goods_id = goods.id);

-- ========================================
-- 插入订单测试数据
-- ========================================

-- 标记部分卡密为已使用（用于测试已完成订单）
UPDATE cards SET used = TRUE WHERE code IN (
    'WZRY-60-2025-A1B2C3',
    'TXSP-VIP-2025-Q3R4S5',
    'AQY-VIP-2025-Z2A3B4',
    'OFF2025-XXXX-YYYY-ZZZZ',
    'WY-YY-2025-F8G9H0'
);

-- 插入订单数据
WITH used_cards AS (
    SELECT c.id, c.goods_id, c.code, g.name AS goods_name, g.price
    FROM cards c
    JOIN goods g ON c.goods_id = g.id
    WHERE c.used = TRUE
)
INSERT INTO orders (order_no, email, goods_id, goods_name, price, quantity, total_amount, status, payment_method, card_id) VALUES
-- 已完成订单（已支付并发卡）
('ORD20250404001', 'test1@example.com', (SELECT goods_id FROM used_cards WHERE code = 'WZRY-60-2025-A1B2C3'), (SELECT goods_name FROM used_cards WHERE code = 'WZRY-60-2025-A1B2C3'), (SELECT price FROM used_cards WHERE code = 'WZRY-60-2025-A1B2C3'), 1, (SELECT price FROM used_cards WHERE code = 'WZRY-60-2025-A1B2C3'), 'completed', 'alipay', (SELECT id FROM used_cards WHERE code = 'WZRY-60-2025-A1B2C3')),
('ORD20250404002', 'test2@example.com', (SELECT goods_id FROM used_cards WHERE code = 'TXSP-VIP-2025-Q3R4S5'), (SELECT goods_name FROM used_cards WHERE code = 'TXSP-VIP-2025-Q3R4S5'), (SELECT price FROM used_cards WHERE code = 'TXSP-VIP-2025-Q3R4S5'), 1, (SELECT price FROM used_cards WHERE code = 'TXSP-VIP-2025-Q3R4S5'), 'completed', 'wechat', (SELECT id FROM used_cards WHERE code = 'TXSP-VIP-2025-Q3R4S5')),
('ORD20250404003', 'test3@example.com', (SELECT goods_id FROM used_cards WHERE code = 'AQY-VIP-2025-Z2A3B4'), (SELECT goods_name FROM used_cards WHERE code = 'AQY-VIP-2025-Z2A3B4'), (SELECT price FROM used_cards WHERE code = 'AQY-VIP-2025-Z2A3B4'), 1, (SELECT price FROM used_cards WHERE code = 'AQY-VIP-2025-Z2A3B4'), 'completed', 'alipay', (SELECT id FROM used_cards WHERE code = 'AQY-VIP-2025-Z2A3B4')),
('ORD20250404004', 'test4@example.com', (SELECT goods_id FROM used_cards WHERE code = 'OFF2025-XXXX-YYYY-ZZZZ'), (SELECT goods_name FROM used_cards WHERE code = 'OFF2025-XXXX-YYYY-ZZZZ'), (SELECT price FROM used_cards WHERE code = 'OFF2025-XXXX-YYYY-ZZZZ'), 1, (SELECT price FROM used_cards WHERE code = 'OFF2025-XXXX-YYYY-ZZZZ'), 'completed', 'wechat', (SELECT id FROM used_cards WHERE code = 'OFF2025-XXXX-YYYY-ZZZZ')),
('ORD20250404005', 'test5@example.com', (SELECT goods_id FROM used_cards WHERE code = 'WY-YY-2025-F8G9H0'), (SELECT goods_name FROM used_cards WHERE code = 'WY-YY-2025-F8G9H0'), (SELECT price FROM used_cards WHERE code = 'WY-YY-2025-F8G9H0'), 1, (SELECT price FROM used_cards WHERE code = 'WY-YY-2025-F8G9H0'), 'completed', 'alipay', (SELECT id FROM used_cards WHERE code = 'WY-YY-2025-F8G9H0')),
-- 待支付订单
('ORD20250404006', 'test6@example.com', (SELECT id FROM goods WHERE name = '王者荣耀 300点券'), '王者荣耀 300点券', 28.50, 1, 28.50, 'pending', NULL, NULL),
('ORD20250404007', 'test7@example.com', (SELECT id FROM goods WHERE name = '芒果TV月卡'), '芒果TV月卡', 12.90, 1, 12.90, 'pending', NULL, NULL),
-- 已取消订单
('ORD20250404008', 'test8@example.com', (SELECT id FROM goods WHERE name = '和平精英 60点券'), '和平精英 60点券', 6.00, 1, 6.00, 'cancelled', 'wechat', NULL),
-- 处理中订单
('ORD20250404009', 'test9@example.com', (SELECT id FROM goods WHERE name = '原神 60创世结晶'), '原神 60创世结晶', 6.00, 1, 6.00, 'paid', 'alipay', NULL),
('ORD20250404010', 'test10@example.com', (SELECT id FROM goods WHERE name = 'Windows 11 激活码'), 'Windows 11 激活码', 199.00, 1, 199.00, 'paid', 'wechat', NULL);

-- 再次更新商品库存（扣除已使用的卡密）
UPDATE goods 
SET stock = (SELECT COUNT(*) FROM cards WHERE cards.goods_id = goods.id AND used = FALSE)
WHERE EXISTS (SELECT 1 FROM cards WHERE cards.goods_id = goods.id);

-- 查看数据插入结果
SELECT '测试数据插入完成！' AS message;

-- 商品统计
SELECT g.name, COUNT(c.id) AS card_count, g.price, g.stock
FROM goods g
LEFT JOIN cards c ON g.id = c.goods_id
GROUP BY g.id, g.name, g.price, g.stock
ORDER BY g.name;

-- 订单统计
SELECT 
    status AS 订单状态,
    COUNT(*) AS 订单数量,
    SUM(total_amount) AS 总金额
FROM orders
GROUP BY status
ORDER BY status;

-- 订单详情
SELECT 
    order_no AS 订单号,
    goods_name AS 商品名称,
    price AS 单价,
    total_amount AS 总额,
    status AS 状态,
    payment_method AS 支付方式,
    email AS 邮箱,
    created_at AS 创建时间
FROM orders
ORDER BY created_at DESC;
