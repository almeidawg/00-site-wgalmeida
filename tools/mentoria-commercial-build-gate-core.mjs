import { readFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

/**
 * Offline, dependency-free build gate for UNRELEASED Mentoria commercial opt-in.
 * Runs before package.json build scripts; does NOT approve a release or
 * authenticate the lead. Only an owner-gated audited release may replace it.
 *
 * The check is intentionally conservative. A future opt-in launch must
 * explicitly update this gate with real evidence and full regression tests.
 */
const FORBIDDEN_IMPORT = /MentoriaCommercialLeadOptInForm|mentoriaCommercialLeadConsent|_mentoriaCommercialConsentBoundary|_mentoriaCommercialReceiptVerifier/
const FORBIDDEN_PUBLIC_ROUTE = /mentoria[^"'\s]*(?:consent|opt.?in|otp|verify|verifica)|(?:consent|opt.?in|otp|verifica)[^"'\s]*mentoria|commercialconsentboundary/i
const BUILD_GATE_COMMAND = 'node ./tools/check-mentoria-commercial-build-gate.mjs'
const FILE_EXT = /\.(?:js|jsx|mjs|cjs|ts|tsx)$/
const PROTECTED_SCRIPTS = [
  'build', 'build:local', 'analyze', 'seo:validate:fresh',
  'smoke:console:fresh', 'verify:full', 'verify:deploy', 'prepush',
]

export function inspectMentoriaCommercialBuildGate(root) {
  const problems = []
  const fail = (reason) => problems.push(reason)
  const read = (path) => readFileSync(resolve(root, path), 'utf8')

  const walk = (folder, handle) => {
    for (const entry of readdirSync(resolve(root, folder), { withFileTypes: true })) {
      if (entry.isSymbolicLink()) {
        fail('symbolic_link_in_scan')
        continue
      }
      const path = join(folder, entry.name).replaceAll('\\', '/')
      if (entry.isDirectory()) {
        if (entry.name !== '__tests__' && entry.name !== '__snapshots__') walk(path, handle)
      } else if (entry.isFile() && FILE_EXT.test(entry.name)) {
        handle(path, entry.name)
      }
    }
  }

  try {
    for (const required of [
      'src/components/MentoriaCommercialLeadOptInForm.jsx',
      'src/lib/mentoriaCommercialLeadConsent.js',
      'api/_mentoriaCommercialConsentBoundary.js',
      'api/_mentoriaCommercialReceiptVerifier.js',
    ]) {
      if (!read(required)) fail('missing_required_contract')
    }

    // Treat import/re-export anywhere in actual application code as a
    // release-blocking change, even when it is not a top-level App import.
    walk('src', (path) => {
      if (path === 'src/components/MentoriaCommercialLeadOptInForm.jsx' ||
          path === 'src/lib/mentoriaCommercialLeadConsent.js') return
      if (FORBIDDEN_IMPORT.test(read(path))) fail('commercial_optin_mounted_in_src')
    })
    if (FORBIDDEN_IMPORT.test(read('index.html'))) fail('commercial_optin_mounted_in_html')

    walk('api', (path, name) => {
      // An underscored file is a helper, NOT a Vercel Function by default.
      // A public file must not refer to commercial opt-in even under aliases.
      if (name.startsWith('_')) return
      if (FORBIDDEN_PUBLIC_ROUTE.test(path) ||
          FORBIDDEN_IMPORT.test(read(path))) fail('public_commercial_consent_api')
    })

    const config = JSON.parse(read('vercel.json'))
    // Pin the deployment build to the guarded npm entrypoint even if the
    // Vercel dashboard override drifts. vercel.json takes precedence.
    if (config.buildCommand !== 'npm run build') fail('vercel_build_command_not_guarded')
    // Legacy custom builders can replace the normal framework build process.
    if (Object.hasOwn(config, 'builds')) fail('vercel_custom_builds_bypass_guard')
    const routes = [
      ...(config.rewrites || []),
      ...(config.redirects || []),
      ...(config.routes || []),
    ]
    if (routes.some((x) => FORBIDDEN_PUBLIC_ROUTE.test(JSON.stringify(x)))) {
      fail('public_commercial_consent_rewrite')
    }

    const form = read('src/components/MentoriaCommercialLeadOptInForm.jsx')
    const consent = read('src/lib/mentoriaCommercialLeadConsent.js')
    const boundary = read('api/_mentoriaCommercialConsentBoundary.js')
    if (!/enabled\s*=\s*false/.test(form)) fail('commercial_form_default_enabled')
    if (!/notice\.text/.test(form) ||
        /fetch\s*\(|localStorage\./.test(form)) fail('commercial_form_network_or_local_state')
    if (!consent.includes('mentoria_commercial_contact')) fail('commercial_purpose_not_scoped')
    if (/from ['"].*_requestGuard|from ['"].*_adminAuth|fetch\s*\(|twilio\.com|SUPABASE_SERVICE|createClient\(/.test(boundary) ||
        !boundary.includes('deps.authenticateLeadSession') ||
        !boundary.includes('deps.beginChallenge') ||
        !boundary.includes('deps.confirmChallenge')) {
      fail('commercial_boundary_trusted_ports_changed')
    }

    // Scripts alone do not protect an operator invoking Vite directly.
    // Keep a second guard installed in this project's Vite configuration.
    const viteConfig = read('vite.config.js')
    if (!viteConfig.includes('import { createMentoriaCommercialViteGatePlugin }') ||
        !/createMentoriaCommercialViteGatePlugin\(\s*__dirname\s*\)/.test(viteConfig)) {
      fail('direct_vite_build_gate_missing')
    }

    const scripts = JSON.parse(read('package.json')).scripts
    for (const name of PROTECTED_SCRIPTS) {
      const body = scripts?.[name]
      if (typeof body !== 'string' || !body.includes('vite build') ||
          !body.includes(BUILD_GATE_COMMAND + ' && vite build')) {
        fail('build_script_gate_missing_' + name.replaceAll(':', '_'))
      }
    }
  } catch {
    // No path, source or environmental details leaked in CI logs.
    fail('unable_to_inspect_source')
  }
  return { ok: problems.length === 0, problems: [...new Set(problems)] }
}
