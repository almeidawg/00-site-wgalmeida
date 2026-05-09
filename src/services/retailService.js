import { searchGoogleImages } from './mediaService';

/**
 * Motor de Descoberta de Produtos - Google Shopping via Domínios Autorizados
 */
export const searchGoogleShopping = async (query) => {
  const authorizedRetailers = [
    'leroymerlin.com.br',
    'westwing.com.br',
    'telhanorte.com.br',
    'tokstok.com.br',
    'portobello.com.br',
    'docol.com.br'
  ];

  const shoppingQuery = `(${authorizedRetailers.map(r => `site:${r}`).join(' OR ')}) ${query}`;
  
  try {
    const results = await searchGoogleImages(shoppingQuery);
    return results.map(item => ({
      ...item,
      source: 'shopping',
      isProduct: true
    }));
  } catch (err) {
    console.error('[RetailService] Falha na busca de produtos:', err);
    return [];
  }
};

export const fetchRetailProducts = async ({ query, style, category }) => {
  // 1. Catálogo de Luxo WG (Curadoria Interna)
  const wgCuratedDB = [
    {
      id: 'wg-c-1',
      source: 'Portobello Shop',
      title: 'Porcelanato Calacatta Oro 120x120',
      price: 'R$ 289,90/m²',
      thumb: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400',
      tags: ['classico', 'moderno', 'porcelanato', 'finishes']
    },
    {
      id: 'wg-c-2',
      source: 'Docol Boutique',
      title: 'Misturador Monocomando Brushed Gold',
      price: 'R$ 1.850,00',
      thumb: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
      tags: ['moderno', 'luxo', 'metais', 'finishes']
    },
    {
      id: 'wg-c-3',
      source: 'Westwing Collection',
      title: 'Poltrona Charles Eames - Couro Natural',
      price: 'R$ 14.500,00',
      thumb: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400',
      tags: ['moderno', 'luxo', 'poltrona', 'decor']
    },
    {
      id: 'wg-c-4',
      source: 'Yamamura',
      title: 'Lustre Pendente Moderno em Metal Preto',
      price: 'R$ 1.250,00',
      thumb: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
      tags: ['moderno', 'iluminacao', 'luminaria', 'decor']
    },
    {
      id: 'wg-c-5',
      source: 'Westwing Now',
      title: 'Luminária de Mesa Bauhaus',
      price: 'R$ 890,00',
      thumb: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=400',
      tags: ['minimalismo', 'moderno', 'luminaria', 'decor']
    },
    {
      id: 'wg-c-6',
      source: 'Leroy Merlin',
      title: 'Plafon LED Inteligente Wi-Fi',
      price: 'R$ 349,00',
      thumb: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400',
      tags: ['moderno', 'tecnologia', 'luminaria', 'decor']
    }
  ];

  let curated = [...wgCuratedDB];
  if (query) {
    const q = query.toLowerCase();
    curated = curated.filter(p => p.title.toLowerCase().includes(q) || p.tags.some(t => t.includes(q)));
  }

  // 2. Busca Real de Mercado
  const market = await searchGoogleShopping(query || style || category);

  return [...curated, ...market];
};
