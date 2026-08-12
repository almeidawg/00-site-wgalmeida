// Leads API — lifecycle canônico de contatos do WG-Easy.
// Fonte: pessoas + fn_promover_contato_para_lead. Não usa tabelas legadas contacts/propostas_solicitadas.

import { requireAdmin } from './_adminAuth.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseHeaders = () => ({
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
});

const stageToStatus = (stage) => {
  if (stage === 'lead_ativo' || stage === 'cliente') return 'convertido';
  if (stage === 'lead_potencial') return 'atendido';
  if (stage === 'arquivado') return 'descartado';
  return 'nova';
};

const statusToStage = (status) => {
  if (status === 'nova') return 'contato';
  if (status === 'atendido') return 'lead_potencial';
  if (status === 'descartado') return 'arquivado';
  return null;
};

const parseJson = async (response) => response.json().catch(() => null);

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (!['GET', 'PATCH', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const isServiceKey = Boolean(SUPABASE_SERVICE_KEY) && authHeader === `Bearer ${SUPABASE_SERVICE_KEY}`;
  if (!isServiceKey) {
    const adminAuth = await requireAdmin(req, res);
    if (!adminAuth.ok) return adminAuth.response;
  }

  if (!SUPABASE_SERVICE_KEY || !SUPABASE_URL) {
    return res.status(500).json({ error: 'Supabase server configuration missing' });
  }

  const headers = supabaseHeaders();

  // POST — promoção governada do contato para lead/oportunidade.
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, tipo } = body || {};
      if (!id) return res.status(400).json({ error: 'id é obrigatório' });
      if (tipo && tipo !== 'contato') {
        return res.status(400).json({ error: 'A promoção suporta apenas contatos do lifecycle canônico.' });
      }

      const rpcResp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/fn_promover_contato_para_lead`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          p_pessoa_id: id,
          p_source: 'manual',
          p_reason: 'Promoção manual pelo AdminLeads do site WG Almeida',
          p_interaction_id: null,
          p_titulo: null,
          p_confidence: null,
          p_promoted_by: null,
          p_metadata: { source: 'site-admin-leads' },
        }),
      });

      const payload = await parseJson(rpcResp);
      if (!rpcResp.ok) {
        return res.status(rpcResp.status >= 500 ? 502 : 400).json({
          error: payload?.message || payload?.error || 'Falha ao promover contato.',
        });
      }

      return res.status(200).json({ ok: true, message: 'Contato promovido para lead/oportunidade.' });
    } catch (err) {
      console.error('Promotion error:', err);
      return res.status(500).json({ error: 'Erro ao promover contato.' });
    }
  }

  // PATCH — mudança de lifecycle sem criar oportunidade. Conversão exige POST governado.
  if (req.method === 'PATCH') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, tipo, status } = body || {};
      if (!id || !status) return res.status(400).json({ error: 'id e status são obrigatórios' });
      if (tipo && tipo !== 'contato') {
        return res.status(400).json({ error: 'A atualização suporta apenas contatos do lifecycle canônico.' });
      }
      if (status === 'convertido') {
        return res.status(409).json({ error: 'Use a ação Promover WGEasy para converter um contato.' });
      }

      const contactStage = statusToStage(status);
      if (!contactStage) return res.status(400).json({ error: 'Status inválido.' });

      const url = `${SUPABASE_URL}/rest/v1/pessoas?id=eq.${encodeURIComponent(id)}`;
      const resp = await fetch(url, {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ contact_stage: contactStage }),
      });

      if (!resp.ok) {
        const payload = await parseJson(resp);
        return res.status(resp.status >= 500 ? 502 : 400).json({
          error: payload?.message || payload?.error || 'Falha ao atualizar lifecycle.',
        });
      }

      return res.status(200).json({ ok: true, status, contact_stage: contactStage });
    } catch (err) {
      console.error('PATCH leads error:', err);
      return res.status(500).json({ error: 'Erro ao atualizar lifecycle.' });
    }
  }

  // GET — contatos conhecidos do lifecycle nos últimos 90 dias.
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const select = 'id,nome,email,telefone,contact_stage,origem_cadastro,lead_source,lead_source_ref,created_at,updated_at';
    const url = `${SUPABASE_URL}/rest/v1/pessoas?select=${select}&ativo=eq.true&created_at=gte.${encodeURIComponent(ninetyDaysAgo)}&order=created_at.desc`;
    const peopleResp = await fetch(url, { headers });
    const people = await parseJson(peopleResp);

    if (!peopleResp.ok) {
      return res.status(peopleResp.status >= 500 ? 502 : 400).json({
        error: people?.message || people?.error || 'Falha ao carregar contatos.',
      });
    }

    const leads = (Array.isArray(people) ? people : []).map((person) => ({
      id: person.id,
      nome: person.nome || person.email || '—',
      email: person.email,
      telefone: person.telefone,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      origem: person.origem_cadastro || person.lead_source || 'WG-Easy',
      status: stageToStatus(person.contact_stage),
      contact_stage: person.contact_stage || 'contato',
      created_at: person.created_at || person.updated_at,
      tipo: 'contato',
    }));

    return res.status(200).json({ leads });
  } catch (err) {
    console.error('GET leads error:', err);
    return res.status(500).json({ error: 'Erro ao carregar contatos.' });
  }
}
