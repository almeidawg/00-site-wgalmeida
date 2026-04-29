import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackScrollDepth } from '@/lib/analytics'

const DEPTH_MARKS = [25, 50, 75, 90]

export default function AnalyticsEvents() {
  const location = useLocation()

  useEffect(() => {
    const fired = new Set()

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable <= 0) return

      const depth = Math.round((window.scrollY / scrollable) * 100)
      DEPTH_MARKS.forEach((mark) => {
        if (depth >= mark && !fired.has(mark)) {
          fired.add(mark)
          trackScrollDepth({ depth: mark, context: location.pathname })
        }
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.requestAnimationFrame(onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [location.pathname])

  return null
}
