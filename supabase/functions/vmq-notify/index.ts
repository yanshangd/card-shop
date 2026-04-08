import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      } 
    })
  }

  console.log('收到请求:', req.method)
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 获取V免签密钥
    const { data: settingsData } = await supabaseClient
      .from('settings')
      .select('key, value')
      .in('key', ['vmq_enabled', 'vmq_key'])

    const settings: Record<string, string> = {}
    settingsData?.forEach((item: any) => {
      settings[item.key] = item.value
    })

    if (settings.vmq_enabled !== 'true') {
      return new Response(
        JSON.stringify({ code: -1, msg: 'V免签未启用' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 解析通知参数
    const params = await req.json()
    const { t, m, o, r, test, s } = params

    // 验证密钥
    const secretKey = settings.vmq_key || ''
    if (secretKey && s !== secretKey) {
      console.log('密钥验证失败', { received: s, expected: secretKey })
      return new Response(
        JSON.stringify({ code: -1, msg: '密钥验证失败' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    console.log('密钥验证成功')

    // 测试回调（只验证密钥，不处理订单）
    if (test === '1') {
      return new Response(
        JSON.stringify({ 
          code: 1, 
          msg: 'test success',
          data: {
            message: '密钥验证成功，回调地址正常'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 验证参数
    if (!t || !m) {
      return new Response(
        JSON.stringify({ code: -1, msg: '参数不完整' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 验证签名（如果有）
    // V免签监控端发送的通知格式：t=支付时间&m=支付金额&o=订单号（可选）&r=随机字符串（可选）

    const payTime = t
    const payAmount = parseFloat(m)

    console.log('收到支付通知:', { payTime, payAmount, orderNo: o })

    // 查找匹配的订单（通过金额匹配，在有效期内）
    const { data: orders, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .eq('pay_amount', payAmount)
      .gt('expire_time', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (orderError || !orders || orders.length === 0) {
      console.log('未找到匹配的订单:', payAmount)
      return new Response(
        JSON.stringify({ code: -1, msg: '未找到匹配的订单' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const order = orders[0]

    // 检查订单是否已处理
    if (order.status === 'completed') {
      return new Response(
        JSON.stringify({ code: 1, msg: '订单已处理' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 获取可用卡密
    const { data: card, error: cardError } = await supabaseClient
      .from('cards')
      .select('*')
      .eq('goods_id', order.goods_id)
      .eq('used', false)
      .limit(1)
      .single()

    if (cardError || !card) {
      console.log('没有可用卡密:', order.goods_id)
      return new Response(
        JSON.stringify({ code: -1, msg: '没有可用卡密' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 标记卡密为已使用
    await supabaseClient
      .from('cards')
      .update({
        used: true,
        order_id: order.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', card.id)

    // 更新商品库存
    const { data: goods } = await supabaseClient
      .from('goods')
      .select('stock')
      .eq('id', order.goods_id)
      .single()

    if (goods) {
      await supabaseClient
        .from('goods')
        .update({ stock: Math.max(0, (goods.stock || 0) - 1) })
        .eq('id', order.goods_id)
    }

    // 更新订单状态
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({
        status: 'completed',
        card_id: card.id,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('更新订单状态失败:', updateError)
    } else {
      console.log('订单状态已更新为 completed:', order.id)
    }

    // 发送邮件通知
    const { data: allSettings } = await supabaseClient
      .from('settings')
      .select('key, value')

    const allSettingsMap: Record<string, string> = {}
    allSettings?.forEach((item: any) => {
      allSettingsMap[item.key] = item.value
    })

    if (allSettingsMap.auto_send_card_email === 'true' &&
        allSettingsMap.email_enabled === 'true' &&
        order.email) {
      let emailTemplate = allSettingsMap.email_template || ''
      let cardCode = card.code
      if (card.password) {
        cardCode = `${card.code} | ${card.password}`
      }
      emailTemplate = emailTemplate
        .replace(/{goods_name}/g, order.goods_name)
        .replace(/{order_no}/g, order.order_no)
        .replace(/{card_code}/g, cardCode)

      const emailSubject = allSettingsMap.email_subject || '您的卡密已发货'

      try {
        await supabaseClient.functions.invoke('send-email', {
          body: {
            to: order.email,
            subject: emailSubject,
            html: emailTemplate,
            smtpConfig: {
              host: allSettingsMap.email_smtp_host,
              port: allSettingsMap.email_smtp_port,
              user: allSettingsMap.email_username,
              pass: allSettingsMap.email_password,
              from: allSettingsMap.email_send_from || allSettingsMap.email_username
            }
          }
        })
      } catch (emailError) {
        console.error('邮件发送失败:', emailError)
      }
    }

    console.log('订单支付成功:', order.order_no)

    return new Response(
      JSON.stringify({ 
        code: 1, 
        msg: 'success',
        data: {
          orderNo: order.order_no,
          goodsName: order.goods_name,
          payAmount: payAmount,
          cardCode: card.code,
          cardPassword: card.password
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('处理支付通知失败:', error)
    return new Response(
      JSON.stringify({ code: -1, msg: '服务器错误' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
