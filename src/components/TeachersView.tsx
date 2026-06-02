import { useState } from 'react';
import { Teacher } from '../types';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Power, 
  Upload, 
  Mail, 
  Tag, 
  Building2, 
  Loader,
  AlertOctagon,
  Sparkles,
  CheckCircle,
  X
} from 'lucide-react';

interface TeachersViewProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function TeachersView({ 
  teachers, 
  onAddTeacher, 
  onUpdateTeacher, 
  onDeleteTeacher,
  onAddAuditLog
}: TeachersViewProps) {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [subjectsText, setSubjectsText] = useState('');
  const [avatar, setAvatar] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Error/Success state
  const [feedback, setFeedback] = useState<{ type: 'success' | 'err', msg: string } | null>(null);

  const triggerToast = (type: 'success' | 'err', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // Convert uploaded image file to string base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      triggerToast('err', 'La foto seleccionada supera el límite máximo de 1.5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
      triggerToast('success', 'Fotografía cargada exitosamente.');
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setName('');
    setEmail('');
    setDepartment('Ingeniería y Tecnología');
    setSubjectsText('');
    setAvatar('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'); // nice default placeholder
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: Teacher) => {
    setEditingTeacher(t);
    setName(t.name);
    setEmail(t.email);
    setDepartment(t.department);
    setSubjectsText(t.subjects.join(', '));
    setAvatar(t.avatar);
    setStatus(t.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !department.trim()) {
      triggerToast('err', 'Por favor llena todos los campos obligatorios.');
      return;
    }

    const subjects = subjectsText
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (subjects.length === 0) {
      triggerToast('err', 'Agrega al menos una materia impartida.');
      return;
    }

    if (editingTeacher) {
      // Update
      const updated: Teacher = {
        ...editingTeacher,
        name,
        email,
        department,
        subjects,
        avatar,
        status
      };
      onUpdateTeacher(updated);
      onAddAuditLog('Edición de Docente', `Edición de datos para ${name} (${department})`);
      triggerToast('success', `Docente ${name} actualizado de manera exitosa.`);
    } else {
      // Create new
      const newTeacher: Teacher = {
        id: `t-${Date.now()}`,
        name,
        email,
        department,
        subjects,
        avatar,
        status,
        averageScore: 10.0, // default starting score
        evaluationsCount: 0
      };
      onAddTeacher(newTeacher);
      onAddAuditLog('Registro de Docente', `Registro de un nuevo docente: ${name}`);
      triggerToast('success', `Docente ${name} registrado correctamente.`);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (t: Teacher) => {
    const nextStatus = t.status === 'active' ? 'inactive' : 'active';
    const updated: Teacher = { ...t, status: nextStatus };
    onUpdateTeacher(updated);
    onAddAuditLog('Estatus de Docente Modificado', `Se cambió estatus de ${t.name} a ${nextStatus === 'active' ? 'Activo' : 'Inactivo'}`);
    triggerToast('success', `${t.name} ahora se encuentra ${nextStatus === 'active' ? 'Activo' : 'Inactivo'}.`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás completamente seguro de que deseas eliminar permanentemente al docente "${name}"? Esta acción removerá su historial de evaluaciones.`)) {
      onDeleteTeacher(id);
      onAddAuditLog('Eliminación de Docente', `Se dio de baja de manera definitiva al docente ${name}`);
      triggerToast('success', `Docente eliminado de manera definitiva.`);
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Toast alert system */}
      {feedback && (
        <div id="toast-notification" className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-xl transition-all duration-300 transform scale-100 ${
          feedback.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200' 
            : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertOctagon className="w-5 h-5 text-rose-400" />}
          <span className="text-xs font-bold leading-relaxed">{feedback.msg}</span>
        </div>
      )}

      {/* View Header with Add teacher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight">Registro y Control de Docentes</h1>
          <p className="text-xs text-slate-400">Inserta nuevos docentes, administra sus perfiles profesionales y actualiza materias impartidas.</p>
        </div>

        <button
          id="btn-add-teacher-modal"
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#F97316] hover:brightness-110 text-xs font-bold text-white shadow-lg shadow-purple-950/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Docente</span>
        </button>
      </div>

      {/* Teachers Directory Table */}
      <div className="bg-[#1E293B]/40 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="p-5 border-b border-white/5 bg-slate-950/20">
          <h3 className="text-sm font-extrabold text-white tracking-wider uppercase select-none">Listado de Personal Docente</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-slate-950/40 text-slate-400 select-none">
                <th className="p-4 font-bold uppercase tracking-wider">Docente</th>
                <th className="p-4 font-bold uppercase tracking-wider">Contacto</th>
                <th className="p-4 font-bold uppercase tracking-wider">Departamento / Escuela</th>
                <th className="p-4 font-bold uppercase tracking-wider">Materias</th>
                <th className="p-4 font-bold uppercase tracking-wider text-center">Estado</th>
                <th className="p-4 font-bold uppercase tracking-wider text-right">Promedio</th>
                <th className="p-4 font-bold uppercase tracking-wider text-right">Efectuar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {teachers.map((t) => (
                <tr 
                  key={t.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  {/* Name and avatar info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-[#1E293B]/40 flex-shrink-0 shadow">
                        <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <div className="font-bold text-white max-w-[170px] truncate">{t.name}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{t.id}</div>
                      </div>
                    </div>
                  </td>
                  {/* Contact details */}
                  <td className="p-4 text-slate-300">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#7C3AED]" />
                      <span>{t.email}</span>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-slate-300 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-[#F97316]" />
                      <span>{t.department}</span>
                    </div>
                  </td>

                  {/* Array of subjects */}
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {t.subjects.map((sub) => (
                        <span key={sub} className="text-[10px] leading-none px-2 py-1 rounded-md bg-white/5 border border-white/5 text-slate-400">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Active status slider button */}
                  <td className="p-4">
                    <div className="flex items-center justify-center">
                      <button
                        id={`btn-toggle-status-${t.id}`}
                        onClick={() => handleToggleStatus(t)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border transition cursor-pointer ${
                          t.status === 'active'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                        }`}
                        title={t.status === 'active' ? 'Desactivar Docente' : 'Activar Docente'}
                      >
                        <Power className="w-3 h-3" />
                        <span>{t.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                      </button>
                    </div>
                  </td>

                  {/* Rating averages */}
                  <td className="p-4 text-right">
                    <div className="font-mono font-bold text-white">{t.averageScore.toFixed(1)}</div>
                    <div className="text-[10px] text-slate-500">{t.evaluationsCount} registradas</div>
                  </td>

                  {/* Row Operations */}
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        id={`btn-edit-teacher-${t.id}`}
                        onClick={() => handleOpenEditModal(t)}
                        className="p-1.5 rounded-lg bg-slate-950 border border-violet-950/30 hover:border-violet-500 hover:text-violet-400 text-slate-400 transition cursor-pointer"
                        title="Editar Perfil"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        id={`btn-delete-teacher-${t.id}`}
                        onClick={() => handleDelete(t.id, t.name)}
                        className="p-1.5 rounded-lg bg-slate-950 border border-red-950/40 hover:border-red-500 hover:text-red-400 text-slate-500 transition cursor-pointer"
                        title="Remover de Base de Datos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor/Creation Form Modal */}
      {isModalOpen && (
        <div id="teacher-profile-modal" className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-lg bg-slate-900 border border-violet-900/40 rounded-3xl overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease-out]">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-950/60 border-b border-violet-950/45 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-bold text-white">
                  {editingTeacher ? 'Ajustar Datos del Docente' : 'Dar de Alta Nuevo Docente'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Photo Upload Circle representation */}
              <div className="flex items-center gap-4 bg-slate-950/30 p-4 rounded-2xl border border-violet-950/20">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border-2 border-dashed border-violet-800/40 hover:border-violet-500 transition flex items-center justify-center flex-shrink-0 group">
                  {avatar ? (
                    <img src={avatar} alt="Avatar cargado" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Upload className="w-5 h-5 text-slate-500 group-hover:text-violet-400" />
                  )}
                  <input 
                    id="teacher-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title="Cargar Fotografía"
                  />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-200">Subir Fotografía</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Formatos JPG/PNG aceptados. Tamaño ideal cuadrado (máximo de 1.5MB).</p>
                </div>
              </div>

              {/* Full Name input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Nombre Completo *</label>
                <input 
                  id="teacher-name-input"
                  type="text"
                  required
                  placeholder="Dra. Diana de la Vega"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-violet-950/40 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none transition"
                />
              </div>

              {/* Email contact input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Correo Institucional *</label>
                <input 
                  id="teacher-email-input"
                  type="email"
                  required
                  placeholder="diana.delavega@universidad.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-violet-950/40 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none transition"
                />
              </div>

              {/* Department Option select */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Departamento / División Académica *</label>
                <select
                  id="teacher-dept-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-violet-950/40 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none transition cursor-pointer"
                >
                  <option value="Ingeniería y Tecnología">Ingeniería y Tecnología</option>
                  <option value="Ciencias de la Computación">Ciencias de la Computación</option>
                  <option value="Diseño e Innovación">Diseño e Innovación</option>
                  <option value="Ciencias Sociales">Ciencias Sociales</option>
                  <option value="Ciencias Básicas">Ciencias Básicas</option>
                </select>
              </div>

              {/* Subjects text separated by comma */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none flex justify-between">
                  <span>Materias Impartidas *</span>
                  <span className="text-[9px] text-violet-400">Separar por comas</span>
                </label>
                <input 
                  id="teacher-subjects-input"
                  type="text"
                  required
                  placeholder="Introducción al Código, Programación Móvil, Kotlin III"
                  value={subjectsText}
                  onChange={(e) => setSubjectsText(e.target.value)}
                  className="w-full bg-slate-950 border border-violet-950/40 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none transition"
                />
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Estado de Cuenta</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer select-none">
                    <input 
                      id="teacher-status-active-radio"
                      type="radio" 
                      name="status" 
                      checked={status === 'active'}
                      onChange={() => setStatus('active')}
                      className="accent-violet-600"
                    />
                    <span>Activo (Elegible para Cuestionarios)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer select-none">
                    <input 
                      id="teacher-status-inactive-radio"
                      type="radio" 
                      name="status" 
                      checked={status === 'inactive'}
                      onChange={() => setStatus('inactive')}
                      className="accent-violet-600"
                    />
                    <span>Inactivo (Excluido)</span>
                  </label>
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="border-t border-violet-950/35 pt-5 flex justify-end gap-3.5">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-violet-950/30 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  id="btn-submit-teacher-form"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-orange-500 hover:from-violet-500 hover:to-orange-400 text-xs font-bold text-white shadow-lg shadow-violet-950/40 transition cursor-pointer"
                >
                  {editingTeacher ? 'Guardar Cambios' : 'Registrar Docente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
