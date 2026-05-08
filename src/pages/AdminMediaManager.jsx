import { motion } from '@/lib/motion-lite';
import { 
  Search, 
  Image as ImageIcon, 
  Upload, 
  Cloud, 
  RefreshCw, 
  Trash2, 
  ExternalLink,
  Filter,
  Grid,
  List,
  Plus,
  Check,
  AlertCircle,
  MoreVertical,
  Download,
  Link2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SEO from '@/components/SEO';

// Mock de dados de mídia do banco (Supabase)
const MOCK_MEDIA = [
  { id: 1, title: 'Hero Barcelona', type: 'blog', source: 'unsplash', url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded', slug: 'arquitetura-barcelona', date: '2026-05-01' },
  { id: 2, title: 'Banner Obra TurnKey', type: 'banner', source: 'cloudinary', url: 'https://res.cloudinary.com/wgalmeida/image/upload/v123/banner-obra', slug: 'home', date: '2026-04-28' },
  { id: 3, title: 'Cozinha Minimalista', type: 'blog', source: 'local', url: '/images/blog/cozinha/hero.webp', slug: 'cozinhas-modernas', date: '2026-05-05' },
];

import { searchUnsplashImages } from '@/services/mediaService';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export default function AdminMediaManager() {
  const [view, setView] = useState('grid'); 
  const [filter, setFilter] = useState('all'); 
  const [search, setSearch] = useState('');
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar overrides do banco
  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_media_overrides')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) setMediaList(data);
      setLoading(false);
    };
    fetchMedia();
  }, []);

  const handleLinkImage = async (imgData) => {
    const { error } = await supabase
      .from('site_media_overrides')
      .upsert({
        page_id: imgData.page_id || 'manual-upload',
        slot_id: imgData.slot_id || 'hero',
        image_url: imgData.url,
        metadata: { source: imgData.source, author: imgData.author }
      });

    if (error) {
      toast({ title: 'Erro ao vincular', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Sucesso!', description: 'Imagem vinculada e salva no banco.' });
      // Refresh local
      setMediaList([{ image_url: imgData.url, ...imgData }, ...mediaList]);
    }
  };

  return (
    <>
      <SEO title="Media Manager | Admin Cockpit" noindex />
      
      <div className="space-y-8">
        {/* Header Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Gerenciador de Mídia</h2>
            <p className="text-slate-500 text-sm mt-1">Organize, edite e vincule imagens sem sobrecarregar o site.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800">
              <Upload size={16} className="mr-2" /> Upload Cloudinary
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20">
              <Plus size={16} className="mr-2" /> Vincular Novo Link
            </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Buscar por slug, título ou fonte..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            {['all', 'blog', 'banner'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                  filter === f ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {f === 'all' ? 'Tudo' : f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border-l border-slate-800 pl-4 ml-2">
            <button 
              onClick={() => setView('grid')}
              className={cn("p-2 rounded-lg", view === 'grid' ? "text-blue-500 bg-blue-500/10" : "text-slate-500")}
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={cn("p-2 rounded-lg", view === 'list' ? "text-blue-500 bg-blue-500/10" : "text-slate-500")}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Google / Unsplash Search Section (Apenas UI por enquanto) */}
        <section className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/20 p-8 rounded-3xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Cloud size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Busca Inteligente (Google & Unsplash)</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6 max-w-xl">
              Encontre imagens de alta qualidade, selecione o thumbnail e o sistema cuidará do vínculo automático via Cloudinary.
            </p>
            <div className="flex gap-2 max-w-md">
              <input 
                type="text" 
                placeholder="Ex: 'apartamento de luxo itaim bibi'..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={() => setIsSearchingGoogle(true)} className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-6">
                Buscar
              </Button>
            </div>
          </div>
          <Cloud size={120} className="absolute right-[-20px] bottom-[-20px] text-blue-500/10 group-hover:scale-110 transition-transform duration-700" />
        </section>

        {/* Media Grid */}
        <div className={cn(
          "grid gap-6",
          view === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
        )}>
          {MOCK_MEDIA.map((item) => (
            <motion.div 
              key={item.id}
              whileHover={{ y: -5 }}
              className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden group"
            >
              <div className="aspect-video relative overflow-hidden bg-slate-950">
                <img src={item.url} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-slate-900/80 rounded-lg hover:bg-blue-600 transition-colors"><Check size={14} /></button>
                  <button className="p-2 bg-slate-900/80 rounded-lg hover:bg-red-600 transition-colors"><Trash2 size={14} /></button>
                </div>

                <div className="absolute bottom-2 left-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-blue-600 text-white rounded">
                    {item.source}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-200 text-sm truncate">{item.title}</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{item.slug}</p>
                  </div>
                  <button className="text-slate-500 hover:text-white"><MoreVertical size={16} /></button>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/50">
                   <div className="flex items-center gap-1.5 text-slate-500">
                     <Link2 size={12} />
                     <span className="text-[10px] font-medium uppercase">{item.type}</span>
                   </div>
                   <button className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-tighter">Editar Vínculo</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State Mock */}
        {MOCK_MEDIA.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-600">
            <ImageIcon size={48} className="mb-4 opacity-20" />
            <p className="font-medium italic">Nenhuma mídia encontrada com os filtros atuais.</p>
          </div>
        )}
      </div>
    </>
  );
}
