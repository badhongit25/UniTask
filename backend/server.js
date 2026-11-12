const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { readDb, writeDb } = require('./db');
const { authMiddleware, JWT_SECRET } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Helper: create activity log
async function logActivity(userId, action, details) {
  try {
    const db = readDb();
    db.activities.unshift({
      id: uuidv4(),
      userId,
      action,
      details,
      createdAt: new Date().toISOString()
    });
    // Keep last 50 activities per user
    db.activities = db.activities.slice(0, 100);
    await writeDb(db);
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// Automatic Deadline & Notification Checker
async function checkDeadlinesAndNotify(userId) {
  try {
    const db = readDb();
    const now = new Date();
    const userTasks = db.tasks.filter(t => t.userId === userId && t.status !== 'completed');
    let dbChanged = false;

    for (const task of userTasks) {
      if (!task.deadline) continue;
      const deadlineDate = new Date(task.deadline);
      const diffMs = deadlineDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // Check overdue
      if (diffMs < 0) {
        const alreadyNotified = db.notifications.some(
          n => n.userId === userId && n.taskId === task.id && n.type === 'overdue'
        );
        if (!alreadyNotified) {
          db.notifications.unshift({
            id: uuidv4(),
            userId,
            taskId: task.id,
            title: `⚠️ Overdue Task: ${task.title}`,
            message: `Your task "${task.title}" is overdue! Deadline was ${deadlineDate.toLocaleString()}.`,
            type: 'overdue',
            read: false,
            createdAt: new Date().toISOString()
          });
          dbChanged = true;
        }
      }
      // Check 1 hour reminder
      else if (diffHours <= 1 && diffHours > 0) {
        const alreadyNotified = db.notifications.some(
          n => n.userId === userId && n.taskId === task.id && n.type === 'reminder_1h'
        );
        if (!alreadyNotified && (task.reminder === '1_hour' || task.reminder === 'both')) {
          db.notifications.unshift({
            id: uuidv4(),
            userId,
            taskId: task.id,
            title: `⏰ Urgent: 1 Hour Left for ${task.title}`,
            message: `Task "${task.title}" deadline is coming up in less than 1 hour (${deadlineDate.toLocaleTimeString()}).`,
            type: 'reminder_1h',
            read: false,
            createdAt: new Date().toISOString()
          });
          dbChanged = true;
        }
      }
      // Check 1 day reminder
      else if (diffHours <= 24 && diffHours > 1) {
        const alreadyNotified = db.notifications.some(
          n => n.userId === userId && n.taskId === task.id && n.type === 'reminder_1d'
        );
        if (!alreadyNotified && (task.reminder === '1_day' || task.reminder === 'both')) {
          db.notifications.unshift({
            id: uuidv4(),
            userId,
            taskId: task.id,
            title: `📅 Reminder: 1 Day Left for ${task.title}`,
            message: `Task "${task.title}" is due tomorrow at ${deadlineDate.toLocaleTimeString()}.`,
            type: 'reminder_1d',
            read: false,
            createdAt: new Date().toISOString()
          });
          dbChanged = true;
        }
      }
    }

    if (dbChanged) {
      await writeDb(db);
    }
  } catch (err) {
    console.error('Error checking deadlines:', err);
  }
}

// ================= AUTH ROUTES =================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, university, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    const db = readDb();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      university: university ? university.trim() : 'Dhaka University',
      department: department ? department.trim() : 'Computer Science',
      avatarUrl: '',
      bio: 'Ready to ace this semester! 🚀',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);

    // Create sample welcome tasks for university student
    const sampleTasks = [
      {
        id: uuidv4(),
        userId: newUser.id,
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
          { id: uuidv4(), title: 'Binary Search Tree code', completed: true },
          { id: uuidv4(), title: 'Dijkstra shortest path algorithm', completed: false },
          { id: uuidv4(), title: 'Generate PDF report and zip source files', completed: false }
        ],
        notes: 'Instructor emphasized clean variable names and commented code. Due 11:59 PM.',
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        userId: newUser.id,
        title: 'Database Management Systems Quiz 2',
        description: 'Syllabus: SQL Joins, Normalization (1NF, 2NF, 3NF, BCNF), and Transaction ACID properties.',
        startDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'urgent',
        category: 'quiz',
        status: 'in_progress',
        reminder: 'both',
        recurring: 'none',
        subtasks: [
          { id: uuidv4(), title: 'Review chapter 5 & 6 lecture slides', completed: true },
          { id: uuidv4(), title: 'Solve previous year mid/quiz questions', completed: false }
        ],
        notes: 'Room 402 at 10:00 AM. Bring scientific calculator and student ID.',
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        userId: newUser.id,
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
          { id: uuidv4(), title: 'Design slides in Google Slides', completed: false },
          { id: uuidv4(), title: 'Rehearse speech with team members', completed: false }
        ],
        notes: 'Each member speaks for 2.5 minutes. Dress code: Semi-formal.',
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    db.tasks.push(...sampleTasks);

    // Initial welcome notification
    db.notifications.push({
      id: uuidv4(),
      userId: newUser.id,
      taskId: null,
      title: '🎓 Welcome to UniTask!',
      message: 'Your personal university deadline and academic task management hub is ready.',
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    });

    await writeDb(db);

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        university: newUser.university,
        department: newUser.department,
        avatarUrl: newUser.avatarUrl,
        bio: newUser.bio,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = readDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    // Check deadlines immediately upon login
    await checkDeadlinesAndNotify(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        university: user.university || '',
        department: user.department || '',
        avatarUrl: user.avatarUrl || '',
        bio: user.bio || '',
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get Current User
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Update Profile
app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { name, university, department, bio, avatarUrl } = req.body;
    const db = readDb();
    const userIndex = db.users.findIndex(u => u.id === req.userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (name) db.users[userIndex].name = name.trim();
    if (university !== undefined) db.users[userIndex].university = university.trim();
    if (department !== undefined) db.users[userIndex].department = department.trim();
    if (bio !== undefined) db.users[userIndex].bio = bio.trim();
    if (avatarUrl !== undefined) db.users[userIndex].avatarUrl = avatarUrl;

    await writeDb(db);
    await logActivity(req.userId, 'PROFILE_UPDATED', 'Updated student profile information');

    res.json({
      user: {
        id: db.users[userIndex].id,
        name: db.users[userIndex].name,
        email: db.users[userIndex].email,
        university: db.users[userIndex].university,
        department: db.users[userIndex].department,
        avatarUrl: db.users[userIndex].avatarUrl,
        bio: db.users[userIndex].bio,
        createdAt: db.users[userIndex].createdAt
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Update / Remove Avatar specifically
app.post('/api/auth/avatar', authMiddleware, async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    const db = readDb();
    const user = db.users.find(u => u.id === req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.avatarUrl = avatarUrl || '';
    await writeDb(db);
    await logActivity(req.userId, 'AVATAR_UPDATED', avatarUrl ? 'Changed profile photo' : 'Removed profile photo');

    res.json({ success: true, avatarUrl: user.avatarUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

// ================= TASK ROUTES (User Isolated) =================

// Get all tasks for current user
app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    await checkDeadlinesAndNotify(req.userId);
    const db = readDb();
    let tasks = db.tasks.filter(t => t.userId === req.userId);

    const { status, category, priority, search, sortBy } = req.query;

    if (status && status !== 'all') {
      tasks = tasks.filter(t => t.status === status);
    }
    if (category && category !== 'all') {
      tasks = tasks.filter(t => t.category === category);
    }
    if (priority && priority !== 'all') {
      tasks = tasks.filter(t => t.priority === priority);
    }
    if (search) {
      const q = search.toLowerCase();
      tasks = tasks.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'deadline_asc') {
      tasks.sort((a, b) => new Date(a.deadline || '9999').getTime() - new Date(b.deadline || '9999').getTime());
    } else if (sortBy === 'deadline_desc') {
      tasks.sort((a, b) => new Date(b.deadline || '0').getTime() - new Date(a.deadline || '0').getTime());
    } else if (sortBy === 'priority') {
      const pOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      tasks.sort((a, b) => (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0));
    } else {
      // Default: urgent & upcoming deadlines first, then newest
      tasks.sort((a, b) => new Date(a.deadline || '9999').getTime() - new Date(b.deadline || '9999').getTime());
    }

    res.json({ tasks });
  } catch (err) {
    console.error('Fetch tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

// Create task
app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      deadline,
      priority,
      category,
      status,
      reminder,
      recurring,
      subtasks,
      notes
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const db = readDb();
    const newTask = {
      id: uuidv4(),
      userId: req.userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      startDate: startDate || new Date().toISOString(),
      deadline: deadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: priority || 'medium', // low, medium, high, urgent
      category: category || 'assignment', // assignment, presentation, quiz, study, personal, work
      status: status || 'pending', // pending, in_progress, completed
      reminder: reminder || 'both', // 1_day, 1_hour, both, none
      recurring: recurring || 'none', // none, daily, weekly, monthly
      subtasks: Array.isArray(subtasks) ? subtasks.map(s => ({
        id: s.id || uuidv4(),
        title: s.title || '',
        completed: Boolean(s.completed)
      })) : [],
      notes: notes || '',
      completedAt: status === 'completed' ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.tasks.unshift(newTask);
    await writeDb(db);
    await logActivity(req.userId, 'TASK_CREATED', `Added new ${newTask.category}: "${newTask.title}"`);
    await checkDeadlinesAndNotify(req.userId);

    res.status(201).json({ task: newTask });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// Update task
app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const db = readDb();
    const index = db.tasks.findIndex(t => t.id === req.params.id && t.userId === req.userId);

    if (index === -1) {
      return res.status(404).json({ error: 'Task not found or access denied.' });
    }

    const prevTask = db.tasks[index];
    const {
      title,
      description,
      startDate,
      deadline,
      priority,
      category,
      status,
      reminder,
      recurring,
      subtasks,
      notes
    } = req.body;

    const isNewlyCompleted = status === 'completed' && prevTask.status !== 'completed';

    db.tasks[index] = {
      ...prevTask,
      title: title !== undefined ? title.trim() : prevTask.title,
      description: description !== undefined ? description.trim() : prevTask.description,
      startDate: startDate !== undefined ? startDate : prevTask.startDate,
      deadline: deadline !== undefined ? deadline : prevTask.deadline,
      priority: priority !== undefined ? priority : prevTask.priority,
      category: category !== undefined ? category : prevTask.category,
      status: status !== undefined ? status : prevTask.status,
      reminder: reminder !== undefined ? reminder : prevTask.reminder,
      recurring: recurring !== undefined ? recurring : prevTask.recurring,
      subtasks: Array.isArray(subtasks) ? subtasks : prevTask.subtasks,
      notes: notes !== undefined ? notes : prevTask.notes,
      completedAt: isNewlyCompleted ? new Date().toISOString() : (status !== 'completed' ? null : prevTask.completedAt),
      updatedAt: new Date().toISOString()
    };

    // If recurring task was marked completed, create next recurrence instance
    if (isNewlyCompleted && db.tasks[index].recurring && db.tasks[index].recurring !== 'none') {
      const curDeadline = new Date(db.tasks[index].deadline);
      let nextDeadline = new Date(curDeadline);
      if (db.tasks[index].recurring === 'daily') {
        nextDeadline.setDate(nextDeadline.getDate() + 1);
      } else if (db.tasks[index].recurring === 'weekly') {
        nextDeadline.setDate(nextDeadline.getDate() + 7);
      } else if (db.tasks[index].recurring === 'monthly') {
        nextDeadline.setMonth(nextDeadline.getMonth() + 1);
      }

      const nextTask = {
        ...db.tasks[index],
        id: uuidv4(),
        status: 'pending',
        startDate: new Date().toISOString(),
        deadline: nextDeadline.toISOString(),
        completedAt: null,
        subtasks: db.tasks[index].subtasks.map(s => ({ ...s, id: uuidv4(), completed: false })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.tasks.unshift(nextTask);
    }

    await writeDb(db);
    await logActivity(req.userId, isNewlyCompleted ? 'TASK_COMPLETED' : 'TASK_UPDATED', `Updated "${db.tasks[index].title}"`);

    res.json({ task: db.tasks[index] });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// Delete task
app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const db = readDb();
    const taskToDelete = db.tasks.find(t => t.id === req.params.id && t.userId === req.userId);

    if (!taskToDelete) {
      return res.status(404).json({ error: 'Task not found or access denied.' });
    }

    db.tasks = db.tasks.filter(t => !(t.id === req.params.id && t.userId === req.userId));
    // Clean up notifications related to this task
    db.notifications = db.notifications.filter(n => !(n.taskId === req.params.id && n.userId === req.userId));

    await writeDb(db);
    await logActivity(req.userId, 'TASK_DELETED', `Deleted task: "${taskToDelete.title}"`);

    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

// Quick toggle status
app.patch('/api/tasks/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const db = readDb();
    const task = db.tasks.find(t => t.id === req.params.id && t.userId === req.userId);

    if (!task) return res.status(404).json({ error: 'Task not found.' });

    task.status = status;
    task.completedAt = status === 'completed' ? new Date().toISOString() : null;
    task.updatedAt = new Date().toISOString();

    await writeDb(db);
    await logActivity(req.userId, status === 'completed' ? 'TASK_COMPLETED' : 'TASK_STATUS_CHANGED', `Marked "${task.title}" as ${status}`);

    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

// Toggle subtask
app.patch('/api/tasks/:id/subtasks/:subtaskId', authMiddleware, async (req, res) => {
  try {
    const db = readDb();
    const task = db.tasks.find(t => t.id === req.params.id && t.userId === req.userId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const subtask = task.subtasks?.find(s => s.id === req.params.subtaskId);
    if (!subtask) return res.status(404).json({ error: 'Subtask not found' });

    subtask.completed = !subtask.completed;
    task.updatedAt = new Date().toISOString();

    await writeDb(db);
    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle subtask' });
  }
});

// ================= STATS & ANALYTICS =================

app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    await checkDeadlinesAndNotify(req.userId);
    const db = readDb();
    const tasks = db.tasks.filter(t => t.userId === req.userId);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;

    // Overdue: not completed and deadline in past
    const overdue = tasks.filter(t => {
      if (t.status === 'completed' || !t.deadline) return false;
      return new Date(t.deadline).getTime() < now.getTime();
    }).length;

    // Today's: deadline is today
    const today = tasks.filter(t => {
      if (!t.deadline) return false;
      const d = new Date(t.deadline);
      return d >= startOfToday && d <= endOfToday;
    }).length;

    // Upcoming: within next 7 days and after now
    const upcoming = tasks.filter(t => {
      if (!t.deadline || t.status === 'completed') return false;
      const d = new Date(t.deadline);
      return d > now && d <= next7Days;
    }).length;

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // By Category
    const byCategory = {
      assignment: tasks.filter(t => t.category === 'assignment').length,
      presentation: tasks.filter(t => t.category === 'presentation').length,
      quiz: tasks.filter(t => t.category === 'quiz').length,
      study: tasks.filter(t => t.category === 'study').length,
      personal: tasks.filter(t => t.category === 'personal').length,
      work: tasks.filter(t => t.category === 'work').length
    };

    // By Priority
    const byPriority = {
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };

    // 7-day completion trend
    const last7DaysData = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dayStr = day.toISOString().slice(0, 10);
      const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });

      const dayCompleted = tasks.filter(t => {
        if (!t.completedAt) return false;
        return t.completedAt.slice(0, 10) === dayStr;
      }).length;

      const dayDue = tasks.filter(t => {
        if (!t.deadline) return false;
        return t.deadline.slice(0, 10) === dayStr;
      }).length;

      last7DaysData.push({
        date: dayStr,
        day: dayName,
        completed: dayCompleted,
        due: dayDue
      });
    }

    res.json({
      stats: {
        total,
        completed,
        pending,
        inProgress,
        overdue,
        today,
        upcoming,
        percentage,
        byCategory,
        byPriority,
        last7DaysData
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to calculate stats.' });
  }
});

// ================= NOTIFICATIONS =================

// Get notifications
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    await checkDeadlinesAndNotify(req.userId);
    const db = readDb();
    const notifications = db.notifications
      .filter(n => n.userId === req.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// Mark single as read
app.patch('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    const db = readDb();
    const notif = db.notifications.find(n => n.id === req.params.id && n.userId === req.userId);
    if (notif) {
      notif.read = true;
      await writeDb(db);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read.' });
  }
});

// Mark all as read
app.patch('/api/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    const db = readDb();
    db.notifications.forEach(n => {
      if (n.userId === req.userId) n.read = true;
    });
    await writeDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read.' });
  }
});

// Delete all notifications
app.delete('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const db = readDb();
    db.notifications = db.notifications.filter(n => n.userId !== req.userId);
    await writeDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notifications.' });
  }
});

// ================= ACTIVITY & EXPORT =================

// Activity logs
app.get('/api/activities', authMiddleware, (req, res) => {
  try {
    const db = readDb();
    const activities = db.activities
      .filter(a => a.userId === req.userId)
      .slice(0, 30);
    res.json({ activities });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get activities.' });
  }
});

// Export CSV
app.get('/api/export/csv', authMiddleware, (req, res) => {
  try {
    const db = readDb();
    const tasks = db.tasks.filter(t => t.userId === req.userId);

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

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="unitask_tasks.csv"');
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to export CSV.' });
  }
});

// Serve static frontend build
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 UniTask Backend Server running on http://localhost:${PORT}`);
});
