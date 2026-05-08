import { motion } from '@/lib/motion-lite';
import { MoodboardProvider, useMoodboard } from '@/contexts/MoodboardContext';
import MoodboardStudioLayout from '@/components/moodboard/MoodboardStudioLayout';
import { 
  ColorPicker, 
  StyleGrid, 
  MoodboardCanvas 
} from '@/components/moodboard';
import SEO from '@/components/SEO';
import { useState } from 'react';

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

  const [lizInsight, setLizInsight] = useState("William, notei sua preferência por tons terrosos. Que tal adicionar uma textura de linho cru para trazer mais sofisticação?");

  return (
    <>
      <SEO title="Studio | Moodboard Imersivo" noindex />
      <MoodboardStudioLayout lizInsight={lizInsight}>
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
