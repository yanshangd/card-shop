import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

function md5(string: string): string {
  function rotateLeft(x: number, n: number): number {
    return (x << n) | (x >>> (32 - n))
  }

  function addUnsigned(x: number, y: number): number {
    const lsw = (x & 0xFFFF) + (y & 0xFFFF)
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xFFFF)
  }

  function F(x: number, y: number, z: number): number { return (x & y) | ((~x) & z) }
  function G(x: number, y: number, z: number): number { return (x & z) | (y & (~z)) }
  function H(x: number, y: number, z: number): number { return x ^ y ^ z }
  function I(x: number, y: number, z: number): number { return y ^ (x | (~z)) }

  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function convertToWordArray(string: string): number[] {
    const wordArray: number[] = []
    for (let i = 0; i < string.length * 8; i += 8) {
      wordArray[i >> 5] |= (string.charCodeAt(i / 8) & 0xFF) << (i % 32)
    }
    return wordArray
  }

  function utf8Encode(string: string): string {
    string = string.replace(/\r\n/g, '\n')
    let output = ''
    for (let n = 0; n < string.length; n++) {
      const c = string.charCodeAt(n)
      if (c < 128) {
        output += String.fromCharCode(c)
      } else if ((c > 127) && (c < 2048)) {
        output += String.fromCharCode((c >> 6) | 192)
        output += String.fromCharCode((c & 63) | 128)
      } else {
        output += String.fromCharCode((c >> 12) | 224)
        output += String.fromCharCode(((c >> 6) & 63) | 128)
        output += String.fromCharCode((c & 63) | 128)
      }
    }
    return output
  }

  function wordToHex(value: number): string {
    const hexTab = '0123456789abcdef'
    let str = ''
    for (let i = 0; i <= 3; i++) {
      str += hexTab.charAt((value >> (i * 8 + 4)) & 0x0F) + hexTab.charAt((value >> (i * 8)) & 0x0F)
    }
    return str
  }

  function rawMD5(string: string): string {
    const x = convertToWordArray(string)
    const len = string.length * 8
    x[len >> 5] |= 0x80 << (len % 32)
    x[(((len + 64) >>> 9) << 4) + 14] = len

    let a = 1732584193
    let b = -271733879
    let c = -1732584194
    let d = 271733878

    for (let i = 0; i < x.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d
      a = FF(a, b, c, d, x[i + 0], 7, -680876936)
      d = FF(d, a, b, c, x[i + 1], 12, -389564586)
      c = FF(c, d, a, b, x[i + 2], 17, 606105819)
      b = FF(b, c, d, a, x[i + 3], 22, -1044525330)
      a = FF(a, b, c, d, x[i + 4], 7, -176418897)
      d = FF(d, a, b, c, x[i + 5], 12, 1200080426)
      c = FF(c, d, a, b, x[i + 6], 17, -1473231341)
      b = FF(b, c, d, a, x[i + 7], 22, -45705983)
      a = FF(a, b, c, d, x[i + 8], 7, 1770035416)
      d = FF(d, a, b, c, x[i + 9], 12, -1958414417)
      c = FF(c, d, a, b, x[i + 10], 17, -42063)
      b = FF(b, c, d, a, x[i + 11], 22, -1990404162)
      a = FF(a, b, c, d, x[i + 12], 7, 1804603682)
      d = FF(d, a, b, c, x[i + 13], 12, -40341101)
      c = FF(c, d, a, b, x[i + 14], 17, -1502002290)
      b = FF(b, c, d, a, x[i + 15], 22, 1236535329)
      a = GG(a, b, c, d, x[i + 1], 5, -165796510)
      d = GG(d, a, b, c, x[i + 6], 9, -1069501632)
      c = GG(c, d, a, b, x[i + 11], 14, 643717713)
      b = GG(b, c, d, a, x[i + 0], 20, -373897302)
      a = GG(a, b, c, d, x[i + 5], 5, -701558691)
      d = GG(d, a, b, c, x[i + 10], 9, 38016083)
      c = GG(c, d, a, b, x[i + 15], 14, -660478335)
      b = GG(b, c, d, a, x[i + 4], 20, -405537848)
      a = GG(a, b, c, d, x[i + 9], 5, 568446438)
      d = GG(d, a, b, c, x[i + 14], 9, -1019803690)
      c = GG(c, d, a, b, x[i + 3], 14, -187363961)
      b = GG(b, c, d, a, x[i + 8], 20, 1163531501)
      a = GG(a, b, c, d, x[i + 13], 5, -1444681467)
      d = GG(d, a, b, c, x[i + 2], 9, -51403784)
      c = GG(c, d, a, b, x[i + 7], 14, 1735328473)
      b = GG(b, c, d, a, x[i + 12], 20, -1926607734)
      a = HH(a, b, c, d, x[i + 5], 4, -378558)
      d = HH(d, a, b, c, x[i + 8], 11, -2022574463)
      c = HH(c, d, a, b, x[i + 11], 16, 1839030562)
      b = HH(b, c, d, a, x[i + 14], 23, -35309556)
      a = HH(a, b, c, d, x[i + 1], 4, -1530992060)
      d = HH(d, a, b, c, x[i + 4], 11, 1272893353)
      c = HH(c, d, a, b, x[i + 7], 16, -155497632)
      b = HH(b, c, d, a, x[i + 10], 23, -1094730640)
      a = HH(a, b, c, d, x[i + 13], 4, 681279174)
      d = HH(d, a, b, c, x[i + 0], 11, -358537222)
      c = HH(c, d, a, b, x[i + 3], 16, -722521979)
      b = HH(b, c, d, a, x[i + 6], 23, 76029189)
      a = HH(a, b, c, d, x[i + 9], 4, -640364487)
      d = HH(d, a, b, c, x[i + 12], 11, -421815835)
      c = HH(c, d, a, b, x[i + 15], 16, 530742520)
      b = HH(b, c, d, a, x[i + 2], 23, -995338651)
      a = II(a, b, c, d, x[i + 0], 6, -198630844)
      d = II(d, a, b, c, x[i + 7], 10, 1126891415)
      c = II(c, d, a, b, x[i + 14], 15, -1416354905)
      b = II(b, c, d, a, x[i + 5], 21, -57434055)
      a = II(a, b, c, d, x[i + 12], 6, 1700485571)
      d = II(d, a, b, c, x[i + 3], 10, -1894986606)
      c = II(c, d, a, b, x[i + 10], 15, -1051523)
      b = II(b, c, d, a, x[i + 1], 21, -2054922799)
      a = II(a, b, c, d, x[i + 8], 6, 1873313359)
      d = II(d, a, b, c, x[i + 15], 10, -30611744)
      c = II(c, d, a, b, x[i + 6], 15, -1560198380)
      b = II(b, c, d, a, x[i + 13], 21, 1309151649)
      a = II(a, b, c, d, x[i + 4], 6, -145523070)
      d = II(d, a, b, c, x[i + 11], 10, -1120210379)
      c = II(c, d, a, b, x[i + 2], 15, 718787259)
      b = II(b, c, d, a, x[i + 9], 21, -343485551)
      a = addUnsigned(a, olda)
      b = addUnsigned(b, oldb)
      c = addUnsigned(c, oldc)
      d = addUnsigned(d, oldd)
    }
    return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)
  }

  return rawMD5(utf8Encode(string))
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const url = new URL(req.url)
    const params = new URLSearchParams(url.search)

    const paramMap: Record<string, string> = {}
    params.forEach((value, key) => {
      paramMap[key] = value
    })

    console.log('收到回调参数:', paramMap)

    const { data: settingsData } = await supabaseClient
      .from('settings')
      .select('key, value')
      .in('key', ['epay_app_secret', 'epay_enabled'])

    const settings: Record<string, string> = {}
    settingsData?.forEach((item: any) => {
      settings[item.key] = item.value
    })

    if (settings.epay_enabled !== 'true') {
      console.log('易支付未启用')
      return new Response('fail', { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    const payId = paramMap['payId']
    const param = paramMap['param'] || ''
    const type = paramMap['type']
    const price = paramMap['price']
    const reallyPrice = paramMap['reallyPrice']
    const sign = paramMap['sign']

    if (!payId || !sign) {
      console.log('参数不完整:', { payId, sign })
      return new Response('fail', { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    const { data: order } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('order_no', payId)
      .single()

    if (!order) {
      console.log('订单不存在:', payId)
      return new Response('fail', { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    if (order.status === 'completed') {
      console.log('订单已处理:', payId)
      return new Response('success', { 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    const signStr = payId + param + type + price + reallyPrice + settings.epay_app_secret
    const calculatedSign = md5(signStr)

    console.log('签名验证:', { signStr, receivedSign: sign, calculatedSign })

    if (calculatedSign !== sign) {
      console.log('签名验证失败')
      return new Response('fail', { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    const { data: card } = await supabaseClient
      .from('cards')
      .select('*')
      .eq('goods_id', order.goods_id)
      .eq('used', false)
      .limit(1)
      .single()

    if (!card) {
      console.log('没有可用卡密')
      return new Response('fail', { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }

    await supabaseClient
      .from('cards')
      .update({
        used: true,
        order_id: order.id
      })
      .eq('id', card.id)

    const { data: goods } = await supabaseClient
      .from('goods')
      .select('*')
      .eq('id', order.goods_id)
      .single()

    if (goods) {
      await supabaseClient
        .from('goods')
        .update({ stock: Math.max(0, (goods.stock || 0) - 1) })
        .eq('id', goods.id)
    }

    await supabaseClient
      .from('orders')
      .update({
        status: 'completed',
        card_id: card.id,
        payment_method: 'epay'
      })
      .eq('id', order.id)

    const { data: allSettings } = await supabaseClient
      .from('settings')
      .select('key, value')

    const allSettingsMap: Record<string, string> = {}
    allSettings?.forEach((item: any) => {
      allSettingsMap[item.key] = item.value
    })

    if (allSettingsMap.auto_send_card_email === 'true' && allSettingsMap.email_enabled === 'true' && order.email) {
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
        const emailRes = await supabaseClient.functions.invoke('send-email', {
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

    console.log('回调处理成功:', payId)
    return new Response('success', { 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    })
  } catch (error) {
    console.error('易支付回调处理失败:', error)
    return new Response('fail', { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    })
  }
})
