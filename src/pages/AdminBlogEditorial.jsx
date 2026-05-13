import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import EditorialCmsWorkbench from '@/components/Admin/EditorialCmsWorkbench';
import editorialQueue from '@/data/blogEditorialQueue.generated.json';
import { getBlogImageAsset, getBlogManifestEntry, publishEditorialOverridesToBlog } from '@/data/blogImageManifest';
import styleCatalog from '@/utils/styleCatalog';
import { getStyleImageUrl } from '@/data/styleImageManifest';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  Search,
  Upload,
  Sparkles,
  Layers,
  ArrowRight,
  X,
  Plus,
  Image as ImageIcon,
  Cloud,
  Zap,
  ExternalLink,
  Trash2,
  AlertTriangle,
  RefreshCcw,
  Library,
  PenTool,
  ArrowUpRight,
  Database,
  FileText
} from 'lucide-react';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from '@/lib/motion-lite';
import { searchGoogleImages, searchPinterestImages, searchUnsplashImages } from '@/services/mediaService';
import { fetchRetailProducts } from '@/services/retailService';
import { uploadImage } from '@/services/cloudinaryAI';
import { createCloudinarySlotState } from '@/utils/editorialSlotState';
import {
  buildEditorialImageStrategy,
  getImageSourcePolicy,
  scoreEditorialCandidate,
} from '@/lib/editorialImageIntelligence';

const BLOG_UPLOAD_STORAGE_KEY = 'wg_blog_editorial_uploads_v1';
const BLOG_UNSPLASH_STORAGE_KEY = 'wg_blog_editorial_unsplash_v1';

const CATEGORY_LABELS = {
  arquitetura: 'Arquitetura',
  engenharia: 'Engenharia',
  marcenaria: 'Marcenaria',
  'guia-estilos': 'Estilos',
};

const getCategoryLabel = (value = '') => CATEGORY_LABELS[value] || value;

