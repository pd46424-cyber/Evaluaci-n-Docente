import { useState, useEffect } from 'react';
import { EvaluationTemplate, Question } from '../types';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Settings, 
  Clipboard, 
  Eye, 
  X,
  Sparkles,
  HelpCircle,
  Clock,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface EvaluationsViewProps {
  templates: EvaluationTemplate[];
  onAddTemplate: (temp: EvaluationTemplate) => void;
  onUpdateTemplate: (temp: EvaluationTemplate) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function EvaluationsView({
  templates,
  onAddTemplate,
  onUpdateTemplate,
  onAddAuditLog
}: EvaluationsViewProps) {
  // Designer states
  const [selectedTemplate, setSelectedTemplate] = useState<EvaluationTemplate | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form states for new template
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  // Question editing workspace
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingType, setEditingType] = useState<'scale' | 'comment'>('scale');
  const [editingCategory, setEditingCategory] = useState<'Metodología' | 'Comunicación' | 'Empatía' | 'Evaluación' | 'General'>('General');

  // Guardado Automático indicator
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  // Trigger auto-saving effect on questions changes
  useEffect(() => {
    if (selectedTemplate) {
      setAutoSaveStatus('saving');
      const timer = setTimeout(() => {
        onUpdateTemplate({
          ...selectedTemplate,
          questions
        });
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 1500);
      }, 1000); // 1s debounce for auto-save
      return () => clearTimeout(timer);
    }
  }, [questions]);

  const handleOpenCreator = () => {
    setNewTitle('');
    setNewDesc('');
    setQuestions([
      { id: 'q-s-1', text: '¿El docente explica con claridad?', type: 'scale', category: 'Metodología' },
      { id: 'q-s-2', text: 'Retroalimentación u sugerencia abierta:', type: 'comment', category: 'General' }
    ]);
    setIsCreatorOpen(true);
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newTemp: EvaluationTemplate = {
      id: `temp-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      questions,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddTemplate(newTemp);
    onAddAuditLog('Diseño de Evaluación', `Se diseñó la nueva evaluación: ${newTitle}`);
    setSelectedTemplate(newTemp);
    setIsCreatorOpen(false);
  };

  // Switch or load template details
  const handleSelectTemplate = (temp: EvaluationTemplate) => {
    setSelectedTemplate(temp);
    setQuestions(temp.questions);
  };

  const handleToggleTemplateStatus = (temp: EvaluationTemplate) => {
    const updated = { ...temp, isActive: !temp.isActive };
    onUpdateTemplate(updated);
    if (selectedTemplate?.id === temp.id) {
      setSelectedTemplate(updated);
    }
    onAddAuditLog('Calificación Estatus', `Se ${updated.isActive ? 'activó' : 'desactivó'} plantilla: ${temp.title}`);
  };

  // Reordering (Drag and Drop replacement using index movers)
  const moveQuestion = (idx: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= questions.length) return;

    const reordered = [...questions];
    const targetItem = reordered[idx];
    reordered[idx] = reordered[nextIdx];
    reordered[nextIdx] = targetItem;
    
    setQuestions(reordered);
    onAddAuditLog('Reordenamiento de preguntas', `Se reorganizó el orden de preguntas de la plantilla`);
  };

  // Add a brand-new blank question
  const handleAddQuestion = () => {
    const newQ: Question = {
      id: `q-designer-${Date.now()}`,
      text: '¿Nueva pregunta personalizada de escala?',
      type: 'scale',
      category: 'General'
    };
    setQuestions([...questions, newQ]);
  };

  const handleDeleteQuestion = (qId: string) => {
    setQuestions(questions.filter(q => q.id !== qId));
    if (editingQuestionId === qId) {
      setEditingQuestionId(null);
    }
  };

  // Trigger edits
  const handleStartEdit = (q: Question) => {
    setEditingQuestionId(q.id);
    setEditingText(q.text);
    setEditingType(q.type);
    setEditingCategory(q.category);
  };

  const handleSaveQuestionEdit = () => {
    if (!editingQuestionId) return;

    setQuestions(questions.map(q => {
      if (q.id === editingQuestionId) {
        return {
          ...q,
          text: editingText,
          type: editingType,
          category: editingCategory
        };
      }
      return q;
    }));

    setEditingQuestionId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Templates Selector List - 5 Columns */}
      <div className="lg:col-span-5 space-y-5">
        <div className="p-6 bg-slate-900/60 border border-violet-950/40 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Estructura de Evaluaciones</h2>
              <p className="text-xs text-slate-500 mt-0.5">Define las matrices de preguntas.</p>
            </div>
            <button
              id="btn-designer-create-modal"
              onClick={handleOpenCreator}
              className="p-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 border border-violet-500/40 text-violet-400 hover:text-white transition cursor-pointer"
              title="Crear Nueva Plantilla"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {templates.map((temp) => {
              const isSelected = selectedTemplate?.id === temp.id;
              return (
                <div 
                  key={temp.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-r from-violet-950/45 to-orange-950/15 border-violet-500' 
                      : 'bg-slate-950/40 border-violet-950/25 hover:border-violet-900/40'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div 
                      onClick={() => handleSelectTemplate(temp)}
                      className="flex-1 cursor-pointer"
                    >
                      <h4 className="text-xs font-bold text-slate-100">{temp.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{temp.description}</p>
                    </div>

                    <button
                      id={`btn-toggle-active-template-${temp.id}`}
                      onClick={() => handleToggleTemplateStatus(temp)}
                      className="text-slate-500 hover:text-violet-400 transition cursor-pointer"
                      title={temp.isActive ? 'Desactivar Plantilla' : 'Activar Plantilla'}
                    >
                      {temp.isActive 
                        ? <ToggleRight className="w-6 h-6 text-orange-500" /> 
                        : <ToggleLeft className="w-6 h-6 text-slate-700" />}
                    </button>
                  </div>

                  <div className="border-t border-violet-950/15 pt-2.5 mt-3 flex items-center justify-between text-[10px] text-slate-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{temp.createdAt}</span>
                    </span>
                    <span>{temp.questions.length} Criterios</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Editor Canvas Area - 7 Columns */}
      <div className="lg:col-span-7">
        {selectedTemplate ? (
          <div className="bg-slate-900/60 border border-violet-950/40 rounded-3xl p-6 space-y-6">
            
            {/* Template Header Workspace */}
            <div className="flex items-start justify-between border-b border-violet-950/30 pb-4">
              <div>
                <span className="text-[9px] font-extrabold text-orange-400 tracking-wider uppercase">Diseñador Activo</span>
                <h2 className="text-base font-bold text-white mt-1">{selectedTemplate.title}</h2>
                <p className="text-xs text-slate-400 mt-1">{selectedTemplate.description}</p>
              </div>

              {/* Status Indicator */}
              <div className="text-right flex flex-col items-end gap-1.5 select-none">
                {autoSaveStatus === 'saving' && (
                  <span className="flex items-center gap-1.5 text-[9px] text-orange-400 font-bold bg-orange-500/10 border border-orange-500/25 px-2.5 py-1 rounded-full animate-pulse">
                    <Clock className="w-3 h-3 animate-spin" />
                    <span>Guardando...</span>
                  </span>
                )}
                {autoSaveStatus === 'saved' && (
                  <span className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span>Cambios Guardados</span>
                  </span>
                )}
                {autoSaveStatus === 'idle' && (
                  <span className="text-[10px] text-slate-500">Auto-guardado activo</span>
                )}

                <button 
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-violet-950/40 text-[10px] text-slate-300 font-semibold cursor-pointer transition select-none"
                >
                  <Eye className="w-3.5 h-3.5 text-violet-400" />
                  <span>Cuestionario Demo</span>
                </button>
              </div>
            </div>

            {/* Questions list with drag-move representation */}
            <div className="space-y-4">
              <div className="flex justify-between items-center select-none">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reactores / Preguntas</h4>
                <button
                  id="btn-designer-add-question"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl bg-violet-600/15 border border-violet-500/25 hover:bg-violet-600 hover:text-white text-xs font-bold text-violet-400 cursor-pointer transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Reactivo</span>
                </button>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isEditing = editingQuestionId === q.id;

                  return (
                    <div 
                      key={q.id}
                      className={`p-4 rounded-2xl bg-slate-950/40 border transition-all ${
                        isEditing ? 'border-violet-500 shadow-lg shadow-violet-950/20' : 'border-violet-950/15'
                      }`}
                    >
                      {isEditing ? (
                        /* Inline Editor block */
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Texto de la Pregunta</label>
                            <input 
                              id="designer-question-edit-text"
                              type="text"
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full bg-slate-900 border border-violet-950/40 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Tipo de Respuesta</label>
                              <select 
                                id="designer-question-edit-type"
                                value={editingType}
                                onChange={(e) => setEditingType(e.target.value as 'scale' | 'comment')}
                                className="w-full bg-slate-900 border border-violet-950/40 focus:border-violet-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none"
                              >
                                <option value="scale">Escala del 1 al 10 (Numérico)</option>
                                <option value="comment">Comentarios Abiertos (Texto)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Categoría Pedagógica</label>
                              <select 
                                id="designer-question-edit-category"
                                value={editingCategory}
                                onChange={(e) => setEditingCategory(e.target.value as any)}
                                className="w-full bg-slate-900 border border-violet-950/40 focus:border-violet-500 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none"
                              >
                                <option value="Metodología">Metodología</option>
                                <option value="Comunicación">Comunicación</option>
                                <option value="Empatía">Empatía</option>
                                <option value="Evaluación">Evaluación</option>
                                <option value="General">General</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1 border-t border-violet-950/15">
                            <button
                              type="button"
                              onClick={() => setEditingQuestionId(null)}
                              className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-[11px] font-bold text-slate-400 hover:text-white"
                            >
                              Cancelar
                            </button>
                            <button
                              id="btn-designer-save-question"
                              type="button"
                              onClick={handleSaveQuestionEdit}
                              className="px-3.5 py-1.5 rounded-lg bg-violet-600 text-[11px] font-bold text-white hover:bg-violet-500"
                            >
                              Completar
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Visual Row */
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Drag elements representation buttons */}
                            <div className="flex flex-col gap-1 items-center justify-center flex-shrink-0">
                              <button 
                                onClick={() => moveQuestion(idx, 'up')}
                                disabled={idx === 0}
                                className="p-0.5 rounded text-slate-600 hover:text-violet-400 disabled:opacity-20 cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => moveQuestion(idx, 'down')}
                                disabled={idx === questions.length - 1}
                                className="p-0.5 rounded text-slate-600 hover:text-violet-400 disabled:opacity-20 cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-violet-500 font-bold">#{idx + 1}</span>
                                <span className="text-[9px] tracking-wider py-0.5 px-2 rounded-full bg-slate-900 border border-violet-950/30 text-slate-400 font-bold uppercase">
                                  {q.category}
                                </span>
                                <span className="text-[9px] text-slate-500">
                                  {q.type === 'scale' ? 'Escala 1-10' : 'Abierta'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-200 mt-1 font-medium">{q.text}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleStartEdit(q)}
                              className="p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-violet-950/20 text-slate-400 hover:text-violet-300 transition cursor-pointer"
                              title="Editar reactivo"
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-red-950/20 text-slate-500 hover:text-red-400 transition cursor-pointer"
                              title="Suprimir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-900/60 border border-violet-950/40 rounded-3xl min-h-[420px]">
            <Clipboard className="w-12 h-12 text-violet-900/40 mb-3" />
            <h4 className="text-sm font-bold text-slate-400">Seleccionar Plantilla de Aula</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1.5">Haz clic sobre un diseño evaluador de la izquierda o crea uno nuevo para ordenar reactivos y configurar guardado automático.</p>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {isCreatorOpen && (
        <div id="eval-creator-modal" className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-md bg-slate-900 border border-violet-900/40 rounded-3xl overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease-out]">
            <div className="p-6 bg-slate-950/60 border-b border-violet-950/45 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-bold text-white">Nueva Evaluación Personalizada</h3>
              </div>
              <button onClick={() => setIsCreatorOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Título del Formulario *</label>
                <input 
                  id="designer-new-title-input"
                  type="text"
                  required
                  placeholder="Evaluación Trimestral de Posgrado"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-violet-950/40 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Descripción / Objetivo Académico *</label>
                <textarea 
                  id="designer-new-desc-input"
                  required
                  rows={3}
                  placeholder="Por favor evalúa objetivamente los reactores con el fin de robustecer el proceso pedagógico..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-violet-950/40 focus:border-violet-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none resize-none"
                />
              </div>

              <div className="p-3 bg-slate-950/30 rounded-2xl border border-violet-950/20 text-[11px] text-slate-400 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <span>Al crear la plantilla, esta se iniciará de forma predeterminada con una pregunta escala y un campo comentario para que comiences tu edición.</span>
              </div>

              <div className="border-t border-violet-950/35 pt-5 flex justify-end gap-3.5">
                <button 
                  type="button"
                  onClick={() => setIsCreatorOpen(false)}
                  className="px-4.5 py-2.5 rounded-xl bg-slate-950 border border-violet-950/30 text-xs font-bold text-slate-300 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button 
                  id="btn-designer-submit-new-template"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-orange-500 text-xs font-bold text-white shadow-lg shadow-violet-950/40 transition"
                >
                  Crear e Inicializar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Cuestionario Demo Modal */}
      {isPreviewOpen && selectedTemplate && (
        <div id="eval-preview-modal" className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-40 animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-xl bg-slate-900 border border-violet-900/40 rounded-3xl overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease-out]">
            <div className="p-6 bg-slate-950/60 border-b border-violet-950/45 flex items-center justify-between">
              <span className="text-xs font-bold text-violet-400">Demostración Visual del Cuestionario</span>
              <button onClick={() => setIsPreviewOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
              <div className="p-4 rounded-2xl bg-violet-600/10 border border-violet-850/40 text-center">
                <h4 className="text-sm font-bold text-white mb-1">{selectedTemplate.title}</h4>
                <p className="text-xs text-slate-400">{selectedTemplate.description}</p>
              </div>

              {questions.map((q, i) => (
                <div key={q.id} className="space-y-2.5">
                  <div className="flex gap-2">
                    <span className="text-xs font-bold font-mono text-orange-400">{i+1}.</span>
                    <h5 className="text-xs font-bold text-slate-200">{q.text}</h5>
                  </div>

                  {q.type === 'scale' ? (
                    <div className="flex justify-between items-center gap-1.5 p-2 bg-slate-950/40 border border-violet-950/20 rounded-xl">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                        <div 
                          key={val} 
                          className="w-8 h-8 rounded-lg bg-slate-900 border border-violet-950/30 flex items-center justify-center text-[10px] font-bold text-slate-400 hover:border-violet-500 cursor-not-allowed select-none"
                        >
                          {val}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <textarea 
                      disabled
                      rows={2}
                      placeholder="Espacio para comentarios del estudiante..."
                      className="w-full bg-slate-950/60 border border-violet-850/30 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed outline-none resize-none"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-950/60 border-t border-violet-950/40 flex justify-end">
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-violet-600 font-bold text-xs text-white"
              >
                Cerrar Demostración
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
