import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 生成唯一订单号
function generateOrderNo(): string {
  return 'VMQ' + Date.now() + Math.floor(Math.random() * 1000).toString().padStart(3, '0')
}

// 生成随机金额（用于区分不同订单）
function generatePayAmount(baseAmount: number): number {
  // 在基础金额上添加0.01-0.99的随机小数，用于区分不同订单
  const randomCent = Math.floor(Math.random() * 99) + 1
  return parseFloat((baseAmount + randomCent / 100).toFixed(2))
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { goodsId, email, payType } = await req.json()

    if (!goodsId || !payType) {
      return new Response(
        JSON.stringify({ success: false, message: '参数不完整' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 获取V免签配置
    const { data: settingsData } = await supabaseClient
      .from('settings')
      .select('key, value')
      .in('key', ['vmq_enabled', 'vmq_key', 'vmq_return_url', 'vmq_wxpay_enabled', 'vmq_alipay_enabled'])

    const settings: Record<string, string> = {}
    settingsData?.forEach((item: any) => {
      settings[item.key] = item.value
    })

    if (settings.vmq_enabled !== 'true') {
      return new Response(
        JSON.stringify({ success: false, message: 'V免签支付未启用' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 检查支付方式是否启用
    if (payType === 'wxpay' && settings.vmq_wxpay_enabled !== 'true') {
      return new Response(
        JSON.stringify({ success: false, message: '微信支付未启用' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    if (payType === 'alipay' && settings.vmq_alipay_enabled !== 'true') {
      return new Response(
        JSON.stringify({ success: false, message: '支付宝支付未启用' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 获取商品信息
    const { data: goods, error: goodsError } = await supabaseClient
      .from('goods')
      .select('*')
      .eq('id', goodsId)
      .single()

    if (goodsError || !goods) {
      return new Response(
        JSON.stringify({ success: false, message: '商品不存在' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // 检查库存
    const { data: availableCards, error: cardsError } = await supabaseClient
      .from('cards')
      .select('id')
      .eq('goods_id', goodsId)
      .eq('used', false)

    if (cardsError || !availableCards || availableCards.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: '库存不足' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 生成支付金额（带随机小数）
    const payAmount = generatePayAmount(goods.price)
    const orderNo = generateOrderNo()

    // 创建订单
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert([{
        order_no: orderNo,
        goods_id: goodsId,
        goods_name: goods.name,
        email: email,
        price: goods.price,
        total_amount: payAmount,
        quantity: 1,
        status: 'pending',
        payment_method: payType === 'wxpay' ? 'vmq_wxpay' : 'vmq_alipay',
        pay_amount: payAmount,
        expire_time: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10分钟过期
      }])
      .select()
      .single()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ success: false, message: '创建订单失败' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // 获取收款码
    const { data: qrCode } = await supabaseClient
      .from('vmq_qrcodes')
      .select('*')
      .eq('pay_type', payType)
      .eq('is_active', true)
      .order('use_count', { ascending: true })
      .limit(1)
      .single()

    // 返回订单信息
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          orderId: order.id,
          orderNo: orderNo,
          payAmount: payAmount,
          goodsName: goods.name,
          payType: payType,
          expireTime: order.expire_time,
          qrCode: qrCode ? {
            id: qrCode.id,
            name: qrCode.name,
            imageUrl: qrCode.image_url,
            qr_content: qrCode.qr_content
          } : null
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('创建V免签订单失败:', error)
    return new Response(
      JSON.stringify({ success: false, message: '服务器错误' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
