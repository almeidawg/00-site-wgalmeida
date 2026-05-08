const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_IMAGE_SEARCH_API_KEY;
const GOOGLE_SEARCH_CX = import.meta.env.VITE_GOOGLE_SEARCH_CX;

// Log de diagnóstico (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('[DiscoveryEngine] Google API Status:', {
    hasKey: !!GOOGLE_API_KEY,
    hasCX: !!GOOGLE_SEARCH_CX
  });
}

export const searchUnsplashImages = async (query, page = 1, perPage = 20) => {
  if (!UNSPLASH_ACCESS_KEY) return [];
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=squarish`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );
    const data = await response.json();
    return (data.results || []).map(img => ({
      id: img.id,
      title: img.description || img.alt_description || 'Imagem Unsplash',
      url: img.urls.regular,
      thumb: img.urls.small,
      source: 'unsplash',
      author: img.user.name
    }));
  } catch (err) {
    console.error('[MediaService] Unsplash Error:', err);
    return [];
  }
};

export const searchGoogleImages = async (query) => {
  if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_CX) {
    console.warn('[DiscoveryEngine] Google Search keys missing in .env');
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_CX}&searchType=image&q=${encodeURIComponent(query)}&num=10`
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        console.error('[DiscoveryEngine] Google Search Limit Exceeded (403). Falling back to Unsplash.');
      } else {
        console.error('[DiscoveryEngine] Google API Error:', response.status, errorData);
      }
      return []; // Return empty to trigger Unsplash fallback in UI
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
    console.error('[DiscoveryEngine] Critical failure in Google Search:', error);
    return [];
  }
};

export const searchPinterestImages = async (query) => {
  // Pinterest search via Google is specifically tuned for high-end aesthetic results
  const pinterestQuery = `site:pinterest.com ${query} architecture interior design luxury photography`;
  
  try {
    const results = await searchGoogleImages(pinterestQuery);
    return results.map(item => ({
      ...item,
      source: 'pinterest' 
    }));
  } catch (err) {
    return [];
  }
};
