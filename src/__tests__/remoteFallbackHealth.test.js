import { describe, expect, it } from 'vitest';
import { classifyRemoteFallbackHealth } from '../../tools/remote-fallback-health.mjs';

describe('remote fallback health classification', () => {
  it('distinguishes retired, reachable, confirmed broken and unverified states', () => {
    expect(classifyRemoteFallbackHealth({ configured: false })).toBe('retired');
    expect(classifyRemoteFallbackHealth({ configured: true, reachable: true, status: 200 })).toBe('reachable');
    expect(classifyRemoteFallbackHealth({ configured: true, status: 404 })).toBe('broken');
    expect(classifyRemoteFallbackHealth({ configured: true, status: 0, error: 'fetch failed' })).toBe('unverified');
  });
});
