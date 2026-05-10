import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink, MessageCircle } from 'lucide-react'
import { useNextBestAction } from '@/hooks/useNextBestAction'

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

export default function SmartCTA({ className = '', showSecondary = false }) {
  const action = useNextBestAction()
  const Icon = action.external ? ExternalLink : ArrowRight

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        {action.reason && (
          <p className="max-w-2xl text-sm font-light leading-relaxed text-wg-gray">
            {action.reason}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <CTALink
          href={action.href}
          external={action.external}
          className="wg-cta-canonical wg-cta-canonical-primary"
        >
          {action.label}
          <Icon className="w-4 h-4" />
        </CTALink>

        {showSecondary && action.secondary && (
          <CTALink
            href={action.secondary.href}
            external={action.secondary.external}
            className="wg-cta-canonical"
          >
            {action.secondary.label}
            {action.secondary.external && <ExternalLink className="w-3 h-3 opacity-60" />}
          </CTALink>
        )}

        <CTALink
          href={action.manual.href}
          external={action.manual.external}
          className="wg-cta-canonical"
        >
          {action.manual.label}
          <MessageCircle className="w-4 h-4" />
        </CTALink>
      </div>
    </div>
  )
}
