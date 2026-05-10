import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, ArrowRight, MessageSquare, Compass, CircleDot } from 'lucide-react'
import { useNextBestAction } from '@/hooks/useNextBestAction'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from '@/lib/motion-lite'

const STAGE_CONFIG = {
  exploracao: {
    label: 'Sugestão de Jornada',
    icon: Compass,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  },
  decisao: {
    label: 'Apoio à Decisão',
    icon: CircleDot,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10'
  },
  acao: {
    label: 'Ação Recomendada',
    icon: MessageSquare,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10'
  },
}

// Routes where we hide the panel
const SUPPRESSED_PATHS = ['/solicite-proposta', '/login', '/register', '/admin', '/moodboard', '/room-visualizer', '/faq', '/success']

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

  useEffect(() => {
    setDismissed(false)
  }, [location.pathname])

  useEffect(() => {
    if (score >= 40 && !dismissed) {
      const t = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(t)
    }
    setVisible(false)
  }, [score, dismissed])

  const suppressed = SUPPRESSED_PATHS.some((p) => location.pathname.startsWith(p))
  if (suppressed || score < 40) return null

  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.exploracao
  const MainIcon = config.icon

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md"
        >
          <div className="relative group overflow-hidden bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] p-2">
            
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="relative flex items-center gap-4 px-4 py-3">
              {/* Liz/Assistant Avatar - Concierge Feel */}
              <div className="shrink-0 relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-white/10 flex items-center justify-center shadow-inner overflow-hidden">
                   <img 
                    src="/images/icone.webp" 
                    alt="Assistente de jornada WG" 
                    className="w-7 h-7 object-contain opacity-80 group-hover:scale-110 transition-transform duration-500" 
                   />
                </div>
                {/* Status Dot */}
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-lg" />
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${config.color}`}>
                    {config.label}
                  </span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                
                <h4 className="text-[13px] text-slate-200 font-medium leading-snug mb-1.5">
                  {label}
                </h4>

                <div className="flex items-center gap-4">
                   <CTALink
                    href={href}
                    external={external}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-blue-400 transition-colors group/link"
                  >
                    Prosseguir <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                  </CTALink>

                  {secondary && (
                    <CTALink
                      href={secondary.href}
                      external={secondary.external}
                      className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {secondary.label}
                    </CTALink>
                  )}
                </div>
              </div>

              {/* Close/Dismiss */}
              <button
                onClick={() => setDismissed(true)}
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Ignorar recomendação"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Animated Shine Effect */}
            <div className="absolute top-[-100%] left-[-100%] w-1/2 h-[300%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-[35deg] group-hover:animate-shine pointer-events-none" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
