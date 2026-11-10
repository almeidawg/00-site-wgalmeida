import { describe, expect, it } from 'vitest';
import { isPublicStoreConfigured } from '@/utils/storePublicReadiness';

const publicFixture = {
  VITE_WG_STORE_OFFERS_ENABLED: 'true',
  VITE_WG_STORE_PUBLIC_SUPABASE_URL: 'https://public-catalog.example.com',
  VITE_WG_STORE_PUBLIC_ANON_KEY: 'sb_publishable_test-only',
  VITE_WG_STORE_PUBLIC_ORG_ID: '123e4567-e89b-42d3-a456-426614174000',
};

describe('public Store readiness gate', () => {
  it('keeps the public storefront unavailable unless explicitly enabled', () => {
    expect(isPublicStoreConfigured({})).toBe(false);
    expect(isPublicStoreConfigured({ ...publicFixture, VITE_WG_STORE_OFFERS_ENABLED: 'false' })).toBe(false);
  });
  it('requires a complete public Supabase configuration', () => {
    for (const field of ['VITE_WG_STORE_PUBLIC_SUPABASE_URL', 'VITE_WG_STORE_PUBLIC_ANON_KEY', 'VITE_WG_STORE_PUBLIC_ORG_ID']) {
      expect(isPublicStoreConfigured({ ...publicFixture, [field]: undefined })).toBe(false);
    }
  });
  it('rejects secret keys and local/insecure destinations', () => {
    expect(isPublicStoreConfigured({ ...publicFixture, VITE_WG_STORE_PUBLIC_ANON_KEY: 'sb_secret_test-only' })).toBe(false);
    expect(isPublicStoreConfigured({ ...publicFixture, VITE_WG_STORE_PUBLIC_SUPABASE_URL: 'http://public-catalog.example.com' })).toBe(false);
    expect(isPublicStoreConfigured({ ...publicFixture, VITE_WG_STORE_PUBLIC_SUPABASE_URL: 'https://localhost' })).toBe(false);
    expect(isPublicStoreConfigured({ ...publicFixture, VITE_WG_STORE_PUBLIC_ORG_ID: 'wrong-tenant' })).toBe(false);
  });
  it('allows configured public affiliate catalogues', () => {
    expect(isPublicStoreConfigured(publicFixture)).toBe(true);
  });
});