export default function AdminBlogEditorial() {
  const [activeTab, setActiveTab] = useState(() => 
    window.location.pathname.includes('/media') ? 'library' : 'curation'
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSlot, setActiveSlot] = useState(null); 
  const [isSyncing, setIsSyncing] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryResults, setLibraryResults] = useState([]);
  const [isLibrarySearching, setIsLibrarySearching] = useState(false);
  const [libraryMode, setLibraryMode] = useState('unsplash');

  const { toast } = useToast();

  const [localSelections, setLocalSelections] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BLOG_UNSPLASH_STORAGE_KEY) || '{}'); } catch { return {}; }
  });
  const [localUploads, setLocalUploads] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BLOG_UPLOAD_STORAGE_KEY) || '{}'); } catch { return {}; }
  });

  const editorialData = useMemo(() => {
    const queue = (editorialQueue || []).map(p => ({ ...p, kind: 'blog' }));
    const styles = (styleCatalog || []).map(s => ({ ...s, kind: 'style', category: 'guia-estilos' }));
    
    const combined = [...queue, ...styles].map(record => {
      const slug = record.slug || '';
      const manifest = getBlogManifestEntry(slug) || {};
      const heroAsset = record.kind === 'style' ? { src: getStyleImageUrl({ slug, variant: 'card' }) } : getBlogImageAsset({ slug, category: record.category, variant: 'hero' });
      const cardAsset = record.kind === 'style' ? null : getBlogImageAsset({ slug, category: record.category, variant: 'card' });
      const contextItems = (manifest.context || []).map((item, idx) => ({ id: `context${idx + 1}`, title: item.sectionTitle || `Seção ${idx + 1}`, asset: item }));
      const imageStrategy = buildEditorialImageStrategy(record);

      return {
        ...record,
        label: record.title || record.name || slug,
        categoryLabel: getCategoryLabel(record.category),
        heroImage: heroAsset,
        cardImage: cardAsset,
        imageStrategy,
        contextItems,
        status: {
          hasHero: Boolean(heroAsset && !heroAsset.isFallback),
          hasCard: Boolean(cardAsset && !cardAsset.isFallback),
          totalSections: contextItems.length,
          filledSections: contextItems.filter(c => c.asset?.src).length
        }
      };
    });

    return combined.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, localSelections, localUploads]);

  const handleLibrarySearch = async (e) => {
    if (e) e.preventDefault();
    if (!librarySearch) return;
    setIsLibrarySearching(true);
    try {
      let images = [];
      const premium = "luxury professional architecture photography";
      if (libraryMode === 'unsplash') images = await searchUnsplashImages(librarySearch);
      else if (libraryMode === 'reference') {
        const [google, pinterest] = await Promise.all([
          searchGoogleImages(`${librarySearch} ${premium}`),
          searchPinterestImages(`${librarySearch} ${premium}`),
        ]);
        images = [...google, ...pinterest].map((item) => ({ ...item, source: item.source === 'pinterest' ? 'pinterest' : 'google' }));
      } else if (libraryMode === 'retail') images = await fetchRetailProducts({ query: librarySearch });
      setLibraryResults(images);
    } catch (err) { console.error(err); } finally { setIsLibrarySearching(false); }
  };

  const handleSync = () => {
    setIsSyncing(true);
    publishEditorialOverridesToBlog(localUploads, localSelections);
    setTimeout(() => {
       setIsSyncing(false);
       toast({ title: 'Ativos Sincronizados', description: 'O site foi atualizado com sucesso.', className: 'bg-green-600 text-white' });
    }, 1200);
  };

  return (
    <>
      <SEO title="Admin Cockpit | WG Almeida" noindex />
      
      <div className="flex flex-col h-screen bg-[#050506] text-slate-200 overflow-hidden font-inter">
        <header className="px-10 py-6 border-b border-white/5 bg-black/40 flex items-center justify-between shrink-0 backdrop-blur-xl">
           <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-wg-orange rounded-2xl flex items-center justify-center shadow-lg hover:rotate-12 transition-all"><ImageIcon className="text-white w-7 h-7" /></div>
              <div>
                 <h1 className="text-2xl font-bold text-white tracking-tighter leading-tight">WG <span className="text-wg-orange">Cockpit</span></h1>
                 <p className="text-[9px] uppercase tracking-[0.3em] text-slate-600 font-bold">Unidade de Gestão Editorial</p>
              </div>
           </div>

           <div className="flex gap-2 p-1.5 bg-slate-950 rounded-2xl border border-white/5">
              <button onClick={() => setActiveTab('curation')} className={cn("px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", activeTab === 'curation' ? "bg-white/10 text-white shadow-xl" : "text-slate-600 hover:text-white")}><PenTool size={14} className="inline mr-2" /> Mesa de Curadoria</button>
              <button onClick={() => setActiveTab('library')} className={cn("px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", activeTab === 'library' ? "bg-white/10 text-white shadow-xl" : "text-slate-600 hover:text-white")}><Library size={14} className="inline mr-2" /> Biblioteca Global</button>
              <button onClick={() => setActiveTab('cms')} className={cn("px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", activeTab === 'cms' ? "bg-white/10 text-white shadow-xl" : "text-slate-600 hover:text-white")}><FileText size={14} className="inline mr-2" /> CMS Mestre</button>
           </div>

           <Button onClick={handleSync} className="bg-wg-orange hover:bg-wg-orange/90 text-white font-bold h-12 px-8 rounded-xl shadow-xl transition-all" disabled={isSyncing}>
              {isSyncing ? <Loader2 className="animate-spin mr-2" /> : <Cloud size={18} className="mr-2" />} Sincronizar
           </Button>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-[#050506]">
           {activeTab === 'curation' ? (
             <div className="max-w-[1800px] mx-auto space-y-8">
                <div className="relative group max-w-2xl">
                   <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" size={20} />
                   <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} type="text" placeholder="Localizar matéria..." className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-lg text-white outline-none focus:ring-2 focus:ring-wg-orange/20 transition-all font-light"/>
                </div>
                <div className="grid grid-cols-1 2xl:grid-cols-2 gap-10 pb-40">
                   {editorialData.map((record) => (
                     <PostCuratoryCard key={record.slug} post={record} onEditMedia={(slot, title) => setActiveSlot({ slug: record.slug, slotName: slot, title: title || record.label, post: record })} />
                   ))}
                </div>
             </div>
           ) : activeTab === 'library' ? (
             <div className="max-w-[1800px] mx-auto h-full flex flex-col space-y-8">
                <div className="flex flex-col md:flex-row gap-6 items-center bg-[#0c0c0e]/80 border border-white/5 p-8 rounded-[40px] backdrop-blur-3xl shadow-2xl">
                   <div className="flex gap-2 p-1.5 bg-slate-950 rounded-2xl border border-white/5 shrink-0">
                      {[
                        { id: 'unsplash', label: 'Unsplash API' },
                        { id: 'retail', label: 'Acervo WG' },
                        { id: 'reference', label: 'Referência' },
                      ].map(mode => (
                        <button key={mode.id} onClick={() => setLibraryMode(mode.id)} className={cn("px-6 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all", libraryMode === mode.id ? "bg-white/10 text-white shadow-xl" : "text-slate-600")}>{mode.label}</button>
                      ))}
                   </div>
                   <form onSubmit={handleLibrarySearch} className="relative flex-1 w-full group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={24} />
                      <input value={librarySearch} onChange={e => setLibrarySearch(e.target.value)} type="text" placeholder="Pesquisar ativos visuais no ecossistema..." className="w-full bg-slate-950 border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-xl text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-900"/>
                      <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl">Buscar Agora</button>
                   </form>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                   {isLibrarySearching ? (
                     <div className="h-64 flex flex-col items-center justify-center opacity-30"><Loader2 size={60} className="animate-spin text-blue-500 mb-4" /><p className="text-xs font-bold uppercase tracking-[0.4em]">Explorando Banco de Imagens...</p></div>
                   ) : (
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-40">
                        {libraryResults.map((img, idx) => (
                          <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="aspect-[3/4] bg-slate-900 rounded-[32px] overflow-hidden border border-white/5 hover:border-wg-orange/50 transition-all cursor-pointer group relative shadow-xl">
                             <img src={img.thumb || img.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                             <div className="absolute top-4 left-4 px-2 py-0.5 bg-black/60 rounded text-[7px] font-bold uppercase border border-white/10">{getImageSourcePolicy(img.source).label}</div>
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center p-6 text-center">
                                <p className="text-[10px] text-white font-bold leading-tight line-clamp-3">{img.title}</p>
                                <button className="absolute bottom-4 p-3 bg-white text-black rounded-xl hover:bg-wg-orange hover:text-white transition-all shadow-lg"><Plus size={16}/></button>
                             </div>
                          </motion.div>
                        ))}
                        {libraryResults.length === 0 && (
                          <div className="col-span-full py-40 text-center opacity-10 flex flex-col items-center"><Library size={120} /><p className="text-2xl font-bold uppercase tracking-widest mt-6">Biblioteca Vazia</p></div>
                        )}
                     </div>
                   )}
               </div>
             </div>
           ) : (
             <div className="max-w-[1800px] mx-auto">
               <EditorialCmsWorkbench />
             </div>
           )}
        </main>
      </div>

      <MediaSelectorModal 
        activeSlot={activeSlot}
        onClose={() => setActiveSlot(null)}
        onSelection={(imgData) => {
          const normalizedSelection = {
            ...imgData,
            src: imgData.src || imgData.url || imgData.urls?.regular || '',
            page: imgData.page || imgData.pageUrl || imgData.unsplashPage || '',
            photoPage: imgData.page || imgData.pageUrl || imgData.unsplashPage || '',
            alt: imgData.alt || imgData.title || '',
          };
          const updated = { ...localSelections, [activeSlot.slug]: { ...localSelections[activeSlot.slug], [activeSlot.slotName]: normalizedSelection } };
          setLocalSelections(updated);
          localStorage.setItem(BLOG_UNSPLASH_STORAGE_KEY, JSON.stringify(updated));
          setActiveSlot(null);
          toast({ title: 'Vínculo Preparado', description: 'Clique em Sincronizar para aplicar.', className: 'bg-wg-orange text-white border-none shadow-2xl' });
        }}
        onUploadSelection={(slotState) => {
          const updated = { ...localUploads, [activeSlot.slug]: { ...localUploads[activeSlot.slug], [activeSlot.slotName]: slotState } };
          setLocalUploads(updated);
          localStorage.setItem(BLOG_UPLOAD_STORAGE_KEY, JSON.stringify(updated));
          setActiveSlot(null);
          toast({ title: 'Upload Preparado', description: 'Acervo WG vinculado. Clique em Sincronizar para publicar.', className: 'bg-emerald-700 text-white border-none shadow-2xl' });
        }}
      />
    </>
  );
}

