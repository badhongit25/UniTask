export type TaskCategory = 'assignment' | 'presentation' | 'quiz' | 'study' | 'personal' | 'work';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type ReminderType = '1_day' | '1_hour' | 'both' | 'none';
export type RecurringType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  startDate: string;
  deadline: string;
  priority: TaskPriority;
  category: TaskCategory;
  status: TaskStatus;
  reminder: ReminderType;
  recurring: RecurringType;
  subtasks: SubTask[];
  notes: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  university?: string;
  department?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  taskId: string | null;
  title: string;
  message: string;
  type: 'reminder_1d' | 'reminder_1h' | 'overdue' | 'system';
  read: boolean;
  createdAt: string;
}

export interface Stats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  today: number;
  upcoming: number;
  percentage: number;
  byCategory: {
    assignment: number;
    presentation: number;
    quiz: number;
    study: number;
    personal: number;
    work: number;
  };
  byPriority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  last7DaysData: Array<{
    date: string;
    day: string;
    completed: number;
    due: number;
  }>;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  createdAt: string;
}
