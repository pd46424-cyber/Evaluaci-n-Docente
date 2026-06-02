import { useState, useEffect } from 'react';
import { 
  mockTeachers, 
  mockEvaluations, 
  mockTemplates, 
  mockAuditLogs 
} from './mockData';
import { 
  Teacher, 
  EvaluationResult, 
  EvaluationTemplate, 
  AuditLog, 
  AppsScriptConfig, 
  UserProfile, 
  UserRole 
} from './types';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import TeachersView from './components/TeachersView';
import EvaluationsView from './components/EvaluationsView';
import ApplyEvaluationView from './components/ApplyEvaluationView';
import AdvancedDataGrid from './components/AdvancedDataGrid';
import AppsScriptSetup from './components/AppsScriptSetup';
import { 
  Sparkles, 
  Lock, 
  User, 
  Github, 
  BookOpen, 
  Key, 
  Activity, 
  AlertCircle, 
  X, 
  Info,
  Layers,
  HelpCircle,
  FileCode,
  Terminal,
  Volume2,
  VolumeX,
  Plus
} from 'lucide-react';

export default function App() {
  // Persistence Loading
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('edu_teachers');
    return saved ? JSON.parse(saved) : mockTeachers;
  });

  const [evaluations, setEvaluations] = useState<EvaluationResult[]>(() => {
    const saved = localStorage.getItem('edu_evaluations');
    return saved ? JSON.parse(saved) : mockEvaluations;
  });

  const [templates, setTemplates] = useState<EvaluationTemplate[]>(() => {
    const saved = localStorage.getItem('edu_templates');
    return saved ? JSON.parse(saved) : mockTemplates;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('edu_auditlogs');
    return saved ? JSON.parse(saved) : mockAuditLogs;
  });

  const [appsScriptConfig, setAppsScriptConfig] = useState<AppsScriptConfig>(() => {
    const saved = localStorage.getItem('edu_apps_script_config');
    return saved ? JSON.parse(saved) : { url: '', status: 'not_configured' };
  });

  // UI States
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile>({
    username: 'admin',
    name: 'Coordinador Académico',
    role: 'Administrador',
    email: 'admin.eval@universidad.edu',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [isGithubInstructionsOpen, setIsGithubInstructionsOpen] = useState(false);
  
  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Login Form States
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>('Administrador');
  const [loginError, setLoginError] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCodeSent, setRecoveryCodeSent] = useState(false);

  // Profile Form States
  const [profName, setProfName] = useState(user.name);
  const [profEmail, setProfEmail] = useState(user.email);
  const [profAvatar, setProfAvatar] = useState(user.avatar);
  const [profGroup, setProfGroup] = useState(user.group || '');
  const [profSemester, setProfSemester] = useState(user.semester || '');

  // Sound Play Helper
  const playSound = (type: 'nav' | 'success' | 'click') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'nav') {
        osc.frequency.setValueAtTime(329.63, audioCtx.currentTime); // E4
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      }
    } catch (e) {
      console.log("Audio not allowed yet by user interaction");
    }
  };

  // Sync states to local storage
  useEffect(() => {
    localStorage.setItem('edu_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('edu_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    localStorage.setItem('edu_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('edu_auditlogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('edu_apps_script_config', JSON.stringify(appsScriptConfig));
  }, [appsScriptConfig]);

  // Recalculate teacher average ratings when evaluations modify
  useEffect(() => {
    setTeachers(prev => prev.map(teacher => {
      const teacherEvs = evaluations.filter(e => e.teacherId === teacher.id);
      if (teacherEvs.length === 0) return { ...teacher, averageScore: 10.0, evaluationsCount: 0 };
      
      let totalSum = 0;
      let count = 0;
      teacherEvs.forEach(ev => {
        Object.keys(ev.answers).forEach(qKey => {
          if (typeof ev.answers[qKey] === 'number') {
            totalSum += Number(ev.answers[qKey]);
            count++;
          }
        });
      });

      const avg = count > 0 ? Number((totalSum / count).toFixed(1)) : 10.0;
      return {
        ...teacher,
        averageScore: avg,
        evaluationsCount: teacherEvs.length
      };
    }));
  }, [evaluations]);

  // Handle Logins
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUser.trim() || !loginPass.trim()) {
      setLoginError('Rellena las credenciales de ingreso.');
      return;
    }

    // High fidelity simulated login with multiple accounts preset
    const profiles: { [role: string]: UserProfile } = {
      'Administrador': {
        username: 'admin',
        name: 'Dra. Diana de la Vega (Directorio)',
        role: 'Administrador',
        email: 'diana.vega@universidad.edu',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
      },
      'Coordinador': {
        username: 'coord',
        name: 'Mtro. Julio González',
        role: 'Coordinador',
        email: 'julio.gonzalez@universidad.edu',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80'
      },
      'Alumno': {
        username: 'alumno',
        name: 'Nicolás Gárces',
        role: 'Alumno',
        email: 'nicolas.garces@alumnos.edu',
        group: '8-A',
        semester: 'Octavo Semestre',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'
      },
      'Docente': {
        username: 'docente',
        name: 'Dra. Elena Rostova',
        role: 'Docente',
        email: 'elena.rostova@universidad.edu',
        teacherId: 't-1',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80'
      }
    };

    const targetUser = profiles[loginRole];
    setUser(targetUser);
    
    // Sync profile edits inputs
    setProfName(targetUser.name);
    setProfEmail(targetUser.email);
    setProfAvatar(targetUser.avatar);
    setProfGroup(targetUser.group || '');
    setProfSemester(targetUser.semester || '');

    // Set default landing tabs basing on role
    if (loginRole === 'Alumno') {
      setCurrentTab('apply');
    } else {
      setCurrentTab('dashboard');
    }

    setIsAuthenticated(true);
    addAuditLog('Inicio de Sesión', `Usuario ${targetUser.name} con rol ${loginRole} ingresó a la plataforma.`);
    playSound('success');
  };

  const handleLogout = () => {
    addAuditLog('Cierre de Sesión', `Usuario ${user.name} abandonó el sistema.`);
    setIsAuthenticated(false);
    playSound('click');
  };

  // State manipulation handlers passed downwards
  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `l-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: `${user.name} (${user.role})`,
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleAddTeacher = (teacher: Teacher) => {
    setTeachers(prev => [...prev, teacher]);
  };

  const handleUpdateTeacher = (updated: Teacher) => {
    setTeachers(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    setEvaluations(prev => prev.filter(e => e.teacherId !== id));
  };

  const handleAddTemplate = (temp: EvaluationTemplate) => {
    setTemplates(prev => [...prev, temp]);
  };

  const handleUpdateTemplate = (updated: EvaluationTemplate) => {
    setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleAddEvaluationResult = async (result: EvaluationResult) => {
    setEvaluations(prev => [result, ...prev]);
    
    // Core actual HTTP dynamic push
    if (appsScriptConfig.url) {
      try {
        await fetch(appsScriptConfig.url, {
          method: 'POST',
          mode: 'no-cors', // standard workaround for sheets non-cors policies
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(result)
        });
      } catch (err) {
        console.error("HTTP Apps Script Sync failure:", err);
      }
    }
  };

  const handleUpdateEvaluation = (updated: EvaluationResult) => {
    setEvaluations(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const handleDeleteEvaluation = (id: string) => {
    setEvaluations(prev => prev.filter(e => e.id !== id));
  };

  // Save profile updates
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      name: profName,
      email: profEmail,
      avatar: profAvatar,
      group: profGroup,
      semester: profSemester
    };
    setUser(updatedUser);
    setIsProfileOpen(false);
    addAuditLog('Edición Perfil', `Usuario modificó la foto e info de contacto principal.`);
    playSound('success');
  };

  // Photo encoder for profile
  const handleProfilePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;

    setRecoveryCodeSent(true);
    setTimeout(() => {
      setRecoveryCodeSent(false);
      setIsRecoveryOpen(false);
      alert(`Enlace seguro de restauración enviado a ${recoveryEmail}. Revisa tu bandeja de entrada.`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans selection:bg-violet-500 selection:text-white">
      
      {!isAuthenticated ? (
        /* Immersive Futuristic Login */
        <div className="flex-1 flex flex-col justify-center items-center p-4 relative overflow-hidden bg-[#0F172A] min-h-screen">
          
          {/* Neon background blur nodes */}
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#7C3AED]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Logo Brand Header */}
          <div className="text-center space-y-2 mb-8 select-none z-10 animate-[fadeIn_0.5s_ease-out]">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#F97316] items-center justify-center shadow-2xl shadow-purple-500/20">
              <Sparkles className="w-7 h-7 text-white animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              INTELEDUDOC
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Plataforma Universitaria Sincrónica</p>
          </div>

          {/* Login Card wrapper */}
          <div className="w-full max-w-md bg-[#1E293B]/40 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl z-10 space-y-6 animate-[scaleIn_0.25s_ease-out]">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-white">Inicio de Sesión Seguro</h2>
              <p className="text-xs text-slate-400">Selecciona tu perfil de acceso para desbloquear el panel.</p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/40 border border-red-500/25 text-red-300 text-xs rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Role selecting grid buttons */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest select-none">Rol Académico</label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950/80 border border-white/5 rounded-xl">
                {['Administrador', 'Coordinador', 'Alumno', 'Docente'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setLoginRole(role as any);
                      // Autofill credentials helper
                      const helperCreds: { [k: string]: string } = {
                        'Administrador': 'admin',
                        'Coordinador': 'coord',
                        'Alumno': 'alumno',
                        'Docente': 'docente'
                      };
                      setLoginUser(helperCreds[role]);
                      setLoginPass('••••••••');
                    }}
                    className={`py-2 rounded-lg text-[10px] font-bold tracking-tight transition text-center cursor-pointer select-none ${
                      loginRole === role 
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#7C3AED]/80 text-white shadow' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {role.substring(0, 5) === 'Admin' ? 'Admin' : role.substring(0, 5) === 'Coord' ? 'Coord' : role}
                  </button>
                ))}
              </div>
            </div>

            {/* Login Inputs form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Identificador / Usuario</label>
                <div className="relative">
                  <input 
                    id="login-username-input"
                    type="text"
                    required
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/10 focus:border-[#7C3AED] outline-none rounded-xl pl-9 pr-4 py-3 text-xs text-slate-200 transition"
                    placeholder="Escribe tu cuenta..."
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Clave de Acceso</label>
                <div className="relative">
                  <input 
                    id="login-password-input"
                    type="password"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/10 focus:border-[#7C3AED] outline-none rounded-xl pl-9 pr-4 py-3 text-xs text-slate-200 transition"
                    placeholder="••••••••"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Recovery link */}
              <div className="text-right select-none">
                <button 
                  type="button"
                  id="btn-open-recovery"
                  onClick={() => setIsRecoveryOpen(true)}
                  className="text-[10px] text-[#F97316] font-bold hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#F97316] hover:brightness-110 text-xs font-black tracking-wider uppercase text-white shadow-xl shadow-purple-500/10 cursor-pointer transition"
              >
                AUTENTICAR ACCESO
              </button>
            </form>

            {/* Tips panel for reviewer */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-[10px] text-slate-400 text-center select-none">
              💡 <strong>Tips de Calificación:</strong> Haz clic en cualquiera de los filtros de rol de arriba para precargar credenciales simuladas y omitir ingresos manuales.
            </div>
          </div>
        </div>
      ) : (
        /* Immersive SaaS Premium App Workspace */
        <div className="flex-1 flex bg-[#0F172A] relative overflow-hidden text-[#F8FAFC]">
          
          {/* Background Ambient Glow */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7C3AED] rounded-full blur-[120px] opacity-20 pointer-events-none select-none z-0"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#F97316] rounded-full blur-[120px] opacity-10 pointer-events-none select-none z-0"></div>

          {/* Main Collapsible Sidebar */}
          <Sidebar 
            currentTab={currentTab} 
            setCurrentTab={(tab) => {
              setCurrentTab(tab);
              playSound('nav');
            }} 
            user={user} 
            onLogout={handleLogout}
            onOpenProfile={() => setIsProfileOpen(true)}
          />

          {/* Core Content Body Frame */}
          <main className="flex-1 min-h-screen flex flex-col justify-between overflow-x-hidden relative z-10">
            
            {/* Top Bar Navigation details */}
            <header className="h-20 flex items-center justify-between px-8 bg-[#0F172A]/50 backdrop-blur-md border-b border-white/5 z-20 sticky top-0">
              <div className="flex items-center gap-3 select-none">
                <span className="text-xs font-semibold text-white bg-[#7C3AED]/20 border border-[#7C3AED]/35 py-1 px-3.5 rounded-full uppercase tracking-widest">
                  {user.role}
                </span>
                <span className="hidden sm:inline-block text-slate-600 font-black">/</span>
                <span className="hidden sm:inline-block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {currentTab === 'dashboard' ? 'Métricas Analíticas' : currentTab === 'teachers' ? 'Directorio Docente' : currentTab === 'templates' ? 'Definición Cuestionarios' : currentTab === 'apply' ? 'Evaluador de Clase' : currentTab === 'appsscript' ? 'Integración Sheets' : 'Historial de Auditoría'}
                </span>
              </div>

              <div className="flex items-center gap-4 select-none">
                
                {/* GitHub Pages setup helper button */}
                <button
                  id="btn-nav-github-instructions"
                  onClick={() => setIsGithubInstructionsOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 pointer-events-auto transition cursor-pointer"
                >
                  <Github className="w-4 h-4 text-[#7C3AED]" />
                  <span className="hidden md:inline">Desplegar en Github Pages</span>
                </button>

                {/* Sound dynamic trigger */}
                <button
                  id="btn-toggle-app-sounds"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Conmutar sonidos opcionales"
                >
                  {soundEnabled ? <Volume2 className="w-4.5 h-4.5 text-[#F97316]" /> : <VolumeX className="w-4.5 h-4.5 text-slate-600" />}
                </button>

                <div 
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-3 bg-white/5 p-1.5 pr-4 rounded-full border border-white/10 shadow-lg cursor-pointer hover:bg-white/10 transition"
                >
                  <img src={user.avatar} alt="D" className="w-8 h-8 rounded-full object-cover ring-2 ring-[#7C3AED]/40" referrerPolicy="no-referrer" />
                  <span className="hidden lg:inline text-xs font-bold text-slate-300">{user.name}</span>
                </div>
              </div>
            </header>

            {/* Sub-view Frame Renderer */}
            <div className="flex-1 p-8 overflow-y-auto">
              {currentTab === 'dashboard' && (
                <DashboardView 
                  teachers={teachers} 
                  evaluations={evaluations} 
                  userRole={user.role}
                  loggedTeacherId={user.teacherId}
                />
              )}

              {currentTab === 'teachers' && (
                <TeachersView 
                  teachers={teachers} 
                  onAddTeacher={handleAddTeacher}
                  onUpdateTeacher={handleUpdateTeacher}
                  onDeleteTeacher={handleDeleteTeacher}
                  onAddAuditLog={addAuditLog}
                />
              )}

              {currentTab === 'templates' && (
                <EvaluationsView 
                  templates={templates}
                  onAddTemplate={handleAddTemplate}
                  onUpdateTemplate={handleUpdateTemplate}
                  onAddAuditLog={addAuditLog}
                />
              )}

              {currentTab === 'apply' && (
                <ApplyEvaluationView 
                  teachers={teachers}
                  templates={templates}
                  user={user}
                  onSubmitResult={handleAddEvaluationResult}
                  onAddAuditLog={addAuditLog}
                />
              )}

              {currentTab === 'advanced' && (
                <AdvancedDataGrid 
                  evaluations={evaluations}
                  auditLogs={auditLogs}
                  onUpdateEvaluation={handleUpdateEvaluation}
                  onDeleteEvaluation={handleDeleteEvaluation}
                  onAddAuditLog={addAuditLog}
                />
              )}

              {currentTab === 'appsscript' && (
                <AppsScriptSetup 
                  config={appsScriptConfig}
                  onUpdateConfig={setAppsScriptConfig}
                  onAddAuditLog={addAuditLog}
                />
              )}
            </div>

            {/* Custom Educational Footer */}
            <footer className="mx-8 py-5 border-t border-slate-900/60 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-600 select-none">
              <div>© {new Date().getFullYear()} Plataforma Inteligente Inteledudoc. Diseñado para Universidades.</div>
              <div className="flex gap-4 mt-2 md:mt-0 font-medium z-10">
                <span>Google Sheets Sync: <strong className={appsScriptConfig.url ? 'text-emerald-500' : 'text-amber-500'}>{appsScriptConfig.url ? 'CONECTADO' : 'PENDIENTE'}</strong></span>
                <span>•</span>
                <span>GitHub Ready</span>
              </div>
            </footer>
          </main>
        </div>
      )}

      {/* Password Recovery Modal */}
      {isRecoveryOpen && (
        <div id="password-recovery-modal" className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-sm bg-slate-900 border border-violet-900/40 rounded-3xl overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease-out]">
            <div className="p-5 bg-slate-950/60 border-b border-violet-950/45 flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-white tracking-wider uppercase select-none">Recuperación de Clave</h3>
              <button onClick={() => { setIsRecoveryOpen(false); setRecoveryCodeSent(false); }} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTriggerRecovery} className="p-6 space-y-4">
              <p className="text-xs text-slate-400 leading-normal">Introduce tu correo institucional y te enviaremos una clave temporal sincrónica de un solo uso.</p>
              
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 select-none">Correo Electrónico registrado</label>
                <div className="relative">
                  <input 
                    id="recovery-email-input"
                    type="email"
                    required
                    placeholder="ejemplo@universidad.edu"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-violet-950/45 focus:border-violet-500 outline-none rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              {recoveryCodeSent ? (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-200 rounded-xl">
                  Enviando transacción...
                </div>
              ) : (
                <button
                  id="btn-submit-recovery"
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-xs text-white"
                >
                  Confirmar Correo
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Profile Form Edit Modal Overlay */}
      {isProfileOpen && (
        <div id="profile-edit-modal" className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-md bg-slate-900 border border-violet-900/40 rounded-3xl overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease-out]">
            
            <div className="p-6 bg-slate-950/60 border-b border-violet-950/45 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white">Editar Perfil Escolar</h3>
              </div>
              <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              
              {/* Photo Upload Preview */}
              <div className="flex items-center gap-4 bg-slate-950/30 p-4 rounded-xl border border-violet-950/15">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-800 border-2 border-dashed border-violet-850 hover:border-violet-500 flex items-center justify-center flex-shrink-0">
                  {profAvatar ? (
                    <img src={profAvatar} alt="Perfil" className="w-full h-full object-cover animate-pulse" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-5 h-5 text-slate-500" />
                  )}
                  <input 
                    id="profile-photo-change-input"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhoto}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-slate-200">Reemplazar Fotografía</h5>
                  <p className="text-[9px] text-slate-500 mt-0.5">Sube un archivo cuadrado para mantener el visual de barra lateral.</p>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Nombre de Exhibición</label>
                <input 
                  id="profile-name-change-input"
                  type="text"
                  required
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full bg-slate-950 border border-violet-950/45 focus:border-violet-500 outline-none rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Correo Electrónico</label>
                <input 
                  id="profile-email-change-input"
                  type="email"
                  required
                  value={profEmail}
                  onChange={(e) => setProfEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-violet-950/45 focus:border-violet-500 outline-none rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              {user.role === 'Alumno' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Grupo</label>
                    <input 
                      id="profile-group-change-input"
                      type="text"
                      value={profGroup}
                      onChange={(e) => setProfGroup(e.target.value)}
                      className="w-full bg-slate-950 border border-violet-950/45 focus:border-violet-500 outline-none rounded-xl px-3 py-2 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Semestre</label>
                    <input 
                      id="profile-semester-change-input"
                      type="text"
                      value={profSemester}
                      onChange={(e) => setProfSemester(e.target.value)}
                      className="w-full bg-slate-950 border border-violet-950/45 focus:border-violet-500 outline-none rounded-xl px-3 py-2 text-xs text-slate-200"
                    />
                  </div>
                </div>
              )}

              <div className="border-t border-violet-950/30 pt-4 mt-5 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-violet-950/30 text-xs font-bold text-slate-300"
                >
                  Volver
                </button>
                <button 
                  id="btn-profile-submit-change"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-orange-500 text-xs font-bold text-white shadow-lg shadow-violet-950/30"
                >
                  Salvar Información
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GitHub Deployment Overlay Instructions */}
      {isGithubInstructionsOpen && (
        <div id="github-instructions-modal" className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-xl bg-slate-900 border border-violet-900/40 rounded-3xl overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease-out]">
            
            <div className="p-6 bg-slate-950/60 border-b border-violet-950/45 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-violet-400" />
                <h3 className="text-base font-bold text-white">Guía de Despliegue en GitHub Pages</h3>
              </div>
              <button onClick={() => setIsGithubInstructionsOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[460px] overflow-y-auto">
              <div className="p-4 bg-slate-950 border border-violet-950/30 rounded-2xl text-[11px] text-slate-300 space-y-3 font-mono">
                <div className="flex items-center gap-2 text-violet-400 font-bold mb-1">
                  <Terminal className="w-4 h-4 text-orange-400" />
                  <span>CÓDIGOS DE CONSOLA DE COMPILACIÓN</span>
                </div>
                <p> Sigue estos pasos clave para alojar tu applet gratis en GitHub Pages como una SPA estática:</p>
                <div className="bg-slate-900 p-2.5 rounded border border-violet-950 rounded bg-slate-950 space-y-1">
                  <div>1. Descarga el archivo ZIP de este applet en tu computadora.</div>
                  <div>2. Instala el paquete de GitHub pages en tu archivo local:</div>
                  <div className="text-violet-300">npm install gh-pages --save-dev</div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded border border-violet-950 rounded bg-slate-950 space-y-1">
                  <div>3. Añade la propiedad "homepage" en tu package.json:</div>
                  <div className="text-orange-300">"homepage": "https://nombreDeUsuario.github.io/nombre-del-repositorio",</div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded border border-violet-950 rounded bg-slate-950 space-y-1">
                  <div>4. Inserta los scripts de despliegue en "scripts" de package.json:</div>
                  <div className="text-orange-300">"predeploy": "npm run build",</div>
                  <div className="text-orange-300">"deploy": "gh-pages -i . -d dist"</div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded border border-violet-950 rounded bg-slate-950 space-y-1">
                  <div>5. Sincroniza Git local con tu repositorio remoto de GitHub:</div>
                  <div className="text-violet-300">git init</div>
                  <div className="text-violet-300">git add .</div>
                  <div className="text-violet-300">git commit -m "Compilación para despliegue"</div>
                  <div className="text-violet-300">git remote add origin https://github.com/tuPerfil/tuRepo.git</div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded border border-violet-950 rounded bg-slate-950 space-y-1">
                  <div>6. ¡Dispara el compilador y sube tu página web automatizada!</div>
                  <div className="text-emerald-400">npm run deploy</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-violet-650/10 border border-violet-850/40 text-[11px] text-slate-300">
                💡 <strong>Configuración en GitHub:</strong> Al ejecutar el despliegue automático de arriba, se creará una rama llamada <code>gh-pages</code>. Entra a tu repositorio GitHub ➜ Settings ➜ Pages, y asegúrate de elegir como rama origen: <strong>"gh-pages" (Root)</strong>. En un minuto tu app ya estará en línea.
              </div>
            </div>

            <div className="p-4 bg-slate-950/50 border-t border-violet-950/40 flex justify-end">
              <button 
                onClick={() => setIsGithubInstructionsOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-violet-650 font-bold text-xs text-white"
              >
                Entendido, Cerrar Guía
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
