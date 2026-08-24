import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

function generateSerialKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = 'KMKZ-'
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function buildEmailHtml(serialKey: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #080808; color: #ff0000; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace; padding: 20px; margin: 0;">
  <div style="display:none;max-height:0;overflow:hidden;">Uplink successful. Your signal is locked in the acquisition buffer. Do not disclose.</div>
  <div style="border: 1px solid #333; padding: 40px; background-color: #000; max-width: 600px; margin: 0 auto;">
    <p style="font-size: 12px; color: #666; margin: 0 0 20px 0;">
      [ KAMIKAZE_MAIN_TERMINAL // VER_1.0 ]
    </p>

    <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;">

    <p style="font-size: 18px; font-weight: bold; letter-spacing: 2px; color: #00ff00; margin: 0 0 16px 0;">
      SIGNAL_RECOGNIZED
    </p>

    <p style="color: #ccc; line-height: 1.6; font-size: 14px; margin: 0 0 20px 0;">
      Uplink successful. You have been integrated into the acquisition buffer for Drop_01.
      Your signal is currently locked in the queue.
    </p>

    <div style="background: #111; padding: 15px; border-left: 4px solid #ff0000; margin: 20px 0;">
      <p style="margin: 0 0 4px 0; font-size: 14px; color: #fff;">
        SERIAL_ID: <span style="color: #ff0000;">#${serialKey}</span>
      </p>
      <p style="margin: 0; font-size: 10px; color: #444;">
        STATUS: ACCESS_QUEUED
      </p>
    </div>

    <p style="font-size: 11px; color: #444; margin: 20px 0;">
      [!] WARNING: SIGNAL PATH IS MONITORED. DO NOT DISCLOSE.
    </p>

    <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;">

    <a href="https://kamikaze.host" style="color: #ff0000; text-decoration: none; font-size: 12px;">
      [ RETURN_TO_VOID ]
    </a>
  </div>
</body>
</html>
`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'METHOD_NOT_ALLOWED' }),
      { status: 405, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } },
    )
  }

  try {
    const { email } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase().trim())) {
      return new Response(
        JSON.stringify({ success: false, message: 'INVALID_FREQUENCY_FORMAT' }),
        { status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } },
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const serialKey = generateSerialKey()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { error: dbError } = await supabase
      .from('merch_waitlist')
      .insert([{ email: normalizedEmail, serial_key: serialKey }])

    if (dbError) {
      if (dbError.code === '23505') {
        const { data: existing } = await supabase
          .from('merch_waitlist')
          .select('serial_key')
          .eq('email', normalizedEmail)
          .single()

        return new Response(
          JSON.stringify({
            success: false,
            message: 'SIGNAL_ALREADY_BOUND',
            serialKey: existing?.serial_key,
          }),
          { status: 409, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } },
        )
      }

      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ success: false, message: 'UPLINK_FAILED' }),
        { status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } },
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Kamikaze <transmissions@kamikaze.host>',
            to: normalizedEmail,
            subject: '[ SIGNAL_RECEIVED ] // ACCESS_QUEUED',
            html: buildEmailHtml(serialKey),
          }),
        })

        if (!emailResponse.ok) {
          const emailError = await emailResponse.text()
          console.error('Resend error:', emailError)
        }
      } catch (emailError) {
        console.error('Email send error:', emailError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'BINDING_SEALED',
        serialKey,
      }),
      { status: 200, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Request error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'TRANSMISSION_ERROR' }),
      { status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } },
    )
  }
})
