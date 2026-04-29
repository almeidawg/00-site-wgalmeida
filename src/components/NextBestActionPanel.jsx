import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useNextBestAction } from '@/hooks/useNextBestAction'
import { useLocation } from 'react-router-dom'

const STAGE_LABELS = {
  exploracao: 'Explorando opções',
  decisao: 'Próximo de decidir',
  acao: 'Pronto para agir',
}

const STAGE_COLOR = {
  exploracao: 'bg-wg-orange/10 text-wg-orange',
  decisao: 'bg-wg-blue/10 text-wg-blue',
  acao: 'bg-green-100 text-green-700',
}

// Routes where we hide the panel to avoid double CTA noise
const SUPPRESSED_PATHS = ['/solicite-proposta', '/login', '/register', '/admin', '/moodboard']

function CTALink({ href, external, className, children }) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return <Link to={href} className={className}>{children}</Link>
}

export default function NextBestActionPanel() {
  const { href, label, external, secondary, score, stage } = useNextBestAction()
  const location = useLocation()
  const [dismissed, setDismissed] = useState(false)
  const [visible, setVisible] = useState(false)

  // Reset dismiss when route changes so panel can re-evaluate
  useEffect(() => {
    setDismissed(false)
  }, [location.pathname])

  // Animate in when score crosses threshold
  useEffect(() => {
    if (score >= 40 && !dismissed) {
      const t = setTimeout(() => setVisible(true), 600)
      return () => clearTimeout(t)
    }
    setVisible(false)
  }, [score, dismissed])

  const suppressed = SUPPRESSED_PATHS.some((p) => location.pathname.startsWith(p))
  if (suppressed || !visible || score < 40) return null

  const Icon = external ? ExternalLink : ArrowRight
  const stageLabel = STAGE_LABELS[stage] || STAGE_LABELS.exploracao
  const stageClass = STAGE_COLOR[stage] || STAGE_COLOR.exploracao

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-sm
                 bg-white/96 border border-black/[0.08] rounded-2xl shadow-[0_14px_36px_rgba(30,24,20,0.12)]
                 px-3.5 py-3 flex items-center gap-3 backdrop-blur-md
                 animate-in slide-in-from-bottom-4 fade-in duration-300"
      role="complementary"
      aria-label="Próximo passo recomendado"
    >
      {/* Icon */}
      <div className="shrink-0 w-8 h-8 rounded-lg bg-wg-orange/10 text-wg-orange flex items-center justify-center">
        <CheckCircle2 className="w-3.5 h-3.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-light uppercase tracking-[0.12em] ${stageClass}`}>
          {stageLabel}
        </span>
        <CTALink
          href={href}
          external={external}
          className="mt-0.5 flex items-center gap-1.5 text-[13px] font-light leading-tight text-wg-black hover:text-wg-orange transition-colors truncate"
        >
          {label}
          <Icon className="w-3 h-3 shrink-0" />
        </CTALink>
        {secondary && (
          <CTALink
            href={secondary.href}
            external={secondary.external}
            className="text-[10.5px] text-wg-gray hover:text-wg-orange transition-colors"
          >
            {secondary.label}
          </CTALink>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-black/30 hover:text-black/60 hover:bg-black/5 transition-colors"
        aria-label="Fechar"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}
