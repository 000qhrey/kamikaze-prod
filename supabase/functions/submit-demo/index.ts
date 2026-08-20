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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error } = await supabase.from('demo_submissions').insert([
      {
        soundcloud_url: trimmedUrl,
        artist_alias: trimmedAlias || null,
      },
    ])

    if (error) {
      console.error('Database error:', error)
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
