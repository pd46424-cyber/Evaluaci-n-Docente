import { Teacher, EvaluationTemplate, EvaluationResult, AuditLog } from './types';

// Avatars standard matching deep neon palette
export const mockTeachers: Teacher[] = [
  {
    id: 't-1',
    name: 'Dra. Elena Rostova',
    email: 'elena.rostova@universidad.edu',
    department: 'Ingeniería y Tecnología',
    subjects: ['Inteligencia Artificial', 'Estructuras de Datos'],
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    averageScore: 9.4,
    evaluationsCount: 24
  },
  {
    id: 't-2',
    name: 'Mtro. Carlos Mendoza',
    email: 'carlos.mendoza@universidad.edu',
    department: 'Ciencias de la Computación',
    subjects: ['Desarrollo Web Avanzado', 'Bases de Datos II'],
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    averageScore: 8.7,
    evaluationsCount: 18
  },
  {
    id: 't-3',
    name: 'Lic. Sofia Lorenzana',
    email: 'sofia.lorenzana@universidad.edu',
    department: 'Diseño e Innovación',
    subjects: ['Diseño de Interfaces (UI/UX)', 'Creatividad Digital'],
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    averageScore: 9.6,
    evaluationsCount: 30
  },
  {
    id: 't-4',
    name: 'Dr. Alejandro Gaviria',
    email: 'alejandro.gaviria@universidad.edu',
    department: 'Ingeniería de Software',
    subjects: ['Arquitectura de Sistemas', 'Patrones de Diseño'],
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    averageScore: 7.2,
    evaluationsCount: 15
  },
  {
    id: 't-5',
    name: 'Dra. Martha Benavides',
    email: 'martha.benavides@universidad.edu',
    department: 'Ciencias Básicas',
    subjects: ['Cálculo de Una Variable', 'Álgebra Lineal'],
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    averageScore: 6.8,
    evaluationsCount: 22
  },
  {
    id: 't-6',
    name: 'Mtro. Héctor Villamizar',
    email: 'hector.villamizar@universidad.edu',
    department: 'Ciencias Sociales',
    subjects: ['Ética Profesional', 'Metodología de la Investigación'],
    status: 'inactive',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80',
    averageScore: 8.1,
    evaluationsCount: 8
  }
];

export const defaultQuestions = [
  { id: 'q-1', text: '¿El docente domina los temas explicados y responde con claridad a las dudas?', type: 'scale' as const, category: 'Metodología' as const },
  { id: 'q-2', text: '¿Explica de manera estructurada y fomenta la participación activa?', type: 'scale' as const, category: 'Metodología' as const },
  { id: 'q-3', text: '¿La comunicación es fluida, respetuosa y asertiva?', type: 'scale' as const, category: 'Comunicación' as const },
  { id: 'q-4', text: '¿Muestra empatía, apertura al diálogo y disposición para asesorar fuera de clase?', type: 'scale' as const, category: 'Empatía' as const },
  { id: 'q-5', text: '¿Los métodos de evaluación son claros, justos y acordes al plan de estudios?', type: 'scale' as const, category: 'Evaluación' as const },
  { id: 'q-6', text: 'Escribe comentarios adicionales sobre el desempeño, fortalezas o áreas de oportunidad del docente:', type: 'comment' as const, category: 'General' as const }
];

export const mockTemplates: EvaluationTemplate[] = [
  {
    id: 'temp-1',
    title: 'Evaluación Docente Mensual Estándar',
    description: 'Plantilla institucional para medir la calidad docente en base a pedagogía, empatía, evaluación y comunicación.',
    questions: defaultQuestions,
    isActive: true,
    createdAt: '2026-02-15'
  },
  {
    id: 'temp-2',
    title: 'Autoevaluación de Desempeño Profesional',
    description: 'Diseñada para coordinadores y directores para evaluar formalmente los objetivos del semestre.',
    questions: [
      { id: 'q2-1', text: '¿Cumple puntualmente con los horarios y la entrega de calificaciones?', type: 'scale', category: 'General' },
      { id: 'q2-2', text: '¿Participa activamente en comités de mejora académica?', type: 'scale', category: 'General' },
      { id: 'q2-3', text: 'Retroalimentación detallada y plan de mejora continua recomendado:', type: 'comment', category: 'General' }
    ],
    isActive: false,
    createdAt: '2026-03-10'
  }
];

