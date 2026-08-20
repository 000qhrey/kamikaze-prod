import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function corsHeaders(_req: Request) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
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
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ success: false, message: 'MISSING_REQUIRED_FIELDS' }),
        { status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase().trim())) {
      return new Response(
        JSON.stringify({ success: false, message: 'INVALID_SIGNAL_FORMAT' }),
        { status: 400, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error } = await supabase.from('contact_submissions').insert([
      {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        subject: subject.trim(),
        message: message.trim(),
      },
    ])

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ success: false, message: 'TRANSMISSION_FAILED' }),
        { status: 500, headers: { ...corsHeaders(req), 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'SIGNAL_TRANSMITTED' }),
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
