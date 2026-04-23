import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const BLOG_OVERRIDES_PATH = path.join(process.cwd(), 'src', 'data', 'blogImageOverrides.generated.js');
const PAGE_OVERRIDES_PATH = path.join(process.cwd(), 'src', 'data', 'publicPageImageOverrides.generated.js');
const CONTEXT_SLOT_NAMES = ['context1', 'context2', 'context3', 'context4'];
const UNSPLASH_VARIANT_SIZES = {
  hero: { width: 1600, height: 900 },
  card: { width: 960, height: 640 },
  context: { width: 1280, height: 720 },
};

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const normalizeSource = (src = '') => {
  if (!isNonEmptyString(src)) return 'remote';
  if (src.startsWith('/')) return 'local';
  if (src.includes('unsplash.com')) return 'unsplash';
  return 'remote';
};

const normalizeSlotOverride = (slotValue) => {
  if (!slotValue || typeof slotValue !== 'object') return null;

  const publicId = isNonEmptyString(slotValue.publicId) ? slotValue.publicId.trim() : '';
  const src = isNonEmptyString(slotValue.src)
    ? slotValue.src.trim()
    : isNonEmptyString(slotValue.secureUrl)
      ? slotValue.secureUrl.trim()
      : '';

  if (!publicId && !src) return null;

  const alt = isNonEmptyString(slotValue.alt) ? slotValue.alt.trim() : '';
  const page = isNonEmptyString(slotValue.pageUrl) ? slotValue.pageUrl.trim() : '';
  const caption = isNonEmptyString(slotValue.caption) ? slotValue.caption.trim() : '';
  const sectionTitle = isNonEmptyString(slotValue.sectionTitle) ? slotValue.sectionTitle.trim() : '';
  const sectionId = isNonEmptyString(slotValue.sectionId) ? slotValue.sectionId.trim() : '';

  if (publicId) {
    return {
      source: 'cloudinary',
      publicId,
      src,
      alt,
      page,
      caption,
      sectionTitle,
      sectionId,
    };
  }

  return {
    source: normalizeSource(src),
    src,
    alt,
    page,
    caption,
    sectionTitle,
    sectionId,
  };
};

const cleanFields = (value) => {
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => {
      if (fieldValue == null) return false;
      if (typeof fieldValue === 'string') return fieldValue.trim().length > 0;
      return true;
    })
  );
};

const normalizeUnsplashSelectionValue = (value) => {
  if (!value) return { id: '', alt: '' };
  if (typeof value === 'string') return { id: value.trim(), alt: '' };
  if (typeof value === 'object') {
    return {
      id: isNonEmptyString(value.id) ? value.id.trim() : '',
      alt: isNonEmptyString(value.alt) ? value.alt.trim() : '',
      caption: isNonEmptyString(value.caption) ? value.caption.trim() : '',
      sectionTitle: isNonEmptyString(value.sectionTitle) ? value.sectionTitle.trim() : '',
      sectionId: isNonEmptyString(value.sectionId) ? value.sectionId.trim() : '',
      page: isNonEmptyString(value.page) ? value.page.trim() : '',
      pageUrl: isNonEmptyString(value.pageUrl) ? value.pageUrl.trim() : '',
    };
  }
  return { id: '', alt: '' };
};

const buildUnsplashPhotoPageUrl = (photoId) =>
  photoId ? `https://unsplash.com/photos/${encodeURIComponent(photoId)}` : '';

const buildUnsplashDownloadUrl = (photoId, variant = 'card') => {
  if (!photoId) return '';
  const size = UNSPLASH_VARIANT_SIZES[variant] || UNSPLASH_VARIANT_SIZES.card;
  return `https://unsplash.com/photos/${encodeURIComponent(photoId)}/download?force=true&w=${size.width}&h=${size.height}&fit=crop`;
};

const extractSlotMetadata = (slotValue = {}) => cleanFields({
  alt: isNonEmptyString(slotValue.alt) ? slotValue.alt.trim() : '',
  page: isNonEmptyString(slotValue.page) ? slotValue.page.trim() : '',
  pageUrl: isNonEmptyString(slotValue.pageUrl) ? slotValue.pageUrl.trim() : '',
  caption: isNonEmptyString(slotValue.caption) ? slotValue.caption.trim() : '',
  sectionTitle: isNonEmptyString(slotValue.sectionTitle) ? slotValue.sectionTitle.trim() : '',
  sectionId: isNonEmptyString(slotValue.sectionId) ? slotValue.sectionId.trim() : '',
});

const buildUnsplashSelectionOverride = (selectionValue, slotName, metadataFallback = {}) => {
  const selection = normalizeUnsplashSelectionValue(selectionValue);
  if (!selection.id) return null;

  const variant = /^context\d+$/.test(slotName) ? 'context' : slotName === 'hero' ? 'hero' : 'card';
  return cleanFields({
    source: 'unsplash',
    src: buildUnsplashDownloadUrl(selection.id, variant),
    alt: metadataFallback.alt || selection.alt || '',
    page: metadataFallback.page || metadataFallback.pageUrl || selection.page || selection.pageUrl || buildUnsplashPhotoPageUrl(selection.id),
    caption: metadataFallback.caption || selection.caption || '',
    sectionTitle: metadataFallback.sectionTitle || selection.sectionTitle || '',
    sectionId: metadataFallback.sectionId || selection.sectionId || '',
  });
};

