import { useState } from 'react';
import { EvaluationResult, AuditLog } from '../types';
import { 
  Search, 
  Edit3, 
  Trash2, 
  Clock, 
  ShieldCheck, 
  Filter, 
  AlertTriangle,
  ChevronRight,
  Database,
  X,
  Plus
} from 'lucide-react';

interface AdvancedDataGridProps {
  evaluations: EvaluationResult[];
  auditLogs: AuditLog[];
  onUpdateEvaluation: (ev: EvaluationResult) => void;
  onDeleteEvaluation: (id: string) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function AdvancedDataGrid({
  evaluations,
  auditLogs,
  onUpdateEvaluation,
  onDeleteEvaluation,
  onAddAuditLog
}: AdvancedDataGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Todos');

  // Selected for edits
  const [editingResult, setEditingResult] = useState<EvaluationResult | null>(null);
  
  // Custom temporary questions marks editor state: questionId -> value
  const [tempAnswers, setTempAnswers] = useState<{ [qId: string]: number | string }>({});

  const groups = ['Todos', ...Array.from(new Set(evaluations.map(e => e.group)))];

  const filteredEvaluations = evaluations.filter(e => {
    const matchesSearch = e.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === 'Todos' || e.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleOpenEdit = (ev: EvaluationResult) => {
    setEditingResult(ev);
    setTempAnswers({ ...ev.answers });
  };

  const handleAnswerScoreChange = (qId: string, val: number) => {
    setTempAnswers({
      ...tempAnswers,
      [qId]: val
    });
  };

  const handleCommentChange = (qId: string, text: string) => {
    setTempAnswers({
      ...tempAnswers,
      [qId]: text
    });
  };

  const handleSaveEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;

    const originalAnswers = { ...editingResult.answers };
    const updated: EvaluationResult = {
      ...editingResult,
      answers: tempAnswers
    };

    onUpdateEvaluation(updated);
    
    // Construct dynamic description of modified markers
    let loggedDiff = '';
    Object.keys(tempAnswers).forEach(qKey => {
      if (originalAnswers[qKey] !== tempAnswers[qKey]) {
        loggedDiff += `[Reactor ${qKey}: de ${originalAnswers[qKey]} a ${tempAnswers[qKey]}] `;
      }
    });

    onAddAuditLog(
      'Evaluación Modificada', 
      `Se editaron calificaciones de ${editingResult.teacherName} (ID: ${editingResult.id}). Cambios: ${loggedDiff || 'Sin cambios numéricos'}`
    );

    setEditingResult(null);
  };

  const handleDelete = (id: string, teacher: string) => {
    if (confirm(`¿Seguro de remover la evaluación para el docente "${teacher}"? Esta acción recalculará los promedios automáticamente.`)) {
      onDeleteEvaluation(id);
      onAddAuditLog('Evaluación Eliminada', `Removida evaluación ${id} para el docente ${teacher}`);
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Dynamic search control header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/60 border border-violet-950/40 rounded-3xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Edición Avanzada y Pivot Universitario</h2>
          <p className="text-xs text-slate-400">Modifica criterios de forma, ajusta respuestas y reconcilia calificaciones con auditoría histórica.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input 
              id="grid-search-input"
              type="text"
              placeholder="Buscar por docente o materia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-violet-950/40 focus:border-violet-500 outline-none rounded-xl pl-9 pr-4 py-2 w-full sm:w-60 text-xs text-slate-300"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <select
            id="grid-group-select"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="bg-slate-950 border border-violet-950/40 focus:border-violet-500 outline-none rounded-xl px-3 py-2 text-xs text-slate-300 cursor-pointer"
          >
            <option value="Todos">Todos los Grupos</option>
            {groups.filter(g => g !== 'Todos').map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main evaluations list block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Table representation - 7 Columns */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-violet-950/40 rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-violet-950/30 flex justify-between items-center select-none">
            <h3 className="text-xs font-extrabold text-white tracking-wider uppercase">Registros de Evaluaciones</h3>
            <span className="text-[10px] text-slate-500">Filtrados: {filteredEvaluations.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-violet-950/30 bg-slate-950/40 text-slate-400 select-none">
                  <th className="p-4 uppercase tracking-wider font-bold">Docente</th>
                  <th className="p-4 uppercase tracking-wider font-bold">Clase / Grupo</th>
                  <th className="p-4 uppercase tracking-wider font-bold">Evaluador / Rol</th>
                  <th className="p-4 uppercase tracking-wider font-bold text-center">Score Promedio</th>
                  <th className="p-4 uppercase tracking-wider font-bold text-right">Efectuar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-950/15">
                {filteredEvaluations.map((ev) => {
                  // Calculate average scale answers for this single evaluation
                  const scaleVals = Object.keys(ev.answers)
                    .filter(key => typeof ev.answers[key] === 'number')
                    .map(key => Number(ev.answers[key]));
                  const avg = scaleVals.length > 0 
                    ? (scaleVals.reduce((acc, v) => acc + v, 0) / scaleVals.length).toFixed(1)
                    : 'N/A';

                  return (
                    <tr key={ev.id} className="hover:bg-slate-800/15 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{ev.teacherName}</div>
                        <div className="text-[10px] text-slate-500">{ev.subject}</div>
                      </td>

                      <td className="p-4 text-slate-300 font-medium">
                        <div>{ev.group}</div>
                        <div className="text-[10px] text-slate-500">{ev.semester}</div>
                      </td>

                      <td className="p-4 text-slate-300">
                        <div className="flex flex-col">
                          <span className="font-semibold">{ev.isAnonymous ? '🔑 Alumno Anónimo' : ev.evaluatorName}</span>
                          <span className="text-[10px] text-violet-400 font-bold tracking-wider uppercase">{ev.evaluatorRole}</span>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-500/10 text-violet-400 border border-violet-500/25">
                          {avg}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            id={`grid-edit-btn-${ev.id}`}
                            onClick={() => handleOpenEdit(ev)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-violet-950/30 hover:border-violet-500 hover:text-violet-400 text-slate-400 transition cursor-pointer"
                            title="Modificar Respuestas"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`grid-delete-btn-${ev.id}`}
                            onClick={() => handleDelete(ev.id, ev.teacherName)}
                            className="p-1.5 rounded-lg bg-slate-950 border border-red-950/40 hover:border-red-500 hover:text-red-400 text-slate-500 transition cursor-pointer"
                            title="Eliminar de Registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredEvaluations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-xs text-slate-500 select-none">
                      No encontramos registros de evaluaciones.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log / Historical trail - 4 Columns */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-violet-950/40 rounded-3xl p-5 flex flex-col justify-between h-full min-h-[420px]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-5 h-5 text-orange-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Historial de Auditoría</h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-5">Seguimiento obligatorio de modificaciones de rúbricas e inserción de perfiles.</p>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-950/40 border border-violet-950/15 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span className="text-violet-400 font-bold">{log.user}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-200">{log.action}</h5>
                  <p className="text-[10px] text-slate-400 leading-normal">{log.details}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-violet-950/20 pt-4 mt-4 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
            <Database className="w-4 h-4 text-violet-400" />
            <span>Respaldado con Hashing Apps Script</span>
          </div>
        </div>
      </div>

      {/* Editor Modal Overlay */}
      {editingResult && (
        <div id="grid-edit-result-modal" className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-lg bg-slate-900 border border-violet-900/40 rounded-3xl overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease-out]">
            
            <div className="p-6 bg-slate-950/60 border-b border-violet-950/45 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-orange-400 tracking-wider uppercase">Auditoría de Rubros</span>
                <h3 className="text-sm font-bold text-white mt-1">Ajuste de Evaluaciones</h3>
              </div>
              <button onClick={() => setEditingResult(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdits} className="p-6 space-y-5">
              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Cualquier cambio efectuado sobre este formulario será registrado en la bitácora de auditoría histórica con tu firma de usuario.</span>
              </div>

              {/* Loop inputs */}
              <div className="space-y-4 max-h-[290px] overflow-y-auto pr-1">
                {Object.keys(tempAnswers).map((qId, i) => {
                  const val = tempAnswers[qId];
                  const isNumberVal = typeof val === 'number';

                  return (
                    <div key={qId} className="space-y-1.5 p-3 rounded-xl bg-slate-950/40 border border-violet-950/10">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">REACTOR {i+1}</div>
                      
                      {isNumberVal ? (
                        <div className="flex items-center gap-3">
                          <input 
                            id={`grid-temp-score-input-${qId}`}
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={val}
                            onChange={(e) => handleAnswerScoreChange(qId, Number(e.target.value))}
                            className="w-full accent-orange-500 bg-slate-900 cursor-pointer h-1.5 rounded-lg"
                          />
                          <span className="font-mono text-xs font-bold text-orange-400 w-8 text-center bg-slate-900 border border-violet-950/35 p-1 rounded-md">
                            {val}
                          </span>
                        </div>
                      ) : (
                        <textarea 
                          id={`grid-temp-comment-input-${qId}`}
                          rows={2}
                          value={val}
                          onChange={(e) => handleCommentChange(qId, e.target.value)}
                          className="w-full bg-slate-950 border border-violet-950/45 focus:border-violet-500 outline-none rounded-xl px-3 py-1.5 text-xs text-slate-200 resize-none"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-violet-950/35 pt-5 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setEditingResult(null)}
                  className="px-4.5 py-2.5 rounded-xl bg-slate-950 border border-violet-950/30 text-xs font-bold text-slate-300 hover:text-white transition"
                >
                  Regresar
                </button>
                <button
                  id="btn-grid-submit-edit"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-orange-500 text-xs font-bold text-white shadow-lg shadow-violet-950/40 transition"
                >
                  Escribir Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
