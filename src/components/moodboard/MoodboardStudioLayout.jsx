import React, { useEffect, useState } from 'react';
import { motion } from '@/lib/motion-lite';
import {
  Layers,
  Palette,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Trash2,
  Loader2,
  Save,
  Undo,
  Redo,
  LayoutGrid,
  Database,
  X,
  Hammer
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandStar from '@/components/BrandStar';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import MoodboardSelectionSummary from './MoodboardSelectionSummary';

const MoodboardStudioLayout = ({ children, activeTab, onTabChange, projectName, onProjectNameChange, onSave, isSaving, saveMessage, onClear, lizInsight }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  };

  const tabs = [
    { id: 'styles', label: t('moodboardPage.studio.tabs.styles'), icon: LayoutGrid },
    { id: 'colors', label: t('moodboardPage.studio.tabs.colors'), icon: Palette },
    { id: 'finishes', label: 'Acabamentos', icon: Hammer },
    { id: 'decor', label: 'Decoração', icon: Layers },
    { id: 'assets', label: t('moodboardPage.studio.tabs.assets'), icon: Database },
  ];

  return (
    <div className="relative flex h-screen bg-[#08080a] text-slate-200 overflow-hidden font-inter">
      {/* Sidebar de Ferramentas */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 'min(475px, 100vw)' : '0px', opacity: sidebarOpen ? 1 : 0 }}
        className="absolute lg:relative h-full bg-[#0c0c0e] border-r border-white/5 flex flex-col z-40 overflow-hidden max-w-full min-w-0 lg:min-w-[475px]"
      >
        <div className="p-6 border-b border-white/5 flex flex-col gap-6 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <BrandStar className="w-5 h-5 text-wg-orange" alt="WG Almeida rating icon" />
              <div className="flex flex-col">
                <span className="font-bold text-[10px] tracking-[0.2em] uppercase text-white leading-none">Moodboard <span className="text-wg-orange">Studio</span></span>
                <span className="text-[7px] text-slate-500 font-bold uppercase tracking-tighter mt-1">{t('moodboardPage.studio.subtitle')}</span>
              </div>
            </div>
            <button type="button" aria-label="Recolher painel de ferramentas" title="Recolher painel" onClick={() => setSidebarOpen(false)} className="text-slate-600 hover:text-white transition-colors p-1.5 -mt-1">
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* Liz Insight Component - Intelligent Communication */}
          {lizInsight && (
            <div className="flex gap-3 items-start animate-fadeIn">
               <div className="shrink-0 w-8 h-8 rounded-full bg-wg-orange flex items-center justify-center text-[9px] font-bold text-white shadow-[0_0_15px_rgba(242,92,38,0.4)] border border-white/10">Liz</div>
               <div className="flex flex-col gap-1">
                 <p className="text-[10px] leading-relaxed text-slate-300 font-medium">
                    {lizInsight}
                 </p>
                 <div className="w-3 h-[1px] bg-wg-orange/30 mt-1" />
               </div>
            </div>
          )}
        </div>

        {/* Tabs de Navegação da Sidebar */}
        <div className="flex flex-wrap gap-1 border-b border-white/5 p-2 bg-black/20 shrink-0">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "min-w-[84px] flex-[1_1_84px] flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all relative group",
                activeTab === tab.id ? "text-wg-orange" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <tab.icon size={18} className={cn("transition-transform group-hover:scale-110", activeTab === tab.id ? "fill-current/10" : "")} />
              <span className="max-w-full truncate text-[8px] font-bold uppercase tracking-[0.08em] sm:text-[9px] sm:tracking-[0.1em]">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="activeTabGlow" className="absolute bottom-0 left-3 right-3 h-0.5 bg-wg-orange shadow-[0_0_10px_rgba(242,92,38,0.8)]" />
              )}
            </button>
          ))}
        </div>

        {/* Conteúdo Dinâmico da Sidebar */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-black/5">
          {children}
        </div>

        {/* Painel de Representação Passo a Passo */}
        <div className="shrink-0 p-4 border-t border-white/5 bg-black/30">
          <MoodboardSelectionSummary />
        </div>

        {/* Footer Sidebar - Status */}
        <div className="p-3 border-t border-white/5 bg-black/20 flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-600 shrink-0">
          <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-wg-orange/30" /> Secure</span>
          <span>WG Almeida &copy; 2026</span>
        </div>
      </motion.aside>

      {/* Main Studio Area */}
      <main className="flex-1 relative flex flex-col bg-[#050506]">
        {/* Top bar de Ações - Compacta */}
        <header className="h-20 px-3 sm:px-5 lg:px-10 flex items-center justify-between gap-2 bg-black/40 backdrop-blur-xl border-b border-white/5 z-30 shrink-0">
          <div className="flex min-w-0 items-center gap-2 lg:gap-8">
            {!sidebarOpen && (
              <button type="button" aria-label="Abrir painel de ferramentas" title="Abrir painel" onClick={() => setSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center bg-slate-900 border border-white/5 rounded-2xl text-wg-orange hover:text-white shadow-2xl transition-all">
                <ChevronRight size={20} />
              </button>
            )}
            
            <div className="flex min-w-0 flex-col">
              <input 
                type="text" 
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
                placeholder={t('moodboardPage.studio.projectNamePlaceholder')}
                aria-label="Nome do projeto"
                maxLength={120}
                className="w-28 bg-transparent border-none p-0 font-playfair text-base font-medium italic text-white outline-none placeholder:text-slate-800 focus:ring-0 sm:w-44 md:w-64 lg:w-96 lg:text-xl"
              />
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em] mt-0.5">{t('moodboardPage.studio.editingNow')} &bull; {t('moodboardPage.studio.editMode')}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-4">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-wg-green/10 rounded-full border border-wg-green/20 mr-4">
               <span className="w-1.5 h-1.5 rounded-full bg-wg-green animate-pulse" />
               <span className="text-[9px] font-bold text-wg-green uppercase tracking-widest">{t('moodboardPage.studio.statusActive')}</span>
            </div>

            <button 
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-3 bg-wg-orange hover:bg-[#de5423] text-white rounded-full text-xs font-light transition-all shadow-[0_16px_34px_rgba(242,92,38,0.18)] hover:shadow-[0_20px_40px_rgba(242,92,38,0.24)] hover:-translate-y-0.5 uppercase tracking-widest disabled:opacity-50 disabled:pointer-events-none sm:px-4 lg:gap-3 lg:px-8"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span className="hidden sm:inline">
                {isSaving ? t('moodboardPage.studio.saving') : t('moodboardPage.studio.saveButton')}
              </span>
            </button>
            {saveMessage && <span className="sr-only" role="status" aria-live="polite">{saveMessage}</span>}
            
            <div className="mx-1 hidden h-8 w-[1px] bg-white/10 sm:block lg:mx-2" />
            
            <Link to="/" aria-label="Sair do Moodboard Studio" title="Sair do Studio" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white lg:h-12 lg:w-12 lg:rounded-2xl">
              <X size={20} />
            </Link>
          </div>
        </header>

        {/* Canvas de Edição - Área Central Otimizada */}
        <div className="flex-1 relative overflow-hidden flex flex-col items-center p-0 lg:p-2">
           {/* Grid Background Decorativo */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
           
           {/* O Studio real renderiza o canvas aqui - Agora alinhado ao topo */}
           <div id="studio-canvas-root" className="w-full h-full max-w-[1400px] relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] rounded-[16px]">
              <div id="main-canvas-container" className="w-full h-full"></div>
           </div>

           {/* Toolbar Flutuante Inferior */}
           <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl z-40">
              <button type="button" disabled aria-label="Desfazer indisponível" className="p-4 rounded-2xl text-slate-700 cursor-not-allowed" title="Histórico de desfazer em desenvolvimento"><Undo size={20}/></button>
              <button type="button" disabled aria-label="Refazer indisponível" className="p-4 rounded-2xl text-slate-700 cursor-not-allowed" title="Histórico de refazer em desenvolvimento"><Redo size={20}/></button>
              <div className="w-[1px] h-8 bg-white/10 mx-2" />
              <button type="button" onClick={onClear} aria-label="Limpar workspace" className="p-4 hover:bg-white/10 rounded-2xl transition-colors text-slate-400 hover:text-white" title={t('moodboardPage.studio.tooltips.clear')}><Trash2 size={20}/></button>
              <div className="w-[1px] h-8 bg-white/10 mx-2" />
              <button type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'} aria-pressed={isFullscreen} className="p-4 bg-wg-orange/10 text-wg-orange rounded-2xl border border-wg-orange/20" title={t('moodboardPage.studio.tooltips.fullscreen')}><Maximize2 size={20}/></button>
           </div>
        </div>
      </main>
    </div>
  );
};

export default MoodboardStudioLayout;
