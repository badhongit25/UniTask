import React, { useEffect, useState } from 'react';
import { Stats, Task, ActivityLog } from '../types';
import { api } from '../services/api';
import { 
  BarChart2, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  History, 
  Calendar, 
  Award, 
  Activity,
  Layers,
  FileCheck
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface AnalyticsViewProps {
  stats: Stats | null;
  tasks: Task[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ stats, tasks }) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.getActivities();
        setActivities(res.activities || []);
      } catch (err) {
        console.warn('Failed to load activities', err);
      }
    };
    fetchActivities();
  }, []);

  const completedTasks = tasks.filter(t => t.status === 'completed');

  // Productivity Score Formula
  const completionRate = stats?.percentage || 0;
  const overdueCount = stats?.overdue || 0;
  const productivityScore = Math.max(0, Math.min(100, Math.round(completionRate * 0.8 + (overdueCount === 0 ? 20 : Math.max(0, 20 - overdueCount * 5)))));

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Productivity Score */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
              <Award className="w-3.5 h-3.5 text-purple-400" /> Academic Performance Index
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Student Productivity Score
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md">
              Based on on-time submission rate, completed assignments, and zero overdue penalties.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-2xl glass-card border border-indigo-500/40 flex flex-col items-center justify-center shadow-lg">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-indigo-400 to-purple-300">
                {productivityScore}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                out of 100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 7-Day Performance & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Trend Bar Chart (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">7-Day Completion Trend</h3>
            </div>
            <span className="text-xs text-slate-400">Tasks completed this week</span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-white/10">
            {stats?.last7DaysData?.map((item, idx) => {
              const maxVal = Math.max(1, ...stats.last7DaysData.map(d => Math.max(d.completed, d.due)));
              const compHeight = (item.completed / maxVal) * 100;
              const dueHeight = (item.due / maxVal) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-32">
                    {/* Completed Bar */}
                    <div 
                      className="w-3 sm:w-4 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-500 group-hover:brightness-125"
                      style={{ height: `${Math.max(6, compHeight)}%` }}
                      title={`${item.completed} completed on ${item.date}`}
                    />
                    {/* Due Bar */}
                    <div 
                      className="w-3 sm:w-4 bg-gradient-to-t from-indigo-600 to-purple-400 rounded-t-md transition-all duration-500 group-hover:brightness-125 opacity-70"
                      style={{ height: `${Math.max(6, dueHeight)}%` }}
                      title={`${item.due} due on ${item.date}`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-400" />
              <span className="text-slate-300">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-indigo-500" />
              <span className="text-slate-300">Deadlines Due</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Category Distribution</h3>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Assignments', count: stats?.byCategory?.assignment || 0, color: 'bg-indigo-500', icon: '📝' },
              { label: 'Quizzes / Exams', count: stats?.byCategory?.quiz || 0, color: 'bg-rose-500', icon: '🎯' },
              { label: 'Presentations', count: stats?.byCategory?.presentation || 0, color: 'bg-purple-500', icon: '🎤' },
              { label: 'Study Sessions', count: stats?.byCategory?.study || 0, color: 'bg-emerald-500', icon: '📚' },
              { label: 'Personal & Work', count: (stats?.byCategory?.personal || 0) + (stats?.byCategory?.work || 0), color: 'bg-sky-500', icon: '💼' },
            ].map(cat => {
              const total = stats?.total || 1;
              const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;

              return (
                <div key={cat.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <span>{cat.icon}</span> {cat.label}
                    </span>
                    <span className="font-semibold text-slate-400">{cat.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Grid: Task History & Recent Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Task History Archive (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Completed Task History</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold ml-auto">
              {completedTasks.length} Done
            </span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {completedTasks.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No completed tasks yet.</p>
            ) : (
              completedTasks.map(t => (
                <div 
                  key={t.id}
                  className="p-3 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-200 truncate">{t.title}</p>
                      <span className="text-[10px] text-slate-500 capitalize">{t.category}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {t.completedAt ? format(parseISO(t.completedAt), 'MMM d, h:mm a') : 'Archived'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Audit Log (6 cols) */}
        <div className="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Recent Activity Log</h3>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No activity recorded yet.</p>
            ) : (
              activities.map(act => (
                <div 
                  key={act.id}
                  className="p-3 rounded-2xl bg-slate-900/40 border border-white/5 flex items-start gap-3 text-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-200">{act.details}</p>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      {format(parseISO(act.createdAt), 'MMM d, yyyy • h:mm a')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
