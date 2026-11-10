// A vitrine pública somente pode tentar carregar ofertas quando a origem
// afiliada aprovada estiver explicitamente configurada. O catálogo legado
// WG Easy/Hostinger não é um fallback seguro sem contrato de API validado.
export function isPublicStoreConfigured(env = {}) {
  if (env.VITE_WG_STORE_OFFERS_ENABLED !== 'true') return false;
  const url = env.VITE_WG_STORE_PUBLIC_SUPABASE_URL;
  const key = env.VITE_WG_STORE_PUBLIC_ANON_KEY;
  const org = env.VITE_WG_STORE_PUBLIC_ORG_ID;
  if (typeof url !== 'string' || typeof key !== 'string' || !key.trim()) return false;
  if (key.startsWith('sb_secret_')) return false;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(org || '')) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && Boolean(parsed.hostname) && !parsed.username && !parsed.password &&
      parsed.hostname !== 'localhost' && !parsed.hostname.endsWith('.local') &&
      !parsed.hostname.endsWith('.internal') && !/^[0-9]+(?:\.[0-9]+){3}$/.test(parsed.hostname);
  } catch {
    return false;
  }
}
