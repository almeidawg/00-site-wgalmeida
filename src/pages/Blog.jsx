import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from '@/lib/motion-lite';
import SEO, { schemas } from '@/components/SEO';
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  ArrowRight,
  Filter,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Copy,
  Twitter,
  Linkedin,
  Facebook,
  Hammer,
  Building2,
  Ruler,
  Globe,
  LayoutGrid,
  Tag,
  MessageCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ResponsiveWebpImage from '@/components/ResponsiveWebpImage';
import { getPublicPageImageSrc } from '@/data/publicPageImageCatalog';
import { getBlogContextAssets, getBlogImageAsset, getBlogImageUrl } from '@/data/blogImageManifest';
import { parseFrontmatter } from '@/utils/frontmatter';
import ICCRILinksBlock from '@/components/ICCRILinksBlock';
import SmartCTA from '@/components/SmartCTA';
import BlogEngagementPanel from '@/components/blog/BlogEngagementPanel';
import BlogMoodboardPanel from '@/components/blog/BlogMoodboardPanel';
import CommercialGovernancePanel from '@/components/blog/CommercialGovernancePanel';
import EditorialThemeBadge from '@/components/blog/EditorialThemeBadge';
import { getArticleMetrics, mergeArticlesWithCms, registerArticleShare } from '@/data/blogCms';
import { getEditorialTheme, resolveEditorialThemeId } from '@/data/editorialThemes';
import { getCommercialPublicationValidation, resolveCommercialTokens } from '@/data/commercialGovernance';

const BLOG_HERO_IMAGE = getPublicPageImageSrc('blog', '/images/banners/PROCESSOS.webp');

const handleArticleImageError = (event) => {
  if (event.currentTarget.dataset.fallbackApplied === 'true') return;
  event.currentTarget.dataset.fallbackApplied = 'true';
  event.currentTarget.src = BLOG_HERO_IMAGE;
};

const categories = [
  { id: 'all', label: 'all', icon: Globe, color: 'text-wg-gray', bgColor: 'bg-gray-100' },
  { id: 'arquitetura', label: 'architecture', icon: Ruler, color: 'text-wg-green', bgColor: 'bg-wg-green' },
  { id: 'engenharia', label: 'engineering', icon: Building2, color: 'text-wg-blue', bgColor: 'bg-wg-blue' },
  { id: 'marcenaria', label: 'carpentry', icon: Hammer, color: 'text-white', bgColor: 'bg-wg-brown' },
];

const getArticleTopic = (article = {}) => resolveEditorialThemeId(article);
const getArticleTheme = (article = {}) => getEditorialTheme(article);
const getArticleTagClass = (article) => getArticleTheme(article).tagClass;
const getArticleLineClass = (article) => getArticleTheme(article).lineClass;
const getArticleCardHoverClass = (article) => getArticleTheme(article).cardHoverClass;
const getArticleIconClass = (article) => getArticleTheme(article).iconClass;
const getArticlePillHoverClass = (article) => getArticleTheme(article).pillHoverClass;
const getArticleCtaHoverClass = (article) => getArticleTheme(article).ctaHoverClass;
const getArticleCtaBorderVars = (article) => getArticleTheme(article).ctaBorderVars;
const getArticleTocHoverClass = (article) => getArticleTheme(article).tocHoverClass;
const getArticleTocReadingClass = (article) => getArticleTheme(article).tocReadingClass;
const getArticleMarkerClass = (article) => getArticleTheme(article).markerClass;

const normalizeArticleTags = (tags) => {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean);
  if (typeof tags === 'string') {
    const trimmed = tags.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return normalizeArticleTags(parsed);
      } catch {
        return trimmed
          .slice(1, -1)
          .split(',')
          .map((tag) => tag.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      }
    }
    return trimmed.split(',').map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
};

const getHeroObjectPosition = (asset) => {
  if (!asset || typeof asset !== 'object') return 'center center';
  if (asset.objectPosition) return asset.objectPosition;
  if (asset.subject === 'person' || asset.alt?.toLowerCase().includes('retrato')) return 'center top';
  return 'center center';
};

