import { motion, AnimatePresence } from '@/lib/motion-lite';
import { 
  Palette, 
  Image as ImageIcon, 
  Layers, 
  Wand2, 
  Download, 
  Share2, 
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Search,
  Loader2,
  Plus,
  LayoutGrid,
  Edit3,
  Copy,
  TrendingUp,
  Star
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import BrandStar from '@/components/BrandStar';
import { cn } from '@/lib/utils';
import { searchGoogleImages, searchPinterestImages, searchUnsplashImages } from '@/services/mediaService';
import { fetchRetailProducts } from '@/services/retailService';
import { getSmartSuggestions } from '@/services/curationService';
import { useMoodboard } from '@/contexts/MoodboardContext';
import ColorPicker from './ColorPicker';
import StyleGrid from './StyleGrid';
import MoodboardLeadModal from './MoodboardLeadModal';
import { useToast } from '@/components/ui/use-toast';

export default function MoodboardStudioLayout({ 
  children, 
  lizInsight,
  colors,
  styles,
  updateColors,
  updateStyles
}) {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('styles'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  
  const searchRef = useRef(null);
  const { addCustomImages, projectName, setProjectName, buildShareUrl } = useMoodboard();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Auto-hide welcome after name is set or timeout
    const timer = setTimeout(() => setShowWelcome(false), 4000);
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  // Dynamic suggestions
  const dynamicSuggestions = useMemo(() => {
    return getSmartSuggestions(styles, activeTab);
  }, [styles, activeTab]);

  const handleSearch = async (e, manualQuery) => {
    if (e) e.preventDefault();
    const finalQuery = manualQuery || searchQuery.trim();
    const activeStyleSlug = styles[0]?.slug || '';
    
    setShowSuggestions(false);
    setIsSearching(true);
    
    // Pure English Technical Search Mapping
    const styleSearchTerms = {
      'industrial': 'industrial loft raw concrete exposed brick black steel aesthetic',
      'minimalismo': 'architectural minimalism pure white seamless space limestone',
      'japandi': 'japandi interior light oak wood handcrafted minimal zen',
      'moderno': 'modern luxury residence floor to ceiling glass walnut wood',
      'classico': 'classic luxury interior boiserie crystal lighting estate',
      'tropical': 'luxury tropical villa organic materials exotic wood resort',
      'art-deco': 'luxury art deco geometric hotel boutique aesthetic',
      'scandinavian': 'scandinavian interior light bright nordic design',
      'wabi-sabi': 'wabi sabi aesthetic natural textures lime wash raw',
      'boho': 'boho chic interior curated organic textures aesthetic'
    };

    const technicalBase = styleSearchTerms[activeStyleSlug] || activeStyleSlug || 'luxury architectural interior';
    
    try {
      // 1. Retail results (Westwing/Leroy) - MAX PRIORITY
      const retailResults = await fetchRetailProducts({ 
        query: finalQuery, 
        style: activeStyleSlug,
        category: activeTab === 'acabamentos' ? 'acabamento' : 'decoracao'
      });

      // 2. Inspiration (Google/Pinterest)
      let visualResults = [];
      const contextTerm = activeTab === 'acabamentos' 
        ? 'flooring wall cladding tiles textures -facade -landscape' 
        : 'furniture decor interior styling details -facade -exterior -landscape -garden';
      
      const premiumQuery = `${finalQuery || technicalBase} ${contextTerm} high-end`;

      if (activeTab === 'decoracao') {
        visualResults = await searchPinterestImages(premiumQuery);
      } else {
        visualResults = await searchGoogleImages(premiumQuery);
      }

      if (!visualResults || visualResults.length === 0) {
        visualResults = await searchUnsplashImages(`${finalQuery || technicalBase} ${contextTerm}`);
      }
        
      setSearchResults([...retailResults, ...visualResults]);
    } catch (err) {
      console.error('Erro na busca:', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if ((activeTab === 'acabamentos' || activeTab === 'decoracao') && searchResults.length === 0) {
      handleSearch();
    }
  }, [activeTab, styles[0]?.slug]);

  const handleShare = async () => {
    const url = buildShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link de Compartilhamento Copiado!",
        description: "O Moodboard agora pode ser visualizado por qualquer pessoa com o link.",
        className: "bg-blue-600 text-white border-none shadow-2xl"
      });
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  const tabs = [
    { id: 'styles', label: 'Estilos', icon: LayoutGrid },
    { id: 'acabamentos', label: 'Acabamentos', icon: Layers },
    { id: 'decoracao', label: 'Decoração', icon: ImageIcon },
    { id: 'colors', label: 'Cores', icon: Palette },
    { id: 'ai', label: 'Liz Insights', icon: Wand2, badge: true },
  ];

  return (
    <div className="fixed inset-0 bg-[#050506] text-slate-200 flex flex-col md:flex-row overflow-hidden z-[100]">
      {/* Sidebar de Ferramentas - Glass Cockpit Refinado (380px) */}
      <motion.aside
        initial={false}
        animate={{ 
          width: sidebarOpen ? (isMobile ? '100%' : 380) : 0, 
          minWidth: sidebarOpen ? (isMobile ? '100%' : 380) : 0,
          maxWidth: sidebarOpen ? (isMobile ? '100%' : 380) : 0,
          opacity: sidebarOpen ? 1 : 0,
          x: sidebarOpen ? 0 : (isMobile ? 0 : -380),
          y: sidebarOpen ? 0 : (isMobile ? '100%' : 0)
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "bg-white/[0.01] border-r border-white/10 flex flex-col relative h-full overflow-hidden z-[150] backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]",
          isMobile && "fixed inset-0 !bg-slate-950/95"
        )}
      >
        <div className="flex flex-col h-full w-full md:w-[380px]">
          <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:border-orange-500/50 transition-colors">
                <BrandStar className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[10px] tracking-[0.2em] uppercase text-white">Moodboard <span className="text-orange-500">Studio</span></span>
                <span className="text-[8px] text-slate-600 font-mono">INTEL CORE V2</span>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              <X size={18} />
            </button>
          </div>

          <div className="flex border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar px-1 bg-black/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchResults([]); 
                }}
                className={cn(
                  "min-w-[80px] flex-1 py-4 flex flex-col items-center gap-2 transition-all relative group",
                  activeTab === tab.id ? "text-orange-500" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-500",
                  activeTab === tab.id ? "bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.1)]" : "bg-transparent"
                )}>
                  <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.1em]">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTabGlow" className="absolute bottom-0 left-3 right-3 h-0.5 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar overflow-x-hidden space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {activeTab === 'styles' && (
                  <div className="space-y-4">
                    <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] px-2">DNA Arquitetônico</h3>
                    <div className="bg-slate-950/20 rounded-[32px] border border-white/5 p-2 shadow-inner">
                      <StyleGrid selectedStyles={styles || []} onStylesChange={updateStyles} maxStyles={5} />
                    </div>
                  </div>
                )}

                {(activeTab === 'acabamentos' || activeTab === 'decoracao') && (
                  <div className="space-y-6">
                      <div className="relative group" ref={searchRef}>
                        <form onSubmit={(e) => handleSearch(e)} className="relative">
                          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-all" size={16} />
                          <input 
                            type="text"
                            value={searchQuery}
                            onFocus={() => setShowSuggestions(true)}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={activeTab === 'acabamentos' ? "Porcelanato, pedras..." : "Sofá, iluminação..."}
                            className="w-full bg-slate-950/40 border border-white/5 rounded-[20px] py-4 pl-12 pr-6 text-xs text-white focus:border-orange-500/30 outline-none transition-all placeholder:text-slate-700"
                          />

                          <AnimatePresence>
                            {showSuggestions && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="absolute top-full left-0 right-0 mt-3 bg-[#111114] border border-white/10 rounded-[24px] shadow-2xl z-[160] overflow-hidden backdrop-blur-3xl"
                              >
                                <div className="p-2">
                                  {dynamicSuggestions.map((item, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => {
                                        setSearchQuery(item);
                                        handleSearch(null, item);
                                      }}
                                      className="w-full text-left px-4 py-3 text-xs text-slate-400 hover:bg-orange-600 hover:text-white transition-all rounded-xl flex items-center gap-4 group"
                                    >
                                      <Star size={12} className="text-slate-700 group-hover:text-white" />
                                      {item}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </form>
                      </div>

                      <div className="space-y-4">
                        {isSearching ? (
                          <div className="flex flex-col items-center justify-center py-24 bg-slate-950/10 rounded-[40px] border border-dashed border-white/5">
                              <Loader2 size={32} className="animate-spin text-orange-500/20" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                              {searchResults.map(img => (
                                <motion.div 
                                  key={img.id} 
                                  whileHover={{ y: -5 }}
                                  onClick={() => {
                                    addCustomImages([{ id: img.id, url: img.thumb || img.url, title: img.title }]);
                                    toast({ title: "Ativo sincronizado" });
                                  }}
                                  className="bg-[#16161a]/40 rounded-[20px] overflow-hidden border border-white/5 hover:border-orange-500/30 cursor-pointer group relative shadow-2xl"
                                >
                                  <div className="aspect-square relative overflow-hidden bg-black/20">
                                    <img src={img.thumb || img.url} alt={img.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" />
                                    {img.source && (
                                      <div className={cn(
                                        "absolute top-2 left-2 px-2 py-0.5 backdrop-blur-md rounded text-[6px] font-bold text-white uppercase border border-white/10",
                                        img.source === 'google' ? "bg-blue-600/60" : img.source === 'pinterest' ? "bg-[#BD081C]/60" : "bg-black/60"
                                      )}>
                                        {img.source}
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-2 truncate text-[8px] text-white/50 font-medium uppercase tracking-tighter">{img.title}</div>
                                </motion.div>
                              ))}
                          </div>
                        )}
                      </div>
                  </div>
                )}

                {activeTab === 'colors' && (
                  <div className="space-y-4">
                    <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] px-2">Cromatismo Técnico</h3>
                    <div className="bg-slate-950/20 rounded-[32px] border border-white/5 p-4 shadow-inner text-center">
                      <ColorPicker selectedColors={colors || []} onColorsChange={updateColors} maxColors={10} />
                    </div>
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div className="space-y-6">
                    <div className="bg-blue-600/5 border border-blue-500/10 p-8 rounded-[40px] relative overflow-hidden group hover:border-blue-500/20 transition-all duration-700">
                        <BrandStar className="text-blue-500 mb-4 w-6 h-6" />
                        <h4 className="text-base font-medium text-white mb-2 font-playfair italic">Sugestão da Liz</h4>
                        <p className="text-[13px] text-blue-200/50 leading-relaxed font-light">"{lizInsight}"</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="p-6 border-t border-white/5 bg-black/10 text-[8px] text-slate-700 flex justify-between uppercase tracking-[0.3em] font-bold shrink-0">
            <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-orange-500/30" /> Secure</span>
            <span className="text-green-500/40 flex items-center gap-1.5"><CheckCircle2 size={10} /> Live Studio</span>
          </div>
        </div>
      </motion.aside>

      {/* Main Area */}
      <main className="flex-1 relative flex flex-col h-full bg-[#050506]">
        <AnimatePresence>
          {showWelcome && (
            <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] bg-[#050506] flex items-center justify-center">
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-center space-y-4">
                  <BrandStar className="w-12 h-12 text-orange-500 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-600">Workspace Preparado</h2>
                    <h3 className="text-3xl md:text-4xl font-playfair italic text-white">Sejam bem-vindos!</h3>
                  </div>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} className="absolute left-6 top-8 z-[100] w-12 h-12 flex items-center justify-center bg-slate-900 border border-white/5 rounded-2xl text-orange-500 hover:text-white shadow-2xl transition-all">
            <ChevronRight size={24} />
          </button>
        )}

        <header className="h-24 border-b border-white/5 flex items-center justify-between px-8 md:px-16 bg-black/20 backdrop-blur-3xl shrink-0">
           <div className="flex items-center gap-6 group">
              {isEditingName ? (
                <input 
                  autoFocus
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                  className="bg-slate-950 border border-orange-500/50 text-white px-5 py-3 rounded-2xl text-2xl font-medium outline-none font-playfair italic"
                />
              ) : (
                <div onClick={() => setIsEditingName(true)} className="flex flex-col cursor-pointer group">
                  <h2 className="text-2xl md:text-3xl font-medium text-white italic font-playfair hover:text-orange-400 transition-all duration-500 leading-none">{projectName}</h2>
                  <div className="flex items-center gap-3 mt-2 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                     <Edit3 size={10} className="text-slate-400" />
                     <span className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.3em]">Curadoria Executiva</span>
                  </div>
                </div>
              )}
           </div>

           <div className="flex items-center gap-4">
              <button onClick={handleShare} className="hidden lg:flex items-center gap-3 px-7 py-3 text-[11px] font-bold text-slate-400 hover:text-white transition-all bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 uppercase tracking-widest">
                 <Share2 size={16} /> Compartilhar
              </button>
              <button onClick={() => setIsLeadModalOpen(true)} className="flex items-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-[24px] text-xs font-bold transition-all shadow-[0_20px_50px_rgba(242,92,38,0.2)] hover:scale-[1.02] hover:-translate-y-0.5 uppercase tracking-widest">
                 <Download size={18} /> <span>Receber Dossiê</span>
              </button>
           </div>
        </header>

        <div className="flex-1 bg-[radial-gradient(#1a1a1c_2px,transparent_1px)] [background-size:48px_48px] relative overflow-hidden flex items-stretch">
           <div className="flex-1 m-4 md:m-8 bg-[#0c0c0e]/40 border border-white/5 rounded-[64px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col group backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
              {children}
              <button className="absolute bottom-12 right-12 w-20 h-20 bg-blue-600 hover:bg-blue-500 text-white rounded-[32px] shadow-2xl flex items-center justify-center group transition-all z-20 hover:scale-105 duration-500">
                 <MessageSquare size={32} className="group-hover:scale-110 transition-transform duration-500" />
              </button>
           </div>
        </div>

        <MoodboardLeadModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} />
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
