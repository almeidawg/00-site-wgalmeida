import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCcw,
  Star,
  ArrowUpRight,
  Rocket
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

export default function AdminLeads() {
  const { toast } = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promotingId, setPromotingId] = useState(null);
  const [filter, setFilter] = useState('all'); // all | proposta | contato
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/leads');
      const data = await resp.json();
      if (data.leads) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error('Erro ao buscar leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const updateLeadStatus = async (id, tipo, status) => {
    try {
      const resp = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, tipo, status })
      });
      if (resp.ok) {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
        toast({ title: "Status atualizado", description: `Lead movido para ${status}` });
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const promoteToWGEasy = async (id, tipo) => {
    setPromotingId(id);
    try {
      const resp = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, tipo })
      });
      
      if (resp.ok) {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'atendido' } : l));
        toast({ 
          title: "Promovido com Sucesso!", 
          description: "O lead agora é uma oportunidade no Kanban do WGEasy.",
          className: "bg-emerald-600 text-white border-none"
        });
      } else {
        throw new Error('Falha na promoção');
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Erro na promoção", description: err.message });
    } finally {
      setPromotingId(null);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.tipo === filter;
    const matchesSearch = 
      lead.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.telefone?.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20 p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Rocket className="text-blue-500" size={24} /> Gestão de Leads & CRM
          </h2>
          <p className="text-slate-400 text-sm mt-1">Triagem de marketing para o ecossistema WG Almeida.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLeads}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20">
            <Download size={18} /> Exportar
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total 90 dias</p>
            <h3 className="text-2xl font-bold text-white">{leads.length}</h3>
         </div>
         <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">Novos Hoje</p>
            <h3 className="text-2xl font-bold text-white">
               {leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length}
            </h3>
         </div>
         <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Propostas</p>
            <h3 className="text-2xl font-bold text-white">{leads.filter(l => l.tipo === 'proposta').length}</h3>
         </div>
         <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Convertidos</p>
            <h3 className="text-2xl font-bold text-white">
               {leads.filter(l => l.status === 'atendido' || l.status === 'convertido').length}
            </h3>
         </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900/20 border border-slate-800/50 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
               type="text"
               placeholder="Buscar lead..."
               className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
               { id: 'all', label: 'Todos' },
               { id: 'proposta', label: 'Propostas' },
               { id: 'contato', label: 'Contatos' },
            ].map(item => (
               <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={cn(
                     "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tighter transition-all",
                     filter === item.id ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                  )}
               >
                  {item.label}
               </button>
            ))}
         </div>
      </div>

      {/* Leads Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
         {loading ? (
            <div className="py-40 flex flex-col items-center justify-center text-slate-500">
               <Loader2 className="animate-spin mb-4" size={32} />
               <p className="text-sm font-medium">Carregando inteligência...</p>
            </div>
         ) : filteredLeads.length === 0 ? (
            <div className="py-40 flex flex-col items-center justify-center text-slate-600">
               <Users className="mb-4 opacity-20" size={64} />
               <p className="text-sm font-medium">Nenhum lead encontrado.</p>
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse border-spacing-0">
                  <thead>
                     <tr className="border-b border-slate-800 bg-slate-950/50">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lead / Campanha</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contato</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ações Operacionais</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                     {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-800/20 transition-colors group">
                           <td className="px-6 py-5">
                              <div className="flex flex-col">
                                 <span className="text-sm font-bold text-slate-200 group-hover:text-white">{lead.nome}</span>
                                 <div className="flex flex-wrap gap-2 mt-1.5">
                                    <span className={cn(
                                       "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-tighter",
                                       lead.tipo === 'proposta' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                    )}>
                                       {lead.origem || lead.tipo}
                                    </span>
                                    {lead.utm_campaign && (
                                       <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase tracking-tighter border border-slate-700">
                                          CAM: {lead.utm_campaign}
                                       </span>
                                    )}
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-5">
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Mail size={12} className="text-slate-600" /> {lead.email || '—'}
                                 </div>
                                 <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Phone size={12} className="text-slate-600" /> {lead.telefone || '—'}
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-5">
                              <div className="flex flex-col">
                                 <span className="text-xs text-slate-300">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
                                 <span className="text-[10px] text-slate-600 font-mono mt-0.5">{new Date(lead.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                           </td>
                           <td className="px-6 py-5">
                              <select 
                                 value={lead.status}
                                 onChange={(e) => updateLeadStatus(lead.id, lead.tipo, e.target.value)}
                                 className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-slate-950 border outline-none transition-all cursor-pointer",
                                    lead.status === 'nova' ? "text-orange-500 border-orange-500/30" :
                                    lead.status === 'atendido' ? "text-blue-500 border-blue-500/30" :
                                    "text-emerald-500 border-emerald-500/30"
                                 )}
                              >
                                 <option value="nova">Nova</option>
                                 <option value="atendido">Atendido</option>
                                 <option value="convertido">Convertido</option>
                                 <option value="descartado">Descartado</option>
                              </select>
                           </td>
                           <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                 <button 
                                    onClick={() => promoteToWGEasy(lead.id, lead.tipo)}
                                    disabled={promotingId === lead.id || lead.status === 'convertido'}
                                    className={cn(
                                       "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                       lead.status === 'convertido' || lead.status === 'atendido'
                                          ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                                          : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                                    )}
                                 >
                                    {promotingId === lead.id ? (
                                       <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                       <Rocket size={14} />
                                    )}
                                    Promover WGEasy
                                 </button>
                                 <a 
                                    href={`https://wa.me/55${lead.telefone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${lead.nome}, vi que você solicitou uma proposta de ${lead.origem || 'projeto'} no site da WG Almeida. Como posso ajudar?`)}`} 
                                    target="_blank" 
                                    className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                                    title="Chamar no WhatsApp"
                                 >
                                    <MessageSquare size={16} />
                                 </a>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
    </div>
  );
}
