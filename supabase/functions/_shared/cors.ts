/** Browser origins that may call public form edge functions. */
const ALLOWED_ORIGINS = new Set([
  'https://kamikaze.host',
  'https://www.kamikaze.host',
  'https://zhreyu.github.io',
])

function isLocalDevOrigin(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
}

/**
 * Reflect allowed Origin (incl. www + GH Pages staging). Fall back to * so
 * preflight never fails for these public POST endpoints.
 */
export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? ''
  const allow =
    origin && (ALLOWED_ORIGINS.has(origin) || isLocalDevOrigin(origin))
      ? origin
      : '*'

  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}
