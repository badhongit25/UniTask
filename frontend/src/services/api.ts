import { Task, User, Stats, NotificationItem, ActivityLog } from '../types';

const TOKEN_KEY = 'unitask_auth_token';
const USERS_KEY = 'unitask_local_users';
const TASKS_KEY = 'unitask_local_tasks';
const NOTIFS_KEY = 'unitask_local_notifs';
const ACTS_KEY = 'unitask_local_acts';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

// Local storage fallback helpers for static hosting (GitHub Pages / Vercel)
function getLocalUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getLocalTasks(userId: string): Task[] {
  try {
    const all: Task[] = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
    return all.filter(t => t.userId === userId);
  } catch {
    return [];
  }
}

function saveAllLocalTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function getAllLocalTasks(): Task[] {
  try {
    return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
  } catch {
    return [];
  }
}

function getLocalNotifs(userId: string): NotificationItem[] {
  try {
    const all: NotificationItem[] = JSON.parse(localStorage.getItem(NOTIFS_KEY) || '[]');
    return all.filter(n => n.userId === userId);
  } catch {
    return [];
  }
}

function saveAllLocalNotifs(notifs: NotificationItem[]) {
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
}

function getLocalActs(userId: string): ActivityLog[] {
  try {
    const all: ActivityLog[] = JSON.parse(localStorage.getItem(ACTS_KEY) || '[]');
    return all.filter(a => a.userId === userId);
  } catch {
    return [];
  }
}

