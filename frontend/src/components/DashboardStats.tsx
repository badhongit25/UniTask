import React from 'react';
import { Stats, Task } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  ListTodo, 
  Hourglass,
  BookOpen,
  Presentation,
  CheckSquare2,
  HelpCircle,
  Briefcase,
  User,
  ArrowUpRight
} from 'lucide-react';

interface DashboardStatsProps {
  stats: Stats | null;
  tasks: Task[];
  onSelectCategory: (category: string) => void;
  onFilterStatus: (status: string) => void;
  onOpenNewTask: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  tasks,
  onSelectCategory,
  onFilterStatus,
  onOpenNewTask
}) => {
  if (!stats) return null;

  // Filter urgent/overdue tasks for alert banner
  const urgentTasks = tasks.filter(t => t.status !== 'completed' && (
    (t.deadline && new Date(t.deadline).getTime() < Date.now()) || t.priority === 'urgent'
  ));

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 glass-panel border border-white/10 shadow-xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              University Semester In-Progress
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Academic Dashboard & Deadlines
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Track university assignments, presentations, quizzes, and home tasks. Stay organized and hit every deadline without stress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewTask}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <CheckSquare2 className="w-4 h-4" />
              <span>Add University Task</span>
            </button>
          </div>
        </div>

        {/* Decorative Background Orbs */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Urgent Overdue Alert Banner if any */}
      {urgentTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 border border-rose-500/30 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-300">
                {urgentTasks.length} Task{urgentTasks.length > 1 ? 's' : ''} Require Immediate Action!
              </p>
              <p className="text-xs text-rose-400/80">
                You have overdue tasks or high priority university deadlines waiting for submission.
              </p>
            </div>
          </div>
          <button
            onClick={() => onFilterStatus('pending')}
            className="px-3 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 text-xs font-semibold border border-rose-500/30 transition-colors whitespace-nowrap"
          >
            View Urgent
          </button>
        </div>
      )}

      {/* Primary 7 Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        
        {/* Total Tasks */}
        <div 
          onClick={() => onFilterStatus('all')}
          className="glass-card p-4 rounded-2xl cursor-pointer group hover:border-indigo-500/40"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Tasks</span>
            <ListTodo className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-[10px] text-slate-400 mt-1">All registered tasks</p>
        </div>

        {/* Completed Tasks */}
        <div 
          onClick={() => onFilterStatus('completed')}
          className="glass-card p-4 rounded-2xl cursor-pointer group hover:border-emerald-500/40"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
          <p className="text-[10px] text-slate-400 mt-1">Successfully finished</p>
        </div>

        {/* Pending Tasks */}
        <div 
          onClick={() => onFilterStatus('pending')}
          className="glass-card p-4 rounded-2xl cursor-pointer group hover:border-amber-500/40"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pending</span>
            <Hourglass className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
          <p className="text-[10px] text-slate-400 mt-1">Awaiting completion</p>
        </div>

        {/* Overdue Tasks */}
        <div 
          onClick={() => onFilterStatus('pending')}
          className={`glass-card p-4 rounded-2xl cursor-pointer group ${
            stats.overdue > 0 ? 'border-rose-500/40 bg-rose-950/20' : 'hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Overdue</span>
            <AlertTriangle className={`w-4 h-4 ${stats.overdue > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`} />
          </div>
          <p className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-rose-400' : 'text-white'}`}>{stats.overdue}</p>
          <p className="text-[10px] text-slate-400 mt-1">Past deadline</p>
        </div>

        {/* Today's Tasks */}
        <div 
          onClick={() => onFilterStatus('all')}
          className="glass-card p-4 rounded-2xl cursor-pointer group hover:border-sky-500/40"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Today's Tasks</span>
            <Clock className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-sky-400">{stats.today}</p>
          <p className="text-[10px] text-slate-400 mt-1">Due before midnight</p>
        </div>

        {/* Upcoming Deadlines */}
        <div 
          onClick={() => onFilterStatus('all')}
          className="glass-card p-4 rounded-2xl cursor-pointer group hover:border-purple-500/40"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Upcoming</span>
            <Calendar className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-bold text-purple-400">{stats.upcoming}</p>
          <p className="text-[10px] text-slate-400 mt-1">Next 7 days</p>
        </div>

        {/* Completion Percentage */}
        <div className="glass-card p-4 rounded-2xl col-span-2 sm:col-span-1 border-indigo-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Completion %</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-indigo-400">{stats.percentage}%</p>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>

      </div>

      {/* University Category Breakdown Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300">University Categories & Tasks</h2>
          <span className="text-xs text-slate-500">Click to filter tasks by type</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Assignment */}
          <div 
            onClick={() => onSelectCategory('assignment')}
            className="glass-card p-3.5 rounded-2xl cursor-pointer hover:border-indigo-500/40 group transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">📝</span>
              <span className="text-xs font-bold text-indigo-400">{stats.byCategory.assignment}</span>
            </div>
            <p className="text-xs font-semibold text-slate-200">Assignment</p>
            <p className="text-[10px] text-slate-400">Reports, homework</p>
          </div>

          {/* Quiz / Exam */}
          <div 
            onClick={() => onSelectCategory('quiz')}
            className="glass-card p-3.5 rounded-2xl cursor-pointer hover:border-rose-500/40 group transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🎯</span>
              <span className="text-xs font-bold text-rose-400">{stats.byCategory.quiz}</span>
            </div>
            <p className="text-xs font-semibold text-slate-200">Quiz & Exam</p>
            <p className="text-[10px] text-slate-400">Tests, viva</p>
          </div>

          {/* Presentation */}
          <div 
            onClick={() => onSelectCategory('presentation')}
            className="glass-card p-3.5 rounded-2xl cursor-pointer hover:border-purple-500/40 group transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🎤</span>
              <span className="text-xs font-bold text-purple-400">{stats.byCategory.presentation}</span>
            </div>
            <p className="text-xs font-semibold text-slate-200">Presentation</p>
            <p className="text-[10px] text-slate-400">Slide deck, speech</p>
          </div>

          {/* Study */}
          <div 
            onClick={() => onSelectCategory('study')}
            className="glass-card p-3.5 rounded-2xl cursor-pointer hover:border-emerald-500/40 group transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">📚</span>
              <span className="text-xs font-bold text-emerald-400">{stats.byCategory.study}</span>
            </div>
            <p className="text-xs font-semibold text-slate-200">Study Session</p>
            <p className="text-[10px] text-slate-400">Readings, chapters</p>
          </div>

          {/* Personal */}
          <div 
            onClick={() => onSelectCategory('personal')}
            className="glass-card p-3.5 rounded-2xl cursor-pointer hover:border-sky-500/40 group transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">👤</span>
              <span className="text-xs font-bold text-sky-400">{stats.byCategory.personal}</span>
            </div>
            <p className="text-xs font-semibold text-slate-200">Personal</p>
            <p className="text-[10px] text-slate-400">Gym, errands</p>
          </div>

          {/* Work */}
          <div 
            onClick={() => onSelectCategory('work')}
            className="glass-card p-3.5 rounded-2xl cursor-pointer hover:border-amber-500/40 group transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">💼</span>
              <span className="text-xs font-bold text-amber-400">{stats.byCategory.work}</span>
            </div>
            <p className="text-xs font-semibold text-slate-200">Work / Project</p>
            <p className="text-[10px] text-slate-400">Internship, freelance</p>
          </div>

        </div>
      </div>

    </div>
  );
};
