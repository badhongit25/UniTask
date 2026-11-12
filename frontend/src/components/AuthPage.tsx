import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Lock, 
  Mail, 
  User as UserIcon, 
  School, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  EyeOff,
  CheckCircle2,
  CalendarCheck,
  Zap,
  ShieldCheck
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('Dhaka University');
  const [department, setDepartment] = useState('Computer Science');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        await register({ name, email, password, university, department });
      } else {
        await login(email, password);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      // Try demo user login, or auto-create if not yet registered
      try {
        await login('demo@unitask.edu', 'demo12345');
      } catch {
        await register({
          name: 'Shakil Ahmed',
          email: 'demo@unitask.edu',
          password: 'demo12345',
          university: 'Dhaka University',
          department: 'CSE'
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Demo login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-6 bg-[#0a0e1a]">
      {/* Dynamic Cosmic Glow Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-center">
        
        {/* Left Side: Showcase & Features */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Designed Exclusively for University Students
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Manage Your University <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                Deadlines with Ease
              </span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
              আর মিস হবে না কোনো Assignment, Presentation কিংবা Quiz এর ডেডলাইন। স্মার্ট ট্র্যাকার, পমোডোরো টাইমার ও অটো রিমাইন্ডার এখন এক সাথে।
            </p>
          </div>

          {/* Quick Highlight Feature Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Deadline Tracker</p>
                <p className="text-[11px] text-slate-400">Assignment, Presentation & Quiz</p>
              </div>
            </div>

            <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Pomodoro Focus</p>
                <p className="text-[11px] text-slate-400">25m study + 5m break interval</p>
              </div>
            </div>

            <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">100% Isolated Data</p>
                <p className="text-[11px] text-slate-400">Secure & refresh-safe session</p>
              </div>
            </div>

            <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 border border-pink-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Timely Reminders</p>
                <p className="text-[11px] text-slate-400">1 day & 1 hr auto notifications</p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync Enabled
            </span>
            <span>•</span>
            <span>Dark Glassmorphic UI</span>
          </div>
        </div>

        {/* Right Side: Auth Form Box */}
        <div className="lg:col-span-6 max-w-md w-full mx-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl relative">
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-3">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                {isRegistering ? 'Create Student Account' : 'Welcome to UniTask'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isRegistering 
                  ? 'আপনার ভার্সিটির অ্যাকাউন্ট তৈরি করুন' 
                  : 'লগইন করে আপনার টাস্ক ম্যানেজ করুন'}
              </p>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isRegistering && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Tanvir Hossain"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">University</label>
                      <div className="relative">
                        <School className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={university}
                          onChange={e => setUniversity(e.target.value)}
                          placeholder="e.g. DU, BUET, NSU"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                      <div className="relative">
                        <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={department}
                          onChange={e => setDepartment(e.target.value)}
                          placeholder="e.g. CSE, EEE, BBA"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student@university.edu.bd"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl glass-input text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isRegistering ? 'Complete Registration' : 'Sign In to Dashboard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Option */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full py-2.5 rounded-xl glass-card hover:bg-white/10 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Explore with One-Click Demo Student Account
              </button>
            </div>

            {/* Toggle Mode */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }}
                className="text-xs text-slate-400 hover:text-indigo-300 transition-colors"
              >
                {isRegistering ? (
                  <>Already have an account? <span className="text-indigo-400 font-semibold underline">Log In</span></>
                ) : (
                  <>New to UniTask? <span className="text-indigo-400 font-semibold underline">Create Account</span></>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