export const mockEvaluations: EvaluationResult[] = [
  {
    id: 'ev-1',
    teacherId: 't-1',
    teacherName: 'Dra. Elena Rostova',
    templateId: 'temp-1',
    templateTitle: 'Evaluación Docente Mensual Estándar',
    subject: 'Inteligencia Artificial',
    group: '8-A',
    semester: 'Octavo Semestre',
    answers: {
      'q-1': 10,
      'q-2': 10,
      'q-3': 9,
      'q-4': 9,
      'q-5': 9,
      'q-6': 'La Dra Rostova es increíblemente buena. Sus clases son retadoras pero se aprende mucho.'
    },
    isAnonymous: true,
    timestamp: '2026-05-15T18:30:00Z',
    evaluatorRole: 'Alumno'
  },
  {
    id: 'ev-2',
    teacherId: 't-1',
    teacherName: 'Dra. Elena Rostova',
    templateId: 'temp-1',
    templateTitle: 'Evaluación Docente Mensual Estándar',
    subject: 'Inteligencia Artificial',
    group: '8-A',
    semester: 'Octavo Semestre',
    answers: {
      'q-1': 9,
      'q-2': 8,
      'q-3': 10,
      'q-4': 10,
      'q-5': 10,
      'q-6': 'Excelente trato humano y dominio técnico. Domina de manera espectacular la materia.'
    },
    isAnonymous: false,
    timestamp: '2026-05-16T10:15:00Z',
    evaluatorRole: 'Alumno',
    evaluatorName: 'Mateo Guardado'
  },
  {
    id: 'ev-3',
    teacherId: 't-3',
    teacherName: 'Lic. Sofia Lorenzana',
    templateId: 'temp-1',
    templateTitle: 'Evaluación Docente Mensual Estándar',
    subject: 'Diseño de Interfaces (UI/UX)',
    group: '4-B',
    semester: 'Cuarto Semestre',
    answers: {
      'q-1': 10,
      'q-2': 10,
      'q-3': 10,
      'q-4': 10,
      'q-5': 8,
      'q-6': 'Es la docente más dinámica y apasionada de la universidad. Las clases de UI/UX son pura inspiración.'
    },
    isAnonymous: true,
    timestamp: '2026-05-18T14:45:00Z',
    evaluatorRole: 'Alumno'
  },
  {
    id: 'ev-4',
    teacherId: 't-4',
    teacherName: 'Dr. Alejandro Gaviria',
    templateId: 'temp-1',
    templateTitle: 'Evaluación Docente Mensual Estándar',
    subject: 'Arquitectura de Sistemas',
    group: '6-A',
    semester: 'Sexto Semestre',
    answers: {
      'q-1': 8,
      'q-2': 7,
      'q-3': 6,
      'q-4': 7,
      'q-5': 8,
      'q-6': 'Sabe muchísimo pero a veces se desespera cuando preguntamos cosas básicas.'
    },
    isAnonymous: true,
    timestamp: '2026-05-20T09:00:00Z',
    evaluatorRole: 'Alumno'
  },
  {
    id: 'ev-5',
    teacherId: 't-5',
    teacherName: 'Dra. Martha Benavides',
    templateId: 'temp-1',
    templateTitle: 'Evaluación Docente Mensual Estándar',
    subject: 'Cálculo de Una Variable',
    group: '2-C',
    semester: 'Segundo Semestre',
    answers: {
      'q-1': 7,
      'q-2': 6,
      'q-3': 7,
      'q-4': 6,
      'q-5': 6,
      'q-6': 'Explica muy rápido y el examen es muchísimo más complejo que los ejercicios de clase. Es difícil pasar.'
    },
    isAnonymous: true,
    timestamp: '2026-05-22T11:20:00Z',
    evaluatorRole: 'Alumno'
  },
  {
    id: 'ev-6',
    teacherId: 't-2',
    teacherName: 'Mtro. Carlos Mendoza',
    templateId: 'temp-1',
    templateTitle: 'Evaluación Docente Mensual Estándar',
    subject: 'Desarrollo Web Avanzado',
    group: '6-B',
    semester: 'Sexto Semestre',
    answers: {
      'q-1': 9,
      'q-2': 9,
      'q-3': 8,
      'q-4': 9,
      'q-5': 8,
      'q-6': 'Excelente maestro, los proyectos prácticos de desarrollo de Apps son de mucha ayuda.'
    },
    isAnonymous: false,
    timestamp: '2026-05-23T16:00:00Z',
    evaluatorRole: 'Alumno',
    evaluatorName: 'Ana Lucía Ortiz'
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'l-1',
    timestamp: '2026-05-24T18:10:00Z',
    user: 'Administrador (Tú)',
    action: 'Creación de Docente',
    details: 'Se registró a Dr. Alejandro Gaviria en Ingeniería de Software'
  },
  {
    id: 'l-2',
    timestamp: '2026-05-25T09:30:00Z',
    user: 'Administrador (Tú)',
    action: 'Edición de Calificación',
    details: 'Modificación de q-5 para ev-4 de 6 a 8 tras revisión de rúbrica'
  },
  {
    id: 'l-3',
    timestamp: '2026-05-25T14:22:00Z',
    user: 'Coordinador (Sofia L.)',
    action: 'Desactivación de Cuenta',
    details: 'Docente Mtro. Héctor Villamizar cambió a estado inactivo (Sabbatical)'
  }
];

