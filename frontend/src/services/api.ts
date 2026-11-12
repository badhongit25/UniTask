import { Task, User, Stats, NotificationItem, ActivityLog } from '../types';

const TOKEN_KEY = 'unitask_auth_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

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
    const data = await apiRequest<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    authStorage.setToken(data.token);
    return data;
  },

  async register(info: { name: string; email: string; password: string; university?: string; department?: string }) {
    const data = await apiRequest<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(info),
    });
    authStorage.setToken(data.token);
    return data;
  },

  async getMe() {
    return apiRequest<{ user: User }>('/api/auth/me');
  },

  async updateProfile(profileData: Partial<User>) {
    return apiRequest<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async updateAvatar(avatarUrl: string) {
    return apiRequest<{ success: boolean; avatarUrl: string }>('/api/auth/avatar', {
      method: 'POST',
      body: JSON.stringify({ avatarUrl }),
    });
  },

  // Tasks
  async getTasks(params?: { status?: string; category?: string; priority?: string; search?: string; sortBy?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.category) query.set('category', params.category);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.search) query.set('search', params.search);
    if (params?.sortBy) query.set('sortBy', params.sortBy);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<{ tasks: Task[] }>(`/api/tasks${queryString}`);
  },

  async createTask(task: Partial<Task>) {
    return apiRequest<{ task: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  async updateTask(id: string, task: Partial<Task>) {
    return apiRequest<{ task: Task }>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  },

  async deleteTask(id: string) {
    return apiRequest<{ success: boolean; message: string }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleTaskStatus(id: string, status: string) {
    return apiRequest<{ task: Task }>(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async toggleSubtask(taskId: string, subtaskId: string) {
    return apiRequest<{ task: Task }>(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PATCH',
    });
  },

  // Stats
  async getStats() {
    return apiRequest<{ stats: Stats }>('/api/stats');
  },

  // Notifications
  async getNotifications() {
    return apiRequest<{ notifications: NotificationItem[]; unreadCount: number }>('/api/notifications');
  },

  async markNotificationRead(id: string) {
    return apiRequest<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  async markAllNotificationsRead() {
    return apiRequest<{ success: boolean }>('/api/notifications/read-all', {
      method: 'PATCH',
    });
  },

  async clearNotifications() {
    return apiRequest<{ success: boolean }>('/api/notifications', {
      method: 'DELETE',
    });
  },

  // Activity logs
  async getActivities() {
    return apiRequest<{ activities: ActivityLog[] }>('/api/activities');
  },

  // Export
  async exportCsv() {
    const token = authStorage.getToken();
    const res = await fetch('/api/export/csv', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unitask_deadlines_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
};