function addLocalAct(userId: string, action: string, details: string) {
  try {
    const all: ActivityLog[] = JSON.parse(localStorage.getItem(ACTS_KEY) || '[]');
    all.unshift({
      id: crypto.randomUUID(),
      userId,
      action,
      details,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(ACTS_KEY, JSON.stringify(all.slice(0, 50)));
  } catch (err) {
    console.warn(err);
  }
}

// Generate sample university tasks for new local user
function initSampleTasks(userId: string): Task[] {
  return [
    {
      id: crypto.randomUUID(),
      userId,
      title: 'Submit Data Structures Assignment 1',
      description: 'Complete Trees and Graph implementation with complexity analysis report.',
      startDate: new Date().toISOString(),
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
      category: 'assignment',
      status: 'pending',
      reminder: 'both',
      recurring: 'none',
      subtasks: [
        { id: crypto.randomUUID(), title: 'Binary Search Tree code', completed: true },
        { id: crypto.randomUUID(), title: 'Dijkstra shortest path algorithm', completed: false },
        { id: crypto.randomUUID(), title: 'Generate PDF report and zip source files', completed: false }
      ],
      notes: 'Instructor emphasized clean variable names and commented code. Due 11:59 PM.',
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      userId,
      title: 'Database Management Systems Quiz 2',
      description: 'Syllabus: SQL Joins, Normalization (1NF, 2NF, 3NF, BCNF), and ACID properties.',
      startDate: new Date().toISOString(),
      deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'urgent',
      category: 'quiz',
      status: 'in_progress',
      reminder: 'both',
      recurring: 'none',
      subtasks: [
        { id: crypto.randomUUID(), title: 'Review chapter 5 & 6 lecture slides', completed: true },
        { id: crypto.randomUUID(), title: 'Solve previous year mid/quiz questions', completed: false }
      ],
      notes: 'Room 402 at 10:00 AM. Bring student ID.',
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      userId,
      title: 'Software Engineering Project Presentation',
      description: 'Prepare 10-minute slide deck with live demo of the web app architecture.',
      startDate: new Date().toISOString(),
      deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'medium',
      category: 'presentation',
      status: 'pending',
      reminder: '1_day',
      recurring: 'none',
      subtasks: [
        { id: crypto.randomUUID(), title: 'Design slides in Google Slides', completed: false },
        { id: crypto.randomUUID(), title: 'Rehearse speech with team members', completed: false }
      ],
      notes: 'Each member speaks for 2.5 minutes. Dress code: Semi-formal.',
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    try {
      const data = await apiRequest<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      authStorage.setToken(data.token);
      return data;
    } catch {
      // Local fallback for static hosting
      const users = getLocalUsers();
      const existing = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase().trim());
      if (existing) {
        authStorage.setToken(existing.id);
        return { token: existing.id, user: existing };
      }
      // Demo auto-create
      if (credentials.email === 'demo@unitask.edu') {
        const demoUser: User = {
          id: 'demo-user-123',
          name: 'Shakil Ahmed',
          email: 'demo@unitask.edu',
          university: 'Dhaka University',
          department: 'CSE',
          avatarUrl: '',
          bio: 'Aiming for high CGPA this semester! 🚀',
          createdAt: new Date().toISOString()
        };
        users.push(demoUser);
        saveLocalUsers(users);
        const sampleTasks = initSampleTasks(demoUser.id);
        saveAllLocalTasks([...getAllLocalTasks(), ...sampleTasks]);
        authStorage.setToken(demoUser.id);
        return { token: demoUser.id, user: demoUser };
      }
      throw new Error('Invalid email or password.');
    }
  },

  async register(info: { name: string; email: string; password: string; university?: string; department?: string }) {
    try {
      const data = await apiRequest<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(info),
      });
      authStorage.setToken(data.token);
      return data;
    } catch {
      // Local fallback
      const users = getLocalUsers();
      const existing = users.find(u => u.email.toLowerCase() === info.email.toLowerCase().trim());
      if (existing) {
        throw new Error('An account with this email already exists.');
      }
      const newUser: User = {
        id: crypto.randomUUID(),
        name: info.name.trim(),
        email: info.email.toLowerCase().trim(),
        university: info.university?.trim() || 'Dhaka University',
        department: info.department?.trim() || 'Computer Science',
        avatarUrl: '',
        bio: 'Ready to ace this semester! 🚀',
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      saveLocalUsers(users);

      const sampleTasks = initSampleTasks(newUser.id);
      saveAllLocalTasks([...getAllLocalTasks(), ...sampleTasks]);

      authStorage.setToken(newUser.id);
      return { token: newUser.id, user: newUser };
    }
  },

  async getMe() {
    try {
      return await apiRequest<{ user: User }>('/api/auth/me');
    } catch {
      const token = authStorage.getToken();
      if (!token) throw new Error('No token');
      const users = getLocalUsers();
      const user = users.find(u => u.id === token);
      if (user) return { user };
      // Fallback demo user if token is set
      const demo: User = {
        id: token,
        name: 'Demo Student',
        email: 'student@du.ac.bd',
        university: 'Dhaka University',
        department: 'CSE',
        avatarUrl: '',
        bio: 'Ready to ace this semester! 🚀',
        createdAt: new Date().toISOString()
      };
      return { user: demo };
    }
  },

  async updateProfile(profileData: Partial<User>) {
    try {
      return await apiRequest<{ user: User }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    } catch {
      const token = authStorage.getToken();
      const users = getLocalUsers();
      const userIndex = users.findIndex(u => u.id === token);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...profileData };
        saveLocalUsers(users);
        addLocalAct(token!, 'PROFILE_UPDATED', 'Updated student profile information');
        return { user: users[userIndex] };
      }
      const updated: User = {
        id: token || 'default',
        name: profileData.name || 'Student',
        email: 'student@du.ac.bd',
        ...profileData
      };
      return { user: updated };
    }
  },

  async updateAvatar(avatarUrl: string) {
    try {
      return await apiRequest<{ success: boolean; avatarUrl: string }>('/api/auth/avatar', {
        method: 'POST',
        body: JSON.stringify({ avatarUrl }),
      });
    } catch {
      const token = authStorage.getToken();
      const users = getLocalUsers();
      const user = users.find(u => u.id === token);
      if (user) {
        user.avatarUrl = avatarUrl;
        saveLocalUsers(users);
      }
      return { success: true, avatarUrl };
    }
  },

  // Tasks
  async getTasks(params?: { status?: string; category?: string; priority?: string; search?: string; sortBy?: string }) {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.category) query.set('category', params.category);
      if (params?.priority) query.set('priority', params.priority);
      if (params?.search) query.set('search', params.search);
      if (params?.sortBy) query.set('sortBy', params.sortBy);

      const queryString = query.toString() ? `?${query.toString()}` : '';
      return await apiRequest<{ tasks: Task[] }>(`/api/tasks${queryString}`);
    } catch {
      const token = authStorage.getToken() || 'default';
      let tasks = getLocalTasks(token);
      if (tasks.length === 0) {
        tasks = initSampleTasks(token);
        saveAllLocalTasks([...getAllLocalTasks(), ...tasks]);
      }
      if (params?.status && params.status !== 'all') {
        tasks = tasks.filter(t => t.status === params.status);
      }
      if (params?.category && params.category !== 'all') {
        tasks = tasks.filter(t => t.category === params.category);
      }
      if (params?.priority && params.priority !== 'all') {
        tasks = tasks.filter(t => t.priority === params.priority);
      }
      return { tasks };
    }
  },

  async createTask(task: Partial<Task>) {
    try {
      return await apiRequest<{ task: Task }>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
      });
    } catch {
      const token = authStorage.getToken() || 'default';
      const newTask: Task = {
        id: crypto.randomUUID(),
        userId: token,
        title: task.title || 'Untitled Task',
        description: task.description || '',
        startDate: task.startDate || new Date().toISOString(),
        deadline: task.deadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        priority: task.priority || 'medium',
        category: task.category || 'assignment',
        status: task.status || 'pending',
        reminder: task.reminder || 'both',
        recurring: task.recurring || 'none',
        subtasks: task.subtasks || [],
        notes: task.notes || '',
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const all = getAllLocalTasks();
      all.unshift(newTask);
      saveAllLocalTasks(all);
      addLocalAct(token, 'TASK_CREATED', `Added new ${newTask.category}: "${newTask.title}"`);
      return { task: newTask };
    }
  },

  async updateTask(id: string, task: Partial<Task>) {
    try {
      return await apiRequest<{ task: Task }>(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(task),
      });
    } catch {
      const all = getAllLocalTasks();
      const idx = all.findIndex(t => t.id === id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...task, updatedAt: new Date().toISOString() };
        if (task.status === 'completed' && !all[idx].completedAt) {
          all[idx].completedAt = new Date().toISOString();
        }
        saveAllLocalTasks(all);
        return { task: all[idx] };
      }
      throw new Error('Task not found');
    }
  },

  async deleteTask(id: string) {
    try {
      return await apiRequest<{ success: boolean; message: string }>(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
    } catch {
      const all = getAllLocalTasks();
      const filtered = all.filter(t => t.id !== id);
      saveAllLocalTasks(filtered);
      return { success: true, message: 'Deleted' };
    }
  },

  async toggleTaskStatus(id: string, status: string) {
    try {
      return await apiRequest<{ task: Task }>(`/api/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch {
      return this.updateTask(id, {
        status: status as Task['status'],
        completedAt: status === 'completed' ? new Date().toISOString() : null
      });
    }
  },

  async toggleSubtask(taskId: string, subtaskId: string) {
    try {
      return await apiRequest<{ task: Task }>(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'PATCH',
      });
    } catch {
      const all = getAllLocalTasks();
      const task = all.find(t => t.id === taskId);
      if (task) {
        const sub = task.subtasks.find(s => s.id === subtaskId);
        if (sub) {
          sub.completed = !sub.completed;
          saveAllLocalTasks(all);
          return { task };
        }
      }
      throw new Error('Subtask not found');
    }
  },

  // Stats
  async getStats() {
    try {
      return await apiRequest<{ stats: Stats }>('/api/stats');
    } catch {
      const token = authStorage.getToken() || 'default';
      const tasks = getLocalTasks(token);
      const now = new Date();
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const pending = tasks.filter(t => t.status === 'pending').length;
      const inProgress = tasks.filter(t => t.status === 'in_progress').length;
      const overdue = tasks.filter(t => t.status !== 'completed' && t.deadline && new Date(t.deadline).getTime() < now.getTime()).length;
      const today = tasks.filter(t => t.deadline && new Date(t.deadline).toDateString() === now.toDateString()).length;
      const upcoming = tasks.filter(t => t.status !== 'completed' && t.deadline && new Date(t.deadline) > now).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      const stats: Stats = {
        total,
        completed,
        pending,
        inProgress,
        overdue,
        today,
        upcoming,
        percentage,
        byCategory: {
          assignment: tasks.filter(t => t.category === 'assignment').length,
          presentation: tasks.filter(t => t.category === 'presentation').length,
          quiz: tasks.filter(t => t.category === 'quiz').length,
          study: tasks.filter(t => t.category === 'study').length,
          personal: tasks.filter(t => t.category === 'personal').length,
          work: tasks.filter(t => t.category === 'work').length
        },
        byPriority: {
          urgent: tasks.filter(t => t.priority === 'urgent').length,
          high: tasks.filter(t => t.priority === 'high').length,
          medium: tasks.filter(t => t.priority === 'medium').length,
          low: tasks.filter(t => t.priority === 'low').length
        },
        last7DaysData: [
          { date: 'Day 1', day: 'Sun', completed: 2, due: 3 },
          { date: 'Day 2', day: 'Mon', completed: 4, due: 2 },
          { date: 'Day 3', day: 'Tue', completed: 3, due: 4 },
          { date: 'Day 4', day: 'Wed', completed: 5, due: 3 },
          { date: 'Day 5', day: 'Thu', completed: 6, due: 2 },
          { date: 'Day 6', day: 'Fri', completed: 4, due: 1 },
          { date: 'Day 7', day: 'Sat', completed: 5, due: 2 },
        ]
      };
      return { stats };
    }
  },

  // Notifications
  async getNotifications() {
    try {
      return await apiRequest<{ notifications: NotificationItem[]; unreadCount: number }>('/api/notifications');
    } catch {
      const token = authStorage.getToken() || 'default';
      const notifs = getLocalNotifs(token);
      if (notifs.length === 0) {
        notifs.push({
          id: crypto.randomUUID(),
          userId: token,
          taskId: null,
          title: '🎓 Welcome to UniTask!',
          message: 'Your personal university deadline and academic task management hub is ready.',
          type: 'system',
          read: false,
          createdAt: new Date().toISOString()
        });
        saveAllLocalNotifs([...getLocalNotifs(token), ...notifs]);
      }
      return { notifications: notifs, unreadCount: notifs.filter(n => !n.read).length };
    }
  },

  async markNotificationRead(id: string) {
    try {
      return await apiRequest<{ success: boolean }>(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
    } catch {
      const all = getLocalNotifs(authStorage.getToken() || 'default');
      const n = all.find(item => item.id === id);
      if (n) n.read = true;
      saveAllLocalNotifs(all);
      return { success: true };
    }
  },

  async markAllNotificationsRead() {
    try {
      return await apiRequest<{ success: boolean }>('/api/notifications/read-all', {
        method: 'PATCH',
      });
    } catch {
      const all = getLocalNotifs(authStorage.getToken() || 'default');
      all.forEach(n => { n.read = true; });
      saveAllLocalNotifs(all);
      return { success: true };
    }
  },

  async clearNotifications() {
    try {
      return await apiRequest<{ success: boolean }>('/api/notifications', {
        method: 'DELETE',
      });
    } catch {
      const token = authStorage.getToken() || 'default';
      const all = getLocalNotifs(token).filter(n => n.userId !== token);
      saveAllLocalNotifs(all);
      return { success: true };
    }
  },

  // Activity logs
  async getActivities() {
    try {
      return await apiRequest<{ activities: ActivityLog[] }>('/api/activities');
    } catch {
      const token = authStorage.getToken() || 'default';
      return { activities: getLocalActs(token) };
    }
  },

  // Export
  async exportCsv() {
    try {
      const token = authStorage.getToken();
      const res = await fetch('/api/export/csv', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('API export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unitask_deadlines_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      const token = authStorage.getToken() || 'default';
      const tasks = getLocalTasks(token);
      const headers = ['Title', 'Category', 'Priority', 'Status', 'Start Date', 'Deadline', 'Description', 'Notes'];
      const rows = tasks.map(t => [
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${t.category || ''}"`,
        `"${t.priority || ''}"`,
        `"${t.status || ''}"`,
        `"${t.startDate || ''}"`,
        `"${t.deadline || ''}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unitask_deadlines_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }
};
