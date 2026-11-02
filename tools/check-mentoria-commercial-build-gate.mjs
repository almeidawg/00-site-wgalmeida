import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inspectMentoriaCommercialBuildGate } from './mentoria-commercial-build-gate-core.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const decision = inspectMentoriaCommercialBuildGate(root)
if (!decision.ok) {
  console.error('[mentoria-commercial-build-gate] BLOCKED: ' + decision.problems.join(', '))
  process.exitCode = 2
} else {
  console.log('[mentoria-commercial-build-gate] PASS: consent/OTP still unmounted')
}
