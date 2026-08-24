/** Public Supabase project for edge functions (contact, demos, waitlist). */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://puirfuvowwnqpopdnyfv.supabase.co'

/**
 * Publishable anon key — required by the Supabase functions gateway for
 * reliable browser calls (staging GH Pages + www.kamikaze.host).
 * Override via NEXT_PUBLIC_SUPABASE_ANON_KEY when rotating keys.
 */
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1aXJmdXZvd3ducXBvcGRueWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NDIzOTMsImV4cCI6MjEwMjExODM5M30.APy2e7nqYjR34TiQNDblI5xLHRksIzGRoTG-SiqEGHs'

/** Headers for browser → Edge Function fetch (CORS + gateway auth). */
export function supabaseFunctionHeaders(
  extra?: Record<string, string>,
): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...extra,
  }
}

export function supabaseFunctionUrl(name: string): string {
  return `${SUPABASE_URL}/functions/v1/${name}`
}
