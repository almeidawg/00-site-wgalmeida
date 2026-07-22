import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from '@/lib/motion-lite';
import { Search, Grid, List } from 'lucide-react';
import StyleCard from './StyleCard';
import { styleCatalog } from '@/utils/styleCatalog';

// Carrega todos os estilos do catálogo oficial
const ALL_STYLES = styleCatalog;

// Gera categorias únicas baseadas no catálogo
const CATEGORIES = [
  { id: 'todos', name: 'Todos' },
  ...Array.from(new Set(styleCatalog.map(s => s.category)))
    .filter(Boolean)
    .map(cat => ({ 
      id: cat, 
      name: cat.charAt(0).toUpperCase() + cat.slice(1) 
    }))
];

const StyleGrid = ({ selectedStyles, onStylesChange, maxStyles = 3 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);

  const filteredStyles = useMemo(() => {
    return ALL_STYLES.filter((style) => {
      const matchesSearch =
        style.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        style.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        style.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        activeCategory === 'todos' || style.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const handleStyleSelect = (style) => {
    // Normalização absoluta: o catálogo oficial usa 'slug'
    const styleKey = style.slug || style.id;
    const isSelected = selectedStyles.some((s) => (s.slug || s.id) === styleKey);

    if (isSelected) {
      onStylesChange(selectedStyles.filter((s) => (s.slug || s.id) !== styleKey));
    } else if (selectedStyles.length < maxStyles) {
      onStylesChange([...selectedStyles, style]);
    }
  };

  const handleFavorite = (style) => {
    const styleId = style.slug || style.id;
    const isFav = favorites.includes(styleId);
    if (isFav) {
      setFavorites(favorites.filter((id) => id !== styleId));
    } else {
      setFavorites([...favorites, styleId]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Compacto para Sidebar */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
          {selectedStyles.length}/{maxStyles} Selecionados
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Visualizar estilos em grade"
            aria-pressed={viewMode === 'grid'}
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${
              viewMode === 'grid' ? 'bg-wg-orange text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Visualizar estilos em lista"
            aria-pressed={viewMode === 'list'}
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${
              viewMode === 'list' ? 'bg-wg-orange text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filter Compacto */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Filtrar estilos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:ring-1 focus:ring-wg-orange outline-none transition-all placeholder:text-slate-700"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((category) => (
            <button
              type="button"
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter transition-all ${
                activeCategory === category.id
                  ? 'bg-slate-200 text-slate-900'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Estilos */}
      <motion.div
        layout
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-2 gap-3'
            : 'flex flex-col gap-2'
        }
      >
        <AnimatePresence>
          {filteredStyles.map((style) => (
            <motion.div
              key={style.slug || style.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <StyleCard
                style={style}
                isSelected={selectedStyles.some((s) => (s.slug || s.id) === (style.slug || style.id))}
                onSelect={handleStyleSelect}
                onFavorite={handleFavorite}
                isFavorite={favorites.includes(style.slug || style.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredStyles.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[10px] text-slate-600 uppercase font-bold">Nenhum estilo encontrado</p>
        </div>
      )}
    </div>
  );
};

export default StyleGrid;
