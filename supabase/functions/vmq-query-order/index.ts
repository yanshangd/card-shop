import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    const { orderId } = await req.json()

    if (!orderId) {
      return new Response(
        JSON.stringify({ success: false, message: '订单ID不能为空' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 查询订单
    const { data: order, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    console.log('查询订单结果:', { orderId, order, error })

    if (error || !order) {
      return new Response(
        JSON.stringify({ success: false, message: '订单不存在' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // 检查订单是否过期
    const isExpired = new Date(order.expire_time) < new Date()

    // 如果订单已过期且状态为pending，更新状态
    if (isExpired && order.status === 'pending') {
      await supabaseClient
        .from('orders')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', orderId)

      order.status = 'expired'
    }

    // 如果订单已完成，获取卡密信息
    let cardInfo = null
    if (order.status === 'completed' && order.card_id) {
      const { data: card } = await supabaseClient
        .from('cards')
        .select('code, password')
        .eq('id', order.card_id)
        .single()

      if (card) {
        cardInfo = {
          code: card.code,
          password: card.password
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          orderId: order.id,
          orderNo: order.order_no,
          status: order.status,
          goodsName: order.goods_name,
          payAmount: order.pay_amount || order.total_amount,
          expireTime: order.expire_time,
          isExpired: isExpired && order.status === 'pending',
          cardInfo: cardInfo
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('查询订单失败:', error)
    return new Response(
      JSON.stringify({ success: false, message: '服务器错误' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
