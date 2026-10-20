/**
 * Referência de handler interno para Mentoria Construção, deliberadamente FAIL-CLOSED.
 * O prefixo _ evita criar a 13ª função publicável no plano Vercel Hobby.
 * Não existe rota real /api/mentoria-interest no Vercel até autorização de release.
 *
 * A presença deste arquivo NÃO ativa recebimento, e-mail, CRM nem persistência.
 * Será substituído somente por implementação governada após segurança, LGPD,
 * proteção contra abuso, tenant, RLS, consentimento e E2E de staging aprovados.
 * Não vincular /api/contact do site institucional a esta campanha.
 */
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  // Não ler ou registrar req.body/headers, identificadores ou dados pessoais.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok:false, code:'METHOD_NOT_ALLOWED' })
  }
  // Política fixa, independente de variável de ambiente ou flags do cliente.
  return res.status(503).json({
    ok:false, code:'MENTORIA_INTAKE_NOT_APPROVED',
    error:'Recebimento da mentoria ainda não habilitado.',
  })
}