const normalizeHeadingId = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const normalizeComparableLabel = (value = '') =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const uniqueLabels = (labels = []) => {
  const seen = new Set();
  return labels.filter((label) => {
    const key = normalizeComparableLabel(label);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const stripMarkdownTitle = (content = '') => content.replace(/^#\s+.*(?:\r?\n)+/, '');

const stripDuplicateTocSection = (markdown = '') =>
  markdown
    .replace(
      /(^|\n)##\s*(?:Neste artigo|In this article|En este articulo|En este artículo)\s*\n+(?:(?:[-*+]\s+.+|[0-9]+\.\s+.+)\n)+/i,
      '$1'
    )
    .trim();

const splitMarkdownByH2 = (content = '') => {
  const blocks = content.split(/(?=^##\s(?!#))/m).filter(Boolean);
  const intro = blocks[0]?.startsWith('## ') ? '' : blocks.shift() || '';

  return {
    intro,
    sections: blocks.map((block, index) => {
      const heading = block.match(/^##\s+(.+)$/m)?.[1]?.trim() || `secao-${index + 1}`;
      return {
        id: normalizeHeadingId(heading),
        heading,
        content: block,
      };
    }),
  };
};

const buildContextImageInsertions = (sections = [], assets = []) => {
  const insertions = new Map();
  if (!sections.length || !assets.length) return insertions;

  assets.forEach((asset, index) => {
    const targetId = normalizeHeadingId(asset.sectionTitle || '');
    let sectionIndex = targetId ? sections.findIndex((section) => section.id === targetId) : -1;

    if (targetId && sectionIndex < 0) {
      return;
    }

    if (sectionIndex < 0) {
      sectionIndex = Math.min(
        sections.length - 1,
        Math.floor(((index + 1) * sections.length) / (assets.length + 1))
      );
    }

    const sectionKey = sections[sectionIndex].id;
    insertions.set(sectionKey, [...(insertions.get(sectionKey) || []), asset]);
  });

  return insertions;
};

const getTocHeadings = (sections = []) =>
  sections.map((section) => ({
    id: section.id,
    text: section.heading,
  }));

const ContextImageFigure = ({ asset }) => {
  if (!asset?.src) return null;

  return (
    <figure className="not-prose my-12 overflow-hidden rounded-2xl border border-black/5 bg-gray-50 shadow-sm">
      <div className="overflow-hidden bg-gray-100 p-3 md:p-5">
        <img
          src={asset.src}
          alt={asset.alt || asset.caption || ''}
          className="mx-auto max-h-[68vh] w-full scale-[1.03] object-contain transition-transform duration-[1400ms] ease-out hover:scale-100"
          loading="lazy"
          onError={handleArticleImageError}
        />
      </div>
      {(asset.caption || asset.sourceLabel || asset.page) && (
        <figcaption className="px-5 py-4 text-[13px] font-light leading-relaxed text-wg-gray">
          {asset.caption}
          {asset.sourceLabel && (
            <>
              {' '}
              <span className="text-gray-400">Fonte:</span>{' '}
              {asset.page ? (
                <a href={asset.page} target="_blank" rel="noreferrer" className="text-wg-orange hover:text-wg-black">
                  {asset.sourceLabel}
                </a>
              ) : (
                <span>{asset.sourceLabel}</span>
              )}
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
};

const ContextImagePanel = ({ asset }) => {
  if (!asset?.src) return null;

  return (
    <figure className="not-prose flex h-full flex-col overflow-hidden bg-[#ECECE8]">
      <div className="group relative min-h-[240px] flex-1 overflow-hidden bg-[#ECECE8] lg:min-h-[320px]">
        <img
          src={asset.src}
          alt={asset.alt || asset.caption || ''}
          className="h-full w-full scale-[1.035] object-cover object-center transition-transform duration-[1800ms] ease-out group-hover:scale-100"
          loading="lazy"
          onError={handleArticleImageError}
        />
      </div>
      {(asset.caption || asset.sourceLabel) && (
        <figcaption className="bg-white px-4 py-3">
          {asset.caption && (
            <p className="text-[12px] font-light leading-relaxed text-wg-gray">{asset.caption}</p>
          )}
        {asset.sourceLabel && (
          <p className="mt-2 text-[10px] font-light uppercase tracking-[0.12em] text-wg-gray">
            Fonte:{' '}
            {asset.page ? (
              <a href={asset.page} target="_blank" rel="noreferrer" className="text-wg-orange hover:text-wg-black">
                {asset.sourceLabel}
              </a>
            ) : (
              <span>{asset.sourceLabel}</span>
            )}
          </p>
        )}
        </figcaption>
      )}
    </figure>
  );
};

const buildEditorialRows = (articles = []) => {
  const rows = [];
  let cursor = 0;
  let featureSide = 'left';

  while (cursor < articles.length) {
    const standardArticles = articles.slice(cursor, cursor + 4);
    if (standardArticles.length > 0) {
      rows.push({
        id: `standard-${cursor}`,
        type: 'standard',
        articles: standardArticles,
      });
      cursor += standardArticles.length;
    }

    if (cursor >= articles.length) break;

    const featureArticles = articles.slice(cursor, cursor + 3);
    if (featureArticles.length < 3) {
      rows.push({
        id: `standard-tail-${cursor}`,
        type: 'standard',
        articles: featureArticles,
      });
      break;
    }

    rows.push({
      id: `feature-${featureSide}-${cursor}`,
      type: 'feature',
      side: featureSide,
      lead: featureSide === 'left' ? featureArticles[0] : featureArticles[2],
      support: featureSide === 'left' ? featureArticles.slice(1) : featureArticles.slice(0, 2),
    });

    cursor += 3;
    featureSide = featureSide === 'left' ? 'right' : 'left';
  }

  return rows;
};

const Blog = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [activeReadingId, setActiveReadingId] = useState('');
  const [articleMetrics, setArticleMetrics] = useState({
    likes: 0,
    shares: 0,
    comments: 0,
    liked: false,
    shareBreakdown: {},
  });

  const currentLang = i18n.language.startsWith('en') ? 'en' : i18n.language.startsWith('es') ? 'es' : 'pt-BR';
  const dateLocale = currentLang === 'en' ? 'en-US' : currentLang === 'es' ? 'es-ES' : 'pt-BR';

  // Carregamento dinâmico de artigos baseado no idioma
  useEffect(() => {
    const loadArticles = async () => {
      setLoading(true);
      try {
        let modules;
        if (currentLang === 'en') {
          modules = import.meta.glob('/src/content/blog/en/*.md', { eager: true });
        } else if (currentLang === 'es') {
          modules = import.meta.glob('/src/content/blog/es/*.md', { eager: true });
        } else {
          modules = import.meta.glob('/src/content/blog/*.md', { eager: true });
        }

        const articleList = Object.entries(modules).map(([path, module]) => {
          const derivedSlug = path.split('/').pop().replace('.md', '');
          const rawContent = typeof module.default === 'string' ? module.default : '';
          const { data, content } = parseFrontmatter(rawContent);
          const articleSlug = data.slug || derivedSlug;
          const imageCard = getBlogImageUrl({
            slug: articleSlug,
            category: data.category,
            variant: 'card',
          }) || data.image || '/images/blog/placeholder.webp';
          const imageHero = getBlogImageUrl({
            slug: articleSlug,
            category: data.category,
            variant: 'hero',
          }) || data.image || BLOG_HERO_IMAGE;

          return {
            slug: articleSlug,
            ...data,
            tags: normalizeArticleTags(data.tags),
            editorialThemeId: data.editorialThemeId || '',
            commercialProfile: data.commercialProfile || {},
            image: imageCard,
            imageCard,
            imageHero,
            content,
          };
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        setArticles(mergeArticlesWithCms(articleList));
      } catch (error) {
        console.error('Erro ao carregar artigos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [currentLang]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!slug) return;
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setArticleMetrics(getArticleMetrics(slug));
  }, [slug]);

  const filteredArticles = articles.filter(article => {
    const haystack = `${article.title || ''} ${article.excerpt || ''} ${article.summary || ''}`.toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || article.category?.toLowerCase() === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticle = filteredArticles.find(a => a.featured) || filteredArticles[0];
  const otherArticles = filteredArticles.filter(a => a.slug !== featuredArticle?.slug);
  const leadArticle = otherArticles[0];
  const sideHighlightArticles = otherArticles.slice(1, 3);
  const editorialRows = buildEditorialRows(otherArticles.slice(3));
  const selectedArticle = slug ? articles.find((article) => article.slug === slug) : null;
  const liveTocHeadings = useMemo(() => {
    if (!selectedArticle?.content) return [];
    const articleContent = stripDuplicateTocSection(
      stripMarkdownTitle(resolveCommercialTokens(selectedArticle.content, selectedArticle))
    );
    const articleSections = splitMarkdownByH2(articleContent);
    return getTocHeadings(articleSections.sections);
  }, [selectedArticle?.content]);
  const featuredTagClass = getArticleTagClass(featuredArticle);
  const featuredLineClass = getArticleLineClass(featuredArticle);

  useEffect(() => {
    if (!slug || !liveTocHeadings.length) {
      setActiveReadingId('');
      return;
    }

    const hashId = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    setActiveReadingId(hashId || liveTocHeadings[0].id);

    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    const targets = liveTocHeadings.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) setActiveReadingId(visible[0].target.id);
      },
      { root: null, rootMargin: '-30% 0px -55% 0px', threshold: [0.2, 0.35, 0.5] }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [slug, liveTocHeadings]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
    if (slug) {
      setArticleMetrics(registerArticleShare(slug, 'link'));
    }
  };

  const renderStandardCard = (article, index, keyPrefix = 'standard') => {
    const articleTagClass = getArticleTagClass(article);
    const articleLineClass = getArticleLineClass(article);
    const articleCardHoverClass = getArticleCardHoverClass(article);

    return (
      <motion.article
        key={`${keyPrefix}-${article.slug}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
        className={`group bg-white rounded-3xl overflow-hidden border border-black/5 hover:shadow-2xl transition-all duration-500 flex flex-col h-full ${articleCardHoverClass}`}
      >
        <Link to={`/blog/${article.slug}`} className="block aspect-[4/3] overflow-hidden relative">
          <img
            src={article.image || '/images/blog/placeholder.webp'}
            alt={article.title}
            className="w-full h-full scale-105 object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-100"
            onError={handleArticleImageError}
          />
          <div className="absolute top-4 left-4">
            <span className={`rounded-full border px-2.5 py-1 text-[9px] font-light uppercase tracking-[0.12em] backdrop-blur-md ${articleTagClass}`}>
              {article.category}
            </span>
          </div>
        </Link>

        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-3 text-[10px] text-gray-400 uppercase tracking-widest mb-4">
            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(article.date).toLocaleDateString(dateLocale)}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime || '5 min'}</span>
          </div>

          <h3 className="text-lg font-light text-wg-black mb-3 leading-tight group-hover:text-wg-orange transition-colors">
            <Link to={`/blog/${article.slug}`}>{article.title}</Link>
          </h3>

          <p className="text-sm text-wg-gray font-light line-clamp-3 mb-6 flex-1">
            {article.excerpt}
          </p>

          <Link
            to={`/blog/${article.slug}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-wg-black group-hover:text-wg-orange transition-colors"
          >
            {t('blog.readMore')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <span className={`mt-4 block h-px w-0 ${articleLineClass} transition-all duration-500 group-hover:w-20`} />
        </div>
      </motion.article>
    );
  };

  const renderFeatureCard = (article, keyPrefix = 'feature') => {
    const articleTagClass = getArticleTagClass(article);
    const articleLineClass = getArticleLineClass(article);
    const articleCardHoverClass = getArticleCardHoverClass(article);

    return (
      <motion.article
        key={`${keyPrefix}-${article.slug}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-all duration-500 hover:shadow-2xl ${articleCardHoverClass}`}
      >
        <Link to={`/blog/${article.slug}`} className="grid min-h-[24rem] grid-cols-1 md:grid-cols-[42%_1fr]">
          <div className="relative min-h-[15rem] overflow-hidden">
            <img
              src={article.image || '/images/blog/placeholder.webp'}
              alt={article.title}
              className="h-full w-full scale-105 object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-100"
              onError={handleArticleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent md:bg-gradient-to-r" />
            <div className="absolute left-4 top-4">
              <span className={`rounded-full border px-2.5 py-1 text-[9px] font-light uppercase tracking-[0.12em] backdrop-blur-md ${articleTagClass}`}>
                {article.category}
              </span>
            </div>
          </div>

          <div className="flex flex-col p-6 md:p-7">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest text-gray-400">
              <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(article.date).toLocaleDateString(dateLocale)}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime || '5 min'}</span>
            </div>
            <h3 className="mb-4 text-2xl font-light leading-tight text-wg-black transition-colors group-hover:text-wg-orange">
              {article.title}
            </h3>
            <p className="mb-6 line-clamp-4 text-sm font-light leading-relaxed text-wg-gray">
              {article.excerpt}
            </p>
            <span className="mt-auto inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-wg-black transition-colors group-hover:text-wg-orange">
              {t('blog.readMore')} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
            <span className={`mt-4 block h-px w-0 ${articleLineClass} transition-all duration-500 group-hover:w-24`} />
          </div>
        </Link>
      </motion.article>
    );
  };

  const renderSupportCard = (article, index, keyPrefix = 'support') => {
    const articleTagClass = getArticleTagClass(article);
    const articleLineClass = getArticleLineClass(article);
    const articleCardHoverClass = getArticleCardHoverClass(article);

    return (
      <motion.article
        key={`${keyPrefix}-${article.slug}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.05 }}
        className={`group flex h-full overflow-hidden rounded-3xl border border-black/5 bg-white transition-all duration-500 hover:shadow-2xl ${articleCardHoverClass}`}
      >
        <Link to={`/blog/${article.slug}`} className="flex w-full flex-col">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={article.image || '/images/blog/placeholder.webp'}
              alt={article.title}
              className="h-full w-full scale-105 object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-100"
              onError={handleArticleImageError}
            />
            <div className="absolute left-4 top-4">
              <span className={`rounded-full border px-2.5 py-1 text-[9px] font-light uppercase tracking-[0.12em] backdrop-blur-md ${articleTagClass}`}>
                {article.category}
              </span>
            </div>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest text-gray-400">
              <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(article.date).toLocaleDateString(dateLocale)}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime || '5 min'}</span>
            </div>
            <h3 className="mb-3 line-clamp-3 text-base font-light leading-tight text-wg-black transition-colors group-hover:text-wg-orange">
              {article.title}
            </h3>
            <p className="mb-5 line-clamp-3 text-sm font-light leading-relaxed text-wg-gray">
              {article.excerpt}
            </p>
            <span className="mt-auto inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-wg-black transition-colors group-hover:text-wg-orange">
              {t('blog.readMore')} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
            <span className={`mt-4 block h-px w-0 ${articleLineClass} transition-all duration-500 group-hover:w-20`} />
          </div>
        </Link>
      </motion.article>
    );
  };

  if (slug) {
    if (loading) {
      return (
        <section className="min-h-screen bg-white pt-32">
          <div className="container-custom py-20 text-center">
            <p className="text-wg-gray font-light">{t('common.loading')}</p>
          </div>
        </section>
      );
    }

    if (!selectedArticle) {
      return (
        <>
          <SEO
            pathname={`/blog/${slug}`}
            title={t('blogPage.notFound.title')}
            description={t('seo.blog.description')}
          />
          <section className="min-h-screen bg-white pt-32">
            <div className="container-custom max-w-3xl py-20 text-center">
              <p className="mb-6 text-sm uppercase tracking-[0.24em] text-wg-orange">{t('blog.title')}</p>
              <h1 className="mb-6 font-playfair text-4xl text-wg-black">{t('blogPage.notFound.title')}</h1>
              <Link to="/blog" className="inline-flex items-center gap-2 rounded-full bg-wg-black px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-wg-orange">
                <ArrowLeft size={16} />
                {t('nav.blog')}
              </Link>
            </div>
          </section>
        </>
      );
    }

    const resolvedArticleContent = resolveCommercialTokens(selectedArticle.content, selectedArticle);
    const articleContent = stripDuplicateTocSection(stripMarkdownTitle(resolvedArticleContent));
    const articleSections = splitMarkdownByH2(articleContent);
    const contextAssets = getBlogContextAssets({ slug: selectedArticle.slug });
    const tocHeadings = liveTocHeadings;
    const articleHeroAsset = getBlogImageAsset({
      slug: selectedArticle.slug,
      category: selectedArticle.category,
      variant: 'hero',
    });
    const articleCardAsset = getBlogImageAsset({
      slug: selectedArticle.slug,
      category: selectedArticle.category,
      variant: 'card',
    });
    const leadSection = articleSections.sections[0] || null;
    const leadAsset = contextAssets[0] || null;
    const leadTargetId = normalizeHeadingId(leadAsset?.sectionTitle || '');
    const useLeadLayout = Boolean(
      leadSection &&
      leadAsset?.src &&
      (!leadTargetId || leadTargetId === leadSection.id)
    );
    const remainingSections = useLeadLayout ? articleSections.sections.slice(1) : articleSections.sections;
    const remainingAssets = useLeadLayout ? contextAssets.slice(1) : contextAssets;
    const contextInsertions = buildContextImageInsertions(remainingSections, remainingAssets);
    const articleTopic = getArticleTopic(selectedArticle);
    const articleTheme = getArticleTheme(selectedArticle);
    const articleTagClass = getArticleTagClass(selectedArticle);
    const articleCardHoverClass = getArticleCardHoverClass(selectedArticle);
    const articleIconClass = getArticleIconClass(selectedArticle);
    const articlePillHoverClass = getArticlePillHoverClass(selectedArticle);
    const articleCtaHoverClass = getArticleCtaHoverClass(selectedArticle);
    const articleCtaBorderVars = getArticleCtaBorderVars(selectedArticle);
    const articleTocHoverClass = getArticleTocHoverClass(selectedArticle);
    const articleTocReadingClass = getArticleTocReadingClass(selectedArticle);
    const articleMarkerClass = getArticleMarkerClass(selectedArticle);
    const publicationValidation = getCommercialPublicationValidation(selectedArticle);
    const isArchitectsLegacyArticle = selectedArticle.slug === 'arquitetos-brasileiros-famosos-legado';
    const currentPageUrl = typeof window !== 'undefined'
      ? window.location.href
      : `https://wgalmeida.com.br/blog/${selectedArticle.slug}`;
    const articleHeroSrc = articleHeroAsset?.src || selectedArticle.imageHero || selectedArticle.image || BLOG_HERO_IMAGE;
    const articleHeroAlt = articleHeroAsset?.alt || selectedArticle.title;
    const articleHeroObjectPosition = getHeroObjectPosition(articleHeroAsset);
    const leadThumb = articleCardAsset?.src || selectedArticle.imageCard || selectedArticle.imageHero || selectedArticle.image || BLOG_HERO_IMAGE;
    const leadThumbAlt = articleCardAsset?.alt || selectedArticle.title;
    const heroTagLabel = selectedArticle.category || selectedArticle.tags?.[0] || 'Artigo';
    const showEditorialThemeBadge = normalizeComparableLabel(heroTagLabel) !== normalizeComparableLabel(articleTheme.label);
    const displayArticleTags = uniqueLabels(selectedArticle.tags || []);
    const heroAuthorLabel = selectedArticle.author || 'Grupo WG Almeida';
    const heroDateLabel = selectedArticle.slug === 'arquitetos-brasileiros-famosos-legado'
      ? new Date(selectedArticle.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : new Date(selectedArticle.date).toLocaleDateString(dateLocale);
    const heroReadTimeLabel = selectedArticle.slug === 'arquitetos-brasileiros-famosos-legado'
      ? '6 min read'
      : selectedArticle.readTime || '5 min';
    const heroIntro = selectedArticle.slug === 'arquitetos-brasileiros-famosos-legado'
      ? 'Um guia editorial para reconhecer referências, obras e lições da arquitetura brasileira que seguem influenciando projetos contemporâneos.'
      : selectedArticle.summary || selectedArticle.excerpt;
    const architectQuickLinks = selectedArticle.slug === 'arquitetos-brasileiros-famosos-legado'
      ? tocHeadings
          .filter((item) => /\(\d{4}\s*-\s*\d{4}\)/.test(item.text))
          .slice(0, 7)
      : [];
    const proseClassName = "wg-prose prose prose-lg max-w-none prose-headings:font-playfair prose-headings:font-light prose-headings:leading-tight prose-headings:text-wg-black prose-h2:mb-6 prose-h2:mt-1 prose-h3:mb-3 prose-h3:mt-8 prose-h4:mb-2 prose-h4:mt-5 prose-h4:font-light prose-h4:text-wg-black prose-p:my-5 prose-p:text-[1.06rem] prose-p:leading-[1.78] prose-p:text-wg-gray prose-a:font-light prose-a:text-wg-gray prose-a:underline prose-a:decoration-black/20 prose-a:underline-offset-4 hover:prose-a:text-wg-black prose-ul:my-3 prose-ul:pl-5 prose-li:my-1 prose-li:text-wg-gray prose-blockquote:my-8 prose-blockquote:rounded-r-[20px] prose-blockquote:border-l-4 prose-blockquote:border-gray-200 prose-blockquote:bg-[#F7F7F5] prose-blockquote:px-5 prose-blockquote:py-4 prose-blockquote:text-wg-gray [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:!text-wg-black [&_h2]:!font-light [&_h2]:!text-wg-black [&_h3]:!font-light [&_h3]:!text-wg-black [&_h4]:!font-light [&_h4]:!text-wg-black [&_li]:!font-light [&_li]:!text-wg-gray [&_p]:!font-light [&_p]:!text-wg-gray [&_strong]:!font-light [&_strong]:!text-inherit";
    const articleMarkdownComponents = {
      hr: () => <hr className="my-10 border-0 border-t border-gray-200" />,
      a: ({ node: _node, ...props }) => <a {...props} className="font-light underline decoration-black/20 underline-offset-4 hover:decoration-black/40" />,
      img: ({ node: _node, ...props }) => (
        <span className="not-prose my-12 block overflow-hidden rounded-2xl bg-gray-100">
          <img
            {...props}
            className="h-auto w-full scale-[1.03] object-cover transition-transform duration-[1400ms] ease-out hover:scale-100"
            loading="lazy"
            onError={handleArticleImageError}
          />
        </span>
      ),
    };
    const renderMarkdown = (content, className = proseClassName) => (
      <div className={className}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={articleMarkdownComponents}>
          {content}
        </ReactMarkdown>
      </div>
    );
    const architectsSectionClass = `${proseClassName} ${articleMarkerClass} [&_h2]:!mb-3 [&_h2]:!font-playfair [&_h2]:!leading-tight [&_h2]:!font-light [&_h2]:!text-wg-black [&_h3]:!mt-5 [&_h3]:!mb-2.5 [&_h3]:!font-light [&_h3]:!tracking-[0.02em] [&_h3]:!text-wg-black [&_h4]:!mt-4 [&_h4]:!mb-2 [&_h4]:!font-light [&_h4]:!text-wg-black [&_blockquote]:!my-5 [&_blockquote]:!border-l-2 [&_blockquote]:!border-wg-orange/50 [&_blockquote]:!pl-5 [&_blockquote]:!italic [&_blockquote]:!text-wg-gray [&_ul]:!my-3 [&_ul]:!list-disc [&_ul]:!pl-5 [&_li]:!my-1 [&_li]:!font-light [&_li]:!text-wg-gray [&_p]:!my-3.5 [&_p]:!font-light [&_p]:!leading-[1.72] [&_p]:!text-wg-gray [&_strong]:!font-light`;

    return (
      <>
        <SEO
          pathname={`/blog/${selectedArticle.slug}`}
          title={selectedArticle.title}
          description={selectedArticle.excerpt || t('seo.blog.description')}
          keywords={selectedArticle.tags}
          og={{ image: articleHeroSrc, type: 'article' }}
          twitter={{ image: articleHeroSrc }}
          schema={schemas.article(
            selectedArticle.title,
            selectedArticle.excerpt || t('seo.blog.description'),
            currentPageUrl,
            selectedArticle.date,
            [articleHeroSrc]
          )}
        />

        <article className="bg-white">
          <section className="wg-page-hero wg-page-hero--full hero-under-header h-[100svh] max-h-[100svh] items-end overflow-hidden bg-wg-black text-white">
            <div className="absolute inset-0 z-0 overflow-hidden">
              <div key={`${selectedArticle.slug}-hero-zoom`} className="absolute inset-0 wg-hero-zoom-in">
              <ResponsiveWebpImage
                key={`${selectedArticle.slug}-hero`}
                src={articleHeroSrc}
                alt={articleHeroAlt}
                className="h-full w-full object-cover will-change-transform"
                style={{ objectPosition: articleHeroObjectPosition }}
                loading="eager"
              />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-wg-black/55 via-wg-black/72 to-wg-black" />
            </div>

            <div className="container-custom relative z-10 flex h-full w-full items-end pb-20 pt-28 md:pb-24 md:pt-32 lg:pb-28 lg:pt-36">
              <div className="max-w-4xl">
                <Link to="/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-light text-white/75 transition-colors hover:text-white">
                  <ArrowLeft size={16} />
                  Blog & Artigos
                </Link>
                <div className="mb-5 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-white/70">
                  <span className={`rounded-full border px-3 py-1.5 text-[10px] font-light uppercase tracking-[0.14em] ${articleTagClass}`}>
                    {heroTagLabel}
                  </span>
                  {showEditorialThemeBadge && <EditorialThemeBadge article={selectedArticle} />}
                </div>
                <h1 className="max-w-4xl font-playfair text-[calc(clamp(2.2rem,6.15vw,5.05rem)-10px)] leading-[0.98]">
                  {selectedArticle.title}
                </h1>
                {heroIntro && (
                  <p className="mt-6 max-w-2xl text-[clamp(1.02rem,1.65vw,1.2rem)] font-light leading-[1.65] text-white/76">
                    {heroIntro}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-light text-white/70">
                  <span className="inline-flex items-center gap-2">
                    <User size={16} className={articleIconClass} />
                    {heroAuthorLabel}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Calendar size={16} className={articleIconClass} />
                    {heroDateLabel}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock size={16} className={articleIconClass} />
                    {heroReadTimeLabel}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#F6F5F2] pt-3 pb-3 md:pt-5 md:pb-4">
            <div className="container-custom max-w-5xl">
              <div className={`group grid overflow-hidden rounded-[26px] border border-black/5 bg-white shadow-sm transition-colors ${articleCardHoverClass} md:grid-cols-[170px_1fr]`}>
                <div className="min-h-[144px] overflow-hidden bg-[#ECECE8]">
                  <ResponsiveWebpImage
                    src={leadThumb}
                    alt={leadThumbAlt}
                    className="h-full w-full scale-[1.04] object-cover transition-transform duration-[1700ms] ease-out group-hover:scale-100"
                    loading="lazy"
                  />
                </div>
                <div className="p-3 md:p-4">
                  <p className="mb-3 text-[11px] font-light uppercase tracking-[0.18em] text-wg-orange">Leitura Guiada</p>
                  <h2 className="mb-3 font-playfair text-xl font-light leading-tight text-wg-black md:text-2xl">
                    {selectedArticle.title}
                  </h2>
                  <div className="mb-2 flex flex-wrap items-center gap-3 text-[11px] font-light uppercase tracking-[0.14em] text-wg-gray">
                    <span>{selectedArticle.author}</span>
                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                    <span>{new Date(selectedArticle.date).toLocaleDateString(dateLocale)}</span>
                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                    <span>{selectedArticle.readTime || '5 min'}</span>
                  </div>
                  {selectedArticle.slug === 'arquitetos-brasileiros-famosos-legado' && (
                    <p className="text-[12px] font-light leading-relaxed text-wg-gray md:text-[13px]">
                      Um guia editorial para reconhecer referências, obras e lições da arquitetura brasileira que seguem influenciando projetos contemporâneos.
                    </p>
                  )}
                  {architectQuickLinks.length > 0 && (
                    <div className="mt-8 flex flex-wrap gap-1.5 md:mt-10 md:justify-start lg:mt-12">
                      {architectQuickLinks.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className={`wg-cta-subtle inline-flex items-center rounded-full border border-black/12 bg-white px-2.5 py-0.5 text-[9px] font-light uppercase tracking-[0.08em] text-wg-gray transition-colors focus:outline-none ${articlePillHoverClass}`}
                          style={articleCtaBorderVars}
                        >
                          {item.text.split('(')[0].trim()}
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 flex w-full flex-wrap items-center justify-end gap-2 border-t border-[#EAEAEA] pt-3">
                    <p className="line-clamp-2 mr-auto flex-1 max-w-none text-[10.5px] font-light leading-snug text-wg-gray">
                      {selectedArticle.summary || selectedArticle.excerpt || 'Leitura editorial conectada a custo, prazo, escopo e próximos passos do projeto.'}
                    </p>
                    <button
                      type="button"
                      onClick={handleShare}
                      className={`wg-cta-subtle cta-quick inline-flex items-center justify-center gap-2 rounded-full border border-black/12 bg-white px-3 py-1.5 text-[9px] font-light uppercase tracking-[0.1em] text-wg-black transition-colors hover:text-wg-black focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${articleCtaHoverClass}`}
                      style={articleCtaBorderVars}
                    >
                      <Share2 size={11} className={articleIconClass} />
                      {showShareTooltip ? t('common.copied') : t('common.share')}
                    </button>
                    <a
                      href={`https://wa.me/5511984650002?text=${encodeURIComponent(`Vi esta materia no site da WG Almeida e quero continuar por aqui: ${currentPageUrl}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`wg-cta-subtle cta-quick inline-flex items-center justify-center gap-2 rounded-full border border-black/12 bg-white px-3 py-1.5 text-[9px] font-light uppercase tracking-[0.1em] text-wg-black transition-colors hover:text-wg-black focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${articleCtaHoverClass}`}
                      style={articleCtaBorderVars}
                    >
                      <MessageCircle size={11} className={articleIconClass} />
                      WhatsApp
                    </a>
                    <Link
                      to={selectedArticle.moodboardShareUrl || '/moodboard'}
                      className={`cta-quick inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-wg-black px-3 py-1.5 text-[9px] font-light uppercase tracking-[0.1em] text-white transition-colors hover:bg-black/90 focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${articleCtaHoverClass}`}
                      style={articleCtaBorderVars}
                    >
                      <LayoutGrid size={11} />
                      {selectedArticle.moodboardShareUrl ? 'Moodboard público' : 'Moodboard'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white pt-3 pb-16 md:pt-4 md:pb-20">
            <div className="container-custom max-w-5xl">
              {tocHeadings.length > 2 && (
                <nav className="mb-6 rounded-[24px] border border-[#E5E5E5] bg-[#FAFAFA] px-6 py-5 shadow-sm md:px-8 md:py-6" aria-label="Neste artigo">
                  <h2 className="mb-5 font-playfair text-2xl font-light text-wg-black">Neste artigo</h2>
                  <div className="flex flex-col gap-0.5">
                    {tocHeadings.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`group inline-flex items-center justify-between gap-4 rounded-xl border border-transparent bg-white px-4 py-2 text-sm font-light text-wg-gray shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-all hover:-translate-y-[1px] hover:shadow-sm hover:text-wg-black ${articleTocHoverClass}`}
                      >
                        <span>{item.text}</span>
                        <span className={`text-[11px] uppercase tracking-[0.12em] ${item.id === activeReadingId ? articleTocReadingClass : 'text-wg-gray/55'}`}>
                          {item.id === activeReadingId ? 'lendo' : 'abrir'}
                        </span>
                      </a>
                    ))}
                  </div>
                </nav>
              )}

              {articleSections.intro && (
                <div className="mb-8 max-w-none rounded-[20px] border border-[#EAEAEA] bg-[#FCFCFC] px-5 py-5 shadow-sm md:px-6 [&_p]:!font-light [&_p]:!text-wg-gray [&_strong]:!font-light">
                  {renderMarkdown(articleSections.intro)}
                </div>
              )}

              {publicationValidation.service && (
                <CommercialGovernancePanel article={selectedArticle} />
              )}

              {useLeadLayout && (
                <article id={leadSection.id} className={`mb-10 overflow-hidden rounded-[28px] border border-[#E5E5E5] bg-white shadow-sm transition-all duration-300 hover:-translate-y-[1px] hover:shadow-md ${articleCardHoverClass}`}>
                  <div className="grid grid-cols-1 lg:min-h-[548px] lg:grid-cols-[320px_1fr] lg:items-stretch">
                    <div className="group relative min-h-[300px] overflow-hidden bg-[#ECECE8] lg:min-h-[548px]">
                      <img
                        src={leadAsset.src}
                        alt={leadAsset.alt || leadAsset.caption || leadSection.heading}
                        className="h-full w-full scale-[1.035] object-cover object-center transition-transform duration-[1800ms] ease-out group-hover:scale-100"
                        loading="lazy"
                        onError={handleArticleImageError}
                      />
                    </div>
                    <div className="bg-[#FAFAFA] p-6 md:p-8">
                      {renderMarkdown(
                        leadSection.content,
                        isArchitectsLegacyArticle
                          ? architectsSectionClass
                          : `${proseClassName} ${articleMarkerClass}`
                      )}
                    </div>
                  </div>
                </article>
              )}

              <div className="space-y-10">
                {remainingSections.map((section, sectionIndex) => {
                  const assets = contextInsertions.get(section.id) || [];
                  const featuredAsset = assets[0];
                  const extraAssets = assets.slice(1);
                  const imageOnRight = sectionIndex % 2 === 0;
                  const isImportanceSection = section.id === 'por-que-esses-arquitetos-sao-importantes';
                  const isVisitSection = section.id === 'como-visitar-essas-obras';
                  const baseSectionClass = isArchitectsLegacyArticle ? architectsSectionClass : `${proseClassName} ${articleMarkerClass}`;
                  const sectionClass = isVisitSection
                    ? `${baseSectionClass} [&_h2]:!mb-1.5 [&_h3]:!mt-1.5 [&_h3]:!mb-2 [&_ul]:!my-1 [&_li]:!my-0.5`
                    : isImportanceSection
                    ? `${baseSectionClass} [&_h2]:!mb-1 [&_h3]:!mt-3 [&_h3]:!mb-1.5 [&_p]:!mt-0 [&_p]:!mb-2.5`
                    : baseSectionClass;

                  if (!featuredAsset) {
                    return (
                      <article key={section.id} id={section.id} className={`rounded-[24px] border border-[#E5E5E5] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-[1px] hover:shadow-md md:p-8 ${articleCardHoverClass}`}>
                        {renderMarkdown(
                          section.content,
                          sectionClass
                        )}
                      </article>
                    );
                  }

                  return (
                    <article key={section.id} id={section.id} className="space-y-8">
                      <div className={`grid overflow-hidden rounded-[28px] border border-[#E5E5E5] bg-white shadow-sm transition-all duration-300 hover:-translate-y-[1px] hover:shadow-md ${imageOnRight ? 'wg-article-split-right' : 'wg-article-split-left'} ${articleCardHoverClass}`}>
                        {!imageOnRight && (
                          <ContextImagePanel asset={featuredAsset} />
                        )}
                        <div className="p-6 md:p-8">
                          {renderMarkdown(
                            section.content,
                            sectionClass
                          )}
                        </div>
                        {imageOnRight && (
                          <ContextImagePanel asset={featuredAsset} imageOnRight />
                        )}
                      </div>
                      {extraAssets.map((asset, assetIndex) => (
                        <ContextImageFigure key={`${section.id}-${asset.src}-${assetIndex}`} asset={asset} />
                      ))}
                    </article>
                  );
                })}
              </div>

              <section className="mt-12 rounded-[24px] border border-[#E5E5E5] bg-[#FAFAFA] p-6 md:p-8">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-light uppercase tracking-[0.16em] text-wg-orange">
                  <MessageCircle size={15} />
                  Liz · assistente de decisão com base no ICCRI
                </div>
                <h2 className="mb-3 font-playfair text-2xl font-light text-wg-black">
                  Quer transformar esta referência em decisão de projeto?
                </h2>
                <p className="max-w-3xl text-[15px] font-light leading-[1.75] text-wg-gray">
                  A Liz pode orientar o próximo passo entre leitura, simulação de custo, briefing e conversa com especialista.
                </p>
                <SmartCTA className="mt-6" showSecondary />
              </section>

              <ICCRILinksBlock context={articleTopic === 'arquitetura' ? 'investimento' : 'custo'} className="mt-8" />

              {displayArticleTags.length > 0 && (
                <div className="mt-10 border-t border-gray-200 pt-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Tag className={`h-3.5 w-3.5 ${articleIconClass}`} />
                    <span className="text-[11px] font-light uppercase tracking-[0.16em] text-wg-gray">Tags</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {displayArticleTags.map((tag) => (
                      <span key={tag} className={`inline-flex min-h-[24px] items-center rounded-full border px-2.5 py-1 text-[9px] font-light uppercase leading-none tracking-[0.1em] ${articleTagClass}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <BlogMoodboardPanel article={selectedArticle} />

              <BlogEngagementPanel
                article={selectedArticle}
                metrics={articleMetrics}
                onMetricsChange={setArticleMetrics}
              />

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleShare}
                  className="wg-cta-canonical wg-cta-canonical-primary"
                >
                  {showShareTooltip ? <CheckCircle2 /> : <Share2 />}
                  {showShareTooltip ? t('common.copied') : t('common.share')}
                </button>
                <Link to="/blog" className="wg-cta-canonical">
                  Voltar para o blog
                  <ArrowRight />
                </Link>
              </div>
            </div>
          </section>
        </article>
      </>
    );
  }

  return (
    <>
      <SEO 
        pathname="/blog"
        title={t('seo.blog.title')}
        description={t('seo.blog.description')}
      />

      {/* Hero Section */}
      <section className="wg-page-hero wg-page-hero--full hero-under-header items-end bg-wg-black">
        <motion.div
          key={featuredArticle?.slug || 'blog-hero'}
          className="absolute inset-0 z-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        >
          <ResponsiveWebpImage
            src={featuredArticle?.image || BLOG_HERO_IMAGE}
            alt={featuredArticle?.title || 'Blog WG Almeida'}
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-wg-black via-wg-black/64 to-wg-black/18" />
        </motion.div>

        <div className="container-custom relative z-10 pb-16 pt-36 md:pb-20 md:pt-44 lg:pt-48">
          <div className="max-w-4xl px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-light uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                  {featuredArticle ? t('blogPage.hero.featured') : t('blog.title')}
                </span>
              {featuredArticle?.category && (
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-light uppercase tracking-[0.14em] ${featuredTagClass}`}>
                  {featuredArticle.category}
                </span>
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="wg-page-hero-title mb-6"
            >
              {featuredArticle?.title || t('blog.subtitle')}
            </motion.h1>

            {featuredArticle?.excerpt && (
              <motion.p
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="mb-7 max-w-[52rem] text-[17px] font-light leading-[1.65] text-white/80 md:text-[18px]"
              >
                {featuredArticle.excerpt}
              </motion.p>
            )}

            {featuredArticle && (
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="flex flex-wrap items-center gap-5 text-sm font-light text-white/65"
              >
                <span className="inline-flex items-center gap-2">
                  <User size={16} />
                  {featuredArticle.author}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(featuredArticle.date).toLocaleDateString(dateLocale)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock size={16} />
                  {featuredArticle.readTime || '5 min'}
                </span>
              </motion.div>
            )}

            {featuredArticle && (
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.46 }}
                className="mt-8"
              >
                <Link
                  to={`/blog/${featuredArticle.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-wg-orange px-6 py-3 font-light text-white transition-all hover:brightness-110"
                >
                  {t('blogPage.hero.cta')}
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            )}
            {featuredArticle && (
              <div className={`mt-8 h-px w-0 ${featuredLineClass} opacity-70 transition-all duration-700 group-hover:w-32`} />
            )}
          </div>
        </div>
      </section>

      {/* Blog Controls */}
      <section className="py-8 bg-white border-b border-gray-100 sticky top-[var(--header-height)] z-30">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all ${
                    activeCategory === cat.id
                      ? `${cat.bgColor} ${cat.id === 'all' ? 'text-wg-black' : 'text-white'} shadow-lg shadow-black/5`
                      : 'bg-gray-50 text-wg-gray hover:bg-gray-100'
                  }`}
                >
                  <cat.icon size={16} />
                  <span className="font-light">{t(`blog.categories.${cat.label}`)}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:border-wg-orange/30 focus:bg-white rounded-2xl outline-none transition-all font-light text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Article Grid */}
      <section className="bg-gray-50 py-10 md:py-14">
        <div className="container-custom">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-wg-gray text-lg font-light">{t('blogPage.notFound.title')}</p>
            </div>
          ) : (
            <>
            {leadArticle && (
              <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {(() => {
                  const article = leadArticle;
                  const articleTagClass = getArticleTagClass(article);
                  const articleLineClass = getArticleLineClass(article);
                  const articleCardHoverClass = getArticleCardHoverClass(article);
                  return (
                    <motion.article
                      key={`lead-${article.slug}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className={`group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition-all duration-500 hover:shadow-2xl ${articleCardHoverClass}`}
                    >
                      <Link to={`/blog/${article.slug}`} className="grid min-h-[24rem] grid-cols-1 md:grid-cols-[42%_1fr]">
                        <div className="relative min-h-[15rem] overflow-hidden">
                          <img
                            src={article.image || '/images/blog/placeholder.webp'}
                            alt={article.title}
                            className="h-full w-full scale-105 object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-100"
                            onError={handleArticleImageError}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent md:bg-gradient-to-r" />
                          <div className="absolute left-4 top-4">
                            <span className={`rounded-full border px-2.5 py-1 text-[9px] font-light uppercase tracking-[0.12em] backdrop-blur-md ${articleTagClass}`}>
                              {article.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col p-6 md:p-7">
                          <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest text-gray-400">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(article.date).toLocaleDateString(dateLocale)}</span>
                            <span className="h-1 w-1 rounded-full bg-gray-300" />
                            <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime || '5 min'}</span>
                          </div>

                          <h3 className="mb-4 text-2xl font-light leading-tight text-wg-black transition-colors group-hover:text-wg-orange">
                            {article.title}
                          </h3>
                          <p className="mb-6 line-clamp-4 text-sm font-light leading-relaxed text-wg-gray">
                            {article.excerpt}
                          </p>
                          <span className="mt-auto inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-wg-black transition-colors group-hover:text-wg-orange">
                            {t('blog.readMore')} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                          </span>
                          <span className={`mt-4 block h-px w-0 ${articleLineClass} transition-all duration-500 group-hover:w-24`} />
                        </div>
                      </Link>
                    </motion.article>
                  );
                })()}

                {sideHighlightArticles.length > 0 && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {sideHighlightArticles.map((article, index) => {
                      const articleTagClass = getArticleTagClass(article);
                      const articleLineClass = getArticleLineClass(article);
                      const articleCardHoverClass = getArticleCardHoverClass(article);
                      return (
                        <motion.article
                          key={`side-${article.slug}`}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: (index + 1) * 0.05 }}
                          className={`group flex h-full overflow-hidden rounded-3xl border border-black/5 bg-white transition-all duration-500 hover:shadow-2xl ${articleCardHoverClass}`}
                        >
                          <Link to={`/blog/${article.slug}`} className="flex w-full flex-col">
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <img
                                src={article.image || '/images/blog/placeholder.webp'}
                                alt={article.title}
                                className="h-full w-full scale-105 object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-100"
                                onError={handleArticleImageError}
                              />
                              <div className="absolute left-4 top-4">
                                <span className={`rounded-full border px-2.5 py-1 text-[9px] font-light uppercase tracking-[0.12em] backdrop-blur-md ${articleTagClass}`}>
                                  {article.category}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-1 flex-col p-5">
                              <h3 className="mb-3 line-clamp-3 text-base font-light leading-tight text-wg-black transition-colors group-hover:text-wg-orange">
                                {article.title}
                              </h3>
                              <div className="mt-auto flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest text-gray-400">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(article.date).toLocaleDateString(dateLocale)}</span>
                                <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime || '5 min'}</span>
                              </div>
                              <span className={`mt-3 block h-px w-0 ${articleLineClass} transition-all duration-500 group-hover:w-20`} />
                            </div>
                          </Link>
                        </motion.article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {editorialRows.map((row) => (
              row.type === 'standard' ? (
                <div key={row.id} className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                  {row.articles.map((article, index) => renderStandardCard(article, index, row.id))}
                </div>
              ) : (
                <div key={row.id} className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {row.side === 'left' && renderFeatureCard(row.lead, row.id)}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {row.support.map((article, index) => renderSupportCard(article, index, row.id))}
                  </div>
                  {row.side === 'right' && renderFeatureCard(row.lead, row.id)}
                </div>
              )
            ))}
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section-padding bg-wg-black text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-wg-orange/5 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="container-custom relative z-10 text-center">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="w-16 h-16 bg-wg-orange/10 rounded-2xl flex items-center justify-center text-wg-orange mx-auto mb-6">
                <Filter size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-playfair italic mb-4">{t('blogPage.newsletter.title')}</h2>
              <p className="text-white/60 font-light text-lg">{t('blogPage.newsletter.subtitle')}</p>
            </motion.div>

            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder={t('blogPage.newsletter.placeholder')}
                className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-wg-orange/50 transition-all font-light"
              />
              <button className="wg-btn-pill-primary px-8 whitespace-nowrap">
                {t('blogPage.newsletter.button')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;
