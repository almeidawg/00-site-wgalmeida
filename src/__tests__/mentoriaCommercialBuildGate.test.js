import { afterEach, describe, expect, it } from 'vitest'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { inspectMentoriaCommercialBuildGate } from '../../tools/mentoria-commercial-build-gate-core.mjs'
import { createMentoriaCommercialViteGatePlugin } from '../../tools/mentoria-commercial-vite-plugin.mjs'

const repoRoot = resolve(process.cwd())
const tempDirs = []

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'wg-mentoria-build-gate-'))
  tempDirs.push(root)
  const sourceFiles = [
    'src/components/MentoriaCommercialLeadOptInForm.jsx',
    'src/lib/mentoriaCommercialLeadConsent.js',
    'api/_mentoriaCommercialConsentBoundary.js',
    'api/_mentoriaCommercialReceiptVerifier.js',
    'package.json', 'vercel.json', 'vite.config.js',
  ]
  for (const path of sourceFiles) {
    const target = join(root, path)
    mkdirSync(dirname(target), { recursive: true })
    copyFileSync(join(repoRoot, path), target)
  }
  mkdirSync(join(root, 'src/pages'), { recursive: true })
  writeFileSync(join(root, 'src/App.jsx'), 'export default function App() { return null }\n')
  writeFileSync(join(root, 'src/main.jsx'), 'im' + 'port App from "./App.jsx"\n')
  writeFileSync(join(root, 'src/pages/MentoriaConstrucaoLanding.jsx'),
    'export default function Landing() { return null }\n')
  writeFileSync(join(root, 'index.html'), '<!doctype html><title>synthetic</title>\n')
  return {
    root,
    write(path, content) {
      const target = join(root, path)
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, content)
    },
    read(path) { return readFileSync(join(root, path), 'utf8') },
    run() { return inspectMentoriaCommercialBuildGate(root) },
  }
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe('Mentoria commercial consent build gate — runs without Vitest/deploy dependencies', () => {
  it('accepts only the current unmounted isolated contracts and validates real repo too', () => {
    expect(fixture().run()).toEqual({ ok: true, problems: [] })
    expect(inspectMentoriaCommercialBuildGate(repoRoot)).toEqual({ ok: true, problems: [] })
  })

  it('blocks mounting the UI in the entrypoint and in an indirect imported component', () => {
    const f = fixture()
    f.write('src/App.jsx', "im" + "port MentoriaCommercialLeadOptInForm from './components/MentoriaCommercialLeadOptInForm.jsx'")
    expect(f.run().problems).toContain('commercial_optin_mounted_in_src')
    const g = fixture()
    g.write('src/components/SomeWrapper.jsx',
      "ex" + "port { default as Preview } from './MentoriaCommercialLeadOptInForm.jsx'")
    expect(g.run().problems).toContain('commercial_optin_mounted_in_src')
  })

  it('blocks a new public consent endpoint even if it does not import the boundary', () => {
    const f = fixture()
    f.write('api/mentoria-consent.js', 'export default function handler() { return null }')
    expect(f.run().problems).toContain('public_commercial_consent_api')
  })

  it('blocks an innocuously named public api route that imports the private boundary', () => {
    const f = fixture()
    f.write('api/route.js',
      "im" + "port { createMentoriaCommercialConsentBoundary } from './_mentoriaCommercialConsentBoundary.js'")
    expect(f.run().problems).toContain('public_commercial_consent_api')
  })

  it('blocks accidental public exposure of the signed receipt verifier', () => {
    const f = fixture()
    f.write('api/receipts.js',
      "ex" + "port { createMentoriaCommercialReceiptVerifier } from './_mentoriaCommercialReceiptVerifier.js'")
    expect(f.run().problems).toContain('public_commercial_consent_api')

    const g = fixture()
    g.write('src/lib/releaseReceipt.js',
      "ex" + "port { createMentoriaCommercialReceiptVerifier } from '../../api/_mentoriaCommercialReceiptVerifier.js'")
    expect(g.run().problems).toContain('commercial_optin_mounted_in_src')
  })

  it('blocks Vercel rewrites pointing to any consent endpoint', () => {
    const f = fixture()
    const config = JSON.parse(f.read('vercel.json'))
    config.rewrites = [{ source: '/mentoria-consent', destination: '/api/consent' }]
    f.write('vercel.json', JSON.stringify(config))
    expect(f.run().problems).toContain('public_commercial_consent_rewrite')
  })

  it('blocks accidental default enablement and browser-originated network calls', () => {
    const f = fixture()
    const path = 'src/components/MentoriaCommercialLeadOptInForm.jsx'
    f.write(path, f.read(path).replace('enabled = false', 'enabled = true'))
    expect(f.run().problems).toContain('commercial_form_default_enabled')
    f.write(path, f.read(path) + "\nfetch('/api/consent')\n")
    expect(f.run().problems).toContain('commercial_form_network_or_local_state')
  })

  it('blocks the generic permissive request guard or site-admin authentication', () => {
    const f = fixture()
    const path = 'api/_mentoriaCommercialConsentBoundary.js'
    f.write(path, f.read(path) + "\n" + "im" + "port { isOriginAllowed } from './_requestGuard.js'\n")
    expect(f.run().problems).toContain('commercial_boundary_trusted_ports_changed')
  })

  it('blocks a build script that omits the guard, including the deploy verification script', () => {
    const f = fixture()
    const data = JSON.parse(f.read('package.json'))
    data.scripts.build = data.scripts.build.replace(
      'node ./tools/check-mentoria-commercial-build-gate.mjs && ', '')
    data.scripts['verify:deploy'] = data.scripts['verify:deploy'].replace(
      'node ./tools/check-mentoria-commercial-build-gate.mjs && ', '')
    f.write('package.json', JSON.stringify(data))
    const result = f.run()
    expect(result.problems).toEqual(expect.arrayContaining([
      'build_script_gate_missing_build', 'build_script_gate_missing_verify_deploy',
    ]))
  })

  it('keeps ANALYZE=true on the actual Vite process, not just the preceding gate', () => {
    const f = fixture()
    const data = JSON.parse(f.read('package.json'))
    expect(data.scripts.analyze).toContain(
      'ANALYZE=true node ./tools/check-mentoria-commercial-build-gate.mjs && ANALYZE=true vite build')
    data.scripts.analyze = data.scripts.analyze.replace(
      ' && ANALYZE=true vite build', ' && vite build')
    f.write('package.json', JSON.stringify(data))
    expect(f.run().problems).toContain('build_script_gate_missing_analyze')
  })

  it('protects the direct Vite build through a Vite build plugin', () => {
    const f = fixture()
    const plugin = createMentoriaCommercialViteGatePlugin(f.root)
    expect(plugin.name).toBe('wg-mentoria-commercial-consent-build-gate')
    expect(plugin.apply).toBe('build')
    expect(() => plugin.configResolved({ command: 'serve' })).not.toThrow()
    expect(() => plugin.configResolved({ command: 'build' })).not.toThrow()

    f.write('src/App.jsx', "im" + "port MentoriaCommercialLeadOptInForm from './components/MentoriaCommercialLeadOptInForm.jsx'")
    expect(() => plugin.configResolved({ command: 'build' }))
      .toThrow(/BLOCKED: commercial_optin_mounted_in_src/)
  })

  it('blocks accidental removal of the direct-Vite plugin from vite.config.js', () => {
    const f = fixture()
    const config = f.read('vite.config.js')
    f.write('vite.config.js', config.replace(
      'createMentoriaCommercialViteGatePlugin(__dirname)', 'undefined'))
    expect(f.run().problems).toContain('direct_vite_build_gate_missing')
  })

  it('pins the Vercel Build Command to the guarded npm script, including when dashboard settings drift', () => {
    const f = fixture()
    const config = JSON.parse(f.read('vercel.json'))
    expect(config.buildCommand).toBe('npm run build')
    for (const alternate of [undefined, 'vite build', 'npx vite build', 'npm run build:local']) {
      const altered = { ...config }
      if (alternate === undefined) delete altered.buildCommand
      else altered.buildCommand = alternate
      f.write('vercel.json', JSON.stringify(altered))
      expect(f.run().problems).toContain('vercel_build_command_not_guarded')
    }
  })

  it('rejects legacy Vercel custom builders that could skip the guarded build command', () => {
    const f = fixture()
    const config = JSON.parse(f.read('vercel.json'))
    config.builds = [{ src: 'index.html', use: '@vercel/static' }]
    f.write('vercel.json', JSON.stringify(config))
    expect(f.run().problems).toContain('vercel_custom_builds_bypass_guard')
  })

  it('fails closed when a required source file disappears', () => {
    const f = fixture()
    const result = f.run()
    expect(result.ok).toBe(true)
    f.write('vercel.json', '{not valid json')
    expect(f.run()).toEqual({ ok: false, problems: ['unable_to_inspect_source'] })
  })
})
