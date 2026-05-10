export const STYLE_SEARCH_PROFILES = {
  'art-deco': ['art deco interior', 'luxury geometric interior', 'brass marble interior'],
  'art-nouveau': ['art nouveau interior', 'organic curves interior', 'decorative floral interior'],
  boho: ['boho chic interior', 'layered bohemian living room', 'natural textured boho interior'],
  classico: ['classic interior design', 'timeless elegant living room', 'ornate moulding marble interior'],
  coastal: ['coastal interior design', 'light airy beach house interior', 'neutral coastal living room'],
  contemporaneo: ['contemporary interior design', 'refined modern living room', 'clean sophisticated interior'],
  cottage: ['cottage interior design', 'cozy cottage living room', 'soft rustic cottage interior'],
  ecletico: ['eclectic interior design', 'collected layered interior', 'mix and match luxury interior'],
  escandinavo: ['scandinavian interior design', 'minimal nordic living room', 'light wood neutral interior'],
  farmhouse: ['farmhouse interior design', 'modern farmhouse living room', 'rustic refined farmhouse interior'],
  glam: ['glam interior design', 'luxury glamorous living room', 'gold velvet elegant interior'],
  hampton: ['hamptons interior design', 'coastal luxury living room', 'bright elegant hamptons interior'],
  'hollywood-regency': ['hollywood regency interior', 'bold glamorous interior', 'high contrast luxury room'],
  industrial: ['industrial interior design', 'loft concrete metal interior', 'urban industrial living room'],
  japandi: ['japandi interior design', 'minimal warm wood interior', 'japanese scandinavian living room'],
  maximalista: ['maximalist interior design', 'bold layered luxury interior', 'colorful expressive living room'],
  mediterraneo: ['mediterranean interior design', 'warm plaster arch interior', 'sunlit mediterranean living room'],
  'mid-century': ['mid century modern interior', 'walnut vintage modern living room', 'retro modern interior'],
  minimalismo: ['minimalist interior design', 'quiet neutral luxury interior', 'clean serene living room'],
  moderno: ['modern interior design', 'sleek contemporary living room', 'architectural modern interior'],
  neoclassico: ['neoclassical interior design', 'symmetrical refined interior', 'elegant moulding salon'],
  provencal: ['provencal interior design', 'french country elegant interior', 'soft rustic chic living room'],
  rustico: ['rustic interior design', 'natural wood stone living room', 'warm rustic luxury interior'],
  'shabby-chic': ['shabby chic interior design', 'romantic distressed furniture interior', 'soft vintage chic room'],
  southwest: ['southwest interior design', 'desert warm earthy interior', 'terracotta southwestern living room'],
  transitional: ['transitional interior design', 'classic modern balanced interior', 'soft luxury transitional room'],
  tropical: ['tropical interior design', 'lush natural airy interior', 'resort style living room'],
  tulum: ['tulum style interior', 'organic earthy luxury interior', 'boho mediterranean resort interior'],
  'urban-modern': ['urban modern interior design', 'city luxury apartment interior', 'modern metropolitan living room'],
  vintage: ['vintage interior design', 'nostalgic curated living room', 'retro elegant interior'],
  'wabi-sabi': ['wabi sabi interior design', 'organic imperfect serene interior', 'earthy minimalist textured room'],
};

const STOP_WORDS = new Set([
  'veja', 'como', 'aplicar', 'estilo', 'projeto', 'para', 'mais', 'com', 'seu', 'sua', 'este', 'esta',
  'tudo', 'sobre', 'guia', 'completo', 'dicas', 'melhores', 'ambientes', 'casa', 'decoração', 'design',
  'arquitetura', 'luxo', 'premium', 'sofisticado', 'interiores', 'inspiração', 'referência'
]);

