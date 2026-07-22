import React from 'react';
import { motion } from '@/lib/motion-lite';
import { Check, Heart } from 'lucide-react';
import { withBasePath } from '@/utils/assetPaths';
import { getStyleImageUrl } from '@/data/styleImageManifest';

const StyleCard = ({
  style,
  isSelected,
  onSelect,
  onFavorite,
  isFavorite = false
}) => {
  const { name, slug, tags } = style;

  // Usa a variante 'card' para a grade, mas garante que pegamos a imagem real do manifesto se disponível
  const styleImage = getStyleImageUrl({ slug: slug, variant: 'card' }) || style.image;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-xl overflow-hidden cursor-pointer group shadow-lg border transition-all duration-300 ${
        isSelected 
          ? 'ring-2 ring-wg-orange border-wg-orange/50 shadow-[0_0_20px_rgba(242,92,38,0.2)]' 
          : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`${isSelected ? 'Remover' : 'Selecionar'} estilo ${name}`}
      aria-pressed={isSelected}
      onClick={() => onSelect(style)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(style);
        }
      }}
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={styleImage}
          alt={name}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-90'}`}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = withBasePath('/images/banners/MARCENARIA.webp'); }}
        />
        {/* Overlay gradient para legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 left-2 w-6 h-6 bg-wg-orange rounded-full flex items-center justify-center shadow-lg">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Favorite button */}
      <button
        type="button"
        aria-label={`${isFavorite ? 'Remover' : 'Adicionar'} ${name} dos favoritos`}
        aria-pressed={isFavorite}
        title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        onClick={(e) => {
          e.stopPropagation();
          onFavorite?.(style);
        }}
        className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
          isFavorite
            ? 'bg-red-500 text-white'
            : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white backdrop-blur-sm'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-white font-medium text-sm mb-1">{name}</h3>
        
        {/* Tags - Compactas no Studio */}
        <div className="flex flex-wrap gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-white/10 text-white/60 text-[9px] rounded uppercase tracking-wider border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default StyleCard;
