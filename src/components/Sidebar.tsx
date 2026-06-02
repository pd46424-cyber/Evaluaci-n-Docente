import { useState } from 'react';
import { 
  GraduationCap, 
  ClipboardCheck, 
  LayoutDashboard, 
  Database, 
  TableProperties, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  User,
  Sparkles
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: UserProfile;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  user, 
  onLogout, 
  onOpenProfile 
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter menu items by user permissions
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      icon: LayoutDashboard,
      roles: ['Administrador', 'Coordinador', 'Docente']
    },
    {
      id: 'teachers',
      label: 'Gestión Docentes',
      icon: GraduationCap,
      roles: ['Administrador', 'Coordinador']
    },
    {
      id: 'templates',
      label: 'Diseño Evaluaciones',
      icon: ClipboardCheck,
      roles: ['Administrador']
    },
    {
      id: 'apply',
      label: 'Evaluar Docente',
      icon: ClipboardCheck,
      roles: ['Alumno', 'Coordinador', 'Administrador']
    },
    {
      id: 'advanced',
      label: 'Historial y Resultados',
      icon: TableProperties,
      roles: ['Administrador', 'Coordinador']
    },
    {
      id: 'appsscript',
      label: 'Conector Google Sheets',
      icon: Database,
      roles: ['Administrador', 'Coordinador']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside 
      id="main-sidebar"
      className={`relative min-h-screen bg-[#1E293B]/40 backdrop-blur-xl border-r border-white/5 text-[#F8FAFC] flex flex-col justify-between transition-all duration-300 shadow-2xl z-30 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Brand Logo */}
      <div>
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#F97316] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col select-none animate-[fadeIn_0.2s_ease-out]">
                <span className="font-extrabold text-sm tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                  INTELEDUDOC
                </span>
                <span className="text-[10px] text-[#7C3AED] font-bold tracking-widest uppercase">
                  Eval - Dashboard
                </span>
              </div>
            )}
          </div>
          
          <button 
            id="sidebar-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg bg-[#1E293B] border border-white/10 hover:border-[#7C3AED] text-slate-400 hover:text-white transition cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Categories */}
        <nav className="p-3 space-y-2 mt-4">
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400/80 tracking-widest uppercase select-none">
              MENÚ PRINCIPAL
            </div>
          )}
          {filteredMenuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-left text-sm font-medium transition-all group overflow-hidden cursor-pointer relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#7C3AED]/20 to-transparent border-l-2 border-[#7C3AED] text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <IconComponent className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-[#7C3AED]' : 'text-slate-500 group-hover:text-white'
                }`} />
                
                {!isCollapsed && (
                  <span className="truncate transition-colors duration-155">
                    {item.label}
                  </span>
                )}
                
                {/* Micro tooltip for collapsed sidebar */}
                {isCollapsed && (
                  <div className="absolute left-20 bg-slate-950 text-white text-xs px-2.5 py-1.5 rounded-md border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-xl">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Mini Profile & Log Out */}
      <div className="p-4 border-t border-white/5">
        <div 
          onClick={onOpenProfile}
          className={`group flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-white/10 bg-white/5 hover:bg-white/10 shadow-lg transition cursor-pointer mb-3.5 text-left ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Editar Perfil"
        >
          <div className="relative flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden ring-2 ring-[#7C3AED]/40 group-hover:ring-[#F97316]/70 transition-all">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-[#7C3AED] flex items-center justify-center text-white font-bold text-sm">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden select-none">
              <div className="text-xs font-bold text-slate-100 truncate group-hover:text-white transition-colors">
                {user.name}
              </div>
              <div className="text-[10px] text-[#F97316] font-semibold uppercase tracking-wider">
                {user.role}
              </div>
            </div>
          )}
        </div>

        <button
          id="logout-btn"
          onClick={onLogout}
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left text-sm font-medium border border-transparent hover:border-red-500/10 text-slate-400 hover:text-red-400 hover:bg-red-550/10 transition cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-red-400" />
          {!isCollapsed && <span className="truncate">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
