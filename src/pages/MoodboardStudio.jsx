import { MoodboardProvider, useMoodboard } from '@/contexts/MoodboardContext';
import MoodboardStudioLayout from '@/components/moodboard/MoodboardStudioLayout';
import {
  ColorPicker,
  StyleGrid,
  MoodboardCanvas,
  ImageUploader
} from '@/components/moodboard';
import MoodboardStepSearch from '@/components/moodboard/MoodboardStepSearch';
import SEO from '@/components/SEO';
import { useState, useEffect } from 'react';
import { ArrowRight, Layers, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

const StudioContent = () => {
  const [activeTab, setActiveTab] = useState('styles');
  const [projectName, setProjectName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    colors,
    styles,
    customImages,
    selectedMaterials,
    updateColors,
    updateStyles,
    updateMaterials,
    removeCustomImage,
    addCustomImages,
    clearMoodboard,
    autoComposeMoodboard,
    isAutoComposing
  } = useMoodboard();

  const primaryStyleTitle = styles[0]?.title || styles[0]?.name || '';

  const [lizInsight, setLizInsight] = useState("Seja bem-vindo ao Studio, William. Comece selecionando seus estilos favoritos para compormos sua visão.");

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

  const handleAutoCompose = async () => {
    if (styles.length === 0) {
      alert('Selecione ao menos um estilo para que eu possa compor o projeto.');
      return;
    }
    const styleEntry = styles[0];
    await autoComposeMoodboard(styleEntry);
    setLizInsight(`William, analisei o catálogo e montei uma composição inicial baseada em ${styleEntry.name}. Injetei referências técnicas de acabamentos e decoração no seu Canvas.`);
  };

  useEffect(() => {
    if (isAutoComposing) return; // Não sobrepõe a mensagem de composição

    // 1. Lógica de Mensagens Dinâmicas da Liz (Modo Consultor Técnico)
    if (activeTab === 'styles') {
      if (styles.length === 0) {
        setLizInsight("William, comece selecionando a base da sua visão. Qual destes estilos mais ressoa com o projeto?");
      } else {
        const names = styles.map(s => s.name || s.title).join(' & ');
        setLizInsight(`Ótima escolha. O mix entre ${names} cria uma base sofisticada. Você pode compor manualmente ou gerar uma base técnica inicial.`);
      }
    } else if (activeTab === 'colors') {
      if (colors.length > 0) {
        setLizInsight(`Sincronizei ${colors.length} tons baseados no seu mix de estilos. Esta paleta garante o equilíbrio entre aconchego e técnica que buscamos.`);
      }
    } else if (activeTab === 'finishes') {
      const styleName = styles[0]?.name || styles[0]?.title || 'escolhido';
      setLizInsight(`Para o estilo ${styleName}, priorizei no motor de busca revestimentos de grande formato e metais com acabamento brushed.`);
    } else if (activeTab === 'decor') {
      setLizInsight("William, a curadoria de decoração agora foca em texturas naturais e iluminação de cena para dar vida à composição.");
    } else if (activeTab === 'assets') {
      setLizInsight("Espaço para referências externas. Você pode vincular fotos de fornecedores ou do local da obra para fechar o dossiê.");
    }
  }, [styles.length, activeTab, isAutoComposing]);

  const canvasTarget = typeof document !== 'undefined' ? document.getElementById('main-canvas-container') : null;

  return (
    <>
      <SEO title="Studio | Moodboard Imersivo" noindex />
      <MoodboardStudioLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onSave={handleSave}
        isSaving={isSaving}
        lizInsight={lizInsight}
      >
         <div className="space-y-8">
            {activeTab === 'styles' && (
              <div className="space-y-6">
                <StyleGrid
                  selectedStyles={styles}
                  onStylesChange={updateStyles}
                />

                {styles.length > 0 && (
                  <button
                    onClick={handleAutoCompose}
                    disabled={isAutoComposing}
                    className="w-full py-4 bg-wg-orange/10 hover:bg-wg-orange/20 border border-wg-orange/30 rounded-2xl text-wg-orange text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(242,92,38,0.1)]"
                  >
                    {isAutoComposing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Compondo Dossiê...
                      </>
                    ) : (
                      <>
                        <Layers size={14} className="group-hover:rotate-12 transition-transform" />
                        Compor Dossiê Técnico
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {activeTab === 'colors' && (
              <ColorPicker
                selectedColors={colors}
                onColorsChange={updateColors}
              />
            )}

            {activeTab === 'finishes' && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Escolha os Acabamentos</h3>
                <MoodboardStepSearch
                  mode="finishes"
                  style={primaryStyleTitle}
                  onAssetAdd={addCustomImages}
                />
              </div>
            )}

            {activeTab === 'decor' && (
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Elementos de Decoração</h3>
                <MoodboardStepSearch
                  mode="decor"
                  style={primaryStyleTitle}
                  onAssetAdd={addCustomImages}
                />
              </div>
            )}

            {activeTab === 'assets' && (
              <ImageUploader
                onImagesAdd={addCustomImages}
                currentCount={customImages.length}
                maxImages={12}
              />
            )}

            <div className="pt-6 border-t border-white/5 space-y-3">
              {activeTab === 'styles' && styles.length > 0 && (
                <button
                  onClick={() => setActiveTab('colors')}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
                >
                  Próximo: Definir Paleta <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              {activeTab === 'colors' && colors.length > 0 && (
                <button
                  onClick={() => setActiveTab('finishes')}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
                >
                  Próximo: Acabamentos <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              {activeTab === 'finishes' && (
                <button
                  onClick={() => setActiveTab('decor')}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
                >
                  Próximo: Decoração <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              {activeTab === 'decor' && (
                <button
                  onClick={() => setActiveTab('assets')}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
                >
                  Próximo: Biblioteca <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <button
                onClick={() => {
                   if(confirm('Deseja limpar todo o seu trabalho atual no Studio?')) {
                     clearMoodboard();
                     setActiveTab('styles');
                   }
                }}
                className="w-full py-3 text-slate-600 hover:text-red-400 text-[8px] font-bold uppercase tracking-[0.2em] transition-all"
              >
                Limpar Workspace
              </button>
            </div>
         </div>
      </MoodboardStudioLayout>

      {mounted && canvasTarget && createPortal(
        <MoodboardCanvas
          colors={colors}
          styles={styles}
          customImages={customImages}
          onRemoveImage={removeCustomImage}
          selectedMaterials={selectedMaterials}
          studioMode={true}
        />,
        canvasTarget
      )}
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