// Automatic recommendations generator based on category performance
export function getAIRecommendations(score: number, categories: { [cat: string]: number }): {
  status: 'excellent' | 'good' | 'average' | 'critical';
  strengths: string[];
  opportunities: string[];
  actionPlan: string;
} {
  if (score >= 9.0) {
    return {
      status: 'excellent',
      strengths: ['Excepcional dominio didáctico y empático', 'Alta tasa de retención estudiantil', 'Comunicación asertiva excelente'],
      opportunities: ['Colaborar como mentor de docentes noveles', 'Liderar talleres de innovación educativa', 'Documentar su metodología de aula'],
      actionPlan: 'Mantener el nivel actual. Fomentar su involucramiento en proyectos institucionales de mentoría docente y redactar un paper corto de mejores prácticas.'
    };
  } else if (score >= 8.0) {
    return {
      status: 'good',
      strengths: ['Excelente estructuración del material', 'Cumple con altas expectativas académicas', 'Trato respetuoso'],
      opportunities: ['Fomentar más participación interactiva', 'Optimizar el balance de dificultad en exámenes', 'Asesoría adicional estructurada'],
      actionPlan: 'Continuar capacitación técnica sobre herramientas digitales ágiles en clase. Monitorear retroalimentación estudiantil antes de los parciales.'
    };
  } else if (score >= 7.0) {
    return {
      status: 'average',
      strengths: ['Dominio correcto de la materia teórica', 'Puntualidad e institucionalidad integral'],
      opportunities: ['Mejorar la paciencia ante dudas básicas de estudiantes', 'Ajustar la curva de dificultad de las evaluaciones', 'Modernizar metodologías pedagógicas'],
      actionPlan: 'Asistir al taller de pedagogía interactiva y empatía digital. Se recomienda coordinar mentorías asistidas por un colega Senior del departamento.'
    };
  } else {
    return {
      status: 'critical',
      strengths: ['Conocimiento formal de los contenidos teóricos'],
      opportunities: ['Nivel de empatía y apertura al diálogo estudiantil crítico', 'Aclaración de dudas baja', 'Excesivo rigor sin retroalimentación clara'],
      actionPlan: 'Reunión prioritaria con Coordinación Académica. Establecer un plan de acción urgente de 30 días enfocado en rediseño de rúbricas y canales directos de tutoría.'
    };
  }
}
