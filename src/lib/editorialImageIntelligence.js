import { buildWgEditorialSearchPlan } from '@/lib/wgVisualSearchProfile';

export const IMAGE_SOURCE_POLICY = {
  unsplash: {
    label: 'Unsplash API',
    status: 'publishable',
    canPublish: true,
    governance: 'Hotlink autorizado pela API, com credito e download tracking ao aprovar.',
  },
  cloudinary: {
    label: 'Acervo WG',
    status: 'publishable',
    canPublish: true,
    governance: 'Ativo proprio/licenciado publicado pelo acervo editorial da WG.',
  },
  local: {
    label: 'Acervo WG',
    status: 'publishable',
    canPublish: true,
    governance: 'Ativo local do projeto, aprovado para publicacao editorial.',
  },
  retail: {
    label: 'Acervo operacional',
    status: 'review',
    canPublish: false,
    governance: 'Referencia operacional. Para publicar, subir como acervo WG/licenciado ou selecionar via fluxo de upload aprovado.',
  },
  remote: {
    label: 'Fonte externa aprovada',
    status: 'review',
    canPublish: true,
    governance: 'Exige credito, pagina de origem e revisao editorial antes de publicar.',
  },
  google: {
    label: 'Google referencia',
    status: 'reference_only',
    canPublish: false,
    governance: 'Referencia de pesquisa. Nao publicar automaticamente.',
  },
  pinterest: {
    label: 'Pinterest referencia',
    status: 'reference_only',
    canPublish: false,
    governance: 'Somente direcao estetica. Pinterest nao e banco livre de publicacao.',
  },
};

const VISUAL_FAMILY_BY_INTENT = {
  person: 'autoral / retrato editorial / legado',
  brand: 'marca / produto / ambiente editorial',
  architecture: 'arquitetura / fachada / autoria espacial',
  decor: 'interiores / estilo / atmosfera',
  lighting: 'iluminacao / ambiencia / detalhe tecnico',
  kitchen: 'cozinha / uso / materialidade',
  bathroom: 'banheiro / spa / acabamento',
  bedroom: 'quarto / textura / conforto',
  living: 'estar / composicao / lifestyle residencial',
  carpentry: 'marcenaria / detalhe construtivo / madeira',
  corporate: 'corporativo / recepcao / workspace',
  technology: 'tecnologia / automacao / interface discreta',
  construction: 'engenharia / obra / materialidade tecnica',
  sustainability: 'biofilia / eficiencia / materia natural',
  reference: 'referencia arquitetonica / obra icone',
};

const SLOT_DIRECTION = {
  hero: {
    orientation: 'horizontal',
    role: 'Imagem-mae da materia',
    visualPriority: 'hero forte',
    framing: 'plano aberto ou retrato editorial com respiro para titulo',
  },
  card: {
    orientation: 'horizontal',
    role: 'Imagem derivada para grid',
    visualPriority: 'card forte',
    framing: 'recorte de leitura rapida, detalhe ou variacao da mesma familia visual',
  },
};

const compact = (value = '') => String(value || '').trim();

export const getImageSourcePolicy = (source = '') =>
  IMAGE_SOURCE_POLICY[String(source || '').toLowerCase()] || {
    label: source || 'Fonte nao classificada',
    status: 'review',
    canPublish: false,
    governance: 'Fonte precisa ser classificada antes da publicacao.',
  };

export const normalizeEditorialCandidate = (candidate = {}, slotPlan = {}, post = {}) => {
  const source = String(candidate.source || '').toLowerCase();
  const policy = getImageSourcePolicy(source);
  const title = compact(candidate.title || candidate.description || candidate.alt || candidate.alt_description);
  const author = compact(candidate.author || candidate.photographer || candidate.user?.name);
  const pageUrl = compact(candidate.pageUrl || candidate.unsplashPage || candidate.page || candidate.profileUrl);

  return {
    ...candidate,
    source,
    sourceLabel: policy.label,
    licenseStatus: policy.status,
    canPublish: policy.canPublish,
    governanceNote: policy.governance,
    title,
    author,
    pageUrl,
    alt: compact(candidate.alt || candidate.alt_description || title || `Imagem editorial para ${post.title || post.slug || 'post WG Almeida'}`),
    downloadLocation: compact(candidate.downloadLocation),
    semanticSlot: slotPlan.slot || 'hero',
    semanticIntent: slotPlan.intent || '',
    semanticQuery: slotPlan.mainQuery || '',
  };
};

const scoreByTokens = (candidateText = '', tokens = []) => {
  const text = candidateText.toLowerCase();
  return tokens.reduce((score, token) => score + (token && text.includes(token.toLowerCase()) ? 10 : 0), 0);
};

