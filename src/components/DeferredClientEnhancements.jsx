import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Toaster } from '@/components/ui/toaster';

const isLocalRuntime = () => {
  if (typeof window === 'undefined') return true;
  const { hostname, protocol } = window.location;
  return protocol === 'file:' || hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
};

export default function DeferredClientEnhancements() {
  const shouldLoadVercelInsights = !isLocalRuntime();

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