const getUnsplashContextSelection = (slotName, unsplashSelections = {}) => {
  const directSelection = unsplashSelections?.[slotName];
  if (directSelection) return directSelection;

  const slotIndex = CONTEXT_SLOT_NAMES.indexOf(slotName);
  if (slotIndex < 0) return null;

  const contextArray = Array.isArray(unsplashSelections?.context) ? unsplashSelections.context : [];
  return contextArray[slotIndex] || null;
};

export const buildBlogOverrideEntry = (slots = {}, unsplashSelections = {}) => {
  const hero = cleanFields(normalizeSlotOverride(slots.hero))
    || buildUnsplashSelectionOverride(unsplashSelections.hero, 'hero', extractSlotMetadata(slots.hero));
  const card = cleanFields(normalizeSlotOverride(slots.card))
    || buildUnsplashSelectionOverride(unsplashSelections.card, 'card', extractSlotMetadata(slots.card));
  const context = CONTEXT_SLOT_NAMES
    .map((slotName) => cleanFields(normalizeSlotOverride(slots[slotName]))
      || buildUnsplashSelectionOverride(
        getUnsplashContextSelection(slotName, unsplashSelections),
        slotName,
        extractSlotMetadata(slots[slotName]),
      ))
    .filter(Boolean);

  if (!hero && !card && context.length === 0) return null;

  const entry = {};

  if (hero) {
    entry.hero = hero;
    entry.seo = hero;
  }

  if (card) {
    entry.card = card;
    entry.thumb = card;
    entry.square = card;
  }

  if (hero || card) {
    entry.default = hero || card;
  }

  if (context.length > 0) {
    entry.context = context;
  }

  return entry;
};

export const buildPageOverrideEntry = (slots = {}) => {
  const hero = cleanFields(normalizeSlotOverride(slots.hero));
  if (!hero) return null;
  return { hero };
};

const serializeJsModule = (constName, value) => {
  const json = JSON.stringify(value, null, 2);
  return `const ${constName} = ${json};\n\nexport default ${constName};\n`;
};

const loadGeneratedModule = async (filePath, exportName) => {
  try {
    const moduleUrl = `${pathToFileURL(filePath).href}?ts=${Date.now()}`;
    const imported = await import(moduleUrl);
    return imported.default || imported[exportName] || null;
  } catch {
    return null;
  }
};

export async function syncEditorialOverrides({
  uploads = {},
  unsplashSelections = {},
  managedBlogSlugs = [],
  managedPageSlugs = [],
  source = 'admin-editorial-sync',
} = {}) {
  const existingBlog = await loadGeneratedModule(BLOG_OVERRIDES_PATH, 'BLOG_IMAGE_OVERRIDES');
  const existingPages = await loadGeneratedModule(PAGE_OVERRIDES_PATH, 'PUBLIC_PAGE_IMAGE_OVERRIDES');

  const nextBlogSlugs = {
    ...(existingBlog?.slugs || {}),
  };
  const nextPages = {
    ...(existingPages?.pages || {}),
  };

  const managedBlogSet = new Set(managedBlogSlugs.filter(isNonEmptyString));
  const managedPageSet = new Set(managedPageSlugs.filter(isNonEmptyString));

  managedBlogSet.forEach((slug) => {
    const nextEntry = buildBlogOverrideEntry(uploads?.[slug] || {}, unsplashSelections?.[slug] || {});
    if (nextEntry) {
      nextBlogSlugs[slug] = nextEntry;
      return;
    }
    delete nextBlogSlugs[slug];
  });

  managedPageSet.forEach((slug) => {
    const nextEntry = buildPageOverrideEntry(uploads?.[slug] || {});
    if (nextEntry) {
      nextPages[slug] = nextEntry;
      return;
    }
    delete nextPages[slug];
  });

  const generatedAt = new Date().toISOString();

  const blogPayload = {
    generatedAt,
    source,
    slugs: nextBlogSlugs,
  };
  const pagePayload = {
    generatedAt,
    source,
    pages: nextPages,
  };

  // Escrita no FS pode falhar em ambientes read-only (ex: Vercel serverless).
  // Retorna sucesso parcial para o cliente publicar via localStorage de qualquer forma.
  let fsWriteOk = true;
  let fsWriteNote = '';
  try {
    await fs.writeFile(BLOG_OVERRIDES_PATH, serializeJsModule('BLOG_IMAGE_OVERRIDES', blogPayload), 'utf8');
    await fs.writeFile(PAGE_OVERRIDES_PATH, serializeJsModule('PUBLIC_PAGE_IMAGE_OVERRIDES', pagePayload), 'utf8');
  } catch {
    fsWriteOk = false;
    fsWriteNote = 'FS read-only (Vercel). Overrides publicados via localStorage no cliente.';
  }

  return {
    ok: true,
    generatedAt,
    source,
    fsWriteOk,
    fsWriteNote,
    blog: {
      target: BLOG_OVERRIDES_PATH,
      synced: Object.keys(nextBlogSlugs).length,
      managed: managedBlogSet.size,
    },
    pages: {
      target: PAGE_OVERRIDES_PATH,
      synced: Object.keys(nextPages).length,
      managed: managedPageSet.size,
    },
  };
}
