import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

// Release guard: deliberately fail when commercial consent is first mounted.
// This guard can be changed ONLY in the owner-approved release that includes
// real lead-auth, phone verification, legally approved notice, abuse/cost
// controls, signed revocation and idempotent CRM integration.
const projectRoot = resolve(process.cwd())
const read = (path) => readFileSync(resolve(projectRoot, path), 'utf8')

describe('Mentoria commercial opt-in release gate — fail closed', () => {
  it('keeps commercial opt-in absent from all current public app entry points', () => {
    const publicEntries = [
      'src/main.jsx',
      'src/App.jsx',
      'src/pages/MentoriaConstrucaoLanding.jsx',
    ]
    for (const entry of publicEntries) {
      const source = read(entry)
      expect(source, entry).not.toMatch(/MentoriaCommercialLeadOptInForm/)
      expect(source, entry).not.toMatch(/_mentoriaCommercialConsentBoundary/)
    }
  })

  it('does not make any consent/OTP endpoint publicly routable via Vercel api/', () => {
    // Verified Vercel rule: source files in api/ prefixed with "_" are
    // utility files, not Vercel Functions. A future file without "_" can
    // create a public endpoint immediately, even without App imports.
    const apiFiles = readdirSync(resolve(projectRoot, 'api'), { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
    const candidateRoutes = apiFiles.filter((name) =>
      !name.startsWith('_') && /mentoria.*(consent|opt.?in|otp|verify)/i.test(name))
    expect(candidateRoutes).toEqual([])
    expect(apiFiles).toContain('_mentoriaCommercialConsentBoundary.js')
  })

  it('does not expose a consent route through manual Vercel rewrites or redirects', () => {
    const config = JSON.parse(read('vercel.json'))
    const routes = [
      ...(config.rewrites || []),
      ...(config.redirects || []),
      ...(config.routes || []),
    ]
    const forbidden = /mentoria[^"']*(?:consent|opt.?in|otp|verif(?:y|ic))|commercialconsentboundary/i
    expect(routes.filter((route) => forbidden.test(JSON.stringify(route)))).toEqual([])
  })

  it('keeps all consumer auth and provider calls outside generic site-admin and memory rate limits', () => {
    const boundary = read('api/_mentoriaCommercialConsentBoundary.js')
    expect(boundary).not.toMatch(/from ['"].*_requestGuard|from ['"].*_adminAuth/)
    expect(boundary).not.toMatch(/fetch\s*\(|twilio\.com|SUPABASE_SERVICE|createClient\(/)
    expect(boundary).toContain('deps.authenticateLeadSession')
    expect(boundary).toContain('deps.beginChallenge')
    expect(boundary).toContain('deps.confirmChallenge')
  })

  it('ships neither a default-enabled lead form nor a production marketing legal notice', () => {
    const form = read('src/components/MentoriaCommercialLeadOptInForm.jsx')
    const contract = read('src/lib/mentoriaCommercialLeadConsent.js')
    expect(form).toMatch(/enabled\s*=\s*false/)
    expect(contract).toContain('mentoria_commercial_contact')
    expect(form).not.toMatch(/fetch\s*\(|localStorage\./)
    // Approved legal text must be provided by a future audited server
    // deployment and must match the SHA-256 checked by that backend.
    expect(form).toContain('notice.text')
    expect(form).not.toMatch(/VITE_TWILIO|TWILIO_AUTH_TOKEN/)
  })
})