function PostCuratoryCard({ post, onEditMedia }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0c0c0e] border border-white/10 rounded-[48px] overflow-hidden flex flex-col shadow-2xl group hover:border-wg-orange/20 transition-all duration-1000">
      <div className="p-10 flex gap-10 border-b border-white/5 bg-black/30">
         <div className="w-64 h-48 rounded-[40px] overflow-hidden bg-slate-950 border border-white/10 relative shrink-0">
            {post.heroImage?.src ? (
              <img src={post.heroImage.src} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 opacity-80" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-800 bg-slate-950"><ImageIcon size={60}/></div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
               <button onClick={() => onEditMedia('hero', post.label)} className="p-5 bg-wg-orange rounded-3xl text-white shadow-2xl hover:scale-110 transition-all"><Upload size={24}/></button>
            </div>
         </div>
         <div className="flex-1 flex flex-col justify-center">
            <span className="px-3 py-1 bg-wg-orange/10 border border-wg-orange/20 rounded-lg text-[10px] font-bold uppercase tracking-[0.3em] text-wg-orange w-fit mb-4">{post.categoryLabel}</span>
            <h3 className="text-3xl font-bold text-white leading-tight font-playfair italic mb-4">{post.label}</h3>
            <p className="mb-3 text-xs font-light leading-relaxed text-slate-400">{post.imageStrategy?.directionSummary}</p>
            <p className="text-[10px] text-slate-700 font-mono tracking-tighter uppercase font-bold">/{post.slug}</p>
         </div>
      </div>

      <div className="p-10 space-y-8 bg-black/10 flex-1">
         <h4 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] flex items-center gap-4 border-b border-white/5 pb-4"><Layers size={18} className="text-wg-orange" /> Esqueleto da Postagem</h4>
         <div className="grid gap-4 md:grid-cols-2">
            {['hero', 'card'].map((slot) => (
              <div key={slot} className="rounded-[28px] border border-white/5 bg-slate-950/50 p-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-wg-orange">{slot} semântico</p>
                <p className="mt-2 text-sm text-white">{post.imageStrategy?.slots?.[slot]?.mainQuery}</p>
                <p className="mt-2 text-[11px] font-light leading-relaxed text-slate-500">{post.imageStrategy?.slots?.[slot]?.framing}</p>
              </div>
            ))}
         </div>
         <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto no-scrollbar pr-4 pb-10">
            {post.contextItems.map((item, idx) => (
               <div key={idx} className="flex items-center gap-8 p-6 bg-slate-900/20 border border-white/5 rounded-[32px] hover:bg-slate-900/40 transition-all group/item">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-black border border-white/10 shrink-0 relative">
                     {item.asset?.src ? <img src={item.asset.src} className="w-full h-full object-cover opacity-70 group-hover/item:opacity-100" /> : <div className="w-full h-full flex items-center justify-center text-slate-800"><ImagePlus size={32} /></div>}
                  </div>
                  <div className="flex-1">
                     <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] mb-2">Seção {idx + 1}</p>
                     <h5 className="text-xl font-bold text-white group-hover/item:text-wg-orange transition-colors">{item.title}</h5>
                  </div>
                  <button onClick={() => onEditMedia(item.id, item.title)} className="flex items-center gap-4 px-8 py-4 bg-white/5 hover:bg-wg-orange text-white rounded-[20px] text-[11px] font-bold uppercase tracking-[0.2em] transition-all border border-white/10">Vincular Foto <Zap size={14} className="fill-current"/></button>
               </div>
            ))}
         </div>
      </div>
    </motion.div>
  );
}

