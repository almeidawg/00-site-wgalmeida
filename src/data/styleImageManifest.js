import { PRODUCT_URLS } from './companyPublic.js';
import { buildCloudinaryEditorialUrl } from '../utils/cloudinaryEditorial.js';
import { withBasePath } from '../utils/assetPaths.js';

const STYLE_UPLOAD_STORAGE_KEY = 'wg_blog_editorial_uploads_v1';
const STYLE_UNSPLASH_STORAGE_KEY = 'wg_blog_editorial_unsplash_v1';

const readLocalStyleUploads = () => {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(window.localStorage.getItem(STYLE_UPLOAD_STORAGE_KEY) || '{}'); } catch { return {}; }
};

const readLocalStyleUnsplashSelections = () => {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(window.localStorage.getItem(STYLE_UNSPLASH_STORAGE_KEY) || '{}'); } catch { return {}; }
};

export const STYLE_IMAGE_MANIFEST = {
  'art-deco': { src: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80', alt: 'Pinterest Art Deco Aesthetic' },
  'art-nouveau': { src: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80', alt: 'Aesthetic Art Nouveau Curves' },
  boho: { src: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1600&q=80', alt: 'Pinterest Boho Dream' },
  classico: { src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80', alt: 'Classic Luxe Interior' },
  coastal: { src: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1600&q=80', alt: 'Pinterest Coastal Living' },
  contemporaneo: { src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80', alt: 'Sleek Contemporary Pinterest' },
  cottage: { src: '', alt: 'Cozy Cottage Vibe' },
  ecletico: { src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=80', alt: 'Curated Eclectic Aesthetic' },
  escandinavo: { src: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1600&q=80', alt: 'Pinterest Nordic Light' },
  farmhouse: { src: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1600&q=80', alt: 'Modern Farmhouse Inspiration' },
  glam: { src: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80', alt: 'High-End Glamour Pinterest' },
  hampton: { src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80', alt: 'Aesthetic Hamptons Home' },
  'hollywood-regency': { src: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1600&q=80', alt: 'Hollywood Bold Luxe' },
  industrial: { src: '', alt: 'Pinterest Industrial Aesthetic' },
  japandi: { src: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1600&q=80', alt: 'Japandi Harmony Vibe' },
  maximalista: { src: 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&w=1600&q=80', alt: 'Pinterest Maximalist Color' },
  mediterraneo: { src: '', alt: 'Mediterranean White Vibe' },
  'mid-century': { src: '', alt: 'Pinterest Mid-Century Modern' },
  minimalismo: { src: '', alt: 'Pure Minimalist Aesthetic' },
  moderno: { src: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80', alt: 'Sleek Modern Pinterest' },
  neoclassico: { src: '', alt: 'Neoclassic Grandeur' },
  provencal: { src: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1600&q=80', alt: 'Aesthetic Provencal Home' },
  rustico: { src: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1600&q=80', alt: 'Pinterest Warm Rustic' },
  'shabby-chic': { src: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1600&q=80', alt: 'Shabby Chic Elegance' },
  southwest: { src: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1600&q=80', alt: 'Southwest Organic Aesthetic' },
  transitional: { src: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1600&q=80', alt: 'Pinterest Transitional Aesthetic' },
  tropical: { src: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1600&q=80', alt: 'Lush Tropical Sanctuary' },
  tulum: { src: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1600&q=80', alt: 'Pinterest Tulum Organic' },
  'urban-modern': { src: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80', alt: 'Pinterest Urban Loft' },
  vintage: { src: 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?auto=format&fit=crop&w=1600&q=80', alt: 'Pinterest Vintage Aesthetic' },
  'wabi-sabi': { src: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1600&q=80', alt: 'Wabi-Sabi Natural Vibe' },
};

const getCommittedStyleLocalSrc = (slug) =>
  slug ? withBasePath(`/images/estilos/${slug}.webp`) : '';

export const getStyleRemoteFallbackUrl = ({ slug, variant = 'card' } = {}) => {
  const entry = slug ? STYLE_IMAGE_MANIFEST[slug] : null;
  if (!entry) return '';
  if (typeof entry === 'string') return buildCloudinaryEditorialUrl(entry, variant);
  return entry.src || '';
};

export const hasStyleRemoteFallback = (slug) =>
  Boolean(getStyleRemoteFallbackUrl({ slug }));

export const getStyleImageAsset = ({ slug, variant = 'hero' } = {}) => {
  if (!slug) return null;

  // 1. Local Cloudinary upload (session)
  const uploads = readLocalStyleUploads();
  const uploadEntry = uploads?.[slug]?.cover;
  if (uploadEntry?.publicId) {
    return { kind: 'cloudinary', src: buildCloudinaryEditorialUrl(uploadEntry.publicId, variant), publicId: uploadEntry.publicId };
  }
  const uploadSrc = uploadEntry?.src || uploadEntry?.secureUrl || '';
  if (uploadSrc) {
    return { kind: 'remote', src: uploadSrc, alt: uploadEntry?.alt || '' };
  }

  // 2. Local Unsplash selection (session)
  const unsplash = readLocalStyleUnsplashSelections();
  const slotData = unsplash?.slugs?.[slug]?.cover;
  if (slotData?.src || slotData?.id) {
    const src = slotData.src || `https://images.unsplash.com/photo-${slotData.id}?auto=format&fit=crop&w=1600&q=80`;
    return { kind: 'unsplash', src, alt: slotData.alt || '', page: slotData.page || '' };
  }

  // 3. Manifest versionado: o WEBP local e a fonte canonica de entrega.
  // A URL externa permanece apenas como referencia editorial no manifesto.
  const entry = STYLE_IMAGE_MANIFEST[slug];
  if (!entry) return null;

  return {
    kind: 'local',
    src: getCommittedStyleLocalSrc(slug),
    alt: typeof entry === 'object' ? entry.alt || '' : '',
    remoteFallback: typeof entry === 'object' ? entry.src || '' : '',
  };
};

export const getStyleImageUrl = ({ slug, variant = 'hero' } = {}) =>
  getStyleImageAsset({ slug, variant })?.src || null;

// Compatibilidade do builder SEO legado. O auditor usa os helpers explícitos
// de entrega local e fallback remoto, evitando inferências incorretas de CDN.
export const getCloudinaryStyleImage = ({ slug } = {}) => {
  const localSrc = getCommittedStyleLocalSrc(slug);
  return localSrc ? `${PRODUCT_URLS.site}${localSrc}` : '';
};

export default STYLE_IMAGE_MANIFEST;
