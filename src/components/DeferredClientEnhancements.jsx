import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Toaster } from '@/components/ui/toaster';

export default function DeferredClientEnhancements() {
  return (
    <>
      <Toaster />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
