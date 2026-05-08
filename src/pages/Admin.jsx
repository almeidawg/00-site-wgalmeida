import { motion } from '@/lib/motion-lite';
import { 
  BarChart3, 
  Users, 
  Monitor, 
  Share2, 
  Search, 
  FileText, 
  TrendingUp, 
  Settings,
  Star,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Check,
  Copy,
  Loader2,
  ArrowRight,
  TrendingDown,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import BrandStar from '@/components/BrandStar';
import SEO from '@/components/SEO';

// Sub-componente: StatCard
const StatCard = ({ title, value, subvalue, icon: Icon, trend, color = "blue" }) => (
  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all group">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend > 0 ? '+' : ''}{trend}% {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        </span>
      )}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
      {subvalue && <p className="text-xs text-slate-400 mt-1.5">{subvalue}</p>}
    </div>
  </div>
);

// Sub-componente: QuickAction
const QuickAction = ({ title, desc, icon: Icon, to, color = "blue" }) => (
  <Link to={to} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/20 border border-slate-800/50 hover:bg-slate-900/60 hover:border-slate-700 transition-all group">
    <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:bg-${color}-500 group-hover:text-white transition-all`}>
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <h4 className="font-semibold text-slate-200 group-hover:text-white transition-colors">{title}</h4>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
    <ArrowRight size={16} className="text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
  </Link>
);

const Admin = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock stats - Em breve virão do Supabase
  const stats = [
    { title: 'Leads Totais', value: '142', subvalue: 'Últimos 30 dias', icon: Users, trend: 12, color: 'blue' },
    { title: 'Taxa de Cliques', value: '4.8%', subvalue: 'Média campanhas', icon: BarChart3, trend: 5, color: 'indigo' },
    { title: 'SEO Health', value: '94/100', subvalue: '158 rotas OK', icon: Search, trend: 2, color: 'emerald' },
    { title: 'Conversão Zap', value: '28%', subvalue: 'Via Liz Assistant', icon: MessageSquare, trend: 8, color: 'orange' },
  ];

  return (
    <>
      <SEO title="Dashboard | Admin Cockpit" noindex />
      
      <div className="space-y-10">
        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-10">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-bold text-white mb-3">Bem-vindo ao Cockpit, William.</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Sua central de comando para o ecossistema <span className="text-blue-500 font-semibold">WG Almeida</span>. 
              Aqui você gerencia o conteúdo, monitora a performance e escala sua presença digital.
            </p>
            <div className="flex gap-4 mt-8">
              <Link to="/admin/blog-editorial" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2">
                Novo Post <ArrowRight size={18} />
              </Link>
              <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all border border-slate-700">
                Ver Relatórios
              </button>
            </div>
          </div>
          
          {/* Decorative element */}
          <div className="absolute right-[-10%] top-[-20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
          <BrandStar className="absolute right-10 top-1/2 -translate-y-1/2 w-48 h-48 text-slate-800/20 pointer-events-none" />
        </section>

        {/* Stats Grid */}
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-xl font-bold text-white">Indicadores de Performance</h3>
            <button className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1 font-medium">
              Ver todos <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>
        </section>

        {/* Actions & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-white px-2">Ações Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickAction 
                title="Gestão Editorial" 
                desc="Edite posts e gerencie o blog" 
                icon={BookOpen} 
                to="/admin/blog-editorial" 
                color="blue"
              />
              <QuickAction 
                title="Media Manager" 
                desc="Gerencie imagens e banners" 
                icon={ImageIcon} 
                to="/admin/media" 
                color="indigo"
              />
              <QuickAction 
                title="Campanhas UTM" 
                desc="Gere links rastreáveis" 
                icon={Monitor} 
                to="/admin/landing" 
                color="orange"
              />
              <QuickAction 
                title="SEO Auditor" 
                desc="Valide a indexação do site" 
                icon={Search} 
                to="/admin/seo" 
                color="emerald"
              />
            </div>
            
            {/* Recent Activity Mock */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 mt-8">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <RefreshCw size={18} className="text-blue-500" /> Atividade Recente
              </h4>
              <div className="space-y-4">
                {[
                  { user: 'Liz (IA)', action: 'Post indexado no Google', time: 'Há 12 min', type: 'seo' },
                  { user: 'Você', action: 'Atualizou Taxonomia V45', time: 'Há 1 hora', type: 'system' },
                  { user: 'Sistema', action: 'Lead gerado: Projeto Brooklin', time: 'Há 3 horas', type: 'lead' },
                ].map((act, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/30 transition-colors border border-transparent hover:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 uppercase">
                        {act.user.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{act.action}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{act.user}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-600">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strategic Insights Card */}
          <div className="bg-gradient-to-b from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/40">
            <div className="relative z-10 h-full flex flex-col">
              <div className="p-3 bg-white/20 rounded-2xl w-fit mb-6">
                <TrendingUp size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 leading-tight">Insight da Liz: Otimização Mobile</h3>
              <p className="text-blue-100 text-sm leading-relaxed flex-1">
                "Detectamos que a remoção da intro cinematográfica reduziu a taxa de rejeição em 15% nas últimas 24h. 
                Sugiro focar em imagens 'Above the Fold' mais leves para aumentar o INP Score."
              </p>
              <button className="mt-8 w-full py-4 bg-white text-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                Aplicar Otimizações <ArrowRight size={18} />
              </button>
            </div>
            <div className="absolute right-[-20%] bottom-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>
      </div>
    </>
  );
};

// Re-exporting as default for the lazy loading
export default Admin;
