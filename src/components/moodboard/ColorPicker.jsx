import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from '@/lib/motion-lite';
import { Check, Plus, X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';

import { styleCatalog } from '@/utils/styleCatalog';

// Gera as paletas dinamicamente a partir do catálogo completo de estilos
const PRESET_PALETTES = styleCatalog.reduce((acc, style) => {
  if (style.colors && style.colors.length > 0) {
    acc[style.slug || style.id] = {
      name: style.name || style.title,
      colors: style.colors
    };
  }
  return acc;
}, {});

const ColorSwatch = ({ color, isSelected, onClick, onRemove, size = 'md' }) => {
  const sizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`${sizes[size]} rounded-full cursor-pointer relative shadow-lg border-2 shrink-0 ${
        isSelected ? 'border-orange-500 shadow-orange-500/20' : 'border-white/10'
      }`}
      style={{ backgroundColor: color }}
      onClick={() => onClick(color)}
    >
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Check className="w-4 h-4 text-white drop-shadow-lg" />
        </div>
      )}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(color);
          }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 shadow-md z-10"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </motion.div>
  );
};

const ColorPicker = ({
  selectedColors,
  onColorsChange,
  maxColors = 10,
  customImages = [],
  onImagesAdd,
  onRemoveImage,
  maxImages = 6
}) => {
  const [customColor, setCustomColor] = useState('#000000');
  const [activeCategory, setActiveCategory] = useState(Object.keys(PRESET_PALETTES)[0] || 'moderno');
  const [isUploadingRef, setIsUploadingRef] = useState(false);
  const fileInputRef = useRef(null);

  const handleColorSelect = (color) => {
    if (selectedColors.includes(color)) {
      onColorsChange(selectedColors.filter((c) => c !== color));
    } else if (selectedColors.length < maxColors) {
      onColorsChange([...selectedColors, color]);
    }
  };

  const handleRemoveColor = (color) => {
    onColorsChange(selectedColors.filter((c) => c !== color));
  };

  const handleAddCustomColor = () => {
    if (!selectedColors.includes(customColor) && selectedColors.length < maxColors) {
      onColorsChange([...selectedColors, customColor]);
    }
  };

  const handleApplyPalette = (paletteKey) => {
    const paletteColors = PRESET_PALETTES[paletteKey].colors;
    // Mesclagem Inteligente: Adiciona cores da paleta que ainda não estão na seleção
    const newColors = [...selectedColors];
    
    paletteColors.forEach(color => {
      if (!newColors.includes(color) && newColors.length < maxColors) {
        newColors.push(color);
      }
    });

    onColorsChange(newColors);
  };

  return (
    <div className="space-y-6 text-slate-200">
      <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
          Sua Seleção ({selectedColors.length}/{maxColors})
        </h3>
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-2 custom-scrollbar min-h-[50px]">
          {selectedColors.length === 0 ? (
            <p className="text-slate-600 text-[10px] uppercase font-bold italic py-2">Selecione estilos para carregar cores</p>
          ) : (
            selectedColors.map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                isSelected={false}
                onClick={() => {}}
                onRemove={handleRemoveColor}
                size="md"
              />
            ))
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-1 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
          {Object.entries(PRESET_PALETTES).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-tighter transition-all border ${
                activeCategory === key
                  ? 'bg-orange-600 text-white border-orange-500 shadow-lg'
                  : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50 flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {PRESET_PALETTES[activeCategory]?.colors.map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                isSelected={selectedColors.includes(color)}
                onClick={handleColorSelect}
                size="sm"
              />
            ))}
          </div>
          <button
            onClick={() => handleApplyPalette(activeCategory)}
            className="ml-4 shrink-0 px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
            title="Adicionar estas cores ao projeto"
          >
            <Plus size={12} className="text-orange-500" /> Incluir
          </button>
        </div>
      </div>

      <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Customizar</h3>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
          />
          <input
            type="text"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs font-mono text-slate-400 focus:border-orange-500 outline-none transition-all"
            placeholder="#000000"
          />
          <button
            onClick={handleAddCustomColor}
            disabled={selectedColors.length >= maxColors}
            className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-all disabled:opacity-30"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
