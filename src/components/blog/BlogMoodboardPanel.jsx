import { ArrowUpRight, Palette, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BlogMoodboardPanel({ article }) {
  const moodboard = article?.moodboard || {};
  const palette = Array.isArray(moodboard.palette) ? moodboard.palette.filter(Boolean) : [];
  const styleSlugs = Array.isArray(moodboard.styleSlugs) ? moodboard.styleSlugs.filter(Boolean) : [];

  if (!palette.length && !styleSlugs.length && !article?.moodboardShareUrl) {
    return null;
  }

  return (
    <section className="mt-10 overflow-hidden rounded-[28px] border border-[#E5E5E5] bg-[#F8F6F1] shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6 md:p-8">
          <p className="text-[11px] font-light uppercase tracking-[0.16em] text-wg-orange">Mood board editorial</p>
          <h2 className="mt-2 font-playfair text-3xl font-light text-wg-black">
            A mesma narrativa visual do artigo pronta para compartilhamento
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] font-light leading-[1.75] text-wg-gray">
            Paleta, direção de arte, referências e ponte para o estúdio de moodboard ficam ligados ao post para que a publicação editorial também funcione como peça de briefing.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {styleSlugs.map((styleSlug) => (
              <span
                key={styleSlug}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] font-light uppercase tracking-[0.12em] text-wg-black"
              >
                <Sparkles size={12} className="text-wg-orange" />
                {styleSlug}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {article.moodboardShareUrl && (
              <Link
                to={article.moodboardShareUrl}
                className="inline-flex items-center gap-2 rounded-full bg-wg-black px-5 py-3 text-[11px] font-light uppercase tracking-[0.16em] text-white transition-colors hover:bg-wg-orange"
              >
                Abrir mood board público
                <ArrowUpRight size={15} />
              </Link>
            )}
            <Link
              to="/moodboard"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-[11px] font-light uppercase tracking-[0.16em] text-wg-black transition-colors hover:border-wg-orange/40 hover:text-wg-orange"
            >
              Abrir estúdio WG
              <Palette size={15} />
            </Link>
          </div>
        </div>

        <div className="border-t border-[#E5E5E5] bg-white p-6 md:p-8 lg:border-l lg:border-t-0">
          <p className="mb-4 text-[11px] font-light uppercase tracking-[0.16em] text-wg-gray">Paleta selecionada</p>
          <div className="grid grid-cols-5 gap-3">
            {palette.map((color) => (
              <div key={color} className="space-y-2">
                <div className="aspect-[3/4] rounded-2xl border border-[#DAD6CE] shadow-sm" style={{ backgroundColor: color }} />
                <p className="text-[10px] font-light uppercase tracking-[0.1em] text-wg-gray">{color}</p>
              </div>
            ))}
          </div>
          {moodboard.note && (
            <p className="mt-5 text-sm font-light leading-[1.75] text-wg-gray">{moodboard.note}</p>
          )}
        </div>
      </div>
    </section>
  );
}
