const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ahlqzzkxuutwoepirpzr.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_AUTH_API_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  SUPABASE_SERVICE_KEY;
const ADMIN_EMAIL_DOMAIN = process.env.ADMIN_EMAIL_DOMAIN || '@wgalmeida.com.br';

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

  if (!resp.ok) return null;
  const rows = await resp.json();
  return Array.isArray(rows) ? rows[0] || null : null;
};

export async function requireAdmin(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

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

  const user = await authResp.json();
  const profile = await fetchProfile(user?.id);
  const email = String(user?.email || profile?.email || '').toLowerCase();
  const isDomainAdmin = email.endsWith(ADMIN_EMAIL_DOMAIN.toLowerCase());
  const isProfileAdmin = profile?.role === 'admin';
  const isInactive = profile?.ativo === false;

  if (isInactive || (!isDomainAdmin && !isProfileAdmin)) {
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
