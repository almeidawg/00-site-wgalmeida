import { useState } from 'react'

const money = (value) =>
  Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

export default function WGEasyEstimateCalculator() {
  const [area, setArea] = useState('80')
  const [standard, setStandard] = useState('equilibrado')
  const [uf, setUf] = useState('SP')
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState('idle')

  const calculate = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setResult(null)
    try {
      const params = new URLSearchParams({ area, standard, uf })
      const response = await fetch(`/api/wgeasy-public-estimate?${params}`)
      const payload = await response.json()
      if (!response.ok || !payload.ok) throw new Error(payload.error)
      setResult(payload)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={calculate} className="rounded-2xl border border-wg-orange/30 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-inter font-light text-wg-black">Calculadora pública de referência</h2>
      <p className="mt-2 text-wg-gray">
        A estimativa consulta a base pública versionada do ICCRI e do WG Easy. Ela não substitui orçamento técnico.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm text-wg-gray">
          Área (m²)
          <input required type="number" min="1" max="100000" value={area} onChange={(e) => setArea(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-base text-wg-black" />
        </label>
        <label className="flex flex-col gap-2 text-sm text-wg-gray">
          Padrão
          <select value={standard} onChange={(e) => setStandard(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-base text-wg-black">
            <option value="basico">Básico</option>
            <option value="essencial">Essencial</option>
            <option value="equilibrado">Equilibrado</option>
            <option value="superior">Superior</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm text-wg-gray">
          Estado
          <select value={uf} onChange={(e) => setUf(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-base text-wg-black">
            <option value="SP">São Paulo</option>
          </select>
        </label>
      </div>
      <button type="submit" disabled={status === 'loading'}
        className="mt-5 rounded-lg bg-wg-orange px-5 py-3 text-white disabled:opacity-60">
        {status === 'loading' ? 'Consultando base...' : 'Calcular faixa estimada'}
      </button>
      <div aria-live="polite" className="mt-5 rounded-xl bg-wg-black p-5 text-white">
        {status === 'idle' && <p className="text-white/75">Preencha os dados e consulte a faixa.</p>}
        {status === 'error' && <p>Base pública indisponível. Nenhum preço antigo foi usado como substituto.</p>}
        {result && (
          <>
            <p className="text-sm text-white/70">{result.area} m², {result.standard.label}, {result.region.label}</p>
            <p className="mt-1 text-2xl font-light">
              {money(result.total.minimum)} a {money(result.total.maximum)}
            </p>
            <p className="mt-2 text-sm text-white/70">
              Faixa provável: {money(result.total.likely)}. Referência: {result.referenceDate}.
            </p>
            <p className="mt-2 text-xs text-white/60">{result.disclaimer}</p>
          </>
        )}
      </div>
    </form>
  )
}
