import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, authStorage } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (info: { name: string; email: string; password: string; university?: string; department?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  requestNotificationPermission: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('unitask_theme') as 'dark' | 'light') || 'dark';
  });

  // Apply theme to html / root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('unitask_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Restore session on page load
  useEffect(() => {
    const checkAuth = async () => {
      const token = authStorage.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getMe();
        setUser(data.user);
      } catch (err) {
        console.warn('Session expired or invalid token:', err);
        authStorage.clearToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    setUser(data.user);
  };

  const register = async (info: { name: string; email: string; password: string; university?: string; department?: string }) => {
    const data = await api.register(info);
    setUser(data.user);
  };

  const logout = () => {
    authStorage.clearToken();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
  };

  const updateAvatar = async (avatarUrl: string) => {
    await api.updateAvatar(avatarUrl);
    if (user) {
      setUser({ ...user, avatarUrl });
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updateAvatar,
        theme,
        toggleTheme,
        requestNotificationPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
