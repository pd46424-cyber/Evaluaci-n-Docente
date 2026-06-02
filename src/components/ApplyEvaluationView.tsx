import { useState } from 'react';
import { 
  Teacher, 
  EvaluationTemplate, 
  EvaluationResult, 
  UserProfile 
} from '../types';
import { 
  Sparkles, 
  CheckCircle, 
  ShieldAlert, 
  ChevronRight, 
  Smile, 
  Meh, 
  Frown, 
  UserCheck, 
  AlertCircle,
  ClipboardList
} from 'lucide-react';

interface ApplyEvaluationViewProps {
  teachers: Teacher[];
  templates: EvaluationTemplate[];
  user: UserProfile;
  onSubmitResult: (result: EvaluationResult) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export default function ApplyEvaluationView({
  teachers,
  templates,
  user,
  onSubmitResult,
  onAddAuditLog
}: ApplyEvaluationViewProps) {
  // Wizard steps: 0 = Selection, 1 = Filling Questionnaires, 2 = Success Landing
  const [step, setStep] = useState(0);

  // Selections
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [group, setGroup] = useState(user.group || '');
  const [semester, setSemester] = useState(user.semester || '');
  const [isAnonymous, setIsAnonymous] = useState(true);

  // Questionnaire responses state: questionId -> value (number or string)
  const [answers, setAnswers] = useState<{ [qId: string]: number | string }>({});

  const [formError, setFormError] = useState('');

  // Loaded target items
  const activeTeachers = teachers.filter(t => t.status === 'active');
  const activeTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const handleStartEvaluation = () => {
    if (!selectedTeacherId || !selectedTemplateId || !subject.trim() || !group.trim() || !semester.trim()) {
      setFormError('Por favor completa todos los datos de asignación obligatorios.');
      return;
    }
    setFormError('');

    // Pre-populate answers with defaults
    const initialAnswers: { [qId: string]: number | string } = {};
    activeTemplate.questions.forEach(q => {
      initialAnswers[q.id] = q.type === 'scale' ? 8 : ''; // middle/high rating default
    });

    setAnswers(initialAnswers);
    setStep(1);
  };

  const handleScoreChange = (qId: string, val: number) => {
    setAnswers({
      ...answers,
      [qId]: val
    });
  };

  const handleCommentChange = (qId: string, text: string) => {
    setAnswers({
      ...answers,
      [qId]: text
    });
  };

  const calculateEmoji = (val: number) => {
    if (val >= 9.0) return <Smile className="w-6 h-6 text-orange-500 animate-bounce" />;
    if (val >= 6.5) return <Meh className="w-6 h-6 text-violet-400" />;
    return <Frown className="w-6 h-6 text-red-500 animate-pulse" />;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verification check inside scale answers
    const scaleQuestions = activeTemplate.questions.filter(q => q.type === 'scale');
    const commentQuestions = activeTemplate.questions.filter(q => q.type === 'comment');

    let validationFailed = false;

    scaleQuestions.forEach(q => {
      const val = Number(answers[q.id]);
      if (isNaN(val) || val < 1 || val > 10) {
        validationFailed = true;
      }
    });

    if (validationFailed) {
      setFormError('Revisa tus respuestas de escala. Todas deben tener una valoración del 1 al 10.');
      return;
    }

    const teacher = teachers.find(t => t.id === selectedTeacherId)!;

    const result: EvaluationResult = {
      id: `ev-new-${Date.now()}`,
      teacherId: selectedTeacherId,
      teacherName: teacher.name,
      templateId: selectedTemplateId,
      templateTitle: activeTemplate.title,
      subject,
      group,
      semester,
      answers,
      isAnonymous,
      timestamp: new Date().toISOString(),
      evaluatorRole: user.role === 'Alumno' ? 'Alumno' : user.role === 'Coordinador' ? 'Coordinador' : 'Administrador',
      evaluatorName: isAnonymous ? undefined : user.name
    };

    onSubmitResult(result);
    onAddAuditLog(
      'Evaluación Enviada', 
      `Evaluación para ${teacher.name} bajo cuestionario "${activeTemplate.title}" (${subject}-${group})`
    );
    setStep(2);
  };

  const handleReset = () => {
    setSelectedTeacherId('');
    setSubject('');
    setAnswers({});
    setFormError('');
    setStep(0);
  };

  return (
    <div className="max-w-2xl mx-auto animate-[fadeIn_0.3s_ease-out]">
      {step === 0 && (
        /* Step 0: Classroom & Teacher selection */
        <div className="bg-slate-900/60 border border-violet-950/40 rounded-3xl p-6 space-y-5">
          <div className="text-center space-y-1.5 pb-4 border-b border-violet-950/30">
            <div className="inline-flex p-2.5 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-400 mb-2">
              <ClipboardList className="w-6 h-6 text-orange-400" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">Cuestionario Evaluador Estudiantil</h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto">Selecciona tu profesor, materia y grupo para iniciar la retroalimentación institucional confidencial.</p>
          </div>

          <div className="space-y-4">
            {formError && (
              <div id="form-error-block" className="p-3.5 bg-rose-950/60 border border-rose-500/30 text-xs text-rose-300 rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Teacher Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Docente a Evaluar *</label>
              <select
                id="apply-teacher-select"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full bg-slate-950 border border-violet-950/40 focus:border-violet-500 outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-200 cursor-pointer"
              >
                <option value="">Selecciona al titular...</option>
                {activeTeachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} - {t.department}</option>
                ))}
              </select>
            </div>

            {/* Template Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Plantilla Evaluativa *</label>
              <select
                id="apply-template-select"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full bg-slate-950 border border-violet-950/40 focus:border-violet-500 outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-200 cursor-pointer"
              >
                <option value="">Selecciona plantilla...</option>
                {templates.filter(t => t.isActive).map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Materia / Unidad de Aprendizaje *</label>
              <input 
                id="apply-subject-input"
                type="text"
                placeholder="Introducción al Código Core, Algoritmia Avanzada"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-violet-950/40 focus:border-violet-500 outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-200"
              />
            </div>

            {/* Group & Semester side-by-side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Grupo *</label>
                <input 
                  id="apply-group-input"
                  type="text"
                  placeholder="8-A, 4-B, 2-C"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="w-full bg-slate-950 border border-violet-950/40 focus:border-violet-500 outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">Semestre *</label>
                <input 
                  id="apply-semester-input"
                  type="text"
                  placeholder="Octavo Semestre"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full bg-slate-950 border border-violet-950/40 focus:border-violet-500 outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-200"
                />
              </div>
            </div>

            {/* Anonymous Toggle representation */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-violet-950/25 flex items-center justify-between select-none">
              <div className="flex gap-3">
                <ShieldAlert className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-slate-200">Garantía de Anonimato</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Oculta tu nombre de los reportes. El docente solo recibirá el análisis consolidado.</p>
                </div>
              </div>
              <button
                id="btn-apply-toggle-anon"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition ${
                  isAnonymous 
                    ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400' 
                    : 'bg-violet-600/20 border border-violet-500/30 text-violet-400'
                }`}
              >
                {isAnonymous ? 'Anónimo' : 'No Anónimo'}
              </button>
            </div>

            <button
              id="btn-apply-start-evaluation"
              onClick={handleStartEvaluation}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-orange-500 hover:from-violet-500 hover:to-orange-400 text-xs font-extrabold text-white shadow-xl shadow-violet-950/40 cursor-pointer transition select-none"
            >
              <span>Ingresar Cuestionario</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        /* Step 1: Solving evaluations */
        <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-violet-950/40 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-violet-950/20">
            <div>
              <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest block">Evaluando Titular</span>
              <h3 className="text-sm font-bold text-white mt-1">
                {teachers.find(t=>t.id === selectedTeacherId)?.name}
              </h3>
            </div>
            
            <div className="text-right">
              <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-950 border border-violet-950/45 text-orange-400">
                {isAnonymous ? '🔐 Confidencial' : '🔓 Visible'}
              </span>
            </div>
          </div>

          <div className="space-y-6 max-h-[440px] overflow-y-auto pr-1">
            {activeTemplate.questions.map((q, idx) => {
              const rating = Number(answers[q.id]) || 8;
              return (
                <div key={q.id} className="space-y-3.5 bg-slate-950/25 p-4 rounded-2xl border border-violet-950/15">
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-xs font-bold text-violet-500">{idx+1}.</span>
                    <div>
                      <span className="inline-block text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 bg-slate-900 border border-violet-950/40 rounded-md text-slate-500 mb-1">
                        {q.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200 leading-relaxed">{q.text}</h4>
                    </div>
                  </div>

                  {q.type === 'scale' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4 p-2 bg-slate-950/50 rounded-xl border border-violet-950/30">
                        {calculateEmoji(rating)}
                        
                        <div className="flex-1 flex justify-between gap-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => {
                            const isCurrent = rating === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                id={`apply-btn-scale-${q.id}-${val}`}
                                onClick={() => handleScoreChange(q.id, val)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer select-none ${
                                  isCurrent 
                                    ? 'bg-gradient-to-b from-orange-400 to-orange-500 text-white shadow-md' 
                                    : 'bg-slate-900 text-slate-500 hover:text-white border border-violet-950/25'
                                }`}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Necesita mejora drástica</span>
                        <span>Materia y docencia impecable</span>
                      </div>
                    </div>
                  ) : (
                    <textarea 
                      required
                      id={`apply-comment-input-${q.id}`}
                      rows={3}
                      value={answers[q.id]?.toString() || ''}
                      onChange={(e) => handleCommentChange(q.id, e.target.value)}
                      placeholder="Comparte comentarios constructivos, dinámicas destacables o problemas de aula..."
                      className="w-full bg-slate-950 border border-violet-950/45 focus:border-violet-500 outline-none rounded-xl px-3 py-2 text-xs text-slate-200 resize-none transition"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-violet-950/30 pt-5 flex justify-between gap-4">
            <button 
              type="button"
              onClick={() => setStep(0)}
              className="px-4.5 py-2.5 rounded-xl bg-slate-950 border border-violet-950/30 text-xs font-bold text-slate-400 hover:text-white transition"
            >
              Atrás
            </button>
            <button
              id="btn-apply-submit"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-orange-500 hover:from-violet-500 hover:to-orange-400 text-xs font-extrabold text-white shadow-xl shadow-violet-950/40 cursor-pointer transition"
            >
              Completar y Guardar Evaluación
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        /* Step 2: Success Landing */
        <div className="bg-slate-900/60 border border-violet-950/40 rounded-3xl p-8 text-center space-y-5 animate-[scaleIn_0.2s_ease-out]">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center mx-auto mb-2 animate-bounce">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-lg font-black text-white">¡Evaluación Radicada de Manera Exitosa!</h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Tus respuestas ya se encuentran registradas y listas para su sincronización mensual con la hoja de cálculo de Google Sheets.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-violet-950/20 max-w-sm mx-auto text-left space-y-1.5">
            <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest select-none">Detalles del Envío</div>
            <div className="text-xs text-slate-300">Profesor: <strong>{teachers.find(t=>t.id===selectedTeacherId)?.name}</strong></div>
            <div className="text-xs text-slate-300">Asignatura: <strong>{subject}</strong></div>
            <div className="text-xs text-slate-300">Grupo / Aula: <strong>{group}</strong></div>
            <div className="text-xs text-slate-400 text-[10px] pt-1">Timestamp: {new Date().toLocaleString()}</div>
          </div>

          <div className="pt-2">
            <button
              id="btn-apply-reset"
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600/20 to-orange-500/10 hover:bg-violet-600 border border-violet-500/30 text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer"
            >
              Efectuar Otra Evaluación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
