const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_IMAGE_SEARCH_API_KEY;
const GOOGLE_SEARCH_CX = import.meta.env.VITE_GOOGLE_SEARCH_CX;

import { searchUnsplashImages as searchUnsplashLibraryImages } from '@/lib/unsplash';

/**
 * Motor de Busca de Imagens - Google Custom Search
 */
export const searchGoogleImages = async (query) => {
  if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_CX) {
    console.warn('[DiscoveryEngine] Credenciais ausentes. Verifique o .env');
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_CX}&searchType=image&q=${encodeURIComponent(query)}&num=10`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[DiscoveryEngine] Erro na API Google:', response.status, errorData);
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
