import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const MoodboardContext = createContext(null);

const STORAGE_KEY = 'wg-moodboard';

export const MoodboardProvider = ({ children }) => {
  const [colors, setColors] = useState([]);
  const [styles, setStyles] = useState([]);
  const [customImages, setCustomImages] = useState([]);
  const [projectName, setProjectName] = useState('Meu Novo Refúgio');
  const [isModified, setIsModified] = useState(false);

  // Carrega do localStorage ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setColors(data.colors || []);
        setStyles(data.styles || []);
        setCustomImages(data.customImages || []);
        if (data.projectName) setProjectName(data.projectName);
      } catch (err) {
        console.error('Erro ao carregar moodboard:', err);
      }
    }
  }, []);

  // Salva no localStorage quando modificado
  useEffect(() => {
    if (isModified) {
      const data = { 
        colors, 
        styles, 
        customImages, 
        projectName,
        updatedAt: new Date().toISOString() 
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [colors, styles, customImages, projectName, isModified]);

  // Handlers
  const updateColors = useCallback((newColors) => {
    setColors(newColors);
    setIsModified(true);
  }, []);

  const updateStyles = useCallback((newStyles) => {
    setStyles(newStyles);
    setIsModified(true);
  }, []);

  const addCustomImages = useCallback((images) => {
    setCustomImages((prev) => [...prev, ...images]);
    setIsModified(true);
  }, []);

  const removeCustomImage = useCallback((image) => {
    setCustomImages((prev) => prev.filter((img) => img.id !== image.id));
    setIsModified(true);
  }, []);

  const clearMoodboard = useCallback(() => {
    setColors([]);
    setStyles([]);
    setCustomImages([]);
    setProjectName('Meu Novo Refúgio');
    localStorage.removeItem(STORAGE_KEY);
    setIsModified(false);
  }, []);

  const buildShareUrl = useCallback(() => {
    const state = {
      p: projectName,
      c: colors,
      s: styles.map(s => s.slug || s.id),
      i: customImages.map(img => ({ u: img.url, t: img.title }))
    };
    // Codificação curta para URL
    const encoded = btoa(encodeURIComponent(JSON.stringify(state)));
    return `${window.location.origin}/moodboard/share?v=${encoded}`;
  }, [projectName, colors, styles, customImages]);

  const getMoodboardData = useCallback(() => {
    return {
      colors,
      styles,
      customImages,
      projectName,
      updatedAt: new Date().toISOString(),
    };
  }, [colors, styles, customImages, projectName]);

  const hasContent = colors.length > 0 || styles.length > 0 || customImages.length > 0;

  const value = {
    // State
    colors,
    styles,
    customImages,
    projectName,
    hasContent,
    isModified,

    // Actions
    setProjectName,
    updateColors,
    updateStyles,
    addCustomImages,
    removeCustomImage,
    clearMoodboard,
    getMoodboardData,
    buildShareUrl
  };

  return (
    <MoodboardContext.Provider value={value}>
      {children}
    </MoodboardContext.Provider>
  );
};

export const useMoodboard = () => {
  const context = useContext(MoodboardContext);
  if (!context) {
    throw new Error('useMoodboard deve ser usado dentro de MoodboardProvider');
  }
  return context;
};

export default MoodboardContext;
