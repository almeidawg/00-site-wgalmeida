import { createClient } from '@supabase/supabase-js';

// Adaptador opt-in e read-only. Nunca usa a chave de service_role no browser.
const config = () => ({
  url: import.meta.env.VITE_WG_STORE_PUBLIC_SUPABASE_URL,
  key: import.meta.env.VITE_WG_STORE_PUBLIC_ANON_KEY,
  org: import.meta.env.VITE_WG_STORE_PUBLIC_ORG_ID,
});

function publicClient() {
  const { url, key, org } = config();
  if (!url || !key || !/^[0-9a-f-]{36}$/i.test(org || '')) {
    throw new Error('WG Store: origem comercial publica nao configurada.');
  }
  return { client: createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }), org };
}

export const publishedOffersEnabled = () => import.meta.env.VITE_WG_STORE_OFFERS_ENABLED === 'true';

// MVP aprovado pelo owner: vitrine afiliada apenas, sem checkout proprio/dropshipping.
// Links de redes nao verificadas continuam bloqueados pelo gate upstream de publicacao.
function safeAffiliateLink(value) {
  if (typeof value !== 'string' || value.length > 2048 || /\s/.test(value)) return null;
  try {
    const link = new URL(value);
    if (link.protocol !== 'https:' || !link.hostname || link.username || link.password) return null;
    // Links de afiliado devem usar dominio, nunca IP literal, localhost ou DNS interno.
    // A autorizacao do dominio/parceiro continua sob controle do backend.
    if (link.hostname === 'localhost' || link.hostname.endsWith('.localhost') ||
        link.hostname.endsWith('.local') || link.hostname.endsWith('.internal') ||
        /^\d+\.\d+\.\d+\.\d+$/.test(link.hostname) || link.hostname.startsWith('[')) return null;
    return link.href;
  } catch {
    return null;
  }
}

function isEligiblePublicAffiliateRow(offer, org) {
  return offer?.org_id === org && offer?.mode === 'affiliate' &&
    typeof offer.id === 'string' && typeof offer.sku === 'string' &&
    typeof offer.title === 'string' && Boolean(offer.id && offer.sku && offer.title) &&
    ['BRL', 'USD', 'EUR'].includes(offer.currency) &&
    (offer.price_minor == null ||
      (Number.isSafeInteger(offer.price_minor) && offer.price_minor >= 0)) &&
    Boolean(safeAffiliateLink(offer.offer_url));
}

export function normalizePublicOffer(offer) {
  if (!offer?.id || !offer?.title || !offer?.sku) throw new Error('Oferta publica invalida.');
  const currency = ['BRL','USD','EUR'].includes(offer.currency) ? offer.currency : 'USD';
  const amount = typeof offer.price_minor === 'number' && offer.price_minor >= 0 ? offer.price_minor : null;
  const affiliateLink = offer.mode === 'affiliate' ? safeAffiliateLink(offer.offer_url) : null;
  const hasAffiliateLink = Boolean(affiliateLink);
  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency });
  const variant = {
    id: 'offer-' + offer.id, title: offer.title, sku: offer.sku, image_url: offer.image_url,
    price_in_cents: amount, price_formatted: amount == null ? 'Consulte o fornecedor' : fmt.format(amount / 100),
    sale_price_in_cents: null, sale_price_formatted: null, currency,
    manage_inventory: true, inventory_quantity: 0, options: [],
  };
  return {
    id: offer.id, title: offer.title, subtitle: offer.supplier_name || '',
    ribbon_text: hasAffiliateLink ? 'Oferta parceira' : null,
    description: offer.description || '', image: offer.image_url || null,
    price_in_cents: amount, currency, purchasable: false, order: 0,
    images: offer.image_url ? [{ url: offer.image_url, order: 0, type: 'main' }] : [],
    variants: [variant], options: [],
    collections: [{ product_id: offer.id, collection_id: offer.category || 'Geral', order: 0 }],
    type: { value: 'produto' }, mode: offer.mode,
    external_link: affiliateLink,
    supplier_name: offer.supplier_name || null, countries: offer.countries || [],
    updated_at: null,
    // Nunca conter comissao/custo interno/PII no retorno publico.
  };
}

export async function loadPublicOffers() {
  const { client, org } = publicClient();
  const { data, error } = await client.from('wg_store_public_offers')
    .select('id,org_id,sku,title,description,category,mode,supplier_name,image_url,currency,price_minor,countries,offer_url')
    .eq('org_id', org).eq('mode', 'affiliate').order('title', { ascending: true });
  if (error) throw new Error('A consulta publica da WG Store falhou.');
  // Defesa adicional: nunca confiar apenas nos filtros do servidor/SDK.
  // Uma linha de outro tenant, venda propria ou sem link valido nao entra no MVP.
  if (!Array.isArray(data) && data != null) throw new Error('Resposta publica invalida da WG Store.');
  const products = (data || []).filter(offer => isEligiblePublicAffiliateRow(offer, org))
    .map(normalizePublicOffer);
  return { count: products.length, offset: 0, limit: products.length, products };
}

export async function loadPublicOffer(id) {
  const { client, org } = publicClient();
  const { data, error } = await client.from('wg_store_public_offers')
    .select('id,org_id,sku,title,description,category,mode,supplier_name,image_url,currency,price_minor,countries,offer_url')
    .eq('org_id', org).eq('id', id).eq('mode', 'affiliate').maybeSingle();
  if (error || !isEligiblePublicAffiliateRow(data, org) || data.id !== id) {
    throw new Error('Oferta publica nao encontrada.');
  }
  return normalizePublicOffer(data);
}

export async function loadPublicCategories() {
  const { products } = await loadPublicOffers();
  const titles = [...new Set(products.map(p=>p.collections[0].collection_id))];
  return { categories: titles.map(title=>({ id: title, title })), count: titles.length };
}
