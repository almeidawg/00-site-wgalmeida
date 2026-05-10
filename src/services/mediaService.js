const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_IMAGE_SEARCH_API_KEY;
const GOOGLE_SEARCH_CX = import.meta.env.VITE_GOOGLE_SEARCH_CX;

import { searchUnsplashImages as searchUnsplashLibraryImages } from '@/lib/unsplash';

let googleImageSearchDisabled = false;
let googleImageSearchWarningShown = false;

/**
 * Motor de Busca de Imagens - Google Custom Search
 */
export const searchGoogleImages = async (query) => {
  if (googleImageSearchDisabled) return [];

  if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_CX) {
    if (!googleImageSearchWarningShown) {
      console.warn('[DiscoveryEngine] Credenciais ausentes. Verifique o .env');
      googleImageSearchWarningShown = true;
    }
    return [];
  }

  try {
    const params = new URLSearchParams({
      key: GOOGLE_API_KEY,
      cx: GOOGLE_SEARCH_CX,
      searchType: 'image',
      q: String(query || '').slice(0, 180),
      num: '10',
    });
    const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params.toString()}`);

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      if (response.status === 400 || response.status === 403) {
        googleImageSearchDisabled = true;
      }

      if (!googleImageSearchWarningShown) {
        console.warn('[DiscoveryEngine] Busca Google desativada nesta sessão:', response.status, errorData?.error?.message || errorData?.message || 'erro na API');
        googleImageSearchWarningShown = true;
      }
      return [];
    }
    
    const data = await response.json();
    if (!data.items) return [];

    return data.items.map((item, index) => ({
      id: `google-${index}-${Date.now()}`,
      title: item.title,
      url: item.link,
      thumb: item.image?.thumbnailLink || item.link,
      source: 'google',
      author: item.displayLink
    }));
  } catch (error) {
    console.error('[DiscoveryEngine] Falha crítica na busca Google:', error);
    return [];
  }
};

/**
 * Busca de Inspiração - Pinterest (via Google)
 */
export const searchPinterestImages = async (query) => {
  const pinterestQuery = `site:pinterest.com ${query} architecture interior design luxury`;
  try {
    const results = await searchGoogleImages(pinterestQuery);
    return results.map(item => ({ ...item, source: 'pinterest' }));
  } catch (err) {
    return [];
  }
};

/**
 * Compatibilidade para telas admin legadas que esperam url/thumb/source.
 */
export const searchUnsplashImages = async (query) => {
  try {
    const results = await searchUnsplashLibraryImages({
      query,
      orientation: 'landscape',
      perPage: 10,
    });

    return results.map((item) => ({
      id: item.id,
      title: item.alt_description || item.description || 'Imagem Unsplash',
      url: item.urls?.regular || item.urls?.full || item.urls?.raw || '',
      thumb: item.urls?.small || item.urls?.thumb || item.urls?.regular || '',
      source: 'unsplash',
      author: item.photographer || item.user?.name || '',
    }));
  } catch (err) {
    console.error('[DiscoveryEngine] Falha na busca Unsplash:', err);
    return [];
  }
};
