import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  Copy,
  FileText,
  Palette,
  Plus,
  RefreshCw,
  Save,
} from 'lucide-react';
import styleCatalog from '@/utils/styleCatalog';
import { parseFrontmatter } from '@/utils/frontmatter';
import CommercialGovernancePanel from '@/components/blog/CommercialGovernancePanel';
import { EDITORIAL_THEME_OPTIONS } from '@/data/editorialThemes';
import {
  COMMERCIAL_PACKAGE_OPTIONS,
  COMMERCIAL_SERVICE_OPTIONS,
  getCommercialPublicationValidation,
} from '@/data/commercialGovernance';
import {
  buildEditablePost,
  buildEmptyPost,
  buildBlogMoodboardShareUrl,
  clonePostRecord,
  collectTaxonomies,
  getAllArticleComments,
  getDraftPosts,
  getPublishedPosts,
  mergeArticlesWithCms,
  moderateArticleComment,
  publishPost,
  saveDraftPost,
  syncPublishedPostsToApi,
} from '@/data/blogCms';

const readMarkdownArticles = () => {
  const modules = import.meta.glob('/src/content/blog/*.md', { eager: true });

  return Object.entries(modules).map(([path, module]) => {
    const derivedSlug = path.split('/').pop().replace('.md', '');
    const rawContent = typeof module.default === 'string' ? module.default : '';
    const { data, content } = parseFrontmatter(rawContent);
    return {
      slug: data.slug || derivedSlug,
      title: data.title || derivedSlug,
      excerpt: data.excerpt || '',
      summary: data.excerpt || '',
      subtitle: data.subtitle || '',
      author: data.author || 'Grupo WG Almeida',
      category: data.category || 'arquitetura',
      tags: Array.isArray(data.tags) ? data.tags : [],
      date: data.date || new Date().toISOString().slice(0, 10),
      readTime: data.readTime || '6 min',
      featured: Boolean(data.featured),
      status: 'published',
      seoTitle: data.title || derivedSlug,
      metaDescription: data.excerpt || '',
      templateId: 'legacy-architects-master-v1',
      editorialThemeId: data.editorialThemeId || '',
      commercialProfile: {
        serviceId: data.commercialProfile?.serviceId || '',
        packageFocus: data.commercialProfile?.packageFocus || '',
      },
      content,
      cta: {
        label: 'Quero levar essa referência para o meu projeto',
        href: '/solicite-proposta',
        helper: '',
      },
      moodboard: {
        projectName: data.title || derivedSlug,
        clientName: 'Leitor WG Almeida',
        palette: [],
        styleSlugs: [],
        referenceImages: [],
        note: '',
      },
    };
  });
};

const parseCommaList = (value) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const serializeGallery = (value = []) =>
  value.map((item) => `${item.src || ''} | ${item.alt || ''} | ${item.caption || ''}`).join('\n');

const parseGallery = (value = '') =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [src = '', alt = '', caption = ''] = line.split('|').map((part) => part.trim());
      return { src, alt, caption };
    })
    .filter((item) => item.src);

const serializeFaq = (value = []) =>
  value.map((item) => `${item.question || ''} | ${item.answer || ''}`).join('\n');

const parseFaq = (value = '') =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [question = '', answer = ''] = line.split('|').map((part) => part.trim());
      return { question, answer };
    })
    .filter((item) => item.question && item.answer);

const toFormState = (post) => ({
  ...post,
  tagsInput: (post.tags || []).join(', '),
  relatedSlugsInput: (post.relatedSlugs || []).join(', '),
  paletteInput: (post.moodboard?.palette || []).join(', '),
  styleSlugsInput: (post.moodboard?.styleSlugs || []).join(', '),
  referenceImagesInput: (post.moodboard?.referenceImages || [])
    .map((image) => `${image.url || ''} | ${image.title || ''}`)
    .join('\n'),
  galleryInput: serializeGallery(post.gallery || []),
  faqInput: serializeFaq(post.faq || []),
});

const toPostPayload = (form) => ({
  ...form,
  tags: parseCommaList(form.tagsInput || ''),
  relatedSlugs: parseCommaList(form.relatedSlugsInput || ''),
  gallery: parseGallery(form.galleryInput || ''),
  faq: parseFaq(form.faqInput || ''),
  moodboard: {
    ...(form.moodboard || {}),
    palette: parseCommaList(form.paletteInput || ''),
    styleSlugs: parseCommaList(form.styleSlugsInput || ''),
    referenceImages: (form.referenceImagesInput || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [url = '', title = ''] = line.split('|').map((part) => part.trim());
        return { url, title };
      })
      .filter((item) => item.url),
  },
});

