import { useState } from 'react';
import { 
  Teacher, 
  EvaluationResult 
} from '../types';
import { 
  mockTeachers, 
  mockEvaluations, 
  getAIRecommendations 
} from '../mockData';
import { 
  Search, 
  TrendingUp, 
  Award, 
  Users, 
  Sparkles, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  HeartHandshake, 
  BarChart2, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { exportToCSV, exportToExcel, printPDFReport } from '../utils/reportExporter';

interface DashboardViewProps {
  teachers: Teacher[];
  evaluations: EvaluationResult[];
  userRole: string;
  loggedTeacherId?: string;
}

export default function DashboardView({ 
  teachers, 
  evaluations, 
  userRole, 
  loggedTeacherId 
}: DashboardViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('Todos');
  const [compareT1, setCompareT1] = useState('');
  const [compareT2, setCompareT2] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Todos');

  // Filter teachers list for active viewing
  const viewableTeachers = userRole === 'Docente' && loggedTeacherId
    ? teachers.filter(t => t.id === loggedTeacherId)
    : teachers;

  const currentEvaluations = userRole === 'Docente' && loggedTeacherId
    ? evaluations.filter(e => e.teacherId === loggedTeacherId)
    : evaluations;

  // Filter departments list from data
  const departments = ['Todos', ...Array.from(new Set(teachers.map(t => t.department)))];

  // Derived metrics
  const activeTeachers = viewableTeachers.filter(t => t.status === 'active');
  const avgOverallScore = activeTeachers.length > 0 
    ? (activeTeachers.reduce((acc, t) => acc + t.averageScore, 0) / activeTeachers.length)
    : 0;

  const totalEvaluationsCount = currentEvaluations.length;

  // Department average scores
  const deptAverages = departments.filter(d => d !== 'Todos').map(dept => {
    const deptDocentes = activeTeachers.filter(t => t.department === dept);
    const avg = deptDocentes.length > 0 
      ? deptDocentes.reduce((acc, t) => acc + t.averageScore, 0) / deptDocentes.length
      : 0;
    return { name: dept, score: avg, count: deptDocentes.length };
  });

  // Performance Traffic Lamp Categories: 
  // Excelente: >= 9.0 (Naranja brillante #F97316)
  // Bueno: 8.0 - 8.9 (Morado claro #A78BFA)
  // Regular: 6.5 - 7.9 (Amarillo #FBBF24)
  // Bajo: < 6.5 (Rojo #EF4444)
  const getTrafficDetails = (score: number) => {
    if (score >= 9.0) return { label: 'Excelente', color: '#F97316', textClass: 'text-orange-500', bgClass: 'bg-orange-500/10 border-orange-500/30' };
    if (score >= 8.0) return { label: 'Bueno', color: '#A78BFA', textClass: 'text-violet-400', bgClass: 'bg-violet-500/10 border-violet-500/30' };
    if (score >= 6.5) return { label: 'Regular', color: '#FBBF24', textClass: 'text-yellow-500', bgClass: 'bg-yellow-500/10 border-yellow-500/30' };
    return { label: 'Bajo', color: '#EF4444', textClass: 'text-red-500', bgClass: 'bg-red-500/10 border-red-500/30' };
  };

  const getTrafficCounts = () => {
    let excelente = 0, bueno = 0, regular = 0, bajo = 0;
    activeTeachers.forEach(t => {
      if (t.averageScore >= 9.0) excelente++;
      else if (t.averageScore >= 8.0) bueno++;
      else if (t.averageScore >= 6.5) regular++;
      else bajo++;
    });
    return { excelente, bueno, regular, bajo, total: activeTeachers.length };
  };

  const trafficCounts = getTrafficCounts();

  // Search & filter action for lists
  const filteredTeachersForList = viewableTeachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.subjects.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = selectedDept === 'Todos' || t.department === selectedDept;
    
    // Performance selector filter
    let matchesCategory = true;
    if (selectedCategoryFilter !== 'Todos') {
      const parentLabel = getTrafficDetails(t.averageScore).label;
      matchesCategory = parentLabel === selectedCategoryFilter;
    }

    return matchesSearch && matchesDept && matchesCategory;
  });

  // Best teachers ranked
  const rankingTeachers = [...teachers]
    .filter(t => t.status === 'active')
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5);

  // Category average scores across all evaluations
  // Scale questions: q-1 (Metodologia), q-2 (Metodologia), q-3 (Comunicacion), q-4 (Empatia), q-5 (Evaluacion)
  const calculateCategoryScores = (teacherId?: string) => {
    const evs = teacherId ? evaluations.filter(e => e.teacherId === teacherId) : evaluations;
    if (evs.length === 0) return { Metodología: 8.5, Comunicación: 8.5, Empatía: 8.5, Evaluación: 8.5 };

    const totals = { Metodología: 0, Comunicación: 0, Empatía: 0, Evaluación: 0 };
    const counts = { Metodología: 0, Comunicación: 0, Empatía: 0, Evaluación: 0 };

    evs.forEach(ev => {
      // Metodologia q-1, q-2
      if (ev.answers['q-1'] !== undefined) { totals.Metodología += Number(ev.answers['q-1']); counts.Metodología++; }
      if (ev.answers['q-2'] !== undefined) { totals.Metodología += Number(ev.answers['q-2']); counts.Metodología++; }
      // Comunicacion q-3
      if (ev.answers['q-3'] !== undefined) { totals.Comunicación += Number(ev.answers['q-3']); counts.Comunicación++; }
      // Empatia q-4
      if (ev.answers['q-4'] !== undefined) { totals.Empatía += Number(ev.answers['q-4']); counts.Empatía++; }
      // Evaluacion q-5
      if (ev.answers['q-5'] !== undefined) { totals.Evaluación += Number(ev.answers['q-5']); counts.Evaluación++; }
    });

    return {
      Metodología: counts.Metodología > 0 ? Number((totals.Metodología / counts.Metodología).toFixed(1)) : 8.0,
      Comunicación: counts.Comunicación > 0 ? Number((totals.Comunicación / counts.Comunicación).toFixed(1)) : 8.0,
      Empatía: counts.Empatía > 0 ? Number((totals.Empatía / counts.Empatía).toFixed(1)) : 8.0,
      Evaluación: counts.Evaluación > 0 ? Number((totals.Evaluación / counts.Evaluación).toFixed(1)) : 8.0,
    };
  };

  const generalCategoryScores = calculateCategoryScores();

  // Export functions
  const handleExportCSV = () => {
    const headers = ['ID', 'Docente', 'Email', 'Celulas/Departamento', 'Estado', 'Promedio', 'Evaluaciones Totales'];
    const rows = teachers.map(t => [
      t.id, 
      t.name, 
      t.email, 
      t.department, 
      t.status === 'active' ? 'Activo' : 'Inactivo', 
      t.averageScore.toString(), 
      t.evaluationsCount.toString()
    ]);
    exportToCSV(`Reporte_Docentes_Mensual_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handleExportExcel = () => {
    const headers = ['ID', 'Docente', 'Email', 'Departamento/Facultad', 'Estado', 'Promedio General', 'Evaluaciones Recibidas'];
    const rows = teachers.map(t => [
      t.id, 
      t.name, 
      t.email, 
      t.department, 
      t.status === 'active' ? 'Activo' : 'Inactivo', 
      t.averageScore.toString(), 
      t.evaluationsCount.toString()
    ]);
    exportToExcel(`Reporte_Docentes_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handlePrintPDF = () => {
    let deptRowsHTML = deptAverages.map(d => `
      <tr class="border-b border-slate-100 hover:bg-slate-50">
        <td class="p-3 text-slate-700 font-medium">${d.name}</td>
        <td class="p-3 text-slate-500">${d.count} docentes</td>
        <td class="p-3 text-right">
          <span class="inline-flex px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700">
            ${d.score.toFixed(1)} / 10
          </span>
        </td>
      </tr>
    `).join('');

    let rankedRowsHTML = rankingTeachers.map((t, idx) => `
      <tr class="border-b border-slate-100 hover:bg-slate-50">
        <td class="p-3 text-slate-500">#${idx+1}</td>
        <td class="p-3 text-slate-700 font-semibold">${t.name}</td>
        <td class="p-3 text-slate-500 text-xs">${t.department}</td>
        <td class="p-3 text-right">
          <span class="inline-flex px-2.5 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-700">
            ${t.averageScore.toFixed(1)}
          </span>
        </td>
      </tr>
    `).join('');

    const html = `
      <div class="space-y-8">
        <div class="grid grid-cols-4 gap-4">
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-medium text-slate-400 block uppercase mb-1">Docentes Activos</span>
            <span class="text-2xl font-bold text-slate-800">${teachers.filter(t=>t.status==='active').length}</span>
          </div>
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-medium text-slate-400 block uppercase mb-1">Promedio General</span>
            <span class="text-2xl font-bold text-violet-600">${avgOverallScore.toFixed(2)}/10</span>
          </div>
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-medium text-slate-400 block uppercase mb-1">Evaluaciones Unidas</span>
            <span class="text-2xl font-bold text-slate-800">${evaluations.length}</span>
          </div>
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-medium text-slate-400 block uppercase mb-1">Sobresalientes >= 9.0</span>
            <span class="text-2xl font-bold text-orange-500">${teachers.filter(t => t.averageScore >= 9).length}</span>
          </div>
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-800 border-b border-indigo-150 pb-2 mb-4">Promedio de Rendimiento por Escuela/Departamento</h2>
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-indigo-50 text-indigo-800 font-bold">
                <th class="p-3 text-left">Departamento</th>
                <th class="p-3 text-left">Docentes Activos</th>
                <th class="p-3 text-right">Promedio de Evaluación</th>
              </tr>
            </thead>
            <tbody>
              ${deptRowsHTML}
            </tbody>
          </table>
        </div>

        <div>
          <h2 class="text-lg font-bold text-slate-800 border-b border-indigo-150 pb-2 mb-4">Top 5 Docentes Destacados (Ranking Mensual)</h2>
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-indigo-50 text-indigo-800 font-bold">
                <th class="p-3 text-left">Rango</th>
                <th class="p-3 text-left">Docente</th>
                <th class="p-3 text-left">Departamento</th>
                <th class="p-3 text-right">Promedio General</th>
              </tr>
            </thead>
            <tbody>
              ${rankedRowsHTML}
            </tbody>
          </table>
        </div>

        <div class="p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-900">
          <strong class="block mb-1">⚠️ Declaración de Veracidad:</strong>
          Los datos emitidos en este reporte derivan del registro directo sincrónico con las hojas de cálculo Google Sheets a través de peticiones HTTP encriptadas, garantizando total auditoría académica y anonimato escolar en cuestionarios de alumnos.
        </div>
      </div>
    `;

    printPDFReport('Evaluación de Desempeño Docente', html);
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#7C3AED] text-xs font-extrabold tracking-widest uppercase">
            <Sparkles className="w-4 h-4 text-[#F97316]" />
            <span>SaaS Inteligente de Evaluación</span>
          </div>
          <h1 id="dashboard-title" className="text-3xl font-extrabold text-white tracking-tight">
            Análisis de Desempeño Docente
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Monitorea el ranking en tiempo real, filtra resultados por semáforo y analiza indicadores pedagógicos centralizados.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button 
            id="btn-export-excel"
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#7C3AED] text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Excel (.xls)</span>
          </button>
          
          <button 
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#7C3AED] text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer"
          >
            <BarChart2 className="w-4 h-4 text-[#7C3AED]" />
            <span>CSV</span>
          </button>

          <button 
            id="btn-export-pdf"
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#F97316] hover:brightness-110 text-xs font-bold text-white shadow-lg shadow-purple-950/40 transition cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Exportar PDF / Imprimir</span>
          </button>
        </div>
      </div>

      {/* Dynamic Indicators Bento Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1 */}
        <div className="relative group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 overflow-hidden hover:border-white/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#7C3AED]/5 rounded-full blur-2xl group-hover:bg-[#7C3AED]/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Docentes Activos</span>
            <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center border border-white/5 text-[#7C3AED]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 select-none">
            {activeTeachers.length} <span className="text-xs text-slate-500 font-medium">/ {teachers.length}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Docentes autorizados con perfil habilitado.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="relative group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 overflow-hidden hover:border-white/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#F97316]/5 rounded-full blur-2xl group-hover:bg-[#F97316]/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Promedio General</span>
            <div className="w-8 h-8 rounded-lg bg-[#F97316]/10 flex items-center justify-center border border-[#F97316]/20 text-[#F97316]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 select-none flex items-baseline gap-1">
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              {avgOverallScore.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 10</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
            <div className="w-2 h-2 rounded-full bg-[#F97316] animate-ping" />
            <span>Calificación institucional global</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="relative group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 overflow-hidden hover:border-white/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#7C3AED]/5 rounded-full blur-2xl group-hover:bg-[#7C3AED]/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Evaluaciones Unidas</span>
            <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center border border-white/5 text-[#7C3AED]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-100 select-none">
            {totalEvaluationsCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Respuestas recibidas en total por Google Sheets.
          </p>
        </div>

        {/* Metric 4 */}
        <div className="relative group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 overflow-hidden hover:border-white/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-650/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Alertas Desempeño</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-500 select-none">
            {trafficCounts.bajo} <span className="text-xs text-slate-400 font-medium">docentes bajo 6.5</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {trafficCounts.bajo > 0 
              ? 'Se recomienda plan de acción prioritario de 30 días.' 
              : 'Sin docentes críticos detectados. ¡Excelente!'}
          </div>
        </div>
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SVG Animated Chart & Category performance - 8 Columns */}
        <div className="lg:col-span-8 bg-[#1E293B]/40 border border-white/10 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-sm shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Promedio de Evaluación por Departamento</h2>
                <p className="text-xs text-slate-400 mt-0.5">Métricas obtenidas con mayor representatividad estudiantil.</p>
              </div>
              <span className="text-[10px] font-bold tracking-wider py-1 px-2.5 rounded bg-white/5 border border-white/10 text-[#7C3AED]">
                Escala 1 - 10
              </span>
            </div>

            {/* Simulated interactive SVG Bar Chart */}
            <div className="relative h-64 w-full flex items-end justify-around pb-4 border-b border-white/5 pt-4">
              
              {/* Background horizontal lines of the chart */}
              <div className="absolute inset-x-0 bottom-4 top-4 flex flex-col justify-between pointer-events-none">
                {[10, 8, 6, 4, 2].map(n => (
                  <div key={n} className="w-full flex items-center justify-between text-[10px] text-slate-600/80">
                    <div className="w-full border-t border-white/5" />
                    <span className="pl-2.5 font-mono select-none">{n}</span>
                  </div>
                ))}
              </div>

              {/* Individual graphic bar entries */}
              {deptAverages.map((dept, idx) => {
                const heightPercentage = Math.min((dept.score / 10) * 100, 100);
                const isWinner = idx === 0; // standard indicator
                return (
                  <div key={dept.name} className="relative group w-1/5 flex flex-col items-center z-10">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none scale-90 group-hover:scale-100 flex flex-col items-center">
                      <div className="bg-slate-950 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg border border-[#7C3AED]/30 shadow-2xl space-y-0.5 text-center">
                        <div className="truncate text-[10px] text-[#7C3AED]">{dept.name}</div>
                        <div>Promedio: {dept.score.toFixed(1)}</div>
                        <div className="text-[9px] text-slate-400">{dept.count} Docentes</div>
                      </div>
                      <div className="w-2.5 h-2.5 bg-slate-950 border-r border-b border-[#7C3AED]/30 transform rotate-45 -mt-1.5" />
                    </div>

                    {/* The Active Animated Bar */}
                    <div className="relative w-12 md:w-16 rounded-t-xl overflow-hidden shadow-lg transition-all duration-500 group-hover:brightness-110 flex items-end" style={{ height: '180px' }}>
                      <div 
                        className={`w-full rounded-t-xl bg-gradient-to-t transition-all duration-1000 ease-out`}
                        style={{ 
                          height: `${heightPercentage}%`,
                          backgroundImage: idx % 2 === 0 
                            ? 'linear-gradient(to top, rgba(124, 58, 237, 0.15), #7C3AED)' 
                            : 'linear-gradient(to top, rgba(249, 115, 22, 0.15), #F97316)'
                        }}
                      />
                    </div>

                    <span className="text-[10px] md:text-xs font-semibold text-slate-400 mt-2 truncate max-w-full text-center group-hover:text-white transition-colors">
                      {dept.name.substring(0, 15)}...
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-300 mt-0.5">
                      {dept.score.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Categories Strengths radar-list representation */}
          <div className="mt-6 pt-5 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/5">
            {Object.entries(generalCategoryScores).map(([category, rating], i) => {
              const percentages = (rating / 10) * 100;
              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">{category}</span>
                    <span className="font-mono font-bold text-[#7C3AED]">{rating} / 10</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        i % 2 === 0 ? 'bg-gradient-to-r from-[#7C3AED] to-[#7C3AED]/60' : 'bg-gradient-to-r from-[#F97316] to-[#F97316]/60'
                      }`}
                      style={{ width: `${percentages}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Semáforo de Desempeño circular visual representation - 4 Columns */}
        <div className="lg:col-span-4 bg-[#1E293B]/40 border border-white/10 rounded-3xl p-6 flex flex-col justify-between h-full backdrop-blur-sm shadow-xl">
          <div>
            <h2 className="text-lg font-bold text-white mb-1.5 tracking-tight">Semáforo de Desempeño</h2>
            <p className="text-xs text-slate-400 mb-6">Segmentación basada en promedio para acciones académicas ágiles.</p>
            
            <div className="flex justify-center mb-6">
              {/* Custom SVG Radial Stack gauge or Donut chart to show the traffic distribution */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background base Ring */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" strokeWidth="9" />
                  
                  {/* Excelente Ring - Orange #F97316 */}
                  {trafficCounts.excelente > 0 && (
                    <circle 
                      cx="50" cy="50" r="38" 
                      fill="none" 
                      stroke="#F97316" 
                      strokeWidth="9" 
                      strokeDasharray={`${(trafficCounts.excelente / trafficCounts.total) * 238.76} 238.76`}
                      strokeDashoffset={0}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  )}

                  {/* Bueno Ring - Violet #A78BFA */}
                  {trafficCounts.bueno > 0 && (
                    <circle 
                      cx="50" cy="50" r="38" 
                      fill="none" 
                      stroke="#A78BFA" 
                      strokeWidth="9" 
                      strokeDasharray={`${(trafficCounts.bueno / trafficCounts.total) * 238.76} 238.76`}
                      strokeDashoffset={-((trafficCounts.excelente / trafficCounts.total) * 238.76)}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  )}

                  {/* Regular Ring - Yellow #FBBF24 */}
                  {trafficCounts.regular > 0 && (
                    <circle 
                      cx="50" cy="50" r="38" 
                      fill="none" 
                      stroke="#FBBF24" 
                      strokeWidth="9" 
                      strokeDasharray={`${(trafficCounts.regular / trafficCounts.total) * 238.76} 238.76`}
                      strokeDashoffset={-(((trafficCounts.excelente + trafficCounts.bueno) / trafficCounts.total) * 238.76)}
                      strokeLinecap="round"
                    />
                  )}

                  {/* Bajo Ring - Red #EF4444 */}
                  {trafficCounts.bajo > 0 && (
                    <circle 
                      cx="50" cy="50" r="38" 
                      fill="none" 
                      stroke="#EF4444" 
                      strokeWidth="9" 
                      strokeDasharray={`${(trafficCounts.bajo / trafficCounts.total) * 238.76} 238.76`}
                      strokeDashoffset={-(((trafficCounts.excelente + trafficCounts.bueno + trafficCounts.regular) / trafficCounts.total) * 238.76)}
                      strokeLinecap="round"
                    />
                  )}
                </svg>

                {/* Text centered */}
                <div className="absolute flex flex-col items-center select-none text-center">
                  <span className="text-3xl font-extrabold text-white">{trafficCounts.total}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Docentes</span>
                </div>
              </div>
            </div>
            
            {/* Legend categories list */}
            <div className="space-y-2.5">
              {[
                { label: 'Excelente', val: trafficCounts.excelente, desc: 'Promedio >= 9.0', color: '#F97316' },
                { label: 'Bueno', val: trafficCounts.bueno, desc: 'Promedio 8.0 - 8.9', color: '#A78BFA' },
                { label: 'Regular', val: trafficCounts.regular, desc: 'Promedio 6.5 - 7.9', color: '#FBBF24' },
                { label: 'Bajo', val: trafficCounts.bajo, desc: 'Promedio < 6.5', color: '#EF4444' }
              ].map((cat) => {
                const percentage = trafficCounts.total > 0 ? ((cat.val / trafficCounts.total) * 100).toFixed(0) : '0';
                return (
                  <button 
                    key={cat.label}
                    onClick={() => {
                      setSelectedCategoryFilter(selectedCategoryFilter === cat.label ? 'Todos' : cat.label);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border border-transparent hover:bg-slate-800/40 text-left transition select-none cursor-pointer ${
                      selectedCategoryFilter === cat.label ? 'bg-slate-800/60 border-violet-900/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <div>
                        <div className="text-xs font-bold text-slate-200">{cat.label}</div>
                        <div className="text-[10px] text-slate-500">{cat.desc}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-100">{cat.val} docentes</div>
                      <div className="text-[10px] text-violet-400 font-medium">{percentage}%</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {selectedCategoryFilter !== 'Todos' && (
            <div className="mt-4 p-2 relative rounded-lg bg-slate-800/60 border border-violet-800/20 text-center flex items-center justify-between">
              <span className="text-xs text-violet-300">Filtro activo: {selectedCategoryFilter}</span>
              <button onClick={() => setSelectedCategoryFilter('Todos')} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main interaction grid: Ranking & Interactive Comparison Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Top 5 Educators list - 5 Columns */}
        <div className="lg:col-span-5 bg-[#1E293B]/40 border border-white/10 rounded-3xl p-6 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#F97316]" />
              <h2 className="text-lg font-bold text-white tracking-tight">Ranking Docentes Destacados</h2>
            </div>
            <span className="text-[10px] font-bold text-slate-500">MENSUAL</span>
          </div>

          <div className="space-y-3.5">
            {rankingTeachers.map((t, idx) => {
              const bgBadge = idx === 0 
                ? 'bg-gradient-to-r from-[#F97316] to-amber-500 text-white shadow-lg shadow-orange-950/20' 
                : idx === 1 
                  ? 'bg-slate-750 text-slate-100' 
                  : idx === 2 
                    ? 'bg-amber-850/50 text-amber-300' 
                    : 'bg-white/5 text-slate-400';
              
              return (
                <div 
                  key={t.id} 
                  className={`flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 select-none group hover:border-[#7C3AED]/30 transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${bgBadge}`}>
                      {idx + 1}
                    </div>
                    
                    <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-1 ring-[#7C3AED]/30">
                      <img src={t.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-100 group-hover:text-[#7C3AED] transition-colors">{t.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">{t.department}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20">
                      {t.averageScore.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{t.evaluationsCount} eval.</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dual Teacher Comparative Tool - 7 Columns */}
        <div className="lg:col-span-7 bg-[#1E293B]/40 border border-white/10 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-sm shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <HeartHandshake className="w-5 h-5 text-[#7C3AED]" />
              <h2 className="text-lg font-bold text-white tracking-tight">Comparador de Desempeño</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">Contraste de indicadores clave entre dos perfiles docentes seleccionados.</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Dropdown 1 */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 select-none">Docente A</label>
                <select 
                  id="compare-teacher-a"
                  value={compareT1}
                  onChange={(e) => setCompareT1(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none transition"
                >
                  <option value="">Seleccionar docente...</option>
                  {teachers.filter(t => t.id !== compareT2 && t.status === 'active').map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Dropdown 2 */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 select-none">Docente B</label>
                <select 
                  id="compare-teacher-b"
                  value={compareT2}
                  onChange={(e) => setCompareT2(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none transition"
                >
                  <option value="">Seleccionar docente...</option>
                  {teachers.filter(t => t.id !== compareT1 && t.status === 'active').map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {compareT1 && compareT2 ? (
              <div className="space-y-4">
                {/* Visual score side-by-side gauge row */}
                {(() => {
                  const t1 = teachers.find(t => t.id === compareT1)!;
                  const t2 = teachers.find(t => t.id === compareT2)!;
                  const cat1 = calculateCategoryScores(t1.id);
                  const cat2 = calculateCategoryScores(t2.id);

                  return (
                    <div className="space-y-4">
                      {/* Name card visual */}
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 rounded-2xl bg-violet-600/10 border border-violet-800/30">
                          <img src={t1.avatar} alt="D1" className="w-10 h-10 object-cover rounded-xl mx-auto mb-2 ring-2 ring-violet-500/50" referrerPolicy="no-referrer" />
                          <h4 className="text-xs font-bold text-slate-200 truncate">{t1.name}</h4>
                          <span className="text-[10px] text-orange-400 font-bold block mt-1">Score: {t1.averageScore.toFixed(1)}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-orange-600/10 border border-orange-850/30">
                          <img src={t2.avatar} alt="D2" className="w-10 h-10 object-cover rounded-xl mx-auto mb-2 ring-2 ring-orange-500/50" referrerPolicy="no-referrer" />
                          <h4 className="text-xs font-bold text-slate-200 truncate">{t2.name}</h4>
                          <span className="text-[10px] text-violet-400 font-bold block mt-1">Score: {t2.averageScore.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Side by side metric sliders */}
                      <div className="space-y-3.5 bg-slate-950/40 p-4 rounded-2xl border border-violet-950/20">
                        {['Metodología', 'Comunicación', 'Empatía', 'Evaluación'].map((cat) => {
                          const v1 = (cat1 as any)[cat];
                          const v2 = (cat2 as any)[cat];
                          const max = Math.max(v1, v2);

                          return (
                            <div key={cat} className="space-y-1">
                              <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
                                <span>{v1.toFixed(1)}</span>
                                <span className="uppercase tracking-widest text-[9px] text-slate-500">{cat}</span>
                                <span>{v2.toFixed(1)}</span>
                              </div>
                              
                              <div className="h-2 w-full flex rounded-full overflow-hidden bg-slate-800">
                                {/* Docente 1 bar */}
                                <div className="h-full flex justify-end" style={{ width: '50%' }}>
                                  <div 
                                    className={`h-full rounded-l-full bg-violet-500 transition-all duration-500`} 
                                    style={{ width: `${(v1 / 10) * 100}%` }}
                                  />
                                </div>
                                {/* Divider spacer */}
                                <div className="w-0.5 h-full bg-slate-950" />
                                {/* Docente 2 bar */}
                                <div className="h-full" style={{ width: '50%' }}>
                                  <div 
                                    className={`h-full rounded-r-full bg-orange-500 transition-all duration-500`}
                                    style={{ width: `${(v2 / 10) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Smart AI recommendations text box */}
                      {(() => {
                        const scoreDiff = Math.abs(t1.averageScore - t2.averageScore);
                        const smarter = t1.averageScore > t2.averageScore ? t1 : t2;
                        return (
                          <div className="p-3.5 rounded-2xl bg-violet-950/30 border border-violet-900/40 text-xs text-slate-300">
                            <div className="flex items-center gap-1.5 font-bold text-violet-400 mb-1">
                              <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                              <span>Recomendaciones Dinámicas (AI Inteligencia)</span>
                            </div>
                            {scoreDiff <= 0.4 ? (
                              <p> Ambos docentes presentan un desempeño académico equiparable y excelente. Se estimula realizar intercambio de rúbricas curriculares cruzadas para potenciar el éxito metodológico conjunto.</p>
                            ) : (
                              <p> Se denota un gradiente de desempeño de <strong>{scoreDiff.toFixed(1)} puntos</strong>. Se recomienda que <strong>{smarter.name}</strong> asista como mentor de su par departamental, especialmente enfocándose en las mejores prácticas operadas para la resolución estudiantil.</p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950/25 border border-dashed border-violet-950/35 rounded-2xl min-h-[220px]">
                <BarChart2 className="w-10 h-10 text-violet-900/40 mb-2" />
                <h4 className="text-xs font-bold text-slate-400">Sin Selección de Par</h4>
                <p className="text-[11px] text-slate-600 max-w-[260px] mt-1">Selecciona dos docentes de la lista de arriba para realizar el desglose analítico comparativo instantáneo.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid of All Teachers & Search engine */}
      <div className="bg-slate-900/60 border border-violet-950/40 rounded-3xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Directorio con Filtros e Historial</h2>
            <p className="text-xs text-slate-400 mt-0.5">Control directo de docentes autorizados y su semáforo de desempeño.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search filter input */}
            <div className="relative">
              <input 
                id="teacher-search-input"
                type="text"
                placeholder="Buscar por nombre/materia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-955 border border-white/10 focus:border-[#7C3AED] rounded-xl pl-9 pr-4 py-2.5 w-full sm:w-60 text-xs text-slate-300 outline-none transition"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>

            {/* Department selector */}
            <select
              id="dept-filter-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-955 border border-white/10 focus:border-[#7C3AED] rounded-xl px-3 py-2.5 text-xs text-[#F8FAFC] outline-none transition cursor-pointer"
            >
              <option value="Todos">Todos los Departamentos</option>
              {departments.filter(d => d !== 'Todos').map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredTeachersForList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTeachersForList.map((t) => {
              const semaforo = getTrafficDetails(t.averageScore);
              const teacherRecs = getAIRecommendations(t.averageScore, {});

              return (
                <div 
                  key={t.id}
                  className="flex flex-col justify-between p-5 bg-white/5 border border-white/5 rounded-3xl hover:border-[#7C3AED]/30 transition-all scale-100 hover:scale-[1.01] group"
                >
                  <div className="space-y-4">
                    {/* Header profile row */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <img 
                          src={t.avatar} 
                          alt="Avatar" 
                          className="w-12 h-12 object-cover rounded-xl border border-white/10"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-200 group-hover:text-[#7C3AED] transition-colors">
                            {t.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[150px] font-semibold uppercase tracking-wider">{t.department}</span>
                        </div>
                      </div>

                      {/* Semáforo badge */}
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${semaforo.bgClass} ${semaforo.textClass}`}>
                        {semaforo.label}
                      </span>
                    </div>

                    {/* Subjects and description lists */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Materias Impartidas</span>
                      <div className="flex flex-wrap gap-1">
                        {t.subjects.map(sub => (
                          <span key={sub} className="text-[9px] px-2 py-1 rounded-md bg-slate-900 border border-violet-950/30 text-slate-400">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Progress score bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-400">Promedio General</span>
                        <span className="font-mono" style={{ color: semaforo.color }}>{t.averageScore.toFixed(1)} / 10</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-700"
                          style={{ 
                            width: `${t.averageScore * 10}%`,
                            backgroundColor: semaforo.color
                          }}
                        />
                      </div>
                    </div>

                    {/* Quick recommendation line */}
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-violet-950/30 text-[10px] text-slate-400">
                      <strong className="text-slate-300 block mb-0.5">Sugerencia Académica:</strong>
                      {teacherRecs.actionPlan.substring(0, 85)}...
                    </div>
                  </div>

                  <div className="border-t border-violet-950/20 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Evaluado: <strong>{t.evaluationsCount} veces</strong></span>
                    <span>Status: <strong className={t.status === 'active' ? 'text-emerald-400' : 'text-red-400'}>{t.status === 'active' ? 'Activo' : 'Inactivo'}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-12 bg-slate-950/25 border border-dashed border-violet-950/35 rounded-2xl">
            <Users className="w-12 h-12 text-violet-900/40 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-400">Sin Docentes Coincidentes</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">No encontramos docentes registrados que cumplan tus criterios de búsqueda o de filtro por semáforo de desempeño.</p>
          </div>
        )}
      </div>
    </div>
  );
}
