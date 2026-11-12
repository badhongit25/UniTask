import React, { useState, useMemo } from 'react';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Plus, 
  Download, 
  SlidersHorizontal,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  Hourglass,
  Clock
} from 'lucide-react';
import { api } from '../services/api';

interface TaskManagementProps {
  tasks: Task[];
  onOpenNewTask: (category?: TaskCategory) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleStatus: (id: string, status: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export const TaskManagement: React.FC<TaskManagementProps> = ({
  tasks,
  onOpenNewTask,
  onEditTask,
  onDeleteTask,
  onToggleStatus,
  onToggleSubtask,
  selectedCategory,
  setSelectedCategory
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('deadline_asc');

  // Filter tasks based on search, category, priority, status
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Category filter
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }
      // Priority filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && task.status !== selectedStatus) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = task.title?.toLowerCase().includes(q);
        const inDesc = task.description?.toLowerCase().includes(q);
        const inNotes = task.notes?.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inNotes) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'deadline_asc') {
        return new Date(a.deadline || '9999').getTime() - new Date(b.deadline || '9999').getTime();
      }
      if (sortBy === 'deadline_desc') {
        return new Date(b.deadline || '0').getTime() - new Date(a.deadline || '0').getTime();
      }
      if (sortBy === 'priority') {
        const order = { urgent: 4, high: 3, medium: 2, low: 1 };
        return (order[b.priority] || 0) - (order[a.priority] || 0);
      }
      return 0;
    });
  }, [tasks, selectedCategory, selectedPriority, selectedStatus, searchQuery, sortBy]);

  // Kanban column tasks
  const todoTasks = filteredTasks.filter(t => t.status === 'pending');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  const handleExport = async () => {
    await api.exportCsv();
  };

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All Tasks', icon: '📋' },
    { id: 'assignment', label: 'Assignments', icon: '📝' },
    { id: 'quiz', label: 'Quizzes / Exams', icon: '🎯' },
    { id: 'presentation', label: 'Presentations', icon: '🎤' },
    { id: 'study', label: 'Study Sessions', icon: '📚' },
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'work', label: 'Work', icon: '💼' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search / Filters Toolbar */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 shadow-lg space-y-4">
        
        {/* Row 1: Search & Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search university tasks, assignments, notes..."
              className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs sm:text-sm font-medium"
            />
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="px-3 py-2 rounded-xl glass-input text-xs font-medium cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Priorities</option>
              <option value="urgent" className="bg-slate-900 text-white">Urgent</option>
              <option value="high" className="bg-slate-900 text-white">High</option>
              <option value="medium" className="bg-slate-900 text-white">Medium</option>
              <option value="low" className="bg-slate-900 text-white">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl glass-input text-xs font-medium cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">All Statuses</option>
              <option value="pending" className="bg-slate-900 text-white">To Do (Pending)</option>
              <option value="in_progress" className="bg-slate-900 text-white">In Progress</option>
              <option value="completed" className="bg-slate-900 text-white">Completed</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl glass-input text-xs font-medium cursor-pointer"
            >
              <option value="deadline_asc" className="bg-slate-900 text-white">Deadline: Earliest First</option>
              <option value="deadline_desc" className="bg-slate-900 text-white">Deadline: Latest First</option>
              <option value="priority" className="bg-slate-900 text-white">Priority: Highest First</option>
            </select>

            {/* View Mode Toggle: Kanban vs List */}
            <div className="flex items-center bg-slate-900/60 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Kanban Board View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExport}
              className="p-2 rounded-xl glass-card hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Add Task Button */}
            <button
              onClick={() => onOpenNewTask(selectedCategory !== 'all' ? (selectedCategory as TaskCategory) : undefined)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>

          </div>

        </div>

        {/* Row 2: Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {cat.id === 'all' ? tasks.length : tasks.filter(t => t.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* Main Content Area */}
      {filteredTasks.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">No tasks found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            {searchQuery
              ? `No tasks match "${searchQuery}". Try a different keyword.`
              : 'You have no tasks in this view. Click the button below to add your first deadline!'}
          </p>
          <button
            onClick={() => onOpenNewTask(selectedCategory !== 'all' ? (selectedCategory as TaskCategory) : undefined)}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Task Now
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        
        /* Kanban Board View: 3 Columns */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Column 1: To Do / Pending */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h3 className="text-sm font-bold text-slate-200">To Do</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 font-semibold">
                  {todoTasks.length}
                </span>
              </div>
              <button
                onClick={() => onOpenNewTask()}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
                title="Add to To-Do"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {todoTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onToggleStatus={onToggleStatus}
                  onToggleSubtask={onToggleSubtask}
                />
              ))}
              {todoTasks.length === 0 && (
                <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center text-xs text-slate-500">
                  No tasks to do
                </div>
              )}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-200">In Progress</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 font-semibold">
                  {inProgressTasks.length}
                </span>
              </div>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {inProgressTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onToggleStatus={onToggleStatus}
                  onToggleSubtask={onToggleSubtask}
                />
              ))}
              {inProgressTasks.length === 0 && (
                <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center text-xs text-slate-500">
                  No tasks currently in progress
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-bold text-slate-200">Completed</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 font-semibold">
                  {completedTasks.length}
                </span>
              </div>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {completedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onToggleStatus={onToggleStatus}
                  onToggleSubtask={onToggleSubtask}
                />
              ))}
              {completedTasks.length === 0 && (
                <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center text-xs text-slate-500">
                  No completed tasks yet
                </div>
              )}
            </div>
          </div>

        </div>

      ) : (

        /* List View */
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onToggleStatus={onToggleStatus}
              onToggleSubtask={onToggleSubtask}
            />
          ))}
        </div>

      )}

    </div>
  );
};
