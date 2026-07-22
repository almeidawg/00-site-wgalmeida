import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchRetailProducts } from '@/services/retailService';
import { buildStyleEditorialSearchPlan } from '@/lib/styleEditorialSearchProfile';

const MoodboardContext = createContext(null);

const STORAGE_KEY = 'wg-moodboard-v3'; // Versão incrementada para nova estrutura de preços
const MAX_PERSISTED_IMAGES = 12;
let storageWarningShown = false;

const isQuotaExceededError = (error) =>
  error?.name === 'QuotaExceededError' ||
  error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
  error?.code === 22 ||
  error?.code === 1014;

export const stripStyleForStorage = (style = {}) => ({
  slug: style.slug,
  id: style.id,
  title: style.title,
  name: style.name,
  excerpt: style.excerpt,
  description: style.description,
  image: style.image,
  quote: style.quote,
  author: style.author,
  featured: style.featured,
  tags: Array.isArray(style.tags) ? style.tags : [],
  colors: Array.isArray(style.colors) ? style.colors : [],
  category: style.category,
});

export const stripImageForStorage = (image = {}) => {
  const url = String(image.url || '');
  const thumb = String(image.thumb || '');
  const isEmbedded = url.startsWith('data:') || thumb.startsWith('data:') || url.startsWith('blob:') || thumb.startsWith('blob:');

  return {
    id: image.id,
    name: image.name || image.title || 'Referência',
    price: image.price,
    source: image.source,
    type: image.type,
    url: isEmbedded ? '' : url,
    thumb: isEmbedded ? '' : thumb,
  };
};

const normalizeMoodboardForStorage = (data) => ({
  ...data,
  styles: (data.styles || []).map(stripStyleForStorage),
});

const persistMoodboardData = (data) => {
  const storageData = normalizeMoodboardForStorage(data);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    return;
  } catch (error) {
    if (!isQuotaExceededError(error)) throw error;
  }

  const compactData = {
    ...storageData,
    customImages: (data.customImages || [])
      .slice(-MAX_PERSISTED_IMAGES)
      .map(stripImageForStorage),
    storageCompacted: true,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compactData));
  } catch (error) {
    if (!isQuotaExceededError(error)) throw error;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...compactData,
        customImages: [],
        storageCompacted: true,
      }));
    } catch {
      if (!storageWarningShown) {
        console.warn('[Moodboard] Persistencia local indisponivel; mantendo estado apenas na sessao atual.');
        storageWarningShown = true;
      }
    }
  }
};

