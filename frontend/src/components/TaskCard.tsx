import React, { useState } from 'react';
import { Task } from '../types';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  CheckSquare, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Tag,
  Repeat
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playChime } from '../utils/sound';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleSubtask
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Calculate deadline urgency
  const now = new Date();
  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = deadlineDate ? deadlineDate.getTime() < now.getTime() && task.status !== 'completed' : false;

  // Human readable deadline format
  const getDeadlineText = () => {
    if (!deadlineDate) return 'No deadline';
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (task.status === 'completed') {
      return `Completed on ${task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'time'}`;
    }

    if (diffMs < 0) {
      const pastHours = Math.abs(diffHours);
      if (pastHours < 24) return `⚠️ Overdue by ${pastHours} hour${pastHours > 1 ? 's' : ''}`;
      const pastDays = Math.abs(diffDays);
      return `⚠️ Overdue by ${pastDays} day${pastDays > 1 ? 's' : ''}`;
    }

    if (diffHours <= 1) return `🚨 Due in less than an hour!`;
    if (diffHours < 24) return `⏰ Due today (${deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
    if (diffDays === 1) return `Due tomorrow`;
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return `Due on ${deadlineDate.toLocaleDateString()}`;
  };

  // Category Icon & Label
  const getCategoryMeta = () => {
    switch (task.category) {
      case 'assignment':
        return { icon: '📝', label: 'Assignment', color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30' };
      case 'quiz':
        return { icon: '🎯', label: 'Quiz / Exam', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' };
      case 'presentation':
        return { icon: '🎤', label: 'Presentation', color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' };
      case 'study':
        return { icon: '📚', label: 'Study', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
      case 'personal':
        return { icon: '👤', label: 'Personal', color: 'text-sky-400 bg-sky-500/15 border-sky-500/30' };
      case 'work':
        return { icon: '💼', label: 'Work', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
      default:
        return { icon: '📌', label: 'Task', color: 'text-slate-400 bg-slate-500/15 border-slate-500/30' };
    }
  };

  const getPriorityMeta = () => {
    switch (task.priority) {
      case 'urgent':
        return { label: 'Urgent', color: 'text-rose-400 bg-rose-500/15 border-rose-500/40 animate-pulse' };
      case 'high':
        return { label: 'High', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
      case 'medium':
        return { label: 'Medium', color: 'text-sky-400 bg-sky-500/15 border-sky-500/30' };
      case 'low':
        return { label: 'Low', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
      default:
        return { label: 'Normal', color: 'text-slate-400 bg-slate-500/15 border-slate-500/30' };
    }
  };

  const cat = getCategoryMeta();
  const prio = getPriorityMeta();

  // Subtask progress
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    if (nextStatus === 'completed') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
      playChime('success');
    }
    onToggleStatus(task.id, nextStatus);
  };

  return (
    <div 
      className={`glass-card rounded-2xl p-4 sm:p-5 relative border transition-all ${
        task.status === 'completed'
          ? 'opacity-70 bg-slate-900/40 border-white/5'
          : isOverdue
          ? 'border-rose-500/40 shadow-lg shadow-rose-900/10'
          : 'border-white/10 hover:border-indigo-500/40'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Category Chip */}
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1 ${cat.color}`}>
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </span>

          {/* Priority Chip */}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${prio.color}`}>
            {prio.label}
          </span>

          {/* Recurring indicator */}
          {task.recurring && task.recurring !== 'none' && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1" title={`Recurring: ${task.recurring}`}>
              <Repeat className="w-2.5 h-2.5" /> {task.recurring}
            </span>
          )}
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-36 glass-panel rounded-xl shadow-xl p-1 border border-white/15 z-20">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(task);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Edit
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete(task.id);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Checkbox + Title + Description */}
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggleComplete}
          className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-400 transition-colors"
          title={task.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
        >
          {task.status === 'completed' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Circle className="w-5 h-5 hover:scale-110 transition-transform" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h4 className={`text-sm sm:text-base font-semibold leading-snug break-words ${
            task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-100'
          }`}>
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Subtask progress bar if subtasks exist */}
      {totalSubtasks > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-emerald-400" />
              {completedSubtasks}/{totalSubtasks} Subtasks completed
            </span>
            <span>{subtaskProgress}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-emerald-400 transition-all duration-300" 
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Info: Deadline & Quick Status Selector */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Deadline pill */}
        <div className={`flex items-center gap-1.5 font-medium ${
          isOverdue 
            ? 'text-rose-400' 
            : task.status === 'completed'
            ? 'text-emerald-400'
            : 'text-slate-300'
        }`}>
          {isOverdue ? <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
          <span>{getDeadlineText()}</span>
        </div>

        {/* Status Dropdown Pill */}
        <select
          value={task.status}
          onChange={(e) => onToggleStatus(task.id, e.target.value)}
          className={`px-2 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer glass-input ${
            task.status === 'completed'
              ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30'
              : task.status === 'in_progress'
              ? 'text-amber-400 border-amber-500/40 bg-amber-950/30'
              : 'text-slate-300 border-white/10 bg-slate-900/50'
          }`}
        >
          <option value="pending" className="bg-slate-900 text-white">To Do</option>
          <option value="in_progress" className="bg-slate-900 text-white">In Progress</option>
          <option value="completed" className="bg-slate-900 text-white">Completed</option>
        </select>

      </div>

      {/* Expand/Collapse Toggle for Subtasks & Notes */}
      {(totalSubtasks > 0 || task.notes) && (
        <div className="mt-2 text-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] text-slate-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
          >
            {showDetails ? (
              <>Hide checklist & notes <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>View checklist & notes ({totalSubtasks} steps) <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        </div>
      )}

      {/* Expanded checklist & notes section */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
          
          {totalSubtasks > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-300">Checklist:</p>
              {task.subtasks.map(s => (
                <label 
                  key={s.id} 
                  className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-1 rounded hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    checked={s.completed}
                    onChange={() => onToggleSubtask(task.id, s.id)}
                    className="rounded accent-indigo-600"
                  />
                  <span className={s.completed ? 'line-through text-slate-500' : ''}>
                    {s.title}
                  </span>
                </label>
              ))}
            </div>
          )}

          {task.notes && (
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-purple-400" /> Student Notes:
              </p>
              <p className="whitespace-pre-wrap leading-relaxed">{task.notes}</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
