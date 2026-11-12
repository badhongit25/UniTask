import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Plus, 
  Bell, 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogOut, 
  CheckCheck, 
  Trash2, 
  Clock, 
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { NotificationItem } from '../types';
import { api } from '../services/api';

interface NavbarProps {
  activeTab: 'dashboard' | 'tasks' | 'calendar' | 'pomodoro' | 'analytics';
  setActiveTab: (tab: 'dashboard' | 'tasks' | 'calendar' | 'pomodoro' | 'analytics') => void;
  onOpenNewTask: () => void;
  onOpenProfile: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onRefreshNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTask,
  onOpenProfile,
  notifications,
  unreadCount,
  onRefreshNotifications
}) => {
  const { user, logout, theme, toggleTheme, requestNotificationPermission } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    onRefreshNotifications();
  };

  const handleClearNotifications = async () => {
    await api.clearNotifications();
    onRefreshNotifications();
  };

  const handleEnablePush = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      alert('Browser notifications enabled! You will receive timely alerts for university deadlines.');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                UniTask
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Academic Deadline Hub</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900/40 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'tasks'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Tasks & Deadlines
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'calendar'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('pomodoro')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'pomodoro'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Pomodoro
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Analytics
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          
          {/* Quick Add Button */}
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl glass-card text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl glass-card text-slate-300 hover:text-white hover:bg-white/10 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl p-4 border border-white/15 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-200">Deadline Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearNotifications}
                        className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                        title="Clear all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto my-2 space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                      No notifications yet! You are all caught up.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          n.read
                            ? 'bg-slate-900/30 border-white/5 opacity-70'
                            : 'bg-indigo-950/40 border-indigo-500/30 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {n.type === 'overdue' ? (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          ) : n.type === 'reminder_1h' ? (
                            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          ) : n.type === 'reminder_1d' ? (
                            <Calendar className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                          ) : (
                            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-slate-200">{n.title}</p>
                            <p className="text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Push Notification button */}
                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[11px] text-slate-400">
                  <span>Browser alerts</span>
                  <button
                    onClick={handleEnablePush}
                    className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    Enable Push <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl glass-card hover:bg-white/10 transition-colors"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover border border-white/20"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold border border-white/20">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="text-xs font-medium text-slate-200 hidden lg:inline max-w-[100px] truncate">
                {user?.name || 'Student'}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl p-2 border border-white/15 z-50">
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  {user?.university && (
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {user.university}
                    </span>
                  )}
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenProfile();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-indigo-400" />
                    Student Profile
                  </button>
                </div>

                <div className="pt-1 border-t border-white/10">
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Tab Navigation Bar */}
      <div className="md:hidden flex items-center justify-around pt-2.5 mt-2 border-t border-white/5 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`py-1 px-2 rounded-md ${activeTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`py-1 px-2 rounded-md ${activeTab === 'tasks' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Tasks
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`py-1 px-2 rounded-md ${activeTab === 'calendar' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Calendar
        </button>
        <button
          onClick={() => setActiveTab('pomodoro')}
          className={`py-1 px-2 rounded-md ${activeTab === 'pomodoro' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Pomodoro
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-1 px-2 rounded-md ${activeTab === 'analytics' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Analytics
        </button>
      </div>
    </header>
  );
};
