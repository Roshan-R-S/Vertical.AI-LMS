import React, { createContext, useContext, useEffect, useState } from 'react';
import { Role, User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  register: (
    email: string, 
    password?: string, 
    name?: string, 
    role?: Role,
    extra?: { firstName?: string; lastName?: string; username?: string; phone?: string; profession?: string }
  ) => Promise<{ message: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('lendkraft_user');
    const token = localStorage.getItem('lendkraft_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setToken(token);
    }
    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }

      const { token, user: loggedInUser } = data;
      
      if (loggedInUser.avatar && loggedInUser.avatar.startsWith('/uploads')) {
        const absoluteAvatar = `${API_URL.replace('/api/v1', '')}${loggedInUser.avatar}`;
        console.log('[AuthContext] Resolving avatar:', loggedInUser.avatar, '=>', absoluteAvatar);
        loggedInUser.avatar = absoluteAvatar;
      }
      
      setUser(loggedInUser);
      setToken(token);
      localStorage.setItem('lendkraft_user', JSON.stringify(loggedInUser));
      localStorage.setItem('lendkraft_token', token);
      
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string, 
    password?: string, 
    name?: string, 
    role?: Role,
    extra?: { firstName?: string; lastName?: string; username?: string; phone?: string; profession?: string }
  ) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role, ...extra }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Registration failed');
      }

      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('lendkraft_user');
    localStorage.removeItem('lendkraft_token');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...data };
      setUser(newUser);
      localStorage.setItem('lendkraft_user', JSON.stringify(newUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
