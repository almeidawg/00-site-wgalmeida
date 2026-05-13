import {
  CheckCircle2,
  Copy,
  Facebook,
  Heart,
  Linkedin,
  MessageCircle,
  Send,
  Share2,
  Twitter,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  createArticleComment,
  getArticleMetrics,
  getApprovedComments,
  registerArticleShare,
  toggleArticleLike,
} from '@/data/blogCms';

const networks = [
  { id: 'link', label: 'Copiar link', icon: Copy },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'twitter', label: 'X / Twitter', icon: Twitter },
  { id: 'facebook', label: 'Facebook', icon: Facebook },
];

const buildShareUrl = (network, articleUrl, title) => {
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(title);

  switch (network) {
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(`${title} ${articleUrl}`)}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    default:
      return articleUrl;
  }
};

export default function BlogEngagementPanel({
  article,
  metrics,
  onMetricsChange,
}) {
  const [form, setForm] = useState({ name: '', body: '' });
  const [copied, setCopied] = useState(false);
  const comments = useMemo(() => getApprovedComments(article.slug), [article.slug, metrics.comments]);
  const articleUrl = typeof window !== 'undefined'
    ? window.location.href
    : `https://wgalmeida.com.br/blog/${article.slug}`;

  const handleLike = () => {
    const next = toggleArticleLike(article.slug);
    onMetricsChange(next);
  };

  const handleShare = async (networkId) => {
    const shareUrl = buildShareUrl(networkId, articleUrl, article.title);
    if (networkId === 'link') {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } else {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }

    const next = registerArticleShare(article.slug, networkId);
    onMetricsChange(next);
  };

  const handleCommentSubmit = (event) => {
    event.preventDefault();
    const comment = createArticleComment(article.slug, form);
    if (!comment) return;
    setForm({ name: '', body: '' });
    onMetricsChange(getArticleMetrics(article.slug));
  };

  return (
    <section className="mt-12 rounded-[28px] border border-[#E5E5E5] bg-[#FBFBFA] p-6 shadow-sm md:p-8">
      <div className="grid gap-8">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleLike}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-light uppercase tracking-[0.14em] transition-colors ${
                metrics.liked
                  ? 'border-wg-black bg-wg-black text-white'
                  : 'border-[#E5E5E5] bg-white text-wg-black hover:border-[#CFCFC8] hover:text-wg-black'
              }`}
            >
              <Heart size={14} className={metrics.liked ? 'fill-current' : ''} />
              {metrics.likes} curtidas
            </button>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-4 py-2 text-[11px] font-light uppercase tracking-[0.14em] text-wg-gray">
              <MessageCircle size={14} />
              {metrics.comments} comentários
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-4 py-2 text-[11px] font-light uppercase tracking-[0.14em] text-wg-gray">
              <Share2 size={14} />
              {metrics.shares} compartilhamentos
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {networks.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleShare(id)}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-[#E5E5E5] bg-white px-3 py-2 text-sm font-light text-wg-black transition-colors hover:border-[#CFCFC8] hover:text-wg-black"
              >
                {id === 'link' && copied ? <CheckCircle2 size={15} /> : <Icon size={15} />}
                {id === 'link' && copied ? 'Link copiado' : label}
              </button>
            ))}
          </div>

          <form onSubmit={handleCommentSubmit} className="rounded-[24px] border border-[#E5E5E5] bg-white p-4 md:p-5">
            <div className="grid gap-3 lg:grid-cols-[13rem_minmax(0,1fr)_auto] lg:items-end">
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="h-12 rounded-2xl border border-[#E5E5E5] px-4 text-sm font-light text-wg-black outline-none transition-colors focus:border-[#CFCFC8]"
                placeholder="Seu nome"
              />
              <textarea
                value={form.body}
                onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
                className="h-12 min-h-12 resize-none rounded-2xl border border-[#E5E5E5] px-4 py-3 text-sm font-light leading-[1.45] text-wg-black outline-none transition-colors focus:border-[#CFCFC8] md:h-[58px] md:min-h-[58px]"
                placeholder="Compartilhe sua leitura, dúvida ou referência que gostaria de ver na próxima edição."
              />
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-wg-black px-5 text-[11px] font-light uppercase tracking-[0.14em] text-white transition-colors hover:bg-black/90"
              >
                <Send size={14} />
                Publicar comentário
              </button>
            </div>
            <p className="mt-2 text-xs font-light leading-snug text-wg-gray">
              Comentários publicados aqui ficam visíveis no seu ambiente atual e servem como base para a próxima camada persistida do blog.
            </p>
          </form>

          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-[#E5E5E5] bg-white px-4 py-5 text-sm font-light text-wg-gray">
                Ainda não há comentários publicados para este artigo.
              </div>
            ) : (
              comments.map((comment) => (
                <article key={comment.id} className="rounded-[22px] border border-[#E5E5E5] bg-white px-4 py-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-wg-black">{comment.name}</p>
                    <span className="text-[11px] font-light uppercase tracking-[0.14em] text-wg-gray">
                      {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm font-light leading-[1.75] text-wg-gray">{comment.body}</p>
                </article>
              ))
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
