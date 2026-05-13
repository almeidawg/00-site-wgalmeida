import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from '@/lib/motion-lite';
import { Search, Loader2, Plus, Image as ImageIcon, ShoppingCart, ExternalLink } from 'lucide-react';
import { searchGoogleImages, searchPinterestImages } from '@/services/mediaService';
import { fetchRetailProducts } from '@/services/retailService';
import { buildStyleEditorialSearchPlan } from '@/lib/styleEditorialSearchProfile';
import { styleCatalog } from '@/utils/styleCatalog';
import { cn } from '@/lib/utils';

const SOURCE_FILTERS = [
  { id: 'all',       label: 'Todos' },
  { id: 'leroy',     label: '🛒 Leroy Merlin' },
  { id: 'pinterest', label: '📌 Pinterest' },
  { id: 'google',    label: '🔍 Google' },
];

const getSourceBadge = (source) => {
  if (!source) return { label: 'web', cls: 'bg-black/80 border-white/10 text-white/60' };
  const s = String(source).toLowerCase();
  if (s.includes('leroy') || s === 'shopping') return { label: 'Leroy', cls: 'bg-green-500/90 border-green-400 text-white' };
  if (s === 'pinterest') return { label: 'Pinterest', cls: 'bg-red-500/90 border-red-400 text-white' };
  if (s === 'google') return { label: 'Google', cls: 'bg-blue-500/90 border-blue-400 text-white' };
  return { label: s, cls: 'bg-black/80 border-white/10 text-white/60' };
};

const isLeroyUrl = (img) =>
  String(img?.url || img?.thumb || '').includes('leroymerlin') ||
  String(img?.source || '').includes('leroy') ||
  img?.source === 'shopping';

