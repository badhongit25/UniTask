import React, { useState } from 'react';
import { Task } from '../types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  addWeeks,
  subWeeks,
  isToday,
  parseISO
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus,
  Layers
} from 'lucide-react';
import { TaskCard } from './TaskCard';

interface CalendarViewProps {
  tasks: Task[];
  onOpenNewTask: (date?: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleStatus: (id: string, status: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onOpenNewTask,
  onEditTask,
  onDeleteTask,
  onToggleStatus,
  onToggleSubtask
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Month navigation
  const nextPeriod = () => {
    if (calendarMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const prevPeriod = () => {
    if (calendarMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const resetToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Generate calendar days for month or week
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = calendarMode === 'month' ? startOfWeek(monthStart) : startOfWeek(currentDate);
  const calendarEnd = calendarMode === 'month' ? endOfWeek(monthEnd) : endOfWeek(currentDate);
  const daysInGrid = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const d = parseISO(task.deadline);
      return isSameDay(d, date);
    });
  };

  // Tasks for the selected date
  const selectedDateTasks = getTasksForDate(selectedDate);

  // Today's deadlines
  const todayTasks = tasks.filter(t => t.deadline && isSameDay(parseISO(t.deadline), new Date()));

  // Overdue tasks
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'completed' || !t.deadline) return false;
    return parseISO(t.deadline).getTime() < Date.now();
  });

  return (
    <div className="space-y-6">
      
      {/* Top Controls Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-white/10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Month/Year Title & Navigation */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {format(currentDate, calendarMode === 'month' ? 'MMMM yyyy' : "'Week of' MMM d, yyyy")}
            </h2>
            <p className="text-xs text-slate-400">
              {tasks.length} total deadlines scheduled
            </p>
          </div>
        </div>

        {/* View Switchers & Today Button */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={resetToToday}
            className="px-3 py-1.5 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white"
          >
            Today
          </button>

          <div className="flex items-center bg-slate-900/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setCalendarMode('month')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                calendarMode === 'month' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setCalendarMode('week')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                calendarMode === 'week' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Week
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={prevPeriod}
              className="p-1.5 rounded-xl glass-card text-slate-300 hover:text-white"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 rounded-xl glass-card text-slate-300 hover:text-white"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Main Grid: Calendar on Left, Selected Day Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 glass-panel p-4 sm:p-6 rounded-3xl border border-white/10 shadow-lg">
          
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {daysInGrid.map(day => {
              const dayTasks = getTasksForDate(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const hasOverdue = dayTasks.some(t => t.status !== 'completed' && parseISO(t.deadline).getTime() < Date.now());

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[75px] sm:min-h-[95px] p-1.5 sm:p-2 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-950/50'
                      : isCurrentDay
                      ? 'border-indigo-500/40 bg-indigo-900/20'
                      : isCurrentMonth
                      ? 'glass-card border-white/5 hover:border-white/20'
                      : 'bg-slate-900/20 border-transparent opacity-40 hover:opacity-75'
                  }`}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isCurrentDay
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : isSelected
                        ? 'text-indigo-300 font-extrabold'
                        : 'text-slate-300'
                    }`}>
                      {format(day, 'd')}
                    </span>

                    {hasOverdue && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </div>

                  {/* Task Indicators */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map(task => (
                      <div
                        key={task.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 ${
                          task.status === 'completed'
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20'
                            : task.priority === 'urgent'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                            : 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        <span className="text-[9px]">
                          {task.category === 'quiz' ? '🎯' : task.category === 'presentation' ? '🎤' : '📝'}
                        </span>
                        <span className="truncate">{task.title}</span>
                      </div>
                    ))}

                    {dayTasks.length > 2 && (
                      <div className="text-[9px] text-slate-400 text-right px-1">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Sidebar: Selected Day & Quick Deadline Lists (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Selected Day's Tasks */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isToday(selectedDate) ? "Today's Schedule" : format(selectedDate, 'EEEE, MMM d')}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedDateTasks.length} task{selectedDateTasks.length === 1 ? '' : 's'} on this day
                </p>
              </div>

              <button
                onClick={() => onOpenNewTask(format(selectedDate, 'yyyy-MM-dd'))}
                className="p-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 transition-all"
                title="Add task on this date"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {selectedDateTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-indigo-400/40 mx-auto mb-2" />
                  No deadlines on this date.
                </div>
              ) : (
                selectedDateTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onToggleStatus={onToggleStatus}
                    onToggleSubtask={onToggleSubtask}
                  />
                ))
              )}
            </div>
          </div>

          {/* Overdue Alert Widget if any */}
          {overdueTasks.length > 0 && (
            <div className="glass-panel p-4 rounded-3xl border border-rose-500/30 bg-rose-950/20 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Overdue Deadlines ({overdueTasks.length})</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {overdueTasks.map(task => (
                  <div 
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className="p-2 rounded-xl bg-slate-900/50 border border-rose-500/20 text-xs cursor-pointer hover:bg-rose-900/20 transition-colors"
                  >
                    <p className="font-semibold text-rose-300 truncate">{task.title}</p>
                    <p className="text-[10px] text-rose-400/80">
                      Was due: {task.deadline ? format(parseISO(task.deadline), 'MMM d, h:mm a') : 'Unknown'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
