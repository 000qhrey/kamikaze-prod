function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const allowed = /^https:\/\/(kamikaze\.host|zhreyu\.github\.io|localhost:\d+)$/.test(origin)
    ? origin
    : 'https://kamikaze.host'

  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

function buildEmailHtml(soundcloudUrl: string, artistAlias: string): string {
  const escapedUrl = soundcloudUrl.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const escapedAlias = artistAlias.replace(/</g, '&lt;').replace(/>/g, '&gt;') || 'ANONYMOUS'

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
      [ KAMIKAZE_DEMO_TERMINAL // NEW_SUBMISSION ]
    </p>
    <p style="font-size: 18px; font-weight: bold; letter-spacing: 2px; color: #00ff41; margin: 0 0 16px 0;">
      DEMO_RECEIVED
    </p>
    <div style="background: #111; padding: 15px; border-left: 4px solid #ff0000; margin: 20px 0;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #888;">
        ARTIST: <span style="color: #fff;">${escapedAlias}</span>
      </p>
      <p style="margin: 0; font-size: 14px; color: #888;">
        LINK: <a href="${escapedUrl}" style="color: #ff0000;">${escapedUrl}</a>
      </p>
    </div>
    <p style="font-size: 10px; color: #444; margin: 0;">
      TIMESTAMP: ${new Date().toISOString()}
    </p>
  </div>
</body>
</html>
`
}

Deno.serve(async (req) => {
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
    const { soundcloudUrl, artistAlias } = await req.json()
    const trimmedUrl = (soundcloudUrl || '').trim()
    const trimmedAlias = (artistAlias || '').trim()

    if (!trimmedUrl) {
      return new Response(
        JSON.stringify({ success: false, message: 'MISSING_SOUNDCLOUD_URL' }),
        { status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    if (!/^https?:\/\/(www\.)?soundcloud\.com\/.+/i.test(trimmedUrl)) {
      return new Response(
        JSON.stringify({ success: false, message: 'INVALID_SOUNDCLOUD_URL' }),
        { status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ success: false, message: 'UPLOAD_SYSTEM_OFFLINE' }),
        { status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Kamikaze Demos <contact@kamikaze.host>',
        to: 'contact@kamikaze.host',
        subject: `[DEMO] ${trimmedAlias || 'New submission'}`,
        html: buildEmailHtml(trimmedUrl, trimmedAlias),
      }),
    })

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text()
      console.error('Resend error:', emailError)
      return new Response(
        JSON.stringify({ success: false, message: 'UPLOAD_FAILED' }),
        { status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'DEMO_RECEIVED' }),
      { status: 200, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Request error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'UPLOAD_ERROR' }),
      { status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
    )
  }
})
