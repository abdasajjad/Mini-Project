export type Role = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  password?: string;
  department?: string;
  resumeText?: string;
}

export interface Internship {
  id: string;
  title: string;
  description: string;
  facultyId: string;
  requiredSkills: string[];
  createdAt: string;
}

export interface Application {
  id: string;
  studentId: string;
  internshipId: string;
  resumeText: string;
  status: 'pending' | 'approved' | 'rejected';
  aiScore: number | null;
  aiFeedback: string | null;
  appliedAt: string;
}

// In-memory data store
export let users: User[] = [
  { id: '1', name: 'Alice (Student)', role: 'student', email: 'alice@example.com', password: 'password', department: 'Computer Science' },
  { id: '2', name: 'Dr. Bob (Faculty)', role: 'faculty', email: 'bob@example.com', password: 'password' },
  { id: '3', name: 'Admin Charlie', role: 'admin', email: 'admin@example.com', password: 'password' }
];

export const internships: Internship[] = [
  {
    id: '101',
    title: 'Software Engineering Intern',
    description: 'Join our team to build scalable web applications using React and Node.js.',
    facultyId: '2',
    requiredSkills: ['React', 'Node.js', 'TypeScript'],
    createdAt: new Date().toISOString()
  },
  {
    id: '102',
    title: 'Data Science Intern',
    description: 'Work on machine learning models and data analysis pipelines.',
    facultyId: '2',
    requiredSkills: ['Python', 'Machine Learning', 'SQL'],
    createdAt: new Date().toISOString()
  }
];

export const applications: Application[] = [];
