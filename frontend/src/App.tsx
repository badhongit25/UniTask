import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/AuthPage';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { TaskManagement } from './components/TaskManagement';
import { CalendarView } from './components/CalendarView';
import { PomodoroTimer } from './components/PomodoroTimer';
import { AnalyticsView } from './components/AnalyticsView';
import { TaskModal } from './components/TaskModal';
import { ProfileModal } from './components/ProfileModal';
import { Task, Stats, NotificationItem, TaskCategory } from './types';
import { api } from './services/api';
import { playChime } from './utils/sound';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'calendar' | 'pomodoro' | 'analytics'>('dashboard');

  // Data States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);

  // Filter & Modal States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultTaskCategory, setDefaultTaskCategory] = useState<TaskCategory>('assignment');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Fetch all tasks, stats, and notifications
  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [tasksRes, statsRes, notifsRes] = await Promise.all([
        api.getTasks(),
        api.getStats(),
        api.getNotifications()
      ]);

      setTasks(tasksRes.tasks || []);
      setStats(statsRes.stats || null);
      setNotifications(notifsRes.notifications || []);
      setUnreadNotifsCount(notifsRes.unreadCount || 0);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // Background timer to check deadlines every 60 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadData();
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, loadData]);

  // Handle task creation / update
  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      await api.updateTask(editingTask.id, taskData);
    } else {
      await api.createTask(taskData);
      playChime('success');
    }
    setEditingTask(null);
    await loadData();
  };

  // Handle task delete
  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await api.deleteTask(id);
      await loadData();
    }
  };

  // Handle status toggle (pending -> in_progress -> completed)
  const handleToggleStatus = async (id: string, status: string) => {
    await api.toggleTaskStatus(id, status);
    await loadData();
  };

  // Handle subtask toggle
  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    await api.toggleSubtask(taskId, subtaskId);
    await loadData();
  };

  // Open modal for new task with optional category or date
  const handleOpenNewTask = (cat?: TaskCategory) => {
    setEditingTask(null);
    if (cat) setDefaultTaskCategory(cat);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Loading spinner during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // If not logged in, render AuthPage
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTask={() => handleOpenNewTask()}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        notifications={notifications}
        unreadCount={unreadNotifsCount}
        onRefreshNotifications={loadData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <DashboardStats
              stats={stats}
              tasks={tasks}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setActiveTab('tasks');
              }}
              onFilterStatus={() => {
                setActiveTab('tasks');
              }}
              onOpenNewTask={() => handleOpenNewTask()}
            />

            {/* Quick Task Board Preview on Dashboard */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Active University Deadlines</h3>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  View All Tasks & Board →
                </button>
              </div>

              <TaskManagement
                tasks={tasks}
                onOpenNewTask={handleOpenNewTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onToggleStatus={handleToggleStatus}
                onToggleSubtask={handleToggleSubtask}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <TaskManagement
            tasks={tasks}
            onOpenNewTask={handleOpenNewTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onToggleStatus={handleToggleStatus}
            onToggleSubtask={handleToggleSubtask}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            tasks={tasks}
            onOpenNewTask={() => handleOpenNewTask()}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onToggleStatus={handleToggleStatus}
            onToggleSubtask={handleToggleSubtask}
          />
        )}

        {activeTab === 'pomodoro' && (
          <PomodoroTimer tasks={tasks} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView stats={stats} tasks={tasks} />
        )}

      </main>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        defaultCategory={defaultTaskCategory}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-white/5 text-center text-xs text-slate-500">
        <p>UniTask • Smart University Academic Deadline & Task Tracker • Built for Students</p>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
