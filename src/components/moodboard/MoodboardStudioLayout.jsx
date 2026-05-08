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
  Plus
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import BrandStar from '@/components/BrandStar';
import { cn } from '@/lib/utils';
import { searchUnsplashImages } from '@/services/mediaService';
import { useMoodboard } from '@/contexts/MoodboardContext';

export default function MoodboardStudioLayout({ children, lizInsight }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('assets'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { addCustomImages } = useMoodboard();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    const results = await searchUnsplashImages(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const tabs = [
    { id: 'assets', label: 'Ativos', icon: ImageIcon },
    { id: 'colors', label: 'Cores', icon: Palette },
    { id: 'layers', label: 'Composição', icon: Layers },
    { id: 'ai', label: 'Liz Insights', icon: Wand2, badge: true },
  ];

  return (
    <div className="fixed inset-0 bg-[#0a0a0b] text-slate-200 flex overflow-hidden z-[100]">
      {/* Sidebar de Ferramentas */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? '320px' : '0px', opacity: sidebarOpen ? 1 : 0 }}
        className="bg-slate-900/50 border-r border-slate-800 flex flex-col relative"
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BrandStar className="w-6 h-6 text-orange-500" />
            <span className="font-bold text-sm tracking-tight uppercase">Moodboard<span className="text-orange-500">Studio</span></span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-4 flex flex-col items-center gap-1 border-b-2 transition-all relative",
                activeTab === tab.id ? "border-orange-500 text-orange-500 bg-orange-500/5" : "border-transparent text-slate-500 hover:text-slate-300"
              )}
            >
              <tab.icon size={18} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
              {tab.badge && <span className="absolute top-2 right-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'assets' && (
             <div className="space-y-6">
                <form onSubmit={handleSearch} className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                   <input 
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Buscar móveis, texturas..."
                     className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                   />
                </form>

                <div>
                   <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Galeria de Referências</h3>
                   
                   {isSearching ? (
                     <div className="flex flex-col items-center justify-center py-10 text-slate-600">
                        <Loader2 size={24} className="animate-spin mb-2" />
                        <span className="text-[10px] uppercase font-bold">Buscando na nuvem...</span>
                     </div>
                   ) : (
                     <div className="grid grid-cols-2 gap-3">
                        {searchResults.map(img => (
                          <div 
                            key={img.id} 
                            onClick={() => addCustomImages([{ id: img.id, url: img.url, title: img.title }])}
                            className="aspect-square bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-orange-500 cursor-pointer group relative"
                          >
                             <img src={img.thumb} alt={img.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                             <div className="absolute inset-0 bg-orange-500/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                <Plus size={20} className="text-white" />
                             </div>
                          </div>
                        ))}

                        {searchResults.length === 0 && !isSearching && (
                          <div className="col-span-2 py-10 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                             <ImageIcon size={24} className="mx-auto text-slate-700 mb-2" />
                             <p className="text-[10px] text-slate-600 uppercase font-bold">Busque ativos para começar</p>
                          </div>
                        )}
                     </div>
                   )}
                </div>
             </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
               <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-2xl relative overflow-hidden">
                  <Sparkles className="text-blue-500 mb-3" size={20} />
                  <h4 className="text-sm font-bold text-white mb-2">Sugestão da Liz</h4>
                  <p className="text-xs text-blue-200/70 leading-relaxed italic">
                    "{lizInsight || 'William, notei que você escolheu tons escuros. Que tal equilibrar com uma textura de mármore Calacatta no piso?'}"
                  </p>
                  <div className="absolute top-[-10px] right-[-10px] w-20 h-20 bg-blue-500/5 rounded-full blur-xl" />
               </div>
               
               <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 border border-slate-700">
                  <Wand2 size={14} className="text-orange-500" /> Otimizar Composicão
               </button>
            </div>
          )}
        </div>

        {/* Status Inferior */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30 text-[10px] text-slate-500 flex justify-between uppercase tracking-widest font-bold">
           <span>Integridade: 100%</span>
           <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={10} /> Online</span>
        </div>
      </motion.aside>

      {/* Main Canvas Area */}
      <main className="flex-1 relative flex flex-col">
        {!sidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(true)}
            className="absolute left-4 top-6 z-50 p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Toolbar Superior */}
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-8 bg-[#0a0a0b]/80 backdrop-blur-md">
           <div className="flex items-center gap-4">
              <h2 className="text-lg font-medium text-white italic font-playfair">Meu Novo Refúgio</h2>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">ID-2026-X12</span>
           </div>

           <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-all">
                 <Share2 size={14} /> Compartilhar
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-900/20">
                 <Download size={14} /> Finalizar e Receber Guia
              </button>
           </div>
        </header>

        {/* Canvas Workspace */}
        <div className="flex-1 bg-[radial-gradient(#1e1e20_1px,transparent_1px)] [background-size:24px_24px] relative overflow-hidden flex items-center justify-center">
           <div className="w-[800px] h-[500px] bg-slate-900/30 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
              {children}
              
              {/* Botão flutuante de Chat com Liz */}
              <button className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl flex items-center justify-center group transition-all">
                 <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
                 <span className="absolute right-full mr-4 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Falar com a Liz</span>
              </button>
           </div>
        </div>

        <MoodboardLeadModal 
          isOpen={isLeadModalOpen} 
          onClose={() => setIsLeadModalOpen(false)} 
        />
      </main>

      {/* Estilos Auxiliares */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
}
