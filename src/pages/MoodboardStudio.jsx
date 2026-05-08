import { MoodboardProvider, useMoodboard } from '@/contexts/MoodboardContext';
import MoodboardStudioLayout from '@/components/moodboard/MoodboardStudioLayout';
import { 
  ColorPicker, 
  StyleGrid, 
  MoodboardCanvas 
} from '@/components/moodboard';
import SEO from '@/components/SEO';
import { useState, useEffect } from 'react';

const StudioContent = () => {
  const {
    colors,
    styles,
    customImages,
    updateColors,
    updateStyles,
    removeCustomImage,
    addCustomImages
  } = useMoodboard();

  const [lizInsight, setLizInsight] = useState("Seja bem-vindo ao Studio, William. Comece selecionando seus estilos favoritos para compormos sua visão.");

  // Sincronização Inteligente: Mescla cores de todos os estilos selecionados
  useEffect(() => {
    if (styles.length > 0) {
      // Coleta todas as cores dos estilos selecionados
      const allStyleColors = styles.reduce((acc, style) => [...acc, ...(style.colors || [])], []);
      const uniqueColors = Array.from(new Set(allStyleColors)).slice(0, 10);
      
      // Só atualiza se a paleta resultante for diferente da atual para evitar loops
      if (uniqueColors.length > 0 && JSON.stringify(uniqueColors) !== JSON.stringify(colors)) {
        updateColors(uniqueColors);
      }

      // Mapeamento de busca profissional (English for Google/Pinterest Luxury)
      const searchMapping = {
        'industrial': { acabamentos: 'polished concrete, black steel', decor: 'leather sofa, industrial lamps' },
        'minimalismo': { acabamentos: 'seamless flooring, white marble', decor: 'minimalist furniture, architectural lighting' },
        'japandi': { acabamentos: 'light oak wood, limestone', decor: 'zen decor, low profile furniture' },
        'moderno': { acabamentos: 'floor to ceiling glass, terrazzo', decor: 'mid-century icons, walnut pieces' },
        'classico': { acabamentos: 'chevron parquet, boiserie', decor: 'crystal chandelier, antique mirrors' },
        'tropical': { acabamentos: 'natural stone, bamboo', decor: 'rattan furniture, botanical prints' }
      };

      const primaryStyle = styles[0];
      const styleSlug = primaryStyle.slug || primaryStyle.id;
      const mapping = searchMapping[styleSlug] || { acabamentos: 'luxury finishes', decor: 'high-end furniture' };
      const styleNames = styles.map(s => s.name).join(' & ');
      
      setLizInsight(`William, criei um mix de cores entre ${styleNames}. No catálogo, priorizei ${mapping.acabamentos} para compor sua visão.`);
    } else if (styles.length === 0 && colors.length > 0) {
       setLizInsight("Selecione um estilo para começarmos a curadoria.");
    }
  }, [styles, colors, updateColors]); 

  return (
    <>
      <SEO title="Studio | Moodboard Imersivo" noindex />
      <MoodboardStudioLayout 
        lizInsight={lizInsight}
        colors={colors}
        styles={styles}
        updateColors={updateColors}
        updateStyles={updateStyles}
      >
         {/* O Canvas agora é o centro do Workspace */}
         <div className="w-full h-full flex items-center justify-center p-4">
            <MoodboardCanvas
              colors={colors}
              styles={styles}
              customImages={customImages}
              onRemoveImage={removeCustomImage}
              studioMode={true}
            />
         </div>
      </MoodboardStudioLayout>
    </>
  );
};

export default function MoodboardStudio() {
  return (
    <MoodboardProvider>
      <StudioContent />
    </MoodboardProvider>
  );
}
