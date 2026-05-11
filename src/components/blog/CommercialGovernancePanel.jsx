import { AlertCircle, CalendarRange, CircleDollarSign, PackageCheck, ShieldCheck } from 'lucide-react';
import { getEditorialTheme } from '@/data/editorialThemes';
import { getCommercialPackages, resolveCommercialProfile } from '@/data/commercialGovernance';

const SectionBlock = ({ title, icon: Icon, children }) => (
  <div className="rounded-[22px] border border-black/6 bg-white p-5 shadow-sm">
    <div className="mb-3 flex items-center gap-2 text-[11px] font-light uppercase tracking-[0.16em] text-wg-gray">
      <Icon size={14} />
      {title}
    </div>
    <div className="space-y-2 text-[14px] font-light leading-[1.7] text-wg-gray">{children}</div>
  </div>
);

export default function CommercialGovernancePanel({ article, serviceId, packageFocusKey, compact = false }) {
  const profile = resolveCommercialProfile({
    ...(article || {}),
    commercialProfile: {
      ...(article?.commercialProfile || {}),
      ...(serviceId ? { serviceId } : {}),
      ...(packageFocusKey ? { packageFocus: packageFocusKey } : {}),
    },
  });

  if (!profile.service) return null;

  const theme = getEditorialTheme({ editorialThemeId: profile.service.nucleus });
  const packages = getCommercialPackages(profile.service.id);
  const activePackageKey =
    profile.packageFocus && profile.service.packages?.[profile.packageFocus]
      ? profile.packageFocus
      : packages[0]?.key;
  const activePackage = packages.find((entry) => entry.key === activePackageKey) || packages[0] || null;

  return (
    <section className={`rounded-[28px] border ${theme.calloutClass} p-5 md:p-6 ${compact ? '' : 'shadow-sm'}`.trim()}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-light uppercase tracking-[0.18em] text-wg-gray">Governanca editorial + comercial</p>
          <h2 className="mt-2 font-playfair text-[clamp(1.5rem,2vw,2rem)] font-light text-wg-black">
            {profile.service.label}
          </h2>
          <p className="mt-2 max-w-3xl text-[15px] font-light leading-[1.75] text-wg-gray">
            Faixas, escopos e prazos publicados nesta pagina seguem a base versionada oficial do projeto.
          </p>
        </div>
        <div className="rounded-2xl border border-black/6 bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-[10px] font-light uppercase tracking-[0.16em] text-wg-gray">Fonte de verdade</p>
          <p className="mt-1 text-sm font-light text-wg-black">{profile.sourceOfTruth}</p>
        </div>
      </div>

      <div className={`mt-6 grid gap-4 ${compact ? 'md:grid-cols-2' : 'xl:grid-cols-4'}`}>
        {packages.map((entry) => {
          const isActive = entry.key === activePackageKey;
          return (
            <article
              key={entry.key}
              className={`rounded-[24px] border bg-white p-5 shadow-sm transition-colors ${
                isActive ? 'border-black/15' : 'border-black/6'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className={`text-[11px] font-light uppercase tracking-[0.16em] ${isActive ? theme.iconClass : 'text-wg-gray'}`}>
                  {entry.label}
                </p>
                {isActive && <ShieldCheck size={14} className={theme.iconClass} />}
              </div>
              <p className="mt-3 text-lg font-light text-wg-black">{entry.rangeLabel}</p>
              <p className="mt-3 text-sm font-light leading-[1.65] text-wg-gray">{entry.summary}</p>
              {entry.timelineTypical && (
                <p className="mt-4 text-[12px] font-light uppercase tracking-[0.14em] text-wg-gray">
                  Prazo tipico: <span className="text-wg-black">{entry.timelineTypical}</span>
                </p>
              )}
            </article>
          );
        })}
      </div>

      {activePackage && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <SectionBlock title="Faixa de investimento" icon={CircleDollarSign}>
            <p>{activePackage.rangeLabel}</p>
            {activePackage.variation && <p>{activePackage.variation}</p>}
          </SectionBlock>

          <SectionBlock title="Prazo estimado" icon={CalendarRange}>
            {activePackage.timelineBase && <p>Prazo base: {activePackage.timelineBase}.</p>}
            {activePackage.timelineTypical && <p>Faixa tipica: {activePackage.timelineTypical}.</p>}
            {activePackage.timelineDependencies?.length > 0 && (
              <p>Dependencias: {activePackage.timelineDependencies.join(', ')}.</p>
            )}
            {activePackage.timelineFactors?.length > 0 && (
              <p>Fatores de variacao: {activePackage.timelineFactors.join(', ')}.</p>
            )}
          </SectionBlock>

          <SectionBlock title="O que esta incluso" icon={PackageCheck}>
            <ul className="list-disc space-y-1 pl-5">
              {activePackage.includes.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </SectionBlock>

          <SectionBlock title="O que pode variar" icon={AlertCircle}>
            <ul className="list-disc space-y-1 pl-5">
              {profile.service.variationFactors.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </SectionBlock>

          <SectionBlock title="Ideal para quem" icon={ShieldCheck}>
            <p>{activePackage.idealFor}</p>
          </SectionBlock>

          <SectionBlock title="Observacoes importantes" icon={AlertCircle}>
            <ul className="list-disc space-y-1 pl-5">
              {profile.service.observations.map((item) => <li key={item}>{item}</li>)}
              {activePackage.excludes?.length > 0 && (
                <li>Fora do escopo: {activePackage.excludes.join(', ')}.</li>
              )}
            </ul>
          </SectionBlock>
        </div>
      )}
    </section>
  );
}