export const MoodboardProvider = ({ children }) => {
  const [colors, setColors] = useState([]);
  const [styles, setStyles] = useState([]);
  const [customImages, setCustomImages] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [projectName, setProjectName] = useState('Meu Novo Refúgio');
  const [isModified, setIsModified] = useState(false);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [isAutoComposing, setIsAutoComposing] = useState(false);

  // --- INTELIGÊNCIA FINANCEIRA: Cálculo de Orçamento ---
  const totalBudget = useMemo(() => {
    if (!customImages || customImages.length === 0) return 0;

    return customImages.reduce((sum, img) => {
      if (!img.price) return sum;
      try {
        // Extrai valor numérico de strings como "R$ 1.500,00" ou "R$ 289,90/m²"
        const cleanPrice = img.price
          .replace('R$', '')
          .replace(/\./g, '')
          .replace(',', '.')
          .split('/')[0] // Pega o valor base antes da unidade (/m², /un)
          .trim();

        const numericValue = parseFloat(cleanPrice);
        return isNaN(numericValue) ? sum : sum + numericValue;
      } catch (e) {
        return sum;
      }
    }, 0);
  }, [customImages]);

  const budgetTier = useMemo(() => {
    if (totalBudget === 0) return null;
    if (totalBudget < 5000) return { label: 'Essential', color: '#10b981', desc: 'Soluções otimizadas de alto impacto visual.' };
    if (totalBudget < 25000) return { label: 'Premium', color: '#3b82f6', desc: 'Materiais nobres e curadoria de design assinado.' };
    return { label: 'Luxury', color: '#8b5e3c', desc: 'Exclusividade absoluta e acabamentos de alto padrão.' };
  }, [totalBudget]);

  // --- PERSISTÊNCIA ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setColors(Array.isArray(data.colors) ? data.colors : []);
        setStyles(Array.isArray(data.styles) ? data.styles : []);
        setCustomImages(Array.isArray(data.customImages) ? data.customImages : []);
        setSelectedMaterials(Array.isArray(data.selectedMaterials) ? data.selectedMaterials : []);
        if (data.projectName) setProjectName(data.projectName);
      } catch (err) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (isModified) {
      const data = {
        colors, styles, customImages, selectedMaterials, projectName,
        updatedAt: new Date().toISOString()
      };
      persistMoodboardData(data);
    }
  }, [colors, styles, customImages, selectedMaterials, projectName, isModified]);

  // --- AUTOMATION: Auto-Compose ---
  const autoComposeMoodboard = useCallback(async (styleEntry) => {
    if (!styleEntry) return;
    setIsAutoComposing(true);
    setIsModified(true);

    try {
      const [finishes, decor] = await Promise.all([
        fetchRetailProducts({ style: styleEntry.title, category: 'finishes' }),
        fetchRetailProducts({ style: styleEntry.title, category: 'decor' })
      ]);

      const topItems = [...(finishes || []).slice(0, 2), ...(decor || []).slice(0, 2)].map((item, idx) => ({
        id: `auto-${item.id}-${Date.now()}-${idx}`,
        url: item.url || item.thumb,
        thumb: item.thumb,
        name: item.title,
        price: item.price,
        source: item.source || 'shopping',
        type: 'external'
      }));

      setCustomImages(prev => [...(prev || []), ...topItems]);
    } catch (e) {
      console.error('Falha na composição autônoma:', e);
    } finally {
      setIsAutoComposing(false);
    }
  }, []);

  // --- HANDLERS ---
  const updateStyles = useCallback((newStyles) => {
    const safeStyles = Array.isArray(newStyles) ? newStyles : [];
    setStyles(safeStyles);
    setIsModified(true);

    if (safeStyles.length > 0) {
      // Tenta pegar cores do objeto style, senão usa fallback técnico de luxo
      const allColors = safeStyles.reduce((acc, s) => {
        const styleColors = Array.isArray(s.colors) && s.colors.length > 0
          ? s.colors
          : ['#F5F5F5', '#1A1A1A', '#D9D9D9']; // Fallback neutro técnico
        return [...acc, ...styleColors];
      }, []);

      const uniqueColors = Array.from(new Set(allColors)).slice(0, 8);
      setColors(uniqueColors);
    } else {
      setColors([]);
    }
  }, []);

  const addCustomImages = useCallback((images) => {
    if (!images) return;
    const imagesArray = Array.isArray(images) ? images : [images];
    setCustomImages((prev) => [...(prev || []), ...imagesArray]);
    setIsModified(true);
  }, []);

  const removeCustomImage = useCallback((image) => {
    setCustomImages((prev) => prev.filter((img) => img.id !== image.id));
    setIsModified(true);
  }, []);

  const updateProjectName = useCallback((name) => {
    setProjectName(String(name || '').slice(0, 120));
    setIsModified(true);
  }, []);

  const clearMoodboard = useCallback(() => {
    setColors([]); setStyles([]); setCustomImages([]); setSelectedMaterials([]);
    setProjectName('Meu Novo Refúgio');
    localStorage.removeItem(STORAGE_KEY);
    setIsModified(false);
  }, []);

  const saveMoodboard = useCallback(() => {
    const updatedAt = new Date().toISOString();
    persistMoodboardData({ colors, styles, customImages, selectedMaterials, projectName, updatedAt });
    setIsModified(false);
    return updatedAt;
  }, [colors, styles, customImages, selectedMaterials, projectName]);

  const getMoodboardData = useCallback(() => ({
    projectName,
    colors,
    styles,
    customImages: customImages.slice(0, 8),
    totalBudget,
    budgetTier,
  }), [projectName, colors, styles, customImages, totalBudget, budgetTier]);

  const buildShareUrl = useCallback(({ clientName } = {}) => {
    try {
      const payload = btoa(encodeURIComponent(JSON.stringify({
        p: projectName,
        n: clientName || 'Visitante',
        c: colors,
        s: styles.map(s => s.slug || s.id),
        i: customImages.slice(0, 8).map(img => ({
          u: img.url || img.thumb || '',
          t: img.name || img.title || '',
        })),
      })));
      return `${window.location.origin}/moodboard/share?v=${payload}`;
    } catch {
      return `${window.location.origin}/moodboard/share`;
    }
  }, [projectName, colors, styles, customImages]);

  const value = {
    colors, styles, customImages, selectedMaterials, projectName,
    totalBudget, budgetTier,
    hasContent: (colors?.length || 0) > 0 || (styles?.length || 0) > 0 || (customImages?.length || 0) > 0,
    isModified, isAutoSyncing, isAutoComposing,
    setProjectName: updateProjectName, updateProjectName, updateColors: setColors, updateStyles,
    updateMaterials: setSelectedMaterials, addCustomImages, removeCustomImage,
    clearMoodboard, saveMoodboard, autoComposeMoodboard,
    getMoodboardData, buildShareUrl,
  };

  return <MoodboardContext.Provider value={value}>{children}</MoodboardContext.Provider>;
};

export const useMoodboard = () => {
  const context = useContext(MoodboardContext);
  if (!context) throw new Error('useMoodboard deve ser usado dentro de MoodboardProvider');
  return context;
};

export default MoodboardContext;
