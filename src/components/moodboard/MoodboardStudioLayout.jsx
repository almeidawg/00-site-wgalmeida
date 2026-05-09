import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from '@/lib/motion-lite';
import { 
  Search, 
  Layers, 
  Palette, 
  Image as ImageIcon, 
  Download, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Trash2,
  Plus,
  Loader2,
  Save,
  Check,
  Undo,
  Redo,
  LayoutGrid,
  Zap,
  MoreVertical,
  Settings,
  Database,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandStar from '@/components/BrandStar';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

const MoodboardStudioLayout = ({ children, activeTab, onTabChange, projectName, onProjectNameChange, onSave, isSaving }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  const tabs = [
    { id: 'styles', label: t('moodboardPage.studio.tabs.styles'), icon: LayoutGrid },
    { id: 'colors', label: t('moodboardPage.studio.tabs.colors'), icon: Palette },
    { id: 'assets', label: t('moodboardPage.studio.tabs.assets'), icon: Database },
  ];

  return (
    <div className="flex h-screen bg-[#08080a] text-slate-200 overflow-hidden font-inter">
      {/* Sidebar de Ferramentas */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? '420px' : '0px', opacity: sidebarOpen ? 1 : 0 }}
        className="relative h-full bg-[#0c0c0e] border-r border-white/5 flex flex-col z-40 overflow-hidden"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 group">
            <div className="w-9 h-9 rounded-lg bg-wg-orange/10 flex items-center justify-center border border-wg-orange/20 group-hover:border-wg-orange/50 transition-colors">
              <BrandStar className="w-5 h-5 text-wg-orange" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[10px] tracking-[0.2em] uppercase text-white">Moodboard <span className="text-wg-orange">Studio</span></span>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">{t('moodboardPage.studio.subtitle')}</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-slate-600 hover:text-white transition-colors p-2">
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Tabs de Navegação da Sidebar */}
        <div className="flex border-b border-white/5 p-2 bg-black/20 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl transition-all relative group",
                activeTab === tab.id ? "text-wg-orange" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <tab.icon size={18} className={cn("transition-transform group-hover:scale-110", activeTab === tab.id ? "fill-current/10" : "")} />
              <span className="text-[9px] font-bold uppercase tracking-[0.1em]">{tab.label}</span>
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

        {/* Footer Sidebar - Status */}
        <div className="p-4 border-t border-white/5 bg-black/20 flex items-center justify-between text-[8px] font-bold uppercase tracking-widest text-slate-600 shrink-0">
          <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-wg-orange/30" /> Secure</span>
          <span>WG Almeida &copy; 2026</span>
        </div>
      </motion.aside>

      {/* Main Studio Area */}
      <main className="flex-1 relative flex flex-col bg-[#050506]">
        {/* Top bar de Ações */}
        <header className="h-24 px-10 flex items-center justify-between bg-black/40 backdrop-blur-xl border-b border-white/5 z-30">
          <div className="flex items-center gap-8">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="w-12 h-12 flex items-center justify-center bg-slate-900 border border-white/5 rounded-2xl text-wg-orange hover:text-white shadow-2xl transition-all">
                <ChevronRight size={24} />
              </button>
            )}
            
            <div className="flex flex-col">
              <input 
                type="text" 
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
                placeholder={t('moodboardPage.studio.projectNamePlaceholder')}
                className="bg-transparent border-none text-white text-2xl font-medium outline-none font-playfair italic focus:ring-0 p-0 placeholder:text-slate-800 w-64 md:w-96"
              />
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mt-1">{t('moodboardPage.studio.editingNow')} &bull; {t('moodboardPage.studio.editMode')}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 mr-4">
               <span className="w-2 h-2 rounded-full bg-wg-green animate-pulse" />
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('moodboardPage.studio.statusActive')}</span>
            </div>

            <button 
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-3 px-8 py-4 bg-wg-orange hover:bg-wg-orange/90 text-white rounded-[24px] text-xs font-bold transition-all shadow-[0_20px_50px_rgba(242,92,38,0.2)] hover:scale-[1.02] hover:-translate-y-0.5 uppercase tracking-widest disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? t('moodboardPage.studio.saving') : t('moodboardPage.studio.saveButton')}
            </button>
            
            <div className="h-10 w-[1px] bg-white/10 mx-2" />
            
            <Link to="/" className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5">
              <X size={24} />
            </Link>
          </div>
        </header>

        {/* Canvas de Edição - Área Central */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-12 lg:p-20">
           {/* Grid Background Decorativo */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
           
           {/* Canvas Placeholder/Container (o Studio real renderiza aqui) */}
           <div className="w-full h-full flex items-center justify-center">
             <div id="studio-canvas-root" className="w-full h-full max-w-[1400px] max-h-[800px] relative z-10 shadow-[0_100px_150px_rgba(0,0,0,0.5)] rounded-[40px]">
                {/* O conteúdo do canvas (MoodboardCanvas) é injetado como children via Studio.jsx */}
             </div>
           </div>

           {/* Toolbar Flutuante Inferior */}
           <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl z-40">
              <button className="p-4 hover:bg-white/10 rounded-2xl transition-colors text-slate-400 hover:text-white" title={t('moodboardPage.studio.tooltips.undo')}><Undo size={20}/></button>
              <button className="p-4 hover:bg-white/10 rounded-2xl transition-colors text-slate-400 hover:text-white" title={t('moodboardPage.studio.tooltips.redo')}><Redo size={20}/></button>
              <div className="w-[1px] h-8 bg-white/10 mx-2" />
              <button className="p-4 hover:bg-white/10 rounded-2xl transition-colors text-slate-400 hover:text-white" title={t('moodboardPage.studio.tooltips.clear')}><Trash2 size={20}/></button>
              <div className="w-[1px] h-8 bg-white/10 mx-2" />
              <button className="p-4 bg-wg-orange/10 text-wg-orange rounded-2xl border border-wg-orange/20" title={t('moodboardPage.studio.tooltips.fullscreen')}><Maximize2 size={20}/></button>
           </div>
        </div>
      </main>
    </div>
  );
};

export default MoodboardStudioLayout;
