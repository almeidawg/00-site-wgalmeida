import React, { useRef } from 'react';
import { motion } from '@/lib/motion-lite';
import { Image as ImageIcon, Palette, Type, Trash2, Move, Layout } from 'lucide-react';
import { getStyleImageUrl } from '@/data/styleImageManifest';

const MoodboardCanvas = ({ colors, styles, customImages = [], onRemoveImage }) => {
  const canvasRef = useRef(null);

  const hasContent = (colors && colors.length > 0) || (styles && styles.length > 0) || (customImages && customImages.length > 0);

  return (
    <div
      ref={canvasRef}
      id="moodboard-canvas"
      className="bg-slate-900/40 rounded-[32px] p-8 h-full w-full relative overflow-hidden backdrop-blur-sm"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {!hasContent ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700">
          <Layout className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-xl font-light mb-2 tracking-tight text-slate-500">Seu Workspace está pronto</h3>
          <p className="text-[10px] text-center max-w-[200px] uppercase font-bold tracking-widest opacity-40">
            Adicione ativos, estilos ou cores na barra lateral para compor sua visão
          </p>
        </div>
      ) : (
        <div className="relative z-10 space-y-10 h-full overflow-y-auto custom-scrollbar pr-2">
          {/* Header Compacto */}
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500">Composição Visual</h2>
            <div className="flex gap-1">
               <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
               <div className="w-2 h-2 rounded-full bg-slate-800" />
               <div className="w-2 h-2 rounded-full bg-slate-800" />
            </div>
          </div>

          {/* Styles Section */}
          {styles && styles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-slate-400">
                <Type className="w-4 h-4 text-orange-500" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest">Estilos Base</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {styles.map((style, index) => {
                  const styleImage = getStyleImageUrl({ slug: style.slug, variant: 'card' }) || style.image;
                  return (
                    <motion.div
                      key={style.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video group border border-white/5"
                    >
                      <img
                        src={styleImage}
                        alt={style.name}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="text-white text-xs font-medium tracking-tight">{style.name}</h4>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Color Palette Section */}
          {colors && colors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-slate-400">
                <Palette className="w-4 h-4 text-orange-500" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest">Paleta Cromática</h3>
              </div>
              <div className="flex gap-3 flex-wrap">
                {colors.map((color, index) => (
                  <motion.div
                    key={color}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, delay: index * 0.05 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-16 h-16 rounded-2xl shadow-2xl border border-white/10"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
                      {color}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Custom Images Section */}
          {customImages && customImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-slate-400">
                <ImageIcon className="w-4 h-4 text-orange-500" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest">Mood & Atmosfera</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {customImages.map((img, index) => (
                  <motion.div
                    key={img.id || index}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative rounded-2xl overflow-hidden shadow-2xl aspect-square group border border-white/5"
                  >
                    <img
                      src={img.url}
                      alt={img.name || 'Referência'}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500"
                    />
                    <button
                      onClick={() => onRemoveImage?.(img)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Estilos para o canvas scrollbar */}
      <style>{`
        #moodboard-canvas .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        #moodboard-canvas .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        #moodboard-canvas .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        #moodboard-canvas .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

export default MoodboardCanvas;
