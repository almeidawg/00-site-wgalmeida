import { motion } from '@/lib/motion-lite';
import { 
  LayoutDashboard, 
  BookOpen, 
  Image as ImageIcon, 
  Search, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import BrandStar from '@/components/BrandStar';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { id: 'editorial', label: 'Editorial Blog', icon: BookOpen, path: '/admin/blog-editorial' },
  { id: 'media', label: 'Media Manager', icon: ImageIcon, path: '/admin/media' },
  { id: 'seo', label: 'SEO & Search', icon: Search, path: '/admin/seo' },
  { id: 'settings', label: 'Configurações', icon: Settings, path: '/admin/settings' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '260px' }}
      className={cn(
        "fixed left-0 top-0 h-screen bg-slate-950 text-slate-200 border-r border-slate-800 z-50 flex flex-col transition-all duration-300",
        isCollapsed ? "items-center" : "items-start"
      )}
    >
      {/* Header / Logo */}
      <div className={cn(
        "w-full p-6 flex items-center justify-between",
        isCollapsed ? "flex-col gap-4" : "flex-row"
      )}>
        {!isCollapsed && (
          <Link to="/admin" className="flex items-center gap-2">
            <BrandStar className="w-8 h-8 text-blue-500" />
            <span className="font-bold text-lg tracking-tight">Admin<span className="text-blue-500">WG</span></span>
          </Link>
        )}
        {isCollapsed && <BrandStar className="w-8 h-8 text-blue-500" />}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 w-full px-4 space-y-2 mt-4">
        {MENU_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all group",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "hover:bg-slate-900 text-slate-400 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn(isActive ? "text-white" : "group-hover:text-blue-400")} />
              {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="w-full p-4 border-t border-slate-900 space-y-2">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all",
            isCollapsed && "justify-center"
          )}
        >
          <Globe size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Ver Site</span>}
        </Link>
        <button
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:text-white hover:bg-red-950/30 transition-all",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </motion.aside>
  );
}
