import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { User, Internship, Application, Role } from './store';
import { Briefcase, User as UserIcon, LogOut, FileText, BrainCircuit, PlusCircle, Users, Sparkles, ArrowRight, UploadCloud, CheckCircle2, XCircle, Mail, Lock, GraduationCap, Presentation, ShieldCheck, Trash2, Plus, AlertCircle } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// --- UI Components ---

function Button({ className, variant = 'primary', size = 'md', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost', size?: 'sm' | 'md' | 'lg' }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        {
          'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5 focus:ring-indigo-500': variant === 'primary',
          'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500': variant === 'secondary',
          'border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-500 text-slate-700': variant === 'outline',
          'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500': variant === 'danger',
          'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900': variant === 'ghost',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}

function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
}

function Badge({ children, variant = 'default', className }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' | 'ai', className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", {
      'bg-slate-100 text-slate-700': variant === 'default',
      'bg-emerald-100 text-emerald-700': variant === 'success',
      'bg-amber-100 text-amber-700': variant === 'warning',
      'bg-rose-100 text-rose-700': variant === 'danger',
      'bg-violet-100 text-violet-700 border border-violet-200': variant === 'ai',
    }, className)}>
      {children}
    </span>
  );
}

const normalizeUser = (raw: any): User => ({
  id: raw?.id || raw?._id || '',
  name: raw?.name || 'Unknown User',
  role: raw?.role || 'student',
  email: raw?.email || '',
  department: raw?.department,
  resumeText: raw?.resumeText
});

const normalizeInternship = (raw: any): Internship => ({
  id: String(raw?.id || raw?._id || ''),
  title: raw?.title || 'Untitled Internship',
  description: raw?.description || '',
  facultyId: String(raw?.facultyId || raw?.postedBy?._id || raw?.postedBy?.id || raw?.postedBy || ''),
  requiredSkills: Array.isArray(raw?.requiredSkills) ? raw.requiredSkills : [],
  createdAt: raw?.createdAt || new Date().toISOString()
});

const normalizeApplication = (raw: any): Application => ({
  id: String(raw?.id || raw?._id || ''),
  studentId: String(raw?.studentId || raw?.student?._id || raw?.student?.id || raw?.student || ''),
  internshipId: String(raw?.internshipId || raw?.internship?._id || raw?.internship?.id || raw?.internship || ''),
  resumeText: raw?.resumeText || '',
  status: raw?.status || 'pending',
  aiScore: raw?.aiScore ?? null,
  aiFeedback: raw?.aiFeedback ?? null,
  appliedAt: raw?.appliedAt || raw?.createdAt || new Date().toISOString()
});

// --- Screens ---

function AuthScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const body = isLogin ? { email, password } : { name, email, password, role, department: role === 'student' ? department : undefined };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        // Check for both 'error' and 'message' keys for flexibility
        const errorMsg = data.error || data.message || 'Authentication failed';
        throw new Error(errorMsg);
      }

      // Extract user and token from response (response contains { token, user })
      const userData = data.user || data;
      onLogin({ ...userData, token: data.token });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Pane - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-950 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/workspace/1920/1080?blur=4')] opacity-20 bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-violet-900/90" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">InternAI</span>
          </div>
        </div>
        
        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            The future of <br/><span className="text-indigo-300">internship management.</span>
          </h1>
          <p className="text-lg text-indigo-200/80">
            AI-powered resume analysis, smart matching, and seamless collaboration between students, faculty, and administration.
          </p>
        </div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isLogin ? 'Enter your details to access your account.' : 'Sign up to get started with InternAI.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { id: 'student', icon: GraduationCap, label: 'Student' },
                    { id: 'faculty', icon: Presentation, label: 'Faculty' },
                    { id: 'admin', icon: ShieldCheck, label: 'Admin' }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as Role)}
                      className={cn(
                        "p-3 border rounded-xl flex flex-col items-center gap-2 transition-all",
                        role === r.id 
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm" 
                          : "border-slate-200 hover:border-indigo-300 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <r.icon className="w-5 h-5" />
                      <span className="text-xs font-semibold">{r.label}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {role === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Create account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
          
          {isLogin && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center mb-4">Demo Accounts </p>
              <div className="flex justify-center gap-2">
                <button onClick={() => {setEmail('student@gmail.com'); setPassword('Rishalsh@786');}} className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">Student</button>
                <button onClick={() => {setEmail('faculty@gmail.com'); setPassword('Rishalsh@786');}} className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">Faculty</button>
                <button onClick={() => {setEmail('admin@gmail.com'); setPassword('Rishalsh@786');}} className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">Admin</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Layout({ user, onLogout, children }: { user: User, onLogout: () => void, children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">InternAI</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                  <span className="text-sm font-bold text-indigo-700">{user.name.charAt(0)}</span>
                </div>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <button onClick={onLogout} className="text-slate-400 hover:text-slate-600 transition-colors" title="Log out">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {children}
        </motion.div>
      </main>
    </div>
  );
}

// Student Dashboard
function StudentDashboard({ user, onUpdateUser }: { user: User, onUpdateUser: (u: User) => void }) {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [resumeText, setResumeText] = useState(user.resumeText || '');
  const [aiFeedback, setAiFeedback] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetch('/api/internships')
      .then(r => r.json())
      .then(data => setInternships(Array.isArray(data) ? data.map(normalizeInternship) : []));
    fetch('/api/applications').then(r => r.json()).then(data => {
      const normalizedApps = Array.isArray(data) ? data.map(normalizeApplication) : [];
      setApplications(normalizedApps.filter((a: Application) => a.studentId === user.id));
    });
  }, [user.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch(`/api/users/${user.id}/resume`, {
        method: 'POST',
        headers,
        body: formData
      });

      const raw = await res.text();
      let data: any = {};
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error('Server returned an invalid response while uploading PDF. Please restart backend and try again.');
        }
      }

      if (!res.ok) {
        throw new Error(data.details ? `${data.message} (${data.details})` : (data.message || data.error || 'Failed to upload resume'));
      }

      setResumeText(data.text || '');
      if (data.user) {
        onUpdateUser(normalizeUser(data.user));
      }
      setAiFeedback('');
    } catch (err) {
      console.error(err);
      alert((err as Error).message || 'Resume upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeResume = async () => {
    if (!resumeText) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText })
      });
      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to analyze resume');
      }

      if (data.warning) {
        alert(data.warning);
      }

      setAiFeedback(data.feedback || 'No suggestions returned by AI.');
    } catch (e) {
      console.error(e);
      alert((e as Error).message || 'Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const apply = async () => {
    if (!selectedInternship || !resumeText) return;
    setIsApplying(true);
    try {
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/applications/${selectedInternship.id}/apply`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          resumeText
        })
      });
      const newApp = await res.json();
      setApplications([...applications, newApp]);
      setSelectedInternship(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsApplying(false);
    }
  };

  if (selectedInternship) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedInternship(null)} className="px-2">
            ← Back
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Apply for {selectedInternship.title}</h1>
        </div>
        
        <Card className="p-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Confirm Application</h3>
            <p className="text-sm text-slate-600 mb-4">
              You are applying for the <strong>{selectedInternship.title}</strong> position.
            </p>
            {resumeText ? (
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-800 flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-3 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Resume Ready</p>
                  <p className="text-indigo-700/80">Your uploaded resume will be submitted with this application.</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800 flex items-start">
                <AlertCircle className="w-5 h-5 mr-3 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Resume Required</p>
                  <p className="text-amber-700/80">Please go back and upload your resume in the AI Analyzer section before applying.</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-100">
            <Button onClick={apply} disabled={isApplying || !resumeText} size="lg">
              {isApplying ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Applications Overview */}
      {applications.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Your Applications</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {applications.map(app => {
              const internship = internships.find(i => i.id === app.internshipId);
              return (
                <Card key={app.id} className="p-5 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-indigo-600" />
                    </div>
                    <Badge variant={
                      app.status === 'approved' ? 'success' : 
                      app.status === 'rejected' ? 'danger' : 'warning'
                    }>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-slate-900">{internship?.title || 'Unknown Role'}</h3>
                  <p className="text-sm text-slate-500 mt-1">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Available Internships */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Discover Internships</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {internships.map(internship => {
            const hasApplied = applications.some(a => a.internshipId === internship.id);
            const internshipSkills = internship.requiredSkills || [];
            return (
              <Card key={internship.id} className="flex flex-col group hover:border-indigo-200 transition-colors">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{internship.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-6 flex-1 line-clamp-3">{internship.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {internshipSkills.slice(0, 3).map(skill => (
                      <span key={skill} className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                        {skill}
                      </span>
                    ))}
                    {internshipSkills.length > 3 && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-400">
                        +{internshipSkills.length - 3}
                      </span>
                    )}
                  </div>
                  <div>
                    {hasApplied ? (
                      <Button variant="secondary" className="w-full" disabled>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Applied
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={() => setSelectedInternship(internship)}>
                        Apply Now
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Resume Analyzer Section */}
      <section>
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl mr-4">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">AI Resume Analyzer</h2>
              <p className="text-sm text-slate-600">Upload your PDF resume to get instant feedback and suggestions for improvement.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <Button variant="outline" className="pointer-events-none bg-white">
                  <UploadCloud className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload PDF Resume'}
                </Button>
              </div>
              {resumeText && <span className="text-sm text-green-600 font-medium flex items-center"><CheckCircle2 className="w-4 h-4 mr-1"/> Resume Uploaded</span>}
            </div>
            
            <div className="flex justify-end pt-2">
              <Button 
                onClick={analyzeResume} 
                disabled={isAnalyzing || !resumeText}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isAnalyzing ? 'Analyzing...' : <><Sparkles className="w-4 h-4 mr-2" /> Analyze & Improve</>}
              </Button>
            </div>
            
            <AnimatePresence>
              {aiFeedback && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-white border border-indigo-100 rounded-xl shadow-sm mt-4">
                    <div className="flex items-center mb-3">
                      <Sparkles className="h-5 w-5 text-indigo-600 mr-2" />
                      <h4 className="font-semibold text-indigo-900">Improvement Suggestions</h4>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{aiFeedback}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </section>
    </div>
  );
}

// Faculty Dashboard
function FacultyDashboard({ user }: { user: User }) {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [analyzingAppId, setAnalyzingAppId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const fetchData = () => {
    fetch('/api/internships')
      .then(r => r.json())
      .then(data => {
        const normalizedInternships = Array.isArray(data) ? data.map(normalizeInternship) : [];
        const currentFacultyId = String((user as any).id || (user as any)._id || '');
        setInternships(normalizedInternships.filter((i: Internship) => String(i.facultyId) === currentFacultyId));
      });
    fetch('/api/applications')
      .then(r => r.json())
      .then(data => setApplications(Array.isArray(data) ? data.map(normalizeApplication) : []));
    fetch('/api/users')
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data.map(normalizeUser) : []));
  };

  const createInternship = async () => {
    if (!newTitle || !newDesc || !newCompany) return;
    try {
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/internships', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          company: newCompany,
          facultyId: user.id,
          requiredSkills: newSkills.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      setIsCreating(false);
      setNewTitle('');
      setNewDesc('');
      setNewSkills('');
      setNewCompany('');
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (appId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`/api/applications/${appId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const getAiMatch = async (app: Application) => {
    setAnalyzingAppId(app.id);
    try {
      const res = await fetch('/api/ai/match-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: app.resumeText, internshipId: app.internshipId })
      });
      const data = await res.json();
      
      setApplications(apps => apps.map(a => a.id === app.id ? { ...a, aiScore: data.score, aiFeedback: data.justification } : a));
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingAppId(null);
    }
  };

  const myInternshipIds = internships.map(i => String(i.id));
  const myApplications = applications.filter(a => myInternshipIds.includes(String(a.internshipId)));

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Faculty Portal</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancel' : <><PlusCircle className="w-4 h-4 mr-2" /> Post Internship</>}
        </Button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className="p-6 mb-8 bg-indigo-50/50 border-indigo-100">
              <h2 className="text-lg font-semibold text-indigo-900 mb-4">Create New Internship</h2>
              <div className="space-y-4">
                <input className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Job Title (e.g. Frontend Developer Intern)" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                <input className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Company Name (e.g. Google, Microsoft)" value={newCompany} onChange={e => setNewCompany(e.target.value)} />
                <textarea className="w-full p-3 bg-white border border-slate-200 rounded-xl h-24 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" placeholder="Job Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                <input className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Required Skills (comma separated, e.g. React, TypeScript, Node.js)" value={newSkills} onChange={e => setNewSkills(e.target.value)} />
                <div className="flex justify-end pt-2">
                  <Button onClick={createInternship}>Publish Internship</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Internships List */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Your Postings</h2>
          {internships.length === 0 ? (
            <p className="text-sm text-slate-500">No internships posted yet.</p>
          ) : (
            internships.map(internship => (
              <Card key={internship.id} className="p-5">
                <h3 className="font-semibold text-slate-900">{internship.title}</h3>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {myApplications.filter(a => a.internshipId === internship.id).length} Applicants
                  </span>
                  <span className="text-slate-400">{new Date(internship.createdAt).toLocaleDateString()}</span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Right Column: Applicants */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Applicants</h2>
          {myApplications.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No applications received yet.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {myApplications.map(app => {
                const student = users.find(u => u.id === app.studentId);
                const internship = internships.find(i => i.id === app.internshipId);
                return (
                  <Card key={app.id} className="p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-lg font-bold text-slate-900">{student?.name}</h3>
                          <Badge variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}>
                            {app.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">Applied for <span className="font-medium text-slate-700">{internship?.title}</span></p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => getAiMatch(app)} disabled={analyzingAppId === app.id} className="border-violet-200 text-violet-700 hover:bg-violet-50">
                          {analyzingAppId === app.id ? 'Analyzing...' : <><Sparkles className="w-4 h-4 mr-1.5"/> AI Match</>}
                        </Button>
                        {app.status === 'pending' && (
                          <>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus(app.id, 'approved')}>Approve</Button>
                            <Button size="sm" variant="danger" onClick={() => updateStatus(app.id, 'rejected')}>Reject</Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {app.aiScore !== null && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-5 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-xl border border-violet-100 flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 rounded-full bg-white border-2 border-violet-200 flex items-center justify-center shadow-sm">
                              <span className="text-xl font-bold text-violet-700">{app.aiScore}</span>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-violet-900 flex items-center mb-1">
                              <Sparkles className="w-4 h-4 mr-1.5" /> AI Match Analysis
                            </h4>
                            <p className="text-sm text-violet-800 leading-relaxed">{app.aiFeedback}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <details className="group">
                        <summary className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700 list-none flex items-center">
                          <FileText className="w-4 h-4 mr-2" /> View Resume
                        </summary>
                        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-mono text-slate-600 whitespace-pre-wrap">
                          {app.resumeText}
                        </div>
                      </details>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Admin Dashboard
function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('student');
  const [newUserDepartment, setNewUserDepartment] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState('');

  const fetchData = () => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data.map(normalizeUser) : []));
    fetch('/api/internships')
      .then(r => r.json())
      .then(data => setInternships(Array.isArray(data) ? data.map(normalizeInternship) : []));
    fetch('/api/applications')
      .then(r => r.json())
      .then(data => setApplications(Array.isArray(data) ? data.map(normalizeApplication) : []));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingUser(true);
    setAddUserError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          department: newUserRole === 'student' ? newUserDepartment : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add user');
      
      setShowAddUser(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('student');
      setNewUserDepartment('');
      fetchData();
    } catch (err: any) {
      console.error(err);
      setAddUserError(err.message);
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
        <Button onClick={() => setShowAddUser(!showAddUser)}>
          {showAddUser ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add User</>}
        </Button>
      </div>

      {showAddUser && (
        <Card className="p-6 bg-slate-50 border-indigo-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Add New User</h3>
          {addUserError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center">
              <XCircle className="w-4 h-4 mr-2" />
              {addUserError}
            </div>
          )}
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input type="password" required value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as Role)} className="block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white">
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {newUserRole === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <input type="text" required value={newUserDepartment} onChange={e => setNewUserDepartment(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Computer Science" />
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isAddingUser}>
                {isAddingUser ? 'Adding...' : 'Create User'}
              </Button>
            </div>
          </form>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center">
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
            <Users className="h-8 w-8" />
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            <p className="text-3xl font-bold text-slate-900">{users.length}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center">
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
            <Briefcase className="h-8 w-8" />
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-slate-500">Active Internships</p>
            <p className="text-3xl font-bold text-slate-900">{internships.length}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center">
          <div className="p-4 rounded-2xl bg-violet-50 text-violet-600">
            <FileText className="h-8 w-8" />
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium text-slate-500">Total Applications</p>
            <p className="text-3xl font-bold text-slate-900">{applications.length}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">User Directory</h3>
        </div>
        <ul className="divide-y divide-slate-100">
          {users.map(user => (
            <li key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                  <UserIcon className="h-5 w-5 text-slate-500" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-bold text-slate-900">{user.name}</div>
                  <div className="text-sm text-slate-500">
                    {user.email}
                    {user.department && <span className="ml-2 text-indigo-600 font-medium">• {user.department}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={
                  user.role === 'admin' ? 'danger' :
                  user.role === 'faculty' ? 'warning' : 'default'
                }>
                  {user.role.toUpperCase()}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 px-2">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        const normalizedUser = {
          ...parsedUser,
          id: parsedUser.id || parsedUser._id
        };
        delete (normalizedUser as any)._id;
        setCurrentUser(normalizedUser);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (user: User & { token?: string }) => {
    const userWithoutToken = { ...user } as any;
    delete (userWithoutToken as any).token;
    userWithoutToken.id = userWithoutToken.id || userWithoutToken._id;
    delete userWithoutToken._id;
    
    setCurrentUser(userWithoutToken);
    if (user.token) {
      localStorage.setItem('token', user.token);
      localStorage.setItem('user', JSON.stringify(userWithoutToken));
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    const normalizedUser = {
      ...updatedUser,
      id: (updatedUser as any).id || (updatedUser as any)._id
    } as any;
    delete normalizedUser._id;

    setCurrentUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Layout user={currentUser} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={
            currentUser.role === 'student' ? <StudentDashboard user={currentUser} onUpdateUser={handleUserUpdate} /> :
            currentUser.role === 'faculty' ? <FacultyDashboard user={currentUser} /> :
            <AdminDashboard />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
