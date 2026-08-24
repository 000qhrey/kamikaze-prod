/** Public Supabase project for edge functions (contact, demos, waitlist). */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'https://puirfuvowwnqpopdnyfv.supabase.co'

/** Publishable anon key — set via NEXT_PUBLIC_SUPABASE_ANON_KEY (never commit). */
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/** Headers for browser → Edge Function fetch (CORS + gateway auth). */
export function supabaseFunctionHeaders(
  extra?: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  }
  if (SUPABASE_ANON_KEY) {
    headers.apikey = SUPABASE_ANON_KEY
    headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`
  }
  return headers
}

export function supabaseFunctionUrl(name: string): string {
  return `${SUPABASE_URL}/functions/v1/${name}`
}
