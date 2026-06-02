export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string; // e.g., "Ingeniería", "Ciencias Sociales", "Diseño"
  subjects: string[];  // e.g., ["Matemáticas", "Física"]
  status: 'active' | 'inactive';
  avatar: string; // url or base64
  averageScore: number; // 0-10
  evaluationsCount: number;
}

export interface Question {
  id: string;
  text: string;
  type: 'scale' | 'comment'; // scale 1-10 or open text comment
  category: 'Metodología' | 'Comunicación' | 'Empatía' | 'Evaluación' | 'General';
}

export interface EvaluationTemplate {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  isActive: boolean;
  createdAt: string;
}

export interface EvaluationResult {
  id: string;
  teacherId: string;
  teacherName: string;
  templateId: string;
  templateTitle: string;
  subject: string;
  group: string;
  semester: string;
  answers: {
    [questionId: string]: number | string; // score 1-10 or comment
  };
  isAnonymous: boolean;
  timestamp: string;
  evaluatorRole: 'Alumno' | 'Coordinador' | 'Administrador';
  evaluatorName?: string; // empty if anonymous
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface AppsScriptConfig {
  url: string;
  status: 'not_configured' | 'connected' | 'error';
  lastSync?: string;
}

export type UserRole = 'Administrador' | 'Coordinador' | 'Alumno' | 'Docente';

export interface UserProfile {
  username: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  teacherId?: string; // if role is 'Docente'
  group?: string;      // if role is 'Alumno'
  semester?: string;   // if role is 'Alumno'
}
