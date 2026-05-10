// Leads API — GET lista de leads (últimos 90 dias) | PATCH atualiza status
// Tabelas: propostas_solicitadas + contacts no Supabase (service role)

import { requireAdmin } from './_adminAuth.js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ahlqzzkxuutwoepirpzr.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseHeaders = () => ({
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
  'Content-Type': 'application/json',
});

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (!['GET', 'PATCH'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const isServiceKey = authHeader === `Bearer ${SUPABASE_SERVICE_KEY}`;

  if (!isServiceKey) {
    const adminAuth = await requireAdmin(req, res);
    if (!adminAuth.ok) return adminAuth.response;
  }

  if (!SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' });
  }

  // POST — Promove um lead para o WGEasy (Oportunidade real)
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, tipo } = body || {};

      if (!id || !tipo) {
        return res.status(400).json({ error: 'id e tipo são obrigatórios' });
      }

      const headers = supabaseHeaders();
      const table = tipo === 'proposta' ? 'propostas_solicitadas' : 'contacts';
      
      // 1. Buscar dados completos do lead
      const leadResp = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}&select=*`, { headers });
      const [lead] = await leadResp.json();

      if (!lead) return res.status(404).json({ error: 'Lead não encontrado' });

      const email = lead.email;
      const nome = lead.name || lead.nome || 'Lead do Site';
      const telefone = lead.phone || lead.telefone;

      // 2. Garantir que a pessoa existe no WGEasy
      let pessoaId;
      const pessoaCheckResp = await fetch(`${SUPABASE_URL}/rest/v1/pessoas?email=eq.${email}&select=id`, { headers });
      const [pessoaExistente] = await pessoaCheckResp.json();

      if (pessoaExistente) {
        pessoaId = pessoaExistente.id;
      } else {
        const novaPessoaResp = await fetch(`${SUPABASE_URL}/rest/v1/pessoas`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'return=representation' },
          body: JSON.stringify({
            nome,
            email,
            telefone,
            tipo: 'CLIENTE',
            origem: lead.origem || 'Site WG Almeida',
            ativo: true
          }),
        });
        const [novaPessoa] = await novaPessoaResp.json();
        pessoaId = novaPessoa.id;
      }

      // 3. Criar Oportunidade no WGEasy
      const desc = `Promovido do Site: ${tipo.toUpperCase()}\nOrigem: ${lead.origem || 'Direto'}\nCampanha: ${lead.utm_campaign || '—'}\n\nNota: Lead capturado em ${new Date(lead.created_at).toLocaleString('pt-BR')}`;
      
      await fetch(`${SUPABASE_URL}/rest/v1/oportunidades`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          titulo: `[SITE] ${nome}`,
          cliente_id: pessoaId,
          estagio: 'Prospecção',
          origem: lead.origem || 'Marketing Digital',
          descricao: desc,
          valor_estimado: tipo === 'proposta' ? 50000 : null // Valor base para propostas do site
        }),
      });

      // 4. Marcar como promovido no site
      await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'atendido' }),
      });

      return res.status(200).json({ ok: true, message: 'Promovido com sucesso para WGEasy' });
    } catch (err) {
      console.error('Promotion error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // PATCH — atualiza status de um lead
  if (req.method === 'PATCH') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, tipo, status } = body || {};

      if (!id || !tipo || !status) {
        return res.status(400).json({ error: 'id, tipo e status são obrigatórios' });
      }

      const table = tipo === 'proposta' ? 'propostas_solicitadas' : 'contacts';
      const url = `${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`;

      const resp = await fetch(url, {
        method: 'PATCH',
        headers: { ...supabaseHeaders(), 'Prefer': 'return=minimal' },
        body: JSON.stringify({ status }),
      });

      if (!resp.ok) {
        const err = await resp.text();
        return res.status(400).json({ error: err });
      }

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('PATCH leads error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // GET — lista leads dos últimos 90 dias
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const headers = supabaseHeaders();

    const [propostasResp, contactsResp] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/propostas_solicitadas?select=id,nome,email,telefone,utm_source,utm_medium,utm_campaign,origem,status,created_at&created_at=gte.${ninetyDaysAgo}&order=created_at.desc`,
        { headers }
      ),
      fetch(
        `${SUPABASE_URL}/rest/v1/contacts?select=id,name,email,phone,utm_source,utm_medium,utm_campaign,origem,status,created_at&created_at=gte.${ninetyDaysAgo}&order=created_at.desc`,
        { headers }
      ),
    ]);

    const propostas = propostasResp.ok ? await propostasResp.json() : [];
    const contacts = contactsResp.ok ? await contactsResp.json() : [];

    const leads = [
      ...propostas.map((p) => ({
        id: p.id,
        nome: p.nome || p.email || '—',
        email: p.email,
        telefone: p.telefone,
        utm_source: p.utm_source,
        utm_medium: p.utm_medium,
        utm_campaign: p.utm_campaign,
        origem: p.origem,
        status: p.status || 'nova',
        created_at: p.created_at,
        tipo: 'proposta',
      })),
      ...contacts.map((c) => ({
        id: c.id,
        nome: c.name || c.email || '—',
        email: c.email,
        telefone: c.phone,
        utm_source: c.utm_source,
        utm_medium: c.utm_medium,
        utm_campaign: c.utm_campaign,
        origem: c.origem,
        status: c.status || 'nova',
        created_at: c.created_at,
        tipo: 'contato',
      })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json({ leads });
  } catch (err) {
    console.error('GET leads error:', err);
    return res.status(500).json({ error: err.message });
  }
}