function MediaSelectorModal({ activeSlot, onClose, onSelection, onUploadSelection }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState('unsplash'); 
  const [apiError, setApiError] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadCredit, setUploadCredit] = useState('WG Almeida');
  const [isUploading, setIsUploading] = useState(false);
  const lastQueryRef = useRef(null);
  const { toast } = useToast();
  const slotPlan = activeSlot?.post?.imageStrategy?.slots?.[activeSlot?.slotName] || activeSlot?.post?.imageStrategy?.slots?.hero || null;

  useEffect(() => {
    if (activeSlot) {
      const semanticQuery = activeSlot?.post?.imageStrategy?.slots?.[activeSlot?.slotName]?.mainQuery;
      const cleanQuery = semanticQuery || (activeSlot.title || '').split(':').shift().split('(').shift().trim();
      setSearchQuery(cleanQuery);
      setUploadAlt(activeSlot?.post?.imageStrategy?.slots?.[activeSlot?.slotName]?.alt || activeSlot.title || '');
      setUploadCredit('WG Almeida');
      handleSearch(cleanQuery);
    }
  }, [activeSlot, searchMode]);

  const handleSearch = async (q) => {
    const query = q || searchQuery;
    if (!query) return;
    if (lastQueryRef.current === `${searchMode}:${query}` && results.length > 0) return;
    setIsSearching(true);
    setApiError(null);
    lastQueryRef.current = `${searchMode}:${query}`;
    try {
      let images = [];
      const premium = "luxury professional architecture photography";
      if (searchMode === 'unsplash') images = await searchUnsplashImages(query);
      else if (searchMode === 'retail') images = await fetchRetailProducts({ query });
      else if (searchMode === 'reference') {
        const [google, pinterest] = await Promise.all([
          searchGoogleImages(`${query} ${premium}`),
          searchPinterestImages(`${query} ${premium}`),
        ]);
        images = [...google, ...pinterest];
      }
      setResults(images.map((image) => scoreEditorialCandidate(image, slotPlan || { slot: activeSlot?.slotName }, activeSlot?.post || {})));
    } catch (err) { setApiError('Erro de conexão.'); } finally { setIsSearching(false); }
  };

  const handleUploadToArchive = async () => {
    if (!uploadFile || !activeSlot) return;
    setIsUploading(true);
    try {
      const result = await uploadImage(uploadFile, {
        folder: `editorial/blog/${activeSlot.slug}`,
      });
      const uploadedAt = new Date().toISOString();
      const slotState = createCloudinarySlotState(
        {
          alt: uploadAlt,
          caption: uploadCredit ? `Credito: ${uploadCredit}` : '',
        },
        {
          public_id: result.publicId,
          secure_url: result.url,
          original_filename: uploadFile.name,
        },
        uploadedAt
      );

      onUploadSelection({
        ...slotState,
        src: result.url,
        source: 'cloudinary',
        sourceLabel: 'Acervo WG',
        credit: uploadCredit,
        licenseType: 'Acervo WG / uso aprovado',
      });
    } catch (err) {
      setApiError(err?.message || 'Erro no upload da imagem.');
      toast({ title: 'Upload não concluído', description: err?.message || 'Verifique as credenciais do Cloudinary.', className: 'bg-red-700 text-white border-none' });
    } finally {
      setIsUploading(false);
    }
  };

  if (!activeSlot) return null;
  
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 md:p-14">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl" onClick={onClose} />
      <motion.div initial={{ scale: 0.98, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative w-full max-w-[90vw] h-[90vh] bg-[#0c0c0e] border border-white/10 rounded-[80px] shadow-2xl flex flex-col overflow-hidden">
         <div className="p-12 border-b border-white/5 flex justify-between items-center bg-black/40 shrink-0">
            <div>
               <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-4xl font-bold text-white tracking-tighter">Curadoria de Ativos</h3>
                  {apiError && <div className="flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-500 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse"><AlertTriangle size={12} /> {apiError}</div>}
               </div>
               <p className="text-slate-400 text-lg">Mapeando para: <span className="text-wg-orange font-bold uppercase tracking-widest font-mono">{activeSlot.title}</span></p>
               {slotPlan && (
                 <p className="mt-2 text-sm font-light text-slate-500">
                   Query semântica: <span className="text-slate-300">{slotPlan.mainQuery}</span>
                 </p>
               )}
            </div>
            <button onClick={onClose} className="w-20 h-20 bg-white/5 rounded-[32px] flex items-center justify-center text-slate-500 border border-white/5 hover:bg-white/10 transition-all shadow-xl"><X size={40}/></button>
         </div>
         <div className="p-10 border-b border-white/5 space-y-8 bg-black/20 shrink-0 text-center">
            <div className="flex gap-3 p-2 bg-slate-950 rounded-[24px] border border-white/5 w-fit mx-auto shadow-2xl">
               <button onClick={() => setSearchMode('unsplash')} className={cn("px-10 py-4 rounded-[18px] text-[11px] font-bold uppercase tracking-[0.2em] transition-all", searchMode === 'unsplash' ? "bg-emerald-600 text-white shadow-2xl" : "text-slate-600 hover:text-white")}>Unsplash API</button>
               <button onClick={() => setSearchMode('retail')} className={cn("px-10 py-4 rounded-[18px] text-[11px] font-bold uppercase tracking-[0.2em] transition-all", searchMode === 'retail' ? "bg-wg-orange text-white shadow-2xl" : "text-slate-600 hover:text-white")}>Acervo WG</button>
               <button onClick={() => setSearchMode('reference')} className={cn("px-10 py-4 rounded-[18px] text-[11px] font-bold uppercase tracking-[0.2em] transition-all", searchMode === 'reference' ? "bg-blue-600 text-white shadow-2xl" : "text-slate-600 hover:text-white")}>Referência</button>
            </div>
            <p className="mx-auto max-w-4xl text-xs font-light leading-relaxed text-slate-500">
              Pinterest e Google entram apenas como referência estética. Para publicar, use Unsplash API, acervo WG ou fonte aprovada com crédito, origem e revisão.
            </p>
            <div className="mx-auto grid max-w-5xl gap-3 rounded-[32px] border border-emerald-500/10 bg-emerald-950/10 p-4 text-left md:grid-cols-[1.15fr_1fr_0.7fr_auto]">
              <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-slate-950 px-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                <Upload size={18} className="text-emerald-400" />
                <span className="line-clamp-1">{uploadFile?.name || 'Selecionar arquivo do acervo'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} />
              </label>
              <input value={uploadAlt} onChange={(event) => setUploadAlt(event.target.value)} className="min-h-14 rounded-2xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none focus:border-emerald-500/40" placeholder="Alt contextual" />
              <input value={uploadCredit} onChange={(event) => setUploadCredit(event.target.value)} className="min-h-14 rounded-2xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none focus:border-emerald-500/40" placeholder="Crédito" />
              <button type="button" onClick={handleUploadToArchive} disabled={!uploadFile || isUploading} className="min-h-14 rounded-2xl bg-emerald-600 px-6 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40">
                {isUploading ? <Loader2 size={18} className="mx-auto animate-spin" /> : 'Subir'}
              </button>
            </div>
            <div className="relative group max-w-4xl mx-auto shadow-2xl">
               <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-wg-orange" size={32} />
               <form onSubmit={e => { e.preventDefault(); handleSearch(searchQuery); }}>
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-[32px] py-10 pl-24 pr-10 text-3xl text-white outline-none focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner font-light" placeholder="Refine a curadoria visual..."/>
                  <button type="submit" className="absolute right-6 top-1/2 -translate-y-1/2 px-14 py-5 bg-white text-black hover:bg-slate-200 rounded-[24px] font-bold text-lg shadow-2xl flex items-center gap-3 transition-all active:scale-95">{isSearching ? <Loader2 size={24} className="animate-spin" /> : <RefreshCcw size={24} />} Buscar</button>
               </form>
            </div>
         </div>
         <div className="flex-1 overflow-y-auto p-14 custom-scrollbar bg-[#050506]">
            {isSearching ? <div className="h-full flex flex-col items-center justify-center space-y-10 opacity-30"><Loader2 size={120} className="animate-spin text-blue-500" /><p className="text-sm uppercase font-bold tracking-[0.6em] text-slate-400 text-center leading-relaxed">Pipeline Sincronizando...</p></div> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10 pb-40">
               {results.map((img, idx) => {
                 const policy = getImageSourcePolicy(img.source);
                 return (
                   <motion.div
                     key={idx}
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: idx * 0.04 }}
                     onClick={() => {
                       if (!img.canPublish) {
                         toast({ title: 'Fonte apenas referencial', description: policy.governance, className: 'bg-slate-900 text-white border border-white/10' });
                         return;
                       }
                       onSelection(img);
                     }}
                     className={cn(
                       "aspect-[3/4] bg-slate-900 rounded-[56px] overflow-hidden border transition-all duration-700 group relative shadow-2xl",
                       img.canPublish ? "cursor-pointer border-white/5 hover:border-wg-orange/50" : "cursor-not-allowed border-blue-500/20 opacity-80"
                     )}
                   >
                     <img src={img.thumb || img.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                     <div className={cn("absolute top-8 left-8 px-4 py-1.5 rounded-full text-[9px] font-bold text-white uppercase border border-white/10 tracking-[0.2em] backdrop-blur-xl shadow-lg", img.canPublish ? 'bg-emerald-700/70' : 'bg-blue-700/70')}>{policy.label}</div>
                     <div className="absolute top-8 right-8 rounded-full bg-black/70 px-3 py-1 text-[9px] font-bold text-white">{img.scores?.final || 0}</div>
                     <div className="absolute bottom-10 left-10 right-10 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 text-center">
                       <p className="text-[11px] text-white font-bold leading-tight uppercase tracking-tight line-clamp-2 mb-3 font-playfair italic">{img.title}</p>
                       <p className="mb-4 line-clamp-3 text-[10px] font-light leading-relaxed text-slate-300">{img.aiRationale}</p>
                       <span className={cn("inline-flex items-center gap-3 px-8 py-4 text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-2xl transition-all", img.canPublish ? "bg-white text-black hover:bg-wg-orange hover:text-white" : "bg-blue-600/30 text-blue-100")}>
                         {img.canPublish ? 'Vincular Ativo' : 'Usar só como referência'}
                       </span>
                     </div>
                   </motion.div>
                 );
               })}
            </div>}
         </div>
      </motion.div>
    </div>
  );
}
