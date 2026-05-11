import BLOG_CMS_GENERATED from './blogCms.generated.js';

const DRAFTS_KEY = 'wg_blog_cms_drafts_v1';
const PUBLISHED_KEY = 'wg_blog_cms_published_v1';
const METRICS_KEY = 'wg_blog_public_metrics_v1';
const COMMENTS_KEY = 'wg_blog_public_comments_v1';

const DEFAULT_AUTHOR = 'Grupo WG Almeida';
const DEFAULT_STATUS = 'published';
const MASTER_TEMPLATE_ID = 'legacy-architects-master-v1';

const isBrowser = typeof window !== 'undefined';

const safeJsonParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const readStorageRecord = (key) => {
  if (!isBrowser) return {};
  return safeJsonParse(window.localStorage.getItem(key), {});
};

const writeStorageRecord = (key, value) => {
  if (!isBrowser) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const uniqueStrings = (values = []) =>
  Array.from(
    new Set(
      values
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    )
  );

const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

const slugify = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const buildMoodboardPayload = (post = {}) => {
  const moodboard = post.moodboard || {};
  const styleSlugs = ensureArray(moodboard.styleSlugs);
  const palette = ensureArray(moodboard.palette);
  const customImages = ensureArray(moodboard.referenceImages).map((image, index) => ({
    u: image?.url || '',
    t: image?.title || `Referencia ${index + 1}`,
  })).filter((image) => image.u);

  if (!styleSlugs.length && !palette.length && !customImages.length) {
    return null;
  }

  return {
    p: moodboard.projectName || post.title || 'Dossie Editorial WG Almeida',
    n: moodboard.clientName || 'Leitor WG Almeida',
    c: palette,
    s: styleSlugs,
    i: customImages,
    ext: post.slug,
  };
};

const encodeMoodboardValue = (value) => {
  if (!value) return '';
  if (typeof window !== 'undefined' && window.btoa) {
    return encodeURIComponent(window.btoa(unescape(encodeURIComponent(JSON.stringify(value)))));
  }

  return encodeURIComponent(Buffer.from(JSON.stringify(value), 'utf8').toString('base64'));
};

export const buildBlogMoodboardShareUrl = (post = {}) => {
  const payload = buildMoodboardPayload(post);
  if (!payload) return '';
  return `/moodboard/share?v=${encodeMoodboardValue(payload)}`;
};

const normalizePostRecord = (record = {}, fallback = {}) => {
  const slug = slugify(record.slug || fallback.slug || record.title || fallback.title || '');
  const title = String(record.title || fallback.title || '').trim();
  if (!slug || !title) return null;

  const date = String(record.date || fallback.date || new Date().toISOString().slice(0, 10)).trim();
  const category = String(record.category || fallback.category || 'arquitetura').trim();
  const tags = uniqueStrings([ensureArray(fallback.tags), ensureArray(record.tags)]);
  const relatedSlugs = uniqueStrings([ensureArray(fallback.relatedSlugs), ensureArray(record.relatedSlugs)]).filter(
    (relatedSlug) => relatedSlug !== slug
  );

  const moodboard = {
    projectName: record.moodboard?.projectName || fallback.moodboard?.projectName || title,
    clientName: record.moodboard?.clientName || fallback.moodboard?.clientName || 'Leitor WG Almeida',
    palette: uniqueStrings([ensureArray(fallback.moodboard?.palette), ensureArray(record.moodboard?.palette)]),
    styleSlugs: uniqueStrings([ensureArray(fallback.moodboard?.styleSlugs), ensureArray(record.moodboard?.styleSlugs)]),
    referenceImages: ensureArray(record.moodboard?.referenceImages || fallback.moodboard?.referenceImages)
      .map((image) => ({
        title: String(image?.title || '').trim(),
        url: String(image?.url || '').trim(),
      }))
      .filter((image) => image.url),
    note: String(record.moodboard?.note || fallback.moodboard?.note || '').trim(),
  };

  const editorialThemeId = String(record.editorialThemeId || fallback.editorialThemeId || '').trim();
  const commercialProfile = {
    serviceId: String(record.commercialProfile?.serviceId || fallback.commercialProfile?.serviceId || '').trim(),
    packageFocus: String(record.commercialProfile?.packageFocus || fallback.commercialProfile?.packageFocus || '').trim(),
  };

  return {
    slug,
    title,
    subtitle: String(record.subtitle || fallback.subtitle || '').trim(),
    excerpt: String(record.excerpt || fallback.excerpt || '').trim(),
    summary: String(record.summary || fallback.summary || '').trim(),
    author: String(record.author || fallback.author || DEFAULT_AUTHOR).trim(),
    category,
    tags,
    seoTitle: String(record.seoTitle || fallback.seoTitle || title).trim(),
    metaDescription: String(record.metaDescription || fallback.metaDescription || record.excerpt || fallback.excerpt || '').trim(),
    date,
    readTime: String(record.readTime || fallback.readTime || '6 min').trim(),
    featured: Boolean(record.featured ?? fallback.featured),
    status: String(record.status || fallback.status || DEFAULT_STATUS).trim(),
    templateId: String(record.templateId || fallback.templateId || MASTER_TEMPLATE_ID).trim(),
    editorialThemeId,
    commercialProfile,
    content: String(record.content || fallback.content || '').trim(),
    coverAlt: String(record.coverAlt || fallback.coverAlt || title).trim(),
    gallery: ensureArray(record.gallery || fallback.gallery).map((item) => ({
      src: String(item?.src || '').trim(),
      alt: String(item?.alt || '').trim(),
      caption: String(item?.caption || '').trim(),
    })).filter((item) => item.src),
    faq: ensureArray(record.faq || fallback.faq).map((item) => ({
      question: String(item?.question || '').trim(),
      answer: String(item?.answer || '').trim(),
    })).filter((item) => item.question && item.answer),
    cta: {
      label: String(record.cta?.label || fallback.cta?.label || 'Quero levar essa referência para o meu projeto').trim(),
      href: String(record.cta?.href || fallback.cta?.href || '/solicite-proposta').trim(),
      helper: String(record.cta?.helper || fallback.cta?.helper || '').trim(),
    },
    relatedSlugs,
    moodboard,
    updatedAt: String(record.updatedAt || new Date().toISOString()).trim(),
    publishedAt: String(record.publishedAt || fallback.publishedAt || '').trim(),
  };
};

const generatedPosts = BLOG_CMS_GENERATED?.posts && typeof BLOG_CMS_GENERATED.posts === 'object'
  ? BLOG_CMS_GENERATED.posts
  : {};

export const getDraftPosts = () => readStorageRecord(DRAFTS_KEY);
export const getPublishedPosts = () => ({
  ...generatedPosts,
  ...readStorageRecord(PUBLISHED_KEY),
});

export const saveDraftPost = (post) => {
  const normalized = normalizePostRecord(post);
  if (!normalized) return null;
  const current = getDraftPosts();
  const next = {
    ...current,
    [normalized.slug]: normalized,
  };
  writeStorageRecord(DRAFTS_KEY, next);
  return normalized;
};

export const publishPost = (post) => {
  const normalized = normalizePostRecord({
    ...post,
    status: post?.status || 'published',
    publishedAt: post?.publishedAt || new Date().toISOString(),
  });
  if (!normalized) return null;
  const current = getPublishedPosts();
  const next = {
    ...current,
    [normalized.slug]: normalized,
  };
  writeStorageRecord(PUBLISHED_KEY, next);
  return normalized;
};

export const deleteDraftPost = (slug) => {
  const current = getDraftPosts();
  if (!current[slug]) return;
  delete current[slug];
  writeStorageRecord(DRAFTS_KEY, current);
};

export const clonePostRecord = (source = {}, nextSlug, nextTitle) => normalizePostRecord({
  ...source,
  slug: nextSlug,
  title: nextTitle,
  featured: false,
  status: 'draft',
  publishedAt: '',
  updatedAt: new Date().toISOString(),
});

export const collectTaxonomies = (articles = []) => {
  const generatedTaxonomies = BLOG_CMS_GENERATED?.taxonomies || {};
  const authors = uniqueStrings([
    generatedTaxonomies.authors,
    articles.map((article) => article.author || DEFAULT_AUTHOR),
  ]);
  const categories = uniqueStrings([
    generatedTaxonomies.categories,
    articles.map((article) => article.category || 'arquitetura'),
  ]);
  const tags = uniqueStrings([
    generatedTaxonomies.tags,
    articles.flatMap((article) => ensureArray(article.tags)),
  ]);

  return { authors, categories, tags };
};

export const mergeArticlesWithCms = (baseArticles = []) => {
  const published = getPublishedPosts();
  const map = new Map();

  baseArticles.forEach((article) => {
    const override = published[article.slug];
    const normalized = normalizePostRecord(override || article, article);
    if (normalized && normalized.status === 'published') {
      map.set(normalized.slug, {
        ...article,
        ...normalized,
        tags: normalized.tags,
        moodboardShareUrl: buildBlogMoodboardShareUrl(normalized),
      });
    }
  });

  Object.entries(published).forEach(([slug, record]) => {
    if (map.has(slug)) return;
    const normalized = normalizePostRecord(record);
    if (!normalized || normalized.status !== 'published') return;
    map.set(slug, {
      ...normalized,
      image: normalized.image || '',
      imageCard: normalized.imageCard || '',
      imageHero: normalized.imageHero || '',
      moodboardShareUrl: buildBlogMoodboardShareUrl(normalized),
    });
  });

  return Array.from(map.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
};

const getMetricStore = () => readStorageRecord(METRICS_KEY);
const getCommentStore = () => readStorageRecord(COMMENTS_KEY);

const writeMetricStore = (value) => writeStorageRecord(METRICS_KEY, value);
const writeCommentStore = (value) => writeStorageRecord(COMMENTS_KEY, value);

export const getArticleMetrics = (slug) => {
  const store = getMetricStore();
  return store[slug] || {
    likes: 0,
    shares: 0,
    comments: 0,
    liked: false,
    shareBreakdown: {},
  };
};

export const toggleArticleLike = (slug) => {
  const store = getMetricStore();
  const current = getArticleMetrics(slug);
  const liked = !current.liked;
  const next = {
    ...current,
    liked,
    likes: Math.max(0, current.likes + (liked ? 1 : -1)),
  };
  store[slug] = next;
  writeMetricStore(store);
  return next;
};

export const registerArticleShare = (slug, network = 'link') => {
  const store = getMetricStore();
  const current = getArticleMetrics(slug);
  const next = {
    ...current,
    shares: current.shares + 1,
    shareBreakdown: {
      ...(current.shareBreakdown || {}),
      [network]: Number(current.shareBreakdown?.[network] || 0) + 1,
    },
  };
  store[slug] = next;
  writeMetricStore(store);
  return next;
};

export const getApprovedComments = (slug) => {
  const store = getCommentStore();
  return ensureArray(store[slug]).filter((comment) => comment.status !== 'hidden');
};

export const getAllArticleComments = (slug) => {
  const store = getCommentStore();
  return ensureArray(store[slug]);
};

export const createArticleComment = (slug, payload = {}) => {
  const store = getCommentStore();
  const existing = ensureArray(store[slug]);
  const comment = {
    id: `${slug}-${Date.now()}`,
    name: String(payload.name || 'Leitor WG').trim() || 'Leitor WG',
    body: String(payload.body || '').trim(),
    createdAt: new Date().toISOString(),
    status: 'approved',
  };
  if (!comment.body) return null;
  store[slug] = [comment, ...existing];
  writeCommentStore(store);

  const metricsStore = getMetricStore();
  metricsStore[slug] = {
    ...getArticleMetrics(slug),
    comments: ensureArray(store[slug]).filter((entry) => entry.status !== 'hidden').length,
  };
  writeMetricStore(metricsStore);

  return comment;
};

export const moderateArticleComment = (slug, commentId, status = 'hidden') => {
  const store = getCommentStore();
  const nextComments = ensureArray(store[slug]).map((comment) =>
    comment.id === commentId ? { ...comment, status } : comment
  );
  store[slug] = nextComments;
  writeCommentStore(store);

  const metricsStore = getMetricStore();
  metricsStore[slug] = {
    ...getArticleMetrics(slug),
    comments: nextComments.filter((entry) => entry.status !== 'hidden').length,
  };
  writeMetricStore(metricsStore);
};

export const buildEditablePost = (article = {}) => normalizePostRecord(article, article);

export const buildEmptyPost = () => normalizePostRecord({
  slug: '',
  title: 'Novo artigo editorial',
  subtitle: '',
  excerpt: '',
  summary: '',
  author: DEFAULT_AUTHOR,
  category: 'arquitetura',
  tags: [],
  date: new Date().toISOString().slice(0, 10),
  readTime: '6 min',
  featured: false,
  status: 'draft',
  templateId: MASTER_TEMPLATE_ID,
  editorialThemeId: '',
  commercialProfile: {
    serviceId: '',
    packageFocus: '',
  },
  content: '## Introdução\n\nComece aqui.\n',
  coverAlt: '',
  gallery: [],
  faq: [],
  relatedSlugs: [],
  moodboard: {
    projectName: 'Dossie Editorial WG Almeida',
    clientName: 'Leitor WG Almeida',
    palette: [],
    styleSlugs: [],
    referenceImages: [],
    note: '',
  },
});

export async function syncPublishedPostsToApi(payload = {}) {
  const response = await fetch('/api/blog-cms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || 'Falha ao sincronizar CMS do blog.');
  }

  return response.json();
}

export {
  COMMENTS_KEY,
  DEFAULT_AUTHOR,
  DEFAULT_STATUS,
  DRAFTS_KEY,
  MASTER_TEMPLATE_ID,
  METRICS_KEY,
  PUBLISHED_KEY,
};
