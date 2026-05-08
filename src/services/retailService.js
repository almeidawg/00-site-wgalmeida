/**
 * Product Discovery Service
 * Integra curadoria de Westwing (Estilo) e Leroy Merlin (Construção/Materiais)
 */

export const fetchRetailProducts = async ({ query, style, category }) => {
  // Simulação de busca inteligente focada em High-End (Estilo Google Shopping Luxury)
  
  const mockRetailDatabase = [
    // --- PORCELANATOS & REVESTIMENTOS (LEROY MERLIN BOUTIQUE / PORTOBELLO) ---
    {
      id: 'lm-porc-1',
      source: 'Portobello Shop',
      title: 'Porcelanato Calacatta Oro 120x120 Polido',
      price: 'R$ 289,90/m²',
      thumb: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400',
      url: 'https://www.leroymerlin.com.br/',
      tags: ['classico', 'moderno', 'porcelanato', 'piso', 'luxo']
    },
    {
      id: 'lm-porc-2',
      source: 'Leroy Merlin',
      title: 'Porcelanato Cinza Concreto 90x90 Acetinado',
      price: 'R$ 115,00/m²',
      thumb: 'https://images.unsplash.com/photo-1515542706656-8e6ef17a1ed2?w=400',
      url: 'https://www.leroymerlin.com.br/',
      tags: ['industrial', 'moderno', 'porcelanato', 'piso']
    },
    {
      id: 'lm-porc-3',
      source: 'Decortiles',
      title: 'Porcelanato Nero Venato 60x120 Brilhante',
      price: 'R$ 340,00/m²',
      thumb: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      url: 'https://www.leroymerlin.com.br/',
      tags: ['moderno', 'minimalismo', 'porcelanato', 'parede', 'luxo']
    },
    {
      id: 'lm-porc-4',
      source: 'Eliane Revestimentos',
      title: 'Porcelanato Amadeirado Carvalho 20x120',
      price: 'R$ 159,90/m²',
      thumb: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=400',
      url: 'https://www.leroymerlin.com.br/',
      tags: ['rustico', 'escandinavo', 'porcelanato', 'piso']
    },
    {
      id: 'lm-porc-5',
      source: 'Porto Design',
      title: 'Porcelanato Off-White Minimalista 100x100',
      price: 'R$ 198,00/m²',
      thumb: 'https://images.unsplash.com/photo-1564078516121-da07b0689369?w=400',
      url: 'https://www.leroymerlin.com.br/',
      tags: ['minimalismo', 'japandi', 'porcelanato', 'piso']
    },

    // --- MÓVEIS & DECORAÇÃO (WESTWING COLLECTION) ---
    {
      id: 'ww-lux-1',
      source: 'Westwing Collection',
      title: 'Poltrona Charles Eames com Puff - Couro Natural',
      price: 'R$ 14.500',
      thumb: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400',
      url: 'https://www.westwing.com.br/',
      tags: ['moderno', 'mid-century', 'luxo', 'poltrona']
    },
    {
      id: 'ww-lux-2',
      source: 'Design Assinado',
      title: 'Sofá Modular Velvet Terracota - Premium',
      price: 'R$ 8.900',
      thumb: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
      url: 'https://www.westwing.com.br/',
      tags: ['contemporaneo', 'moderno', 'sala', 'sofa']
    },
    {
      id: 'ww-lux-3',
      source: 'Arte de Luxo',
      title: 'Pendente de Vidro Soprado à Mão - Artisanal',
      price: 'R$ 3.800',
      thumb: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
      url: 'https://www.westwing.com.br/',
      tags: ['japandi', 'minimalismo', 'iluminação', 'pendente']
    },
    {
      id: 'ww-lux-4',
      source: 'Westwing Now',
      title: 'Mesa de Centro em Mármore Carrara',
      price: 'R$ 4.200',
      thumb: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400',
      url: 'https://www.westwing.com.br/',
      tags: ['moderno', 'classico', 'sala', 'mesa']
    }
  ];

  // Lógica de Busca Híbrida: Google Shopping Experience
  let results = [...mockRetailDatabase];

  // 1. Filtragem por busca textual (Prioridade Máxima)
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.tags.some(t => t.includes(q)) ||
      p.source.toLowerCase().includes(q)
    );
  } else if (style) {
    // 2. Se não houver busca, filtra por estilo (Curadoria Automática)
    const styleSpecific = results.filter(p => p.tags.includes(style));
    if (styleSpecific.length > 0) {
      results = styleSpecific;
    }
  }

  // 3. Se houver categoria (aba ativa), dá um peso maior ou filtra se necessário
  if (category) {
    const catType = category === 'acabamentos' ? 'porcelanato' : 'decoracao';
    // Se estivermos em acabamentos, priorizamos itens de obra
    if (category === 'acabamentos') {
      const finishes = results.filter(p => p.tags.includes('porcelanato') || p.tags.includes('piso') || p.tags.includes('parede'));
      if (finishes.length > 0 && !query) results = finishes;
    }
  }

  return results;
};
