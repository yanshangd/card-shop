
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ordersApi, cardsApi, goodsApi, settingsApi } from '@/api/supabaseApi'
import { supabase } from '@/api/supabase'
import { vmqApi } from '@/api/vmqApi'
import { ElMessage } from 'element-plus'

const md5 = (string) => {
  function rotateLeft(x, n) {
    return (x << n) | (x >>> (32 - n))
  }

  function addUnsigned(x, y) {
    let lsw = (x & 0xFFFF) + (y & 0xFFFF)
    let msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xFFFF)
  }

  function F(x, y, z) { return (x & y) | ((~x) & z) }
  function G(x, y, z) { return (x & z) | (y & (~z)) }
  function H(x, y, z) { return x ^ y ^ z }
  function I(x, y, z) { return y ^ (x | (~z)) }

  function FF(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function GG(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function HH(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function II(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function convertToWordArray(string) {
    let wordArray = []
    for (let i = 0; i < string.length * 8; i += 8) {
      wordArray[i >> 5] |= (string.charCodeAt(i / 8) & 0xFF) << (i % 32)
    }
    return wordArray
  }

  function utf8Encode(string) {
    string = string.replace(/\r\n/g, '\n')
    let output = ''
    for (let n = 0; n < string.length; n++) {
      let c = string.charCodeAt(n)
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

  function wordToHex(value) {
    let hexTab = '0123456789abcdef'
    let str = ''
    for (let i = 0; i <= 3; i++) {
      str += hexTab.charAt((value >> (i * 8 + 4)) & 0x0F) + hexTab.charAt((value >> (i * 8)) & 0x0F)
    }
    return str
  }

  function rawMD5(string) {
    let x = convertToWordArray(string)
    let len = string.length * 8
    x[len >> 5] |= 0x80 << (len % 32)
    x[(((len + 64) >>> 9) << 4) + 14] = len

    let a = 1732584193
    let b = -271733879
    let c = -1732584194
    let d = 271733878

    for (let i = 0; i < x.length; i += 16) {
      let olda = a, oldb = b, oldc = c, oldd = d
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

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const loading = ref(false)
  const epaySettings = ref({
    enabled: false,
    appId: '',
    appSecret: '',
    gateway: ''
  })
  const vmqSettings = ref({
    enabled: false,
    wxpayEnabled: false,
    alipayEnabled: false,
    key: ''
  })

  const fetchOrders = async (email = null) => {
    loading.value = true
    try {
      const filter = email ? { email } : {}
      const res = await ordersApi.getOrders(filter)
      if (res.success) {
        orders.value = res.data
      }
    } catch (error) {
      console.error('获取订单列表失败:', error)
      orders.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchEpaySettings = async () => {
    try {
      const res = await settingsApi.getSettings()
      if (res.success) {
        epaySettings.value = {
          enabled: res.data.epay_enabled || false,
          appId: res.data.epay_app_id || '',
          appSecret: res.data.epay_app_secret || '',
          gateway: res.data.epay_gateway || ''
        }
        vmqSettings.value = {
          enabled: res.data.vmq_enabled || false,
          wxpayEnabled: res.data.vmq_wxpay_enabled || false,
          alipayEnabled: res.data.vmq_alipay_enabled || false,
          key: res.data.vmq_key || ''
        }
      }
    } catch (error) {
      console.error('获取支付设置失败:', error)
    }
  }

  const fetchVmqSettings = async () => {
    try {
      const res = await settingsApi.getSettings()
      if (res.success) {
        vmqSettings.value = {
          enabled: res.data.vmq_enabled || false,
          wxpayEnabled: res.data.vmq_wxpay_enabled || false,
          alipayEnabled: res.data.vmq_alipay_enabled || false,
          key: res.data.vmq_key || ''
        }
      }
    } catch (error) {
      console.error('获取V免签设置失败:', error)
    }
  }

  const generateOrderNo = () => {
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return 'ORD' + timestamp + random
  }

  const createOrder = async (goodsId, email, paymentMethod = 'manual') => {
    try {
      const goodsRes = await goodsApi.getGoodsById(goodsId)

      if (!goodsRes.success) {
        ElMessage.error('获取商品信息失败')
        return null
      }

      const goods = goodsRes.data

      // 检查可用卡密数量（库存）
      const availableCardsRes = await cardsApi.getCards({ goodsId: goodsId, used: false })
      const availableCount = availableCardsRes.success ? availableCardsRes.data.length : 0

      if (availableCount <= 0) {
        ElMessage.error('库存不足')
        return null
      }

      // 判断是否使用易支付
      const useEpay = (paymentMethod === 'wxpay' || paymentMethod === 'alipay') && epaySettings.value.enabled

      // 判断是否使用V免签
      const useVmq = (paymentMethod === 'vmq_wxpay' || paymentMethod === 'vmq_alipay') && vmqSettings.value.enabled

      // 如果使用V免签
      if (useVmq) {
        const payType = paymentMethod === 'vmq_wxpay' ? 'wxpay' : 'alipay'
        
        // 获取当前待支付订单的金额列表
        const { data: pendingOrders } = await supabase
          .from('orders')
          .select('pay_amount')
          .eq('status', 'pending')
          .gte('expire_time', new Date().toISOString())
        
        const pendingAmounts = new Set(
          (pendingOrders || []).map(o => o.pay_amount)
        )
        
        // 从商品金额开始，找到不冲突的金额
        let payAmount = parseFloat(goods.price.toFixed(2))
        while (pendingAmounts.has(payAmount)) {
          payAmount = parseFloat((payAmount + 0.01).toFixed(2))
        }
        
        const orderNo = generateOrderNo()
        
        // 创建订单
        const orderData = {
          order_no: orderNo,
          goods_id: goodsId,
          goods_name: goods.name,
          email,
          price: goods.price,
          total_amount: payAmount,
          quantity: 1,
          status: 'pending',
          payment_method: paymentMethod,
          pay_amount: payAmount,
          expire_time: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        }
        
        const orderRes = await ordersApi.createOrder(orderData)
        if (!orderRes.success) {
          ElMessage.error('创建订单失败')
          return null
        }
        
        const order = orderRes.data
        
        // 获取收款码
        const { data: qrCodes } = await supabase
          .from('vmq_qrcodes')
          .select('*')
          .eq('pay_type', payType)
          .eq('is_active', true)
          .order('use_count', { ascending: true })
          .limit(1)
        
        const qrCode = qrCodes && qrCodes.length > 0 ? qrCodes[0] : null
        
        return {
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
          } : null,
          needRedirect: false,
          isVmq: true
        }
      }

      const orderNo = generateOrderNo()
      const orderData = {
        order_no: orderNo,
        goods_id: goodsId,
        goods_name: goods.name,
        email,
        price: goods.price,
        total_amount: goods.price,
        quantity: 1,
        status: 'pending'
      }

      const orderRes = await ordersApi.createOrder(orderData)

      if (!orderRes.success) {
        ElMessage.error('创建订单失败')
        return null
      }

      const order = orderRes.data

      if (useEpay) {
        await redirectToEpay(order, goods, paymentMethod)
        return { ...order, needRedirect: true }
      } else {
        const cardRes = await cardsApi.getAvailableCard(goodsId)
        if (!cardRes.success || !cardRes.data) {
          ElMessage.error('库存不足')
          return null
        }

        await cardsApi.updateCard(cardRes.data.id, {
          used: true,
          order_id: order.id
        })

        await ordersApi.updateOrder(order.id, {
          status: 'completed',
          card_id: cardRes.data.id
        })

        ElMessage.success('购买成功！卡密已自动发送！')
        return { ...order, needRedirect: false }
      }
    } catch (error) {
      console.error('创建订单失败:', error)
      ElMessage.error('购买失败，请重试')
      return null
    }
  }

  // 查询V免签订单状态
  const queryVmqOrder = async (orderId) => {
    try {
      const result = await vmqApi.queryOrder(orderId)
      return result
    } catch (error) {
      console.error('查询V免签订单失败:', error)
      return { success: false, message: error.message }
    }
  }

  const redirectToEpay = async (order, goods, paymentMethod) => {
    try {
      console.log('跳转到易支付，设置:', epaySettings.value)
      
      if (!epaySettings.value.enabled) {
        ElMessage.error('易支付未启用')
        return
      }
      
      if (!epaySettings.value.gateway || !epaySettings.value.appId || !epaySettings.value.appSecret) {
        ElMessage.error('易支付配置不完整')
        return
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://umvcqkigklidfaomvnwd.supabase.co'
      
      const payId = order.order_no
      // type: 1=微信支付, 2=支付宝支付
      const type = paymentMethod === 'wxpay' ? 1 : 2
      const price = goods.price.toFixed(2)
      const param = ''
      
      const signStr = payId + param + type + price + epaySettings.value.appSecret
      const sign = md5(signStr)

      const params = new URLSearchParams({
        appId: epaySettings.value.appId,
        payId: payId,
        type: type,
        price: price,
        sign: sign,
        param: param,
        isHtml: 1,
        notifyUrl: `${supabaseUrl}/functions/v1/epay-callback`,
        returnUrl: `${window.location.origin}/`
      })

      const fullUrl = epaySettings.value.gateway + '?' + params.toString()
      
      console.log('========== 易支付提交信息 ==========')
      console.log('提交URL:', fullUrl)
      console.log('签名字符串:', signStr)
      console.log('计算签名:', sign)
      console.log('完整参数:')
      for (const [key, value] of params.entries()) {
        console.log(`  ${key} = ${value}`)
      }
      console.log('====================================')
      
      // 跳转到支付页面
      window.location.href = fullUrl
    } catch (error) {
      console.error('跳转到易支付失败:', error)
      ElMessage.error('跳转到支付页面失败')
    }
  }

  return {
    orders,
    loading,
    epaySettings,
    vmqSettings,
    fetchOrders,
    fetchEpaySettings,
    fetchVmqSettings,
    createOrder,
    queryVmqOrder
  }
})
