import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from '@/lib/motion-lite';
import { CheckCircle2, Circle, Layers, Trophy } from 'lucide-react';
import { useMoodboard } from '@/contexts/MoodboardContext';
import { getStyleImageUrl } from '@/data/styleImageManifest';

const Step = ({ num, label, done, children }) => (
  <div className="flex gap-3 items-start">
    <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 ${done ? 'bg-wg-orange text-white shadow-[0_0_8px_rgba(242,92,38,0.3)]' : 'border border-slate-200 text-slate-400 bg-slate-50'}`}>
      {done ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-[8px] font-bold">{num}</span>}
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-[9px] font-bold uppercase tracking-widest mb-1.5 transition-colors ${done ? 'text-slate-950 font-semibold' : 'text-slate-400 font-medium'}`}>{label}</p>
      {children}
    </div>
  </div>
);

const StyleThumb = ({ style }) => {
  const url = getStyleImageUrl?.({ slug: style.slug, variant: 'card' }) || style.image || '/images/banners/MARCENARIA.webp';
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0"
      title={style.title || style.name}
    >
      <img src={url} alt={style.title} className="w-full h-full object-cover" />
    </motion.div>
  );
};

const ColorSwatch = ({ color }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', stiffness: 300 }}
    className="w-5 h-5 rounded-full border border-slate-200 flex-shrink-0 shadow-md"
    style={{ backgroundColor: color }}
    title={color}
  />
);

const ImageThumb = ({ img }) => {
  const src = img.thumb || img.url || '';
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100"
    >
      {src ? (
        <img src={src} alt={img.name || ''} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400">
          <Layers className="w-3 h-3" />
        </div>
      )}
    </motion.div>
  );
};

const MoodboardSelectionSummary = () => {
  const { colors, styles, customImages, totalBudget, budgetTier } = useMoodboard();
  const prevCountRef = useRef(0);
  const [pulse, setPulse] = useState(false);

  const finishes = customImages.filter(i => i.source === 'shopping' || String(i.id || '').includes('auto'));
  const decor = customImages.filter(i => !finishes.includes(i) && i.source !== 'upload').slice(0, 4);
  const assets = customImages.filter(i => i.source === 'upload' || i.type === 'upload').slice(0, 4);

  const totalCount = styles.length + colors.length + customImages.length;
  const maxSteps = 5;
  const completedSteps = [
    styles.length > 0,
    colors.length > 0,
    finishes.length > 0,
    decor.length > 0,
    assets.length > 0,
  ].filter(Boolean).length;
  const progress = Math.round((completedSteps / maxSteps) * 100);

  useEffect(() => {
    if (totalCount > prevCountRef.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 800);
      prevCountRef.current = totalCount;
      return () => clearTimeout(t);
    }
    prevCountRef.current = totalCount;
  }, [totalCount]);

  const formattedBudget = totalBudget > 0
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalBudget)
    : null;

  return (
    <motion.div
      animate={pulse ? { boxShadow: '0 0 0 2px rgba(242,92,38,0.5)' } : { boxShadow: '0 0 0 0px rgba(242,92,38,0)' }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-wg-orange" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-800 font-semibold">Sua Composição</span>
        </div>
        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${progress === 100 ? 'bg-wg-orange text-white' : 'bg-slate-100 text-slate-600'}`}>
          {completedSteps}/{maxSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-wg-orange rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {/* Step 1: Estilos */}
        <Step num={1} label="Estilos" done={styles.length > 0}>
          <AnimatePresence>
            {styles.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1.5 flex-wrap">
                {styles.slice(0, 3).map(s => <StyleThumb key={s.slug || s.id} style={s} />)}
              </motion.div>
            ) : (
              <p className="text-[8px] text-slate-400">Nenhum estilo selecionado</p>
            )}
          </AnimatePresence>
        </Step>

        {/* Step 2: Paleta */}
        <Step num={2} label="Paleta" done={colors.length > 0}>
          <AnimatePresence>
            {colors.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1.5 flex-wrap">
                {colors.slice(0, 8).map(c => <ColorSwatch key={c} color={c} />)}
              </motion.div>
            ) : (
              <p className="text-[8px] text-slate-400">Defina a paleta cromática</p>
            )}
          </AnimatePresence>
        </Step>

        {/* Step 3: Acabamentos */}
        <Step num={3} label="Acabamentos" done={finishes.length > 0}>
          <AnimatePresence>
            {finishes.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1.5 flex-wrap">
                {finishes.slice(0, 5).map((img, i) => <ImageThumb key={img.id || i} img={img} />)}
                {finishes.length > 5 && (
                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[7px] text-slate-500 font-bold">
                    +{finishes.length - 5}
                  </div>
                )}
              </motion.div>
            ) : (
              <p className="text-[8px] text-slate-400">Busque acabamentos e materiais</p>
            )}
          </AnimatePresence>
        </Step>

        {/* Step 4: Decoração */}
        <Step num={4} label="Decoração" done={decor.length > 0}>
          <AnimatePresence>
            {decor.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1.5 flex-wrap">
                {decor.slice(0, 5).map((img, i) => <ImageThumb key={img.id || i} img={img} />)}
              </motion.div>
            ) : (
              <p className="text-[8px] text-slate-400">Adicione elementos decorativos</p>
            )}
          </AnimatePresence>
        </Step>

        {/* Step 5: Ativos */}
        <Step num={5} label="Referências" done={assets.length > 0}>
          <AnimatePresence>
            {assets.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1.5 flex-wrap">
                {assets.slice(0, 5).map((img, i) => <ImageThumb key={img.id || i} img={img} />)}
              </motion.div>
            ) : (
              <p className="text-[8px] text-slate-400">Faça upload de referências</p>
            )}
          </AnimatePresence>
        </Step>
      </div>

      {/* Budget summary */}
      {formattedBudget && budgetTier && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-slate-100 pt-3 flex items-center justify-between"
        >
          <div>
            <p className="text-[7px] uppercase tracking-widest text-slate-400 mb-0.5">Investimento Est.</p>
            <p className="text-sm font-medium text-slate-900">{formattedBudget}</p>
          </div>
          <div
            className="px-2 py-1 rounded-lg text-[7px] font-bold uppercase tracking-widest"
            style={{ backgroundColor: `${budgetTier.color}15`, color: budgetTier.color, border: `1px solid ${budgetTier.color}25` }}
          >
            <Trophy className="w-2.5 h-2.5 inline mr-1" />
            {budgetTier.label}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MoodboardSelectionSummary;
