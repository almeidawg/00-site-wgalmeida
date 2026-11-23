import { describe, expect, it, vi } from 'vitest';
import { supabase } from '@/lib/customSupabaseClient';
import { getProducts, getCategories, getProductQuantities, initializeCheckout } from '@/api/EcommerceApi';

vi.mock('@/lib/customSupabaseClient', () => ({ supabase: { from: vi.fn() } }));
import { classifyRemoteFallbackHealth } from '../../tools/remote-fallback-health.mjs';

describe('remote fallback health classification', () => {
  it('distinguishes retired, reachable, confirmed broken and unverified states', () => {
    expect(classifyRemoteFallbackHealth({ configured: false })).toBe('retired');
    expect(classifyRemoteFallbackHealth({ configured: true, reachable: true, status: 200 })).toBe('reachable');
    expect(classifyRemoteFallbackHealth({ configured: true, status: 404 })).toBe('broken');
    expect(classifyRemoteFallbackHealth({ configured: true, status: 0, error: 'fetch failed' })).toBe('unverified');
  });

  it('does not invent WGEasy stock quantities', async () => {
    const response = await getProductQuantities({ fields: 'inventory_quantity', product_ids: ['produto-1'] });
    expect(response.variants).toEqual([{ id: 'variant-produto-1', inventory_quantity: 0 }]);
  });

  it('does not charge through Hostinger for WGEasy products', async () => {
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);
    await expect(initializeCheckout({ items: [{ variant_id: 'variant-produto-1', quantity: 1 }] }))
      .rejects.toThrow('Checkout bloqueado');
    expect(spy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('derives unique category filters from active WG Easy products without querying missing category tables', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{ categoria: 'Iluminação' }, { categoria: 'Marcenaria' }, { categoria: 'Iluminação' }, { categoria: null }],
      error: null,
    });
    const query = { eq: vi.fn().mockReturnThis(), order };
    supabase.from.mockClear();
    supabase.from.mockReturnValue({ select: vi.fn().mockReturnValue(query) });

    const result = await getCategories();
    expect(supabase.from).toHaveBeenCalledWith('pricelist_itens');
    expect(supabase.from).not.toHaveBeenCalledWith('pricelist_categorias');
    expect(query.eq).toHaveBeenCalledWith('tipo', 'produto');
    expect(query.eq).toHaveBeenCalledWith('ativo', true);
    expect(result.categories.map((category) => category.id)).toEqual(['Iluminação', 'Marcenaria']);
    expect(result.count).toBe(2);
  });

  it('does not switch to another catalog when WGEasy lookup fails', async () => {
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);
    const order = vi.fn().mockResolvedValue({ error: { message: 'schema drift' }, data: null });
    const eq = vi.fn().mockReturnThis();
    supabase.from.mockReturnValue({ select: () => ({ eq, order }) });
    await expect(getProducts()).rejects.toThrow('Catalogo WGEasy indisponivel');
    expect(spy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
