import { motion } from '@/lib/motion-lite';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="animate-pulse">Carregando painel...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <AdminSidebar />
      
      <main className="pl-[260px] min-h-screen transition-all duration-300">
        <header className="h-20 border-b border-slate-900 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">Sistema <span className="text-blue-500">WG</span> Cockpit</h1>
            <p className="text-xs text-slate-500 mt-0.5">Operação digital site-wgalmeida</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-slate-200">{user.email}</span>
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Master Admin</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border border-white/10 shadow-lg shadow-blue-900/20">
              <span className="font-bold text-white uppercase">{user.email?.charAt(0)}</span>
            </div>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
