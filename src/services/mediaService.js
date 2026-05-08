const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

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
  // TODO: Implementar via Google Custom Search API usando as keys do ACESSOS_MASTER
  // Por enquanto, fallback para Unsplash com prefixo de qualidade
  return searchUnsplashImages(`architecture interior design ${query}`);
};
