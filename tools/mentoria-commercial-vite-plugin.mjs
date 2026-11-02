import { inspectMentoriaCommercialBuildGate } from './mentoria-commercial-build-gate-core.mjs'

/**
 * Independent Vite build enforcement. Direct Vite bypasses npm scripts but
 * cannot skip this plugin when the repository vite.config.js is loaded.
 * Precaution against accidental activation, NOT an access-control boundary
 * against a deliberate custom config.
 */
export function createMentoriaCommercialViteGatePlugin(root) {
  return {
    name: 'wg-mentoria-commercial-consent-build-gate',
    apply: 'build',
    configResolved(config) {
      if (config.command !== 'build') return
      const result = inspectMentoriaCommercialBuildGate(root)
      if (!result.ok) {
        throw new Error(
          '[mentoria-commercial-vite-gate] BLOCKED: ' + result.problems.join(', ')
        )
      }
      console.log('[mentoria-commercial-vite-gate] PASS: consent/OTP not mounted')
    },
  }
}
