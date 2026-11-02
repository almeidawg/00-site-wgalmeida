const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ahlqzzkxuutwoepirpzr.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_AUTH_API_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  SUPABASE_SERVICE_KEY;

const jsonError = (res, status, error) => res.status(status).json({ error });

const getBearerToken = (req) => {
  const raw =
    req.headers?.authorization ||
    req.headers?.Authorization ||
    '';
  const match = String(raw).match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || '';
};

const fetchProfile = async (userId) => {
  if (!userId || !SUPABASE_SERVICE_KEY) return null;

  const url = `${SUPABASE_URL}/rest/v1/profiles?select=id,email,role,ativo&id=eq.${encodeURIComponent(userId)}&limit=1`;
  const resp = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!resp.ok) throw new Error('Admin profile lookup failed');
  const rows = await resp.json();
  if (!Array.isArray(rows)) throw new Error('Admin profile response invalid');
  return rows[0] || null;
};

export async function requireAdmin(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  // Admin do site inativo em producao ate a migracao para o WGEasy (decisao do owner, 2026-10-22).
  // Reativar sem mexer em codigo: SITE_ADMIN_ENABLED=true na Vercel.
  if (process.env.VERCEL_ENV === 'production' && process.env.SITE_ADMIN_ENABLED !== 'true') {
    return {
      ok: false,
      response: res.status(503).json({ error: 'Admin do site desativado. Use o WGEasy.', code: 'site_admin_disabled' }),
    };
  }

  const token = getBearerToken(req);
  if (!token) {
    return {
      ok: false,
      response: jsonError(res, 401, 'Unauthorized'),
    };
  }

  if (!SUPABASE_SERVICE_KEY || !SUPABASE_AUTH_API_KEY) {
    return {
      ok: false,
      response: jsonError(res, 500, 'Auth service not configured'),
    };
  }

  let authResp;
  try {
    authResp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_AUTH_API_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Admin auth verification failed:', error);
    return {
      ok: false,
      response: jsonError(res, 503, 'Auth service unavailable'),
    };
  }

  if (!authResp.ok) {
    return {
      ok: false,
      response: jsonError(res, 401, 'Unauthorized'),
    };
  }

  let user;
  try {
    user = await authResp.json();
  } catch {
    console.error('Admin auth user response invalid');
    return {
      ok: false,
      response: jsonError(res, 503, 'Auth service unavailable'),
    };
  }
  let profile;
  try {
    profile = await fetchProfile(user?.id);
  } catch {
    console.error('Admin profile verification unavailable');
    return {
      ok: false,
      response: jsonError(res, 503, 'Auth service unavailable'),
    };
  }
  // A corporate email is an identity attribute, never an authorization grant.
  // Require a matching, explicitly active admin profile in the canonical auth provider.
  const isVerifiedAdmin = Boolean(user?.id) &&
    profile?.id === user.id &&
    profile?.role === 'admin' &&
    profile?.ativo === true;

  if (!isVerifiedAdmin) {
    return {
      ok: false,
      response: jsonError(res, 403, 'Forbidden'),
    };
  }

  return {
    ok: true,
    user,
    profile,
  };
}