export const STYLE_MATERIAL_MAPPING = {
  'art-deco': ['Latão Dourado', 'Mármore Nero Marquina', 'Laca Brilhante', 'Vidro Canelado'],
  'boho': ['Palha Natural', 'Terracota', 'Madeira de Demolição', 'Ladrilho Hidráulico'],
  'classico': ['Mármore Calacatta', 'Piso Chevron', 'Boiserie Branca', 'Molduras Clássicas'],
  'contemporaneo': ['Concreto Aparente', 'Metal Preto Fosco', 'Porcelanato Grandes Formatos', 'Painel Ripado'],
  'escandinavo': ['Pinus', 'Carvalho Americano', 'Cerâmica Artesanal', 'Tecido Linho'],
  'industrial': ['Tijolinho Aparente', 'Aço Corten', 'Cimento Queimado', 'Tubulação Aparente'],
  'japandi': ['Madeira Clara', 'Pedra Natural Basalto', 'Papel Arroz', 'Bambu'],
  'minimalismo': ['Microcimento', 'Gesso Acetinado', 'Mobiliário Oculto', 'Pedra Sabão'],
  'moderno': ['Nogueira', 'Aço Inox Escovado', 'Terrazzo', 'Vidro Fumê'],
  'rustico': ['Vigas de Madeira', 'Parede de Pedra', 'Cobre Envelhecido', 'Tijolo de Barro'],
  'tropical': ['Bambu', 'Pedra Vulcânica', 'Palha trançada', 'Madeira Tropical'],
};

export const STYLE_DECOR_MAPPING = {
  'art-deco': ['Espelho Sol', 'Poltrona de Veludo', 'Luminária Geométrica', 'Escultura Metálica'],
  'boho': ['Tapete Kilim', 'Macramê', 'Plantas Tropicais', 'Almofada Étnica'],
  'classico': ['Lustre de Cristal', 'Sofá Chesterfield', 'Pintura a Óleo', 'Vaso de Porcelana'],
  'contemporaneo': ['Sofá Modular', 'Mesa de Centro Escultural', 'Quadro Abstrato', 'Luminária de Trilho'],
  'escandinavo': ['Pele de Carneiro', 'Cadeira Wishbone', 'Prints Minimalistas', 'Vela Aromática'],
  'industrial': ['Sofá de Couro Conhaque', 'Lâmpada de Edison', 'Estante de Ferro', 'Relógio de Estação'],
  'japandi': ['Cama Baixa', 'Bonsai', 'Vaso de Cerâmica Wabi-sabi', 'Luminária de Papel'],
  'minimalismo': ['Cortina de Linho', 'Mesa Monolítica', 'Escultura de Linha única', 'Vaso Solitário'],
  'moderno': ['Poltrona Eames', 'Luminária Arco', 'Tapete Geométrico', 'Mesa Saarinen'],
  'rustico': ['Tapete de Couro', 'Lustre de Ferro Forjado', 'Artesanato em Barro', 'Manta de Lã'],
  'tropical': ['Palmeira Imperial', 'Móveis de Fibra', 'Objetos de Concha', 'Rede de Descanso'],
};

export const buildStyleEditorialSearchPlan = (style = {}, mode = 'cover') => {
  const baseQueries = STYLE_SEARCH_PROFILES[style.slug] || [];

  let contextualQueries = [];
  if (mode === 'finishes') {
    contextualQueries = STYLE_MATERIAL_MAPPING[style.slug] || [`${style.title} acabamentos`];
  } else if (mode === 'decor') {
    contextualQueries = STYLE_DECOR_MAPPING[style.slug] || [`${style.title} decoração`];
  } else {
    contextualQueries = baseQueries;
  }

  // Filtragem inteligente de termos do excerpt (apenas palavras relevantes)
  const excerptTerms = typeof style.excerpt === 'string'
    ? style.excerpt
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
      .split(/\s+/)
      .filter((term) => term.length > 3 && !STOP_WORDS.has(term))
      .slice(0, 6)
    : [];

  const tagTerms = Array.isArray(style.tags)
    ? style.tags.map((tag) => String(tag).trim().toLowerCase()).filter(tag => tag && !STOP_WORDS.has(tag))
    : [];

  // Prioridade: 1. Curadoria (contextual), 2. Tags limpas, 3. Excerpt limpo
  const searchTerms = [...new Set([...contextualQueries, ...tagTerms, ...excerptTerms])];
  const mainQuery = contextualQueries[0] || `${style.title || style.slug || 'interior'} interior design`;

  return {
    mainQuery,
    searchTerms,
    searchQuery: mainQuery,
    intent: mode === 'cover'
      ? 'referencia real de ambiente para capa editorial do guia de estilo'
      : `busca de ${mode === 'finishes' ? 'acabamentos' : 'decoracao'} para o estilo ${style.title}`,
  };
};
