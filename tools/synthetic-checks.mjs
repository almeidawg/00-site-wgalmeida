const baseUrl = process.env.SYNTHETIC_BASE_URL || 'https://wgalmeida.com.br'

const criticalRoutes = [
  '/api/health',
  '/buildtech',
  '/buildtech/solucoes.html',
  '/buildtech/metodo.html',
  '/buildtech/contato.html',
  '/clientes/umauma',
  '/contato?context=buildtech',
]

const timeout = (ms) =>
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms)
  })

const checkRoute = async (route) => {
  const startedAt = Date.now()
  const response = await Promise.race([
    fetch(new URL(route, baseUrl), { redirect: 'follow' }),
    timeout(15000),
  ])
  const durationMs = Date.now() - startedAt

  if (!response.ok) {
    throw new Error(`${route} returned HTTP ${response.status}`)
  }

  return { route, status: response.status, durationMs }
}

const results = []

for (const route of criticalRoutes) {
  try {
    results.push(await checkRoute(route))
  } catch (error) {
    results.push({ route, error: error.message })
  }
}

console.table(results)

const failures = results.filter((result) => result.error)
if (failures.length) {
  console.error(`Synthetic checks failed: ${failures.length}`)
  process.exit(1)
}