const MoodboardStepSearch = ({ mode, style, onAssetAdd }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeSource, setActiveSource] = useState('all');

  const suggestions = useMemo(() => {
    const styleEntry = styleCatalog.find(s => s.title === style || s.slug === style);
    if (!styleEntry) return [];
    const plan = buildStyleEditorialSearchPlan(styleEntry, mode);
    return plan.searchTerms.filter(t => t && t.length > 2).slice(0, 6);
  }, [style, mode]);

  const handleSearch = async (manualQuery, forceSource) => {
    const finalQuery = manualQuery || query;
    const src = forceSource !== undefined ? forceSource : activeSource;
    setIsLoading(true);
    try {
      const styleEntry = styleCatalog.find(s => s.title === style || s.slug === style);

      let searchQuery = finalQuery;
      if (!finalQuery && styleEntry) {
        const plan = buildStyleEditorialSearchPlan(styleEntry, mode);
        searchQuery = plan.mainQuery;
      }

      if (!searchQuery) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      let retailResults = [], pinterestResults = [], googleResults = [];

      if (src === 'leroy') {
        retailResults = await fetchRetailProducts({ query: searchQuery, style, category: mode, forceLeroy: true });
      } else if (src === 'pinterest') {
        pinterestResults = await searchPinterestImages(searchQuery);
      } else if (src === 'google') {
        googleResults = await searchGoogleImages(searchQuery);
      } else {
        retailResults = await fetchRetailProducts({ query: searchQuery, style, category: mode });
        if (retailResults.length < 4) pinterestResults = await searchPinterestImages(searchQuery);
        if (retailResults.length + pinterestResults.length < 4) googleResults = await searchGoogleImages(searchQuery);
      }

      const combined = [...retailResults, ...pinterestResults, ...googleResults];
      const seen = new Set();
      const unique = combined.filter(img => {
        const url = img.url || img.thumb;
        if (!url || seen.has(url)) return false;
        seen.add(url);
        return true;
      });

      setResults(unique.slice(0, 30));
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (term) => {
    setQuery(term);
    setIsFocused(false);
    handleSearch(term);
  };

  const handleSourceChange = (src) => {
    setActiveSource(src);
    handleSearch(query, src);
  };

  useEffect(() => {
    handleSearch();
  }, [mode, style]);

  return (
    <div className="space-y-3">
      {/* Filtros de fonte */}
      <div className="flex gap-1.5 flex-wrap">
        {SOURCE_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => handleSourceChange(f.id)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all',
              activeSource === f.id
                ? 'bg-wg-orange text-white border-wg-orange shadow-[0_0_10px_rgba(242,92,38,0.3)]'
                : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 relative">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative z-20">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder={
              activeSource === 'leroy' ? `Buscar em Leroy Merlin...` :
              activeSource === 'pinterest' ? `Buscar no Pinterest...` :
              activeSource === 'google' ? `Buscar no Google Imagens...` :
              style ? `Procurar para ${style}...` : 'Buscar em Leroy Merlin, Pinterest...'
            }
            value={query}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] text-slate-200 focus:ring-1 focus:ring-wg-orange outline-none transition-all placeholder:text-slate-700"
          />
        </form>

        <AnimatePresence>
          {isFocused && suggestions.length > 0 && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsFocused(false)} />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 p-3 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-20 backdrop-blur-xl"
              >
                <p className="px-1 py-1 text-[8px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 mb-3">Sugestões de Curadoria</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(term)}
                      className="px-2.5 py-1.5 bg-white/5 hover:bg-wg-orange hover:text-white rounded-lg text-[9px] text-slate-400 transition-all border border-white/5 font-medium"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[500px] custom-scrollbar pr-1 pb-10">
        {isLoading ? (
          <div className="col-span-3 py-20 flex flex-col items-center gap-3 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin text-wg-orange" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Varrendo Catálogos...</span>
          </div>
        ) : results.length > 0 ? (
          results.map((img, idx) => {
            const badge = getSourceBadge(img.source);
            const isLeroy = isLeroyUrl(img);
            return (
              <motion.div
                key={img.id || idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (idx % 12) * 0.02 }}
                className="group relative aspect-square bg-slate-950 rounded-xl overflow-hidden border border-white/5 hover:border-wg-orange/40 transition-all shadow-md"
              >
                <img
                  src={img.thumb || img.url}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500"
                  loading="lazy"
                  alt={img.title}
                />

                {/* Badge de fonte — sempre visível */}
                <div className="absolute top-1.5 left-1.5 flex gap-1 items-center">
                  <span className={cn('px-1.5 py-0.5 rounded-md text-[6px] font-bold uppercase tracking-widest border backdrop-blur-md', badge.cls)}>
                    {badge.label}
                  </span>
                  {isLeroy && <ShoppingCart className="w-2.5 h-2.5 text-green-400 drop-shadow-lg" />}
                </div>

                {/* Botão adicionar */}
                <button
                  onClick={() => onAssetAdd({
                    id: `search-${idx}-${Date.now()}`,
                    url: img.url || img.thumb,
                    thumb: img.thumb || img.url,
                    name: img.title || 'Referência',
                    price: img.price,
                    type: 'external',
                    source: img.source,
                  })}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <div className="w-8 h-8 bg-wg-orange rounded-full flex items-center justify-center text-white shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Plus size={16} />
                  </div>
                </button>

                {/* Info footer */}
                <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/70 backdrop-blur-sm">
                  <p className="text-[7px] text-white/90 truncate uppercase tracking-tighter">{img.title || 'Item de Design'}</p>
                  <div className="flex items-center justify-between gap-1">
                    {img.price && <p className="text-[7px] text-wg-orange font-bold">{img.price}</p>}
                    {isLeroy && img.url && (
                      <a
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="text-[6px] text-green-400 hover:text-green-300 flex items-center gap-0.5 ml-auto"
                      >
                        Ver loja <ExternalLink className="w-2 h-2" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-3 py-20 text-center text-slate-800">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-10" />
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-30">Nenhum resultado encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodboardStepSearch;
