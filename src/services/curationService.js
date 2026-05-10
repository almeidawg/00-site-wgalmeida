/**
 * Curation Service - Inteligência de Direcionamento de Itens
 * Mapeia Estilos para Especificações Técnicas e de Design
 */

const STYLE_CURATION = {
  industrial: {
    acabamentos: [
      'Cimento Queimado Platinum',
      'Tijolo Aparente London Brick',
      'Porcelanato Aço Corten',
      'Eletrocalhas Pretas Aparentes',
      'Piso Vinílico Concreto',
      'Metais Preto Fosco (Matte Black)',
      'Vidro Canelado com Caixilho'
    ],
    decoracao: [
      'Sofá de Couro Conhaque',
      'Mesa de Jantar em Madeira de Demolição',
      'Luminária Trilho Industrial',
      'Estante de Ferro e Madeira',
      'Cadeiras Tolix',
      'Pendentes de Metal e Filamento',
      'Quadros de Arte Urbana'
    ]
  },
  minimalismo: {
    acabamentos: [
      'Mármore Branco Paraná',
      'Microcimento Off-White',
      'Porcelanato Extra-Large (120x240)',
      'Metais Monocomando Minimalistas',
      'Painéis de Madeira Nude',
      'Rodapé Invertido',
      'Pintura Velvet Toque de Seda'
    ],
    decoracao: [
      'Sofá Modular de Linho Cru',
      'Mesa de Centro Orgânica Branca',
      'Iluminação Linear em LED',
      'Adornos em Cerâmica Branca',
      'Poltrona de Design Escultural',
      'Cortinas em Voil de Linho',
      'Espelhos com Moldura Invisível'
    ]
  },
  japandi: {
    acabamentos: [
      'Madeira Carvalho Light',
      'Pedra Basalto',
      'Revestimento Ripado de Bambu',
      'Papel de Parede de Palha Natural',
      'Cerâmica Artesanal Mate',
      'Metais em Cobre Escovado',
      'Pintura em Tons de Areia'
    ],
    decoracao: [
      'Mobiliário de Linhas Baixas',
      'Luminária de Papel de Arroz',
      'Tapete de Fibra de Juta',
      'Plantas como Bonsai ou Oliveira',
      'Cama Futon Moderna',
      'Objetos de Madeira Wabi-Sabi',
      'Bancos de Madeira Clara'
    ]
  },
  moderno: {
    acabamentos: [
      'Painéis em Nogueira',
      'Piso em Granilite Polido',
      'Metais em Aço Inox Escovado',
      'Laminados de Alta Pressão',
      'Pedras de Quartzo Cinza',
      'Revestimentos Geométricos',
      'Esquadrias de Alumínio Slim'
    ],
    decoracao: [
      'Poltrona Charles Eames',
      'Luminária de Piso Arco',
      'Aparador em Laca Brilhante',
      'Sofá de Veludo Azul Navy',
      'Mesas Laterais em Acrílico',
      'Arandelas de Design Assinado',
      'Obras de Arte Abstrata'
    ]
  },
  classico: {
    acabamentos: [
      'Mármore Carrara',
      'Piso Chevron de Madeira',
      'Molduras Boiserie nas Paredes',
      'Metais Gold ou Rosé Gold',
      'Rodapé Alto Branco',
      'Papel de Parede Adamascado',
      'Sanca com Detalhes em Gesso'
    ],
    decoracao: [
      'Lustre de Cristal de Rocha',
      'Sofá Chesterfield de Veludo',
      'Espelhos com Moldura Dourada',
      'Mesa de Jantar em Mármore',
      'Poltronas Estilo Luis XV',
      'Vasos de Murano',
      'Tapetes Persas ou Orientais'
    ]
  },
  tropical: {
    acabamentos: [
      'Pedra Moledo Aparente',
      'Deck de Madeira Cumaru',
      'Piso de Ladrilho Hidráulico',
      'Metais em Bronze Antigo',
      'Revestimento de Palha ou Palhinha',
      'Pintura Verde Floresta',
      'Pedra de Rio para Banheiros'
    ],
    decoracao: [
      'Móveis em Rattan e Vime',
      'Rede de Descanso de Luxo',
      'Quadros de Botânica',
      'Almofadas com Estampas Exóticas',
      'Luminárias de Palha Trançada',
      'Bancos de Tronco Natural',
      'Plantas Grandes (Costela de Adão)'
    ]
  }
};

export const getSmartSuggestions = (selectedStyles, activeTab) => {
  if (!selectedStyles || selectedStyles.length === 0) return [];
  
  const categoryKey = activeTab === 'acabamentos' ? 'acabamentos' : 'decoracao';
  
  // Coleta sugestões de todos os estilos selecionados
  let allSuggestions = [];
  selectedStyles.forEach(style => {
    const slug = style.slug || style.id;
    if (STYLE_CURATION[slug]) {
      allSuggestions = [...allSuggestions, ...STYLE_CURATION[slug][categoryKey]];
    }
  });

  // Se não houver sugestões específicas para o estilo, retorna fallback genérico de luxo
  if (allSuggestions.length === 0) {
    return activeTab === 'acabamentos' 
      ? ['Porcelanato Premium', 'Marmoraria de Luxo', 'Metais de Design']
      : ['Móveis Assinados', 'Decoração de Curadoria', 'Iluminação Cênica'];
  }

  // Remove duplicatas e embaralha levemente para parecer orgânico
  return Array.from(new Set(allSuggestions)).sort(() => Math.random() - 0.5).slice(0, 8);
};
