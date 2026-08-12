import {
  Users,
  Search,
  Download,
  Phone,
  Mail,
  MessageSquare,
  Loader2,
  RefreshCcw,
  Rocket,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const buildWhatsAppHref = (lead) => {
  const phone = lead.telefone?.replace(/\D/g, '') || '';
  const project = lead.origem || 'projeto';
  const message = `Olá ${lead.nome}, vi que você solicitou uma proposta de ${project} no site da WG Almeida. Como posso ajudar?`;
  return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
};

export default function AdminLeads() {
  const { toast } = useToast();
  const { session } = useAuth();
  const authHeaders = session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promotingId, setPromotingId] = useState(null);
  const [filter, setFilter] = useState('all'); // all | nova | atendido | convertido | descartado
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await fetch('/api/leads', { headers: authHeaders });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data.error || `Falha ao carregar leads (${resp.status})`);
      }
      setLeads(Array.isArray(data.leads) ? data.leads : []);
    } catch (err) {
      console.error('Erro ao buscar leads:', err);
      setError(err.message || 'NÃ£o foi possÃ­vel carregar os leads.');
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
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, tipo, status })
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `Falha ao atualizar status (${resp.status})`);
      }
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      setError('');
      toast({ title: "Status atualizado", description: `Lead movido para ${status}` });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError(err.message || 'NÃ£o foi possÃ­vel atualizar o status do lead.');
    }
  };

  const promoteToWGEasy = async (id, tipo) => {
    setPromotingId(id);
    try {
      const resp = await fetch('/api/leads', {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, tipo })
      });
      
      if (resp.ok) {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'convertido' } : l));
        toast({ 
          title: "Promovido com Sucesso!", 
          description: "O lead agora Ã© uma oportunidade no Kanban do WGEasy.",
          className: "bg-emerald-600 text-white border-none"
        });
      } else {
        throw new Error('Falha na promoÃ§Ã£o');
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Erro na promoÃ§Ã£o", description: err.message });
    } finally {
      setPromotingId(null);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.status === filter;
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
            <Rocket className="text-blue-500" size={24} /> GestÃ£o de Leads & CRM
          </h2>
          <p className="text-slate-400 text-sm mt-1">Triagem de marketing para o ecossistema WG Almeida.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button"
            onClick={fetchLeads}
            aria-label="Atualizar lista de leads"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button type="button"disabled title="ExportaÃ§Ã£o em preparaÃ§Ã£o" className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-slate-500 rounded-xl text-sm font-bold cursor-not-allowed border border-slate-700">
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
            <p className="text-[10px] font-bold text-wg-orange uppercase tracking-widest mb-1">Novos Hoje</p>
            <h3 className="text-2xl font-bold text-white">
               {leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length}
            </h3>
         </div>
         <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Em atendimento</p>
            <h3 className="text-2xl font-bold text-white">{leads.filter(l => l.status === 'atendido').length}</h3>
         </div>
         <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Convertidos</p>
            <h3 className="text-2xl font-bold text-white">
               {leads.filter(l => l.status === 'convertido').length}
            </h3>
         </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900/20 border border-slate-800/50 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
               type="text"
               aria-label="Buscar lead"
               placeholder="Buscar lead..."
               className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex w-full flex-wrap items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 md:w-auto">
            {[
               { id: 'all', label: 'Todos' },
               { id: 'nova', label: 'Novos' },
               { id: 'atendido', label: 'Em atendimento' },
               { id: 'convertido', label: 'Convertidos' },
               { id: 'descartado', label: 'Descartados' },
            ].map(item => (
               <button type="button"
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

      {error && (
         <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
         </div>
      )}

      {/* Leads Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
         {loading ? (
            <div className="py-40 flex flex-col items-center justify-center text-slate-500">
               <Loader2 className="animate-spin mb-4" size={32} />
               <p className="text-sm font-medium">Carregando inteligÃªncia...</p>
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
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">AÃ§Ãµes Operacionais</th>
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
                                       lead.tipo === 'proposta' ? "bg-wg-orange/10 text-wg-orange border-wg-orange/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
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
                                    <Mail size={12} className="text-slate-600" /> {lead.email || 'â€”'}
                                 </div>
                                 <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Phone size={12} className="text-slate-600" /> {lead.telefone || 'â€”'}
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
                                 aria-label={`Status do lead ${lead.nome || lead.email || lead.id}`}
                                 value={lead.status}
                                 onChange={(e) => updateLeadStatus(lead.id, lead.tipo, e.target.value)}
                                 className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-slate-950 border outline-none transition-all cursor-pointer",
                                    lead.status === 'nova' ? "text-wg-orange border-wg-orange/30" :
                                    lead.status === 'atendido' ? "text-blue-500 border-blue-500/30" :
                                    "text-emerald-500 border-emerald-500/30"
                                 )}
                              >
                                 <option value="nova">Nova</option>
                                 <option value="atendido">Atendido</option>
                                 <option value="convertido" disabled>Convertido via promoção</option>
                                 <option value="descartado">Descartado</option>
                              </select>
                           </td>
                           <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                 <button type="button"
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
                                    href={buildWhatsAppHref(lead)}
                                    target="_blank" 
                                    rel="noreferrer"
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
