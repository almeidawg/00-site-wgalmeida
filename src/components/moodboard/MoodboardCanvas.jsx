import React, { useRef, useMemo } from 'react';
import { motion, AnimatePresence } from '@/lib/motion-lite';
import {
  Image as ImageIcon,
  Palette,
  Type,
  Trash2,
  Layout,
  Hammer,
  Sparkles,
  Target,
  Trophy,
  Download,
  Share2,
  ShoppingCart
} from 'lucide-react';
import { getStyleImageUrl } from '@/data/styleImageManifest';
import { MATERIAL_DATA } from '@/lib/moodboard-constants';
import { useMoodboard } from '@/contexts/MoodboardContext';

const MoodboardCanvas = ({ onRemoveImage }) => {
  const canvasRef = useRef(null);
  const {
    colors,
    styles,
    customImages,
    selectedMaterials,
    totalBudget,
    budgetTier,
    projectName
  } = useMoodboard();

  const materials = useMemo(() =>
    (selectedMaterials || []).map(id => MATERIAL_DATA[id]).filter(Boolean),
  [selectedMaterials]);

  const hasContent = (colors && colors.length > 0) || (styles && styles.length > 0) || (customImages && customImages.length > 0) || (materials.length > 0);

  const formattedBudget = useMemo(() => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBudget);
  }, [totalBudget]);

  return (
    <div
      ref={canvasRef}
      id="moodboard-canvas"
      className="bg-[#050506] h-full w-full relative overflow-hidden flex flex-col pt-24"
    >
      {/* 1. INVESTMENT INTELLIGENCE HEADER */}
      <div className="px-10 mb-8">
        <div className="flex items-end justify-between border-b border-white/5 pb-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 mb-1">
                <Target className="w-3 h-3 text-wg-orange" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">Dossiê Técnico de Projeto</span>
             </div>
             <h1 className="text-3xl font-light text-white tracking-tight">{projectName}</h1>
          </div>

          <div className="flex gap-4 items-center">
            {totalBudget > 0 && budgetTier && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl"
              >
                <div className="flex flex-col items-end">
                   <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Investimento Est.</span>
                   <span className="text-lg font-medium text-white">{formattedBudget}</span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex items-center gap-3">
                   <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: `${budgetTier.color}20`, border: `1px solid ${budgetTier.color}40` }}
                   >
                      <Trophy className="w-4 h-4" style={{ color: budgetTier.color }} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-white uppercase tracking-tighter">{budgetTier.label}</span>
                      <span className="text-[8px] text-slate-500 max-w-[140px] leading-tight">{budgetTier.desc}</span>
                   </div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-2">
              <button className="p-3 bg-white/5 hover:bg-wg-orange text-white rounded-full transition-all border border-white/10">
                <Download size={18} />
              </button>
              <button className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {!hasContent ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-700">
          <Layout className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-xl font-light mb-2 tracking-tight text-slate-500">Workspace de Curadoria</h3>
          <p className="text-[10px] text-center max-w-[200px] uppercase font-bold tracking-widest opacity-40 leading-relaxed">
            Selecione estilos e ativos na barra lateral para iniciar a composição financeira e visual.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar px-10 pb-20 space-y-12 relative z-10">

          {/* Progress Indicator */}
          <div className="grid grid-cols-5 gap-4">
             {[
               { id: 1, label: 'Estilos', active: styles.length > 0 },
               { id: 2, label: 'Paletas', active: colors.length > 0 },
               { id: 3, label: 'Acabamentos', active: customImages.some(i => i.source === 'shopping' || i.id.includes('auto')) },
               { id: 4, label: 'Decoração', active: customImages.length > 4 },
               { id: 5, label: 'Ativos', active: customImages.length > 8 }
             ].map((item) => (
               <div key={item.id} className="space-y-2">
                  <div className={`h-1 rounded-full transition-all duration-1000 ${item.active ? 'bg-wg-orange shadow-[0_0_10px_rgba(242,92,38,0.4)]' : 'bg-white/10'}`} />
                  <span className={`text-[8px] font-bold uppercase tracking-[0.2em] ${item.active ? 'text-white' : 'text-slate-600'}`}>0{item.id}. {item.label}</span>
               </div>
             ))}
          </div>

          {/* 1. Styles Section */}
          {styles.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Type className="w-4 h-4 text-wg-orange" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest">Base de Estilo</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {styles.map((style, index) => (
                  <motion.div
                    key={style.slug || style.id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video group border border-white/5"
                  >
                    <img
                      src={getStyleImageUrl({ slug: style.slug, variant: 'card' }) || style.image}
                      alt={style.title}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h4 className="text-white text-xs font-medium tracking-tight uppercase tracking-widest">{style.title || style.name}</h4>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* 2. Color Palette Section */}
          {colors.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Palette className="w-4 h-4 text-wg-orange" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest">DNA Cromático</h3>
              </div>
              <div className="flex gap-4 flex-wrap">
                {colors.map((color, index) => (
                  <motion.div
                    key={color}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: index * 0.05 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-16 h-16 rounded-2xl shadow-2xl border border-white/10"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[9px] font-mono text-slate-500">{color}</span>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* 3. Materials & Shopping Section */}
          {customImages.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Hammer className="w-4 h-4 text-wg-orange" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest">Mood & Especificações Técnicas</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {customImages.map((img, index) => (
                  <motion.div
                    key={img.id || index}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative rounded-xl overflow-hidden shadow-2xl aspect-square group border border-white/5 bg-slate-950"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500"
                    />

                    {img.price && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/80 backdrop-blur-md rounded border border-white/10 z-10 flex items-center gap-1">
                        <ShoppingCart className="w-2 h-2 text-wg-orange" />
                        <span className="text-[7px] font-bold text-white">{img.price}</span>
                      </div>
                    )}

                    <button
                      onClick={() => onRemoveImage?.(img)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-[7px] text-white/90 truncate uppercase">{img.name || 'Referência'}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

        </div>
      )}

      <style>{`
        #moodboard-canvas .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        #moodboard-canvas .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        #moodboard-canvas .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        #moodboard-canvas .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

export default MoodboardCanvas;
