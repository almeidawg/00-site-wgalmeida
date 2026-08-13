import { Activity, BarChart3, CheckCircle2, RefreshCcw, ShieldCheck, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const MetricCard = ({ label, value, helper, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
    <div className="mb-3 flex items-center justify-between">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <Icon size={18} className="text-blue-400" />
    </div>
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{helper}</p>
  </div>
);

export default function AdminConversionMetrics() {
  const { session } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);

  const loadMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/conversion-metrics?days=${days}`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Falha ao carregar métricas (${response.status})`);
      setMetrics(data);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar as métricas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [days]);

  const totals = metrics?.totals || {};
  const contexts = metrics?.byContext || {};
  const daily = metrics?.daily || [];
  const maxDaily = Math.max(1, ...daily.map((item) => item.total || 0));

  return (
    <div className="space-y-8 p-8 pb-20">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
            <BarChart3 className="text-blue-500" size={24} /> Conversão & Observabilidade
          </h2>
          <p className="mt-1 text-sm text-slate-400">Indicadores agregados do intake do site, sem exposição de PII.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            aria-label="Período das métricas"
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-200"
          >
            <option value={7}>7 dias</option>
            <option value={30}>30 dias</option>
            <option value={90}>90 dias</option>
          </select>
          <button type="button" onClick={loadMetrics} aria-label="Atualizar métricas" className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-400 hover:text-white">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Intakes persistidos" value={loading ? '—' : totals.persistedSubmissions ?? 0} helper={`Chaves duráveis dos últimos ${days} dias`} icon={Activity} />
        <MetricCard label="Salvas" value={loading ? '—' : totals.saved ?? 0} helper={`${Math.round((totals.saveRate || 0) * 100)}% das tentativas persistidas`} icon={CheckCircle2} />
        <MetricCard label="Promoções" value={loading ? '—' : totals.promotionCompleted ?? 0} helper={`${totals.leadPromotions ?? 0} promoções registradas no lifecycle`} icon={TrendingUp} />
        <MetricCard label="Privacidade" value="PII 0" helper="Endpoint retorna somente agregados" icon={ShieldCheck} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-slate-300">Origem funcional</h3>
          <div className="space-y-4">
            {['moodboard', 'contact', 'buildtech', 'other'].map((key) => {
              const value = contexts[key] || 0;
              const total = Math.max(1, totals.persistedSubmissions || 0);
              return (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-xs"><span className="capitalize text-slate-400">{key}</span><span className="font-mono text-slate-200">{value}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-950"><div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, (value / total) * 100)}%` }} /></div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
          <h3 className="mb-5 text-sm font-bold uppercase tracking-widest text-slate-300">Volume diário</h3>
          {daily.length === 0 ? (
            <p className="text-sm text-slate-500">Sem submissões agregadas no período.</p>
          ) : (
            <div className="flex h-48 items-end gap-2 overflow-x-auto" aria-label="Volume diário de submissões">
              {daily.map((item) => (
                <div key={item.date} className="flex min-w-10 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{item.total}</span>
                  <div className="w-full rounded-t bg-blue-500/80" style={{ height: `${Math.max(8, (item.total / maxDaily) * 140)}px` }} title={`${item.date}: ${item.total}`} />
                  <span className="text-[9px] text-slate-600">{item.date.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <p className="text-xs text-slate-600">Fonte: chaves de idempotência e promoções do lifecycle. Rejeições e duplicatas permanecem nos logs estruturados da Vercel e não são inferidas neste painel. O endpoint não consulta nome, e-mail, telefone ou mensagem.</p>
    </div>
  );
}
