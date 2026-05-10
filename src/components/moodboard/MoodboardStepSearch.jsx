import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from '@/lib/motion-lite';
import { Search, Loader2, Plus, Image as ImageIcon, ShoppingCart } from 'lucide-react';
import { searchGoogleImages, searchPinterestImages } from '@/services/mediaService';
import { fetchRetailProducts } from '@/services/retailService';
import { buildStyleEditorialSearchPlan } from '@/lib/styleEditorialSearchProfile';
import { styleCatalog } from '@/utils/styleCatalog';
import { cn } from '@/lib/utils';

const MoodboardStepSearch = ({ mode, style, onAssetAdd }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Lógica de Sugestões Inteligentes baseadas no Estilo e Modo
  const suggestions = useMemo(() => {
    const styleEntry = styleCatalog.find(s => s.title === style || s.slug === style);
    if (!styleEntry) return [];
    
    const plan = buildStyleEditorialSearchPlan(styleEntry, mode);
    return plan.searchTerms.filter(t => t && t.length > 2).slice(0, 6);
  }, [style, mode]);

  const handleSearch = async (manualQuery) => {
    const finalQuery = manualQuery || query;
    setIsLoading(true);
    try {
      const styleEntry = styleCatalog.find(s => s.title === style || s.slug === style);

      // Normalização para evitar falhas por acentuação
      const normalizedQuery = (finalQuery || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

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

      // 1. Busca Técnica em Shopping/Varejo
      const retailResults = await fetchRetailProducts({ 
        query: searchQuery, 
        style: style,
        category: mode 
      });

      // 2. Busca Estética no Pinterest somente quando a curadoria local for insuficiente.
      const pinterestResults = retailResults.length >= 4 ? [] : await searchPinterestImages(searchQuery);

      // 3. Busca de Referência no Google Imagens (Prioriza se o resto falhar)
      let googleResults = [];
      if (retailResults.length + pinterestResults.length < 4) {
        googleResults = await searchGoogleImages(searchQuery);
      }

      // Mescla e remove duplicados
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

  useEffect(() => {
    handleSearch();
  }, [mode, style]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 relative">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative z-20">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder={style ? `Procurar em fornecedores para ${style}...` : "Buscar em Leroy Merlin, Westwing..."}
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
          results.map((img, idx) => (
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
              
              <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <span className={cn(
                  "px-1.5 py-0.5 rounded-md text-[6px] font-bold uppercase tracking-widest border backdrop-blur-md",
                  img.source === 'shopping' ? "bg-green-500/80 border-green-400 text-white" : "bg-black/80 border-white/10 text-white/80"
                )}>
                  {img.source || 'web'}
                </span>
                {img.source === 'shopping' && (
                  <ShoppingCart className="w-2.5 h-2.5 text-green-400 drop-shadow-lg" />
                )}
              </div>

              <button 
                onClick={() => onAssetAdd({
                  id: `search-${idx}-${Date.now()}`,
                  url: img.url || img.thumb,
                  thumb: img.thumb || img.url,
                  name: img.title || 'Referência',
                  type: 'external',
                  source: img.source
                })}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all"
              >
                <div className="w-8 h-8 bg-wg-orange rounded-full flex items-center justify-center text-white shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <Plus size={16} />
                </div>
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/70 backdrop-blur-sm transition-transform">
                <p className="text-[7px] text-white/90 truncate uppercase tracking-tighter">{img.title || 'Item de Design'}</p>
                {img.price && <p className="text-[6px] text-wg-orange font-bold">{img.price}</p>}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-3 py-20 text-center text-slate-800">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-10" />
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-30">Nenhum fornecedor encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodboardStepSearch;
