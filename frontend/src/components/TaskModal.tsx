import React, { useState, useEffect } from 'react';
import { Task, TaskCategory, TaskPriority, TaskStatus, ReminderType, RecurringType, SubTask } from '../types';
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Flag, 
  Tag, 
  FileText, 
  CheckSquare, 
  Repeat, 
  Bell, 
  Sparkles,
  AlignLeft
} from 'lucide-react';


interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => Promise<void>;
  initialTask?: Task | null;
  defaultCategory?: TaskCategory;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  defaultCategory = 'assignment'
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>(defaultCategory);
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [reminder, setReminder] = useState<ReminderType>('both');
  const [recurring, setRecurring] = useState<RecurringType>('none');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to format Date for datetime-local input
  const formatDateTimeLocal = (date: Date) => {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setStartDate(initialTask.startDate ? formatDateTimeLocal(new Date(initialTask.startDate)) : '');
      setDeadline(initialTask.deadline ? formatDateTimeLocal(new Date(initialTask.deadline)) : '');
      setPriority(initialTask.priority || 'medium');
      setCategory(initialTask.category || 'assignment');
      setStatus(initialTask.status || 'pending');
      setReminder(initialTask.reminder || 'both');
      setRecurring(initialTask.recurring || 'none');
      setSubtasks(initialTask.subtasks || []);
      setNotes(initialTask.notes || '');
    } else {
      // Default dates
      const now = new Date();
      setStartDate(formatDateTimeLocal(now));
      
      const due = new Date();
      due.setDate(due.getDate() + 2);
      due.setHours(23, 59, 0, 0);
      setDeadline(formatDateTimeLocal(due));

      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory(defaultCategory);
      setStatus('pending');
      setReminder('both');
      setRecurring('none');
      setSubtasks([]);
      setNotes('');
    }
    setError(null);
  }, [initialTask, isOpen, defaultCategory]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: crypto.randomUUID(), title: newSubtaskTitle.trim(), completed: false }
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  // Quick preset deadline buttons
  const setQuickDeadline = (hoursFromNow: number) => {
    const d = new Date();
    d.setTime(d.getTime() + hoursFromNow * 60 * 60 * 1000);
    setDeadline(formatDateTimeLocal(d));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title (কাজের নাম)');
      return;
    }
    if (!deadline) {
      setError('Please set a deadline date & time');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        deadline: new Date(deadline).toISOString(),
        priority,
        category,
        status,
        reminder,
        recurring,
        subtasks,
        notes: notes.trim()
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save task.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {initialTask ? 'Edit Task & Deadline' : 'Add New Task / Deadline'}
              </h3>
              <p className="text-xs text-slate-400">
                ভার্সিটির অ্যাসাইনমেন্ট, প্রেজেন্টেশন বা কুইজ শিডিউল করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 mt-5">
          
          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Task Title (কাজের নাম) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Data Structures Assignment 2 / Database Quiz 1"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-medium"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                Category (ক্যাটাগরি)
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-medium cursor-pointer"
              >
                <option value="assignment" className="bg-slate-900 text-white">📝 Assignment (অ্যাসাইনমেন্ট)</option>
                <option value="quiz" className="bg-slate-900 text-white">🎯 Quiz / Exam (কুইজ/পরীক্ষা)</option>
                <option value="presentation" className="bg-slate-900 text-white">🎤 Presentation (প্রেজেন্টেশন)</option>
                <option value="study" className="bg-slate-900 text-white">📚 Study (পড়ালেখা)</option>
                <option value="personal" className="bg-slate-900 text-white">👤 Personal (ব্যক্তিগত)</option>
                <option value="work" className="bg-slate-900 text-white">💼 Work (কাজ/প্রজেক্ট)</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-indigo-400" />
                Priority (গুরুত্ব)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-1 text-[11px] font-semibold rounded-lg border capitalize transition-all ${
                      priority === p
                        ? p === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-sm'
                          : p === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                          : p === 'medium'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-sm'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                        : 'bg-slate-900/40 text-slate-400 border-white/5 hover:bg-white/5'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Dates: Start Date & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Start Date (শুরুর তারিখ)
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                Deadline (শেষ করার তারিখ) <span className="text-rose-400">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs border-indigo-500/40"
              />
            </div>

          </div>

          {/* Quick Presets for Deadline */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-400 shrink-0">Quick Deadlines:</span>
            <button
              type="button"
              onClick={() => setQuickDeadline(12)}
              className="px-2 py-1 rounded-lg glass-card text-slate-300 hover:text-white shrink-0"
            >
              Today Midnight
            </button>
            <button
              type="button"
              onClick={() => setQuickDeadline(24)}
              className="px-2 py-1 rounded-lg glass-card text-slate-300 hover:text-white shrink-0"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setQuickDeadline(72)}
              className="px-2 py-1 rounded-lg glass-card text-slate-300 hover:text-white shrink-0"
            >
              In 3 Days
            </button>
            <button
              type="button"
              onClick={() => setQuickDeadline(168)}
              className="px-2 py-1 rounded-lg glass-card text-slate-300 hover:text-white shrink-0"
            >
              In 1 Week
            </button>
          </div>

          {/* Status & Reminders & Recurring */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium"
              >
                <option value="pending" className="bg-slate-900 text-white">To Do / Pending</option>
                <option value="in_progress" className="bg-slate-900 text-white">In Progress</option>
                <option value="completed" className="bg-slate-900 text-white">Completed</option>
              </select>
            </div>

            {/* Reminder */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                Reminder
              </label>
              <select
                value={reminder}
                onChange={e => setReminder(e.target.value as ReminderType)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium"
              >
                <option value="both" className="bg-slate-900 text-white">1 Day & 1 Hour Before</option>
                <option value="1_day" className="bg-slate-900 text-white">1 Day Before</option>
                <option value="1_hour" className="bg-slate-900 text-white">1 Hour Before</option>
                <option value="none" className="bg-slate-900 text-white">No Reminder</option>
              </select>
            </div>

            {/* Recurring Task */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-purple-400" />
                Recurring Task
              </label>
              <select
                value={recurring}
                onChange={e => setRecurring(e.target.value as RecurringType)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-medium"
              >
                <option value="none" className="bg-slate-900 text-white">One-time Task</option>
                <option value="daily" className="bg-slate-900 text-white">Daily</option>
                <option value="weekly" className="bg-slate-900 text-white">Weekly</option>
                <option value="monthly" className="bg-slate-900 text-white">Monthly</option>
              </select>
            </div>

          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-indigo-400" />
              Description (কাজের বিস্তারিত)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Topics covered, required format, instructor guidelines..."
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs leading-relaxed"
            />
          </div>

          {/* Subtasks (Checklist) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              Subtasks (বড় কাজকে ছোট ভাগে ভাগ করুন)
            </label>
            
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add subtask step (e.g. Read slide 1-30)..."
                className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 rounded-xl bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-900/40 border border-white/5">
                {subtasks.map(s => (
                  <div key={s.id} className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-white/5">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={s.completed}
                        onChange={() => handleToggleSubtask(s.id)}
                        className="rounded accent-indigo-600"
                      />
                      <span className={`text-xs ${s.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {s.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(s.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              Notes & Links (Task-এর সাথে নোট বা ড্রাইভ লিংক রাখুন)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Drive link, reference book chapter, group partner names..."
              className="w-full px-3.5 py-2 rounded-xl glass-input text-xs leading-relaxed"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{initialTask ? 'Update Task' : 'Save Task'}</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
