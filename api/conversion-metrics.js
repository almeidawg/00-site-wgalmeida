import { requireAdmin } from './_adminAuth.js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

const headers = () => ({
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
});

const safeRows = async (response) => {
  const payload = await response.json().catch(() => []);
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || `Supabase ${response.status}`);
  }
  return Array.isArray(payload) ? payload : [];
};

const normalizeContext = (row) => {
  const raw = String(row?.metadata?.context || '').toLowerCase();
  if (raw.includes('moodboard')) return 'moodboard';
  if (raw.includes('buildtech')) return 'buildtech';
  if (raw.includes('contact') || raw.includes('contato')) return 'contact';
  return 'other';
};

const increment = (bucket, key) => {
  bucket[key] = (bucket[key] || 0) + 1;
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await requireAdmin(req, res);
  if (!auth.ok) return auth.response;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Metrics service not configured' });
  }

  const requestedDays = Number.parseInt(String(req.query?.days || '30'), 10);
  const days = Number.isFinite(requestedDays) ? Math.min(90, Math.max(1, requestedDays)) : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [idempotencyResp, promotionsResp] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/site_contact_idempotency?select=outcome,promotion_outcome,metadata,created_at&created_at=gte.${encodeURIComponent(since)}&order=created_at.asc`, { headers: headers() }),
      fetch(`${SUPABASE_URL}/rest/v1/lead_promotions?select=promotion_mode,promoted_at&promoted_at=gte.${encodeURIComponent(since)}&order=promoted_at.asc`, { headers: headers() }),
    ]);

    const idempotency = await safeRows(idempotencyResp);
    const promotions = await safeRows(promotionsResp);

    const outcome = {};
    const promotion = {};
    const context = {};
    const daily = new Map();

    for (const row of idempotency) {
      increment(outcome, row.outcome || 'unknown');
      increment(promotion, row.promotion_outcome || 'unknown');
      increment(context, normalizeContext(row));

      const day = String(row.created_at || '').slice(0, 10);
      if (day) {
        const current = daily.get(day) || { date: day, total: 0, saved: 0, processing: 0 };
        current.total += 1;
        if (row.outcome === 'saved') current.saved += 1;
        if (row.outcome === 'processing') current.processing += 1;
        daily.set(day, current);
      }
    }

    const total = idempotency.length;
    const saved = outcome.saved || 0;
    const completedPromotions = promotion.promotion_completed || 0;

    return res.status(200).json({
      periodDays: days,
      since,
      totals: {
        persistedSubmissions: total,
        saved,
        processing: outcome.processing || 0,
        promotionCompleted: completedPromotions,
        leadPromotions: promotions.length,
        saveRate: total ? Number((saved / total).toFixed(4)) : 0,
      },
      byOutcome: outcome,
      byPromotion: promotion,
      byContext: context,
      daily: [...daily.values()],
      privacy: {
        piiIncluded: false,
        source: 'site_contact_idempotency + lead_promotions aggregate-only',
      },
    });
  } catch (error) {
    console.error('Conversion metrics error:', error);
    return res.status(502).json({ error: 'Falha ao carregar métricas agregadas.' });
  }
}
