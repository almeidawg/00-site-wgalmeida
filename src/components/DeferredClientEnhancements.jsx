import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Toaster } from '@/components/ui/toaster';
import { isMentoriaPrelaunchTrackingBlocked, isMentoriaPrelaunchRoute } from '@/lib/analytics';

const isLocalRuntime = () => {
  if (typeof window === 'undefined') return true;
  const { hostname, protocol } = window.location;
  // Acessos por IP não devem carregar rastreadores da Vercel.
  return protocol === 'file:' || hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
};

export default function DeferredClientEnhancements() {
  const shouldLoadVercelInsights = !isLocalRuntime() &&
    !isMentoriaPrelaunchTrackingBlocked(typeof window === 'undefined' ? '' : window.location.hostname) &&
    !isMentoriaPrelaunchRoute(typeof window === 'undefined' ? '' : window.location.pathname);

  return (
    <>
      <Toaster />
      {shouldLoadVercelInsights && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </>
  );
}