export default function EditorialCmsWorkbench() {
  const [baseArticles, setBaseArticles] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [form, setForm] = useState(() => toFormState(buildEmptyPost()));
  const [message, setMessage] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const markdownArticles = readMarkdownArticles();
    setBaseArticles(markdownArticles);
    const merged = mergeArticlesWithCms(markdownArticles);
    const firstArticle = merged[0] || markdownArticles[0] || buildEmptyPost();
    setSelectedSlug(firstArticle.slug);
    setForm(toFormState(buildEditablePost(firstArticle)));
  }, []);

  const mergedArticles = useMemo(() => mergeArticlesWithCms(baseArticles), [baseArticles, message]);
  const taxonomies = useMemo(() => collectTaxonomies(mergedArticles), [mergedArticles]);
  const draftMap = useMemo(() => getDraftPosts(), [message]);
  const publishedMap = useMemo(() => getPublishedPosts(), [message]);
  const selectedComments = useMemo(() => getAllArticleComments(selectedSlug), [selectedSlug, message]);

  const selectArticle = (slug) => {
    const article =
      draftMap[slug] ||
      publishedMap[slug] ||
      mergedArticles.find((entry) => entry.slug === slug) ||
      baseArticles.find((entry) => entry.slug === slug);

    if (!article) return;
    setSelectedSlug(slug);
    setForm(toFormState(buildEditablePost(article)));
  };

  const handleField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleNestedField = (root, field, value) => {
    setForm((current) => ({
      ...current,
      [root]: {
        ...(current[root] || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveDraft = () => {
    const saved = saveDraftPost(toPostPayload(form));
    if (!saved) return;
    setSelectedSlug(saved.slug);
    setForm(toFormState(saved));
    setMessage(`Rascunho salvo para /blog/${saved.slug}.`);
  };

  const handlePublish = async () => {
    const published = publishPost(toPostPayload(form));
    if (!published) return;

    setSelectedSlug(published.slug);
    setForm(toFormState(published));
    setSyncing(true);
    try {
      const merged = {
        ...getPublishedPosts(),
        [published.slug]: published,
      };
      await syncPublishedPostsToApi({
        posts: merged,
        taxonomies,
        source: 'admin-blog-cms-workbench',
      });
      setMessage(`Post publicado e sincronizado: /blog/${published.slug}.`);
    } catch (error) {
      setMessage(`Post publicado localmente, mas a sincronização remota falhou: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleCreate = () => {
    const next = buildEmptyPost();
    setSelectedSlug('');
    setForm(toFormState(next));
    setMessage('Novo rascunho iniciado no template mestre.');
  };

  const handleDuplicate = () => {
    const nextSlug = `${form.slug || 'novo-post'}-copia`;
    const duplicate = clonePostRecord(toPostPayload(form), nextSlug, `${form.title} (cópia)`);
    if (!duplicate) return;
    setSelectedSlug(duplicate.slug);
    setForm(toFormState(duplicate));
    saveDraftPost(duplicate);
    setMessage(`Duplicado para /blog/${duplicate.slug}.`);
  };

  const moodboardShareUrl = useMemo(() => buildBlogMoodboardShareUrl(toPostPayload(form)), [form]);
  const publicationValidation = useMemo(() => getCommercialPublicationValidation(toPostPayload(form)), [form]);

  return (
    <div className="grid gap-8 xl:grid-cols-[24rem_minmax(0,1fr)]">
      <aside className="rounded-[36px] border border-white/8 bg-[#0c0c0e] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-wg-orange">CMS mestre</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Publicação editorial</h2>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-wg-orange px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
          >
            <Plus size={14} />
            Novo
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {mergedArticles.map((article) => {
            const hasDraft = Boolean(draftMap[article.slug]);
            return (
              <button
                key={article.slug}
                type="button"
                onClick={() => selectArticle(article.slug)}
                className={`w-full rounded-[24px] border px-4 py-4 text-left transition-colors ${
                  selectedSlug === article.slug
                    ? 'border-wg-orange/50 bg-wg-orange/10'
                    : 'border-white/6 bg-white/[0.02] hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{article.title}</p>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    {article.status}
                  </span>
                </div>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">/{article.slug}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/8 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-slate-400">
                    {article.category}
                  </span>
                  {hasDraft && (
                    <span className="rounded-full border border-wg-orange/30 bg-wg-orange/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-wg-orange">
                      draft local
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="space-y-6">
        <div className="rounded-[36px] border border-white/8 bg-[#0c0c0e] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-slate-500">Template oficial</p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">
                /blog/arquitetos-brasileiros-famosos-legado
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
                Esta bancada controla layout editorial, taxonomia, mood board, SEO e publicação do template mestre reaproveitado por todo o blog.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
              >
                <Save size={14} />
                Salvar draft
              </button>
              <button
                type="button"
                onClick={handleDuplicate}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
              >
                <Copy size={14} />
                Duplicar
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={syncing || publicationValidation.hasBlockingErrors}
                className="inline-flex items-center gap-2 rounded-2xl bg-wg-orange px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white disabled:opacity-60"
              >
                {syncing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Publicar
              </button>
            </div>
          </div>
          {message && (
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-300">
              {message}
            </div>
          )}
        </div>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="rounded-[36px] border border-white/8 bg-[#0c0c0e] p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Slug</span>
                <input value={form.slug || ''} onChange={(event) => handleField('slug', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</span>
                <select value={form.status || 'draft'} onChange={(event) => handleField('status', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
                  <option value="draft">draft</option>
                  <option value="review">review</option>
                  <option value="scheduled">scheduled</option>
                  <option value="published">published</option>
                  <option value="archived">archived</option>
                </select>
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Título</span>
                <input value={form.title || ''} onChange={(event) => handleField('title', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Subtítulo</span>
                <input value={form.subtitle || ''} onChange={(event) => handleField('subtitle', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Resumo curto</span>
                <textarea value={form.excerpt || ''} onChange={(event) => handleField('excerpt', event.target.value)} className="min-h-[92px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Resumo de abertura</span>
                <textarea value={form.summary || ''} onChange={(event) => handleField('summary', event.target.value)} className="min-h-[92px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Autor</span>
                <input list="wg-blog-authors" value={form.author || ''} onChange={(event) => handleField('author', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
                <datalist id="wg-blog-authors">
                  {taxonomies.authors.map((author) => <option key={author} value={author} />)}
                </datalist>
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Categoria</span>
                <input list="wg-blog-categories" value={form.category || ''} onChange={(event) => handleField('category', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
                <datalist id="wg-blog-categories">
                  {taxonomies.categories.map((category) => <option key={category} value={category} />)}
                </datalist>
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Nucleo editorial</span>
                <select value={form.editorialThemeId || ''} onChange={(event) => handleField('editorialThemeId', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
                  <option value="">Auto por taxonomia</option>
                  {EDITORIAL_THEME_OPTIONS.map((theme) => (
                    <option key={theme.id} value={theme.id}>{theme.label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Tags</span>
                <input value={form.tagsInput || ''} onChange={(event) => handleField('tagsInput', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Tempo de leitura</span>
                <input value={form.readTime || ''} onChange={(event) => handleField('readTime', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Data</span>
                <input type="date" value={String(form.date || '').slice(0, 10)} onChange={(event) => handleField('date', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Servico comercial</span>
                <select value={form.commercialProfile?.serviceId || ''} onChange={(event) => handleNestedField('commercialProfile', 'serviceId', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
                  <option value="">Sem vinculo comercial</option>
                  {COMMERCIAL_SERVICE_OPTIONS.map((service) => (
                    <option key={service.id} value={service.id}>{service.label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Pacote foco</span>
                <select value={form.commercialProfile?.packageFocus || ''} onChange={(event) => handleNestedField('commercialProfile', 'packageFocus', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
                  <option value="">Sem destaque</option>
                  {COMMERCIAL_PACKAGE_OPTIONS.map((entry) => (
                    <option key={entry.id} value={entry.id}>{entry.label}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <input type="checkbox" checked={Boolean(form.featured)} onChange={(event) => handleField('featured', event.target.checked)} />
                <span className="text-sm text-white">Destacar na vitrine do blog</span>
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">SEO title</span>
                <input value={form.seoTitle || ''} onChange={(event) => handleField('seoTitle', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Meta description</span>
                <textarea value={form.metaDescription || ''} onChange={(event) => handleField('metaDescription', event.target.value)} className="min-h-[80px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Conteúdo em Markdown</span>
                <textarea value={form.content || ''} onChange={(event) => handleField('content', event.target.value)} className="min-h-[420px] w-full rounded-[28px] border border-white/10 bg-black/20 px-4 py-4 font-mono text-sm text-white outline-none" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Relacionados</span>
                <input value={form.relatedSlugsInput || ''} onChange={(event) => handleField('relatedSlugsInput', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </label>
            </div>

            <div className="mt-8 grid gap-4 border-t border-white/8 pt-8 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">CTA label</span>
                <input value={form.cta?.label || ''} onChange={(event) => handleNestedField('cta', 'label', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">CTA href</span>
                <input value={form.cta?.href || ''} onChange={(event) => handleNestedField('cta', 'href', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">CTA helper</span>
                <input value={form.cta?.helper || ''} onChange={(event) => handleNestedField('cta', 'helper', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </label>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[36px] border border-white/8 bg-[#0c0c0e] p-6">
              <div className="flex items-center gap-2">
                <Palette size={16} className="text-wg-orange" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Mood board integrado</p>
              </div>
              <div className="mt-5 space-y-3">
                <input value={form.moodboard?.projectName || ''} onChange={(event) => handleNestedField('moodboard', 'projectName', event.target.value)} placeholder="Nome do dossiê" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
                <input value={form.moodboard?.clientName || ''} onChange={(event) => handleNestedField('moodboard', 'clientName', event.target.value)} placeholder="Leitor / cliente" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
                <input value={form.paletteInput || ''} onChange={(event) => handleField('paletteInput', event.target.value)} placeholder="Paleta: #F5F0E8, #2B4580" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
                <input value={form.styleSlugsInput || ''} onChange={(event) => handleField('styleSlugsInput', event.target.value)} placeholder="Estilos: japandi, minimalista" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
                <textarea value={form.referenceImagesInput || ''} onChange={(event) => handleField('referenceImagesInput', event.target.value)} placeholder="URL da referência | Título" className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
                <textarea value={form.moodboard?.note || ''} onChange={(event) => handleNestedField('moodboard', 'note', event.target.value)} placeholder="Observação curatorial do mood board" className="min-h-[90px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </div>
              <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Styles sugeridos</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {styleCatalog.slice(0, 10).map((style) => (
                    <button
                      key={style.slug || style.id}
                      type="button"
                      onClick={() => {
                        const current = new Set(parseCommaList(form.styleSlugsInput || ''));
                        current.add(style.slug || style.id);
                        handleField('styleSlugsInput', Array.from(current).join(', '));
                      }}
                      className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-slate-300 transition-colors hover:border-wg-orange/35 hover:text-wg-orange"
                    >
                      {style.slug || style.id}
                    </button>
                  ))}
                </div>
              </div>
              {moodboardShareUrl && (
                <Link
                  to={moodboardShareUrl}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-wg-orange px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white"
                >
                  Abrir share do mood board
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </section>

            <section className="rounded-[36px] border border-white/8 bg-[#0c0c0e] p-6">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-wg-orange" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Blocos auxiliares</p>
              </div>
              <div className="mt-5 space-y-3">
                <textarea value={form.galleryInput || ''} onChange={(event) => handleField('galleryInput', event.target.value)} placeholder="Galeria: src | alt | legenda" className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
                <textarea value={form.faqInput || ''} onChange={(event) => handleField('faqInput', event.target.value)} placeholder="FAQ: pergunta | resposta" className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" />
              </div>
            </section>

            <section className="rounded-[36px] border border-white/8 bg-[#0c0c0e] p-6">
              <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Publication guard</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Fonte de verdade</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                      {publicationValidation.sourceOfTruth || 'Sem vinculo central de valores'}
                    </p>
                  </div>
                  {publicationValidation.errors.length > 0 && (
                    <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm leading-relaxed text-red-100">
                      {publicationValidation.errors.map((error) => (
                        <p key={error}>{error}</p>
                      ))}
                    </div>
                  )}
                  {publicationValidation.warnings.length > 0 && (
                    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-50">
                      {publicationValidation.warnings.map((warning) => (
                        <p key={warning}>{warning}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-[36px] border border-white/8 bg-[#0c0c0e] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Preview e publicação</p>
              <div className="mt-5 space-y-3">
                {form.slug && (
                  <Link to={`/blog/${form.slug}`} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    Abrir artigo público
                    <ArrowUpRight size={14} />
                  </Link>
                )}
                {form.slug && (
                  <p className="text-sm leading-relaxed text-slate-400">
                    URL prevista: <span className="text-white">/blog/{form.slug}</span>
                  </p>
                )}
                {publicationValidation.service && (
                  <CommercialGovernancePanel
                    article={toPostPayload(form)}
                    compact
                  />
                )}
              </div>
            </section>

            <section className="rounded-[36px] border border-white/8 bg-[#0c0c0e] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Moderação de comentários</p>
              <div className="mt-5 space-y-3">
                {selectedComments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-sm text-slate-400">
                    Nenhum comentário registrado para este artigo.
                  </div>
                ) : (
                  selectedComments.map((comment) => (
                    <article key={comment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{comment.name}</p>
                        <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{comment.status}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">{comment.body}</p>
                      <div className="mt-3 flex gap-2">
                        <button type="button" onClick={() => { moderateArticleComment(selectedSlug, comment.id, 'approved'); setMessage('Comentário aprovado.'); }} className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white">
                          Aprovar
                        </button>
                        <button type="button" onClick={() => { moderateArticleComment(selectedSlug, comment.id, 'hidden'); setMessage('Comentário ocultado.'); }} className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white">
                          Ocultar
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
