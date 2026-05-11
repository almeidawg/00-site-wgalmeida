import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const BLOG_CMS_PATH = path.join(process.cwd(), 'src', 'data', 'blogCms.generated.js');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const slugify = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

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

const uniqueStrings = (values = []) =>
  Array.from(
    new Set(
      values
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    )
  );

const normalizePost = (record = {}) => {
  const slug = slugify(record.slug || record.title || '');
  const title = String(record.title || '').trim();
  if (!slug || !title) return null;

  return {
    slug,
    title,
    subtitle: String(record.subtitle || '').trim(),
    excerpt: String(record.excerpt || '').trim(),
    summary: String(record.summary || '').trim(),
    author: String(record.author || 'Grupo WG Almeida').trim(),
    category: String(record.category || 'arquitetura').trim(),
    tags: uniqueStrings(ensureArray(record.tags)),
    seoTitle: String(record.seoTitle || title).trim(),
    metaDescription: String(record.metaDescription || record.excerpt || '').trim(),
    date: String(record.date || new Date().toISOString().slice(0, 10)).trim(),
    readTime: String(record.readTime || '6 min').trim(),
    featured: Boolean(record.featured),
    status: String(record.status || 'published').trim(),
    templateId: String(record.templateId || 'legacy-architects-master-v1').trim(),
    content: String(record.content || '').trim(),
    coverAlt: String(record.coverAlt || title).trim(),
    gallery: ensureArray(record.gallery).map((item) => ({
      src: String(item?.src || '').trim(),
      alt: String(item?.alt || '').trim(),
      caption: String(item?.caption || '').trim(),
    })).filter((item) => item.src),
    faq: ensureArray(record.faq).map((item) => ({
      question: String(item?.question || '').trim(),
      answer: String(item?.answer || '').trim(),
    })).filter((item) => item.question && item.answer),
    cta: {
      label: String(record.cta?.label || 'Quero levar essa referência para o meu projeto').trim(),
      href: String(record.cta?.href || '/solicite-proposta').trim(),
      helper: String(record.cta?.helper || '').trim(),
    },
    relatedSlugs: uniqueStrings(ensureArray(record.relatedSlugs)).filter((relatedSlug) => relatedSlug !== slug),
    moodboard: {
      projectName: String(record.moodboard?.projectName || title).trim(),
      clientName: String(record.moodboard?.clientName || 'Leitor WG Almeida').trim(),
      palette: uniqueStrings(ensureArray(record.moodboard?.palette)),
      styleSlugs: uniqueStrings(ensureArray(record.moodboard?.styleSlugs)),
      referenceImages: ensureArray(record.moodboard?.referenceImages).map((image) => ({
        title: String(image?.title || '').trim(),
        url: String(image?.url || '').trim(),
      })).filter((image) => image.url),
      note: String(record.moodboard?.note || '').trim(),
    },
    publishedAt: String(record.publishedAt || new Date().toISOString()).trim(),
    updatedAt: String(record.updatedAt || new Date().toISOString()).trim(),
  };
};

const serializeJsModule = (constName, value) => {
  const json = JSON.stringify(value, null, 2);
  return `const ${constName} = ${json};\n\nexport default ${constName};\n`;
};

const loadGeneratedModule = async () => {
  try {
    const moduleUrl = `${pathToFileURL(BLOG_CMS_PATH).href}?ts=${Date.now()}`;
    const imported = await import(moduleUrl);
    return imported.default || null;
  } catch {
    return null;
  }
};

export async function syncBlogCms({
  posts = {},
  taxonomies = {},
  source = 'admin-blog-cms',
} = {}) {
  const current = await loadGeneratedModule();
  const currentPosts = current?.posts && typeof current.posts === 'object' ? current.posts : {};
  const nextPosts = { ...currentPosts };

  Object.entries(posts || {}).forEach(([slug, record]) => {
    if (!record || record.status === 'archived') {
      delete nextPosts[slug];
      return;
    }

    const normalized = normalizePost({ ...record, slug });
    if (normalized) {
      nextPosts[normalized.slug] = normalized;
    }
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    source,
    taxonomies: {
      authors: uniqueStrings(taxonomies.authors),
      categories: uniqueStrings(taxonomies.categories),
      tags: uniqueStrings(taxonomies.tags),
    },
    posts: nextPosts,
  };

  let fsWriteOk = true;
  let fsWriteNote = '';

  try {
    await fs.writeFile(BLOG_CMS_PATH, serializeJsModule('BLOG_CMS_GENERATED', payload), 'utf8');
  } catch {
    fsWriteOk = false;
    fsWriteNote = 'FS read-only. Publicacao mantida apenas no cliente/localStorage.';
  }

  return {
    ok: true,
    generatedAt: payload.generatedAt,
    source,
    fsWriteOk,
    fsWriteNote,
    posts: {
      target: BLOG_CMS_PATH,
      count: Object.keys(nextPosts).length,
    },
  };
}
