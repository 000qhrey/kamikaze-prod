function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const allowed = /^https:\/\/(kamikaze\.host|zhreyu\.github\.io|localhost:\d+)$/.test(origin)
    ? origin
    : 'https://kamikaze.host'

  return {
    'Access-Control-Allow-Origin': "*",
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

function buildEmailHtml(name: string, email: string, subject: string, message: string): string {
  const escapedMessage = message.replace(/\n/g, '<br>').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const escapedName = name.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const escapedSubject = subject.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #080808; color: #ffffff; font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace; padding: 20px; margin: 0;">
  <div style="border: 1px solid #333; padding: 40px; background-color: #000; max-width: 600px; margin: 0 auto;">
    <p style="font-size: 12px; color: #666; margin: 0 0 20px 0;">
      [ KAMIKAZE_CONTACT_TERMINAL // INCOMING_TRANSMISSION ]
    </p>

    <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;">

    <p style="font-size: 18px; font-weight: bold; letter-spacing: 2px; color: #ff0000; margin: 0 0 16px 0;">
      NEW_SIGNAL_RECEIVED
    </p>

    <div style="background: #111; padding: 15px; border-left: 4px solid #ff0000; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #888;">
        FROM: <span style="color: #fff;">${escapedName}</span>
      </p>
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #888;">
        SIGNAL: <span style="color: #ff0000;">${email}</span>
      </p>
      <p style="margin: 0; font-size: 14px; color: #888;">
        SUBJECT: <span style="color: #fff;">${escapedSubject}</span>
      </p>
    </div>

    <div style="background: #0a0a0a; padding: 20px; border: 1px solid #222; margin: 20px 0;">
      <p style="font-size: 11px; color: #666; margin: 0 0 10px 0;">MESSAGE_PAYLOAD:</p>
      <p style="color: #ccc; line-height: 1.8; font-size: 14px; margin: 0; white-space: pre-wrap;">
${escapedMessage}
      </p>
    </div>

    <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;">

    <p style="font-size: 10px; color: #444; margin: 0;">
      TIMESTAMP: ${new Date().toISOString()}
    </p>
  </div>
</body>
</html>
`
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders(req) })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'METHOD_NOT_ALLOWED' }),
      { status: 405, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { name, email, subject, message } = await req.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ success: false, message: 'MISSING_REQUIRED_FIELDS' }),
        { status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase().trim())) {
      return new Response(
        JSON.stringify({ success: false, message: 'INVALID_SIGNAL_FORMAT' }),
        { status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const trimmedName = name.trim()
    const trimmedSubject = subject.trim()
    const trimmedMessage = message.trim()

    // Send email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ success: false, message: 'TRANSMISSION_SYSTEM_OFFLINE' }),
        { status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Kamikaze Contact <contact@kamikaze.host>',
        to: 'contact@kamikaze.host',
        reply_to: normalizedEmail,
        subject: `[CONTACT] ${trimmedSubject}`,
        html: buildEmailHtml(trimmedName, normalizedEmail, trimmedSubject, trimmedMessage),
      }),
    })

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text()
      console.error('Resend error:', emailError)
      return new Response(
        JSON.stringify({ success: false, message: 'TRANSMISSION_FAILED' }),
        { status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SIGNAL_TRANSMITTED',
      }),
      { status: 200, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Request error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'TRANSMISSION_ERROR' }),
      { status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
    )
  }
})
