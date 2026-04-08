import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import nodemailer from 'https://esm.sh/nodemailer@6.9.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, smtpConfig } = await req.json()

    if (!to || !subject || !html || !smtpConfig) {
      return new Response(
        JSON.stringify({ success: false, message: '缺少必要参数' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const port = parseInt(smtpConfig.port) || 587
    const secure = port === 465

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: port,
      secure: secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    await transporter.sendMail({
      from: smtpConfig.from || smtpConfig.user,
      to: to,
      subject: subject,
      html: html,
    })

    return new Response(
      JSON.stringify({ success: true, message: '邮件发送成功' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    let errorMessage = '邮件发送失败'
    if (error.message) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }
    
    return new Response(
      JSON.stringify({ success: false, message: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
