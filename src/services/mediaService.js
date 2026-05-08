const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_IMAGE_SEARCH_API_KEY;
const GOOGLE_SEARCH_CX = import.meta.env.VITE_GOOGLE_SEARCH_CX;

export const searchUnsplashImages = async (query, page = 1, perPage = 20) => {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('[MediaService] Unsplash Access Key não configurada.');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=squarish`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) throw new Error('Falha na busca Unsplash');
    
    const data = await response.json();
    return data.results.map(img => ({
      id: img.id,
      title: img.description || img.alt_description || 'Imagem Unsplash',
      url: img.urls.regular,
      thumb: img.urls.small,
      source: 'unsplash',
      author: img.user.name,
      pageUrl: img.links.html
    }));
  } catch (error) {
    console.error('[MediaService] Erro ao buscar Unsplash:', error);
    return [];
  }
};

export const searchGoogleImages = async (query) => {
  if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_CX) {
    console.warn('[MediaService] Google Search credentials não configuradas. Usando fallback Unsplash.');
    return searchUnsplashImages(`architecture interior design ${query}`);
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_SEARCH_CX}&searchType=image&q=${encodeURIComponent(query)}&num=10`
    );

    if (!response.ok) throw new Error('Falha na busca Google Images');
    
    const data = await response.json();
    if (!data.items) return [];

    return data.items.map((item, index) => ({
      id: `google-${index}-${Date.now()}`,
      title: item.title,
      url: item.link,
      thumb: item.image?.thumbnailLink || item.link,
      source: 'google',
      author: item.displayLink,
      pageUrl: item.image?.contextLink
    }));
  } catch (error) {
    console.error('[MediaService] Erro ao buscar Google Images:', error);
    return searchUnsplashImages(query);
  }
};