export const scoreEditorialCandidate = (candidate = {}, slotPlan = {}, post = {}) => {
  const normalized = normalizeEditorialCandidate(candidate, slotPlan, post);
  const candidateText = [
    normalized.title,
    normalized.alt,
    normalized.author,
    normalized.semanticQuery,
    normalized.sourceLabel,
  ].filter(Boolean).join(' ');
  const titleTokens = compact(post.title).toLowerCase().split(/\s+/).filter((token) => token.length > 4).slice(0, 8);
  const categoryTokens = compact(post.category).toLowerCase().split(/\s+/).filter(Boolean);
  const styleTokens = compact(slotPlan.intent).toLowerCase().split(/\s+/).filter(Boolean);

  const sourceScore = normalized.canPublish ? 25 : -40;
  const titleScore = Math.min(scoreByTokens(candidateText, titleTokens), 35);
  const categoryScore = Math.min(scoreByTokens(candidateText, categoryTokens), 15);
  const styleScore = Math.min(scoreByTokens(candidateText, styleTokens), 15);
  const creditScore = normalized.author || normalized.pageUrl ? 10 : 0;
  const finalScore = Math.max(0, Math.min(100, sourceScore + titleScore + categoryScore + styleScore + creditScore + 15));

  return {
    ...normalized,
    scores: {
      title: titleScore,
      category: categoryScore,
      style: styleScore,
      source: sourceScore,
      credit: creditScore,
      final: finalScore,
    },
    selectionStatus: normalized.canPublish ? 'sugerida' : 'referencia',
    aiRationale: normalized.canPublish
      ? `Imagem sugerida para ${slotPlan.slot || 'slot'} por aderencia ao tema "${post.title || post.slug}" e a consulta "${slotPlan.mainQuery || ''}".`
      : `${normalized.sourceLabel} fica apenas como referencia visual; use Unsplash API, acervo WG ou fonte aprovada para publicar.`,
  };
};

export const buildEditorialImageStrategy = (post = {}) => {
  const plan = buildWgEditorialSearchPlan(post);
  const hero = {
    ...SLOT_DIRECTION.hero,
    ...plan.hero,
    family: VISUAL_FAMILY_BY_INTENT[plan.hero.intent] || 'editorial tecnico',
    negativeTerms: ['generic stock photo', 'random building', 'text overlay', 'watermark', 'low quality'],
  };
  const card = {
    ...SLOT_DIRECTION.card,
    ...plan.card,
    family: VISUAL_FAMILY_BY_INTENT[plan.card.intent] || hero.family,
    negativeTerms: ['generic stock photo', 'random object', 'text overlay', 'watermark', 'low quality'],
  };

  return {
    title: post.title || post.slug || '',
    category: post.category || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    visualFamily: hero.family,
    semanticIntent: hero.intent,
    directionSummary: `Hero e card devem nascer da familia visual "${hero.family}", com card derivado ou compatível com a imagem-mae.`,
    slots: { hero, card },
    governance: {
      preferredSources: ['acervo WG', 'Unsplash API', 'fonte licenciada aprovada'],
      referenceOnlySources: ['Pinterest', 'Google Images sem licenca validada'],
      requiredFields: ['credito', 'origem', 'alt contextual', 'focal point', 'status de revisao'],
    },
  };
};

export const buildDefaultImageGovernance = (post = {}) => {
  const strategy = buildEditorialImageStrategy(post);
  return {
    theme: post.title || '',
    subtheme: '',
    visualStyle: strategy.visualFamily,
    imageIntent: strategy.directionSummary,
    imageEntity: strategy.semanticIntent,
    visualKeywords: strategy.slots.hero.searchTerms.join(', '),
    editorialTone: 'editorial premium, claro e semanticamente conectado',
    desiredDominantColor: '',
    orientation: 'horizontal',
    visualPriority: 'hero forte',
    source: '',
    originalUrl: '',
    credit: '',
    licenseType: '',
    heroImage: '',
    cardImage: '',
    alt: '',
    cardAlt: '',
    focalPoint: '50% 50%',
    desktopCrop: 'landscape',
    mobileCrop: 'center',
    reviewStatus: 'sugerida',
    semanticPrompt: strategy.slots.hero.mainQuery,
    queryVariants: strategy.slots.hero.searchTerms.join(', '),
    scoreTitle: '',
    scoreCategory: '',
    scoreStyle: '',
    scoreFinal: '',
    aiJustification: strategy.directionSummary,
    automationStatus: 'sugerida',
  };
};
