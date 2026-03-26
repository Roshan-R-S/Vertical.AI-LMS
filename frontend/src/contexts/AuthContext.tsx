import React, { createContext, useContext, useEffect, useState } from 'react';
import { MOCK_USERS } from '../mockData';
import { Role, User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string, role: Role) => Promise<{ message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_CREDENTIALS: Record<string, { role: Role; userId: string; name: string }> = {
  'admin@vertical.ai': { role: 'SUPER_ADMIN', userId: 'u1', name: 'System Admin' },
  'sales@vertical.ai': { role: 'SALES_ADMIN', userId: 'u2', name: 'Sales Manager' },
  'lead@vertical.ai': { role: 'TEAM_LEAD', userId: 'u3', name: 'Team Leader' },
  'alex@vertical.ai': { role: 'BDE', userId: 'u4', name: 'Alex Johnson' },
  'jane@vertical.ai': { role: 'BDE', userId: 'u5', name: 'Jane Smith' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credentials, setCredentials] = useState(DEFAULT_CREDENTIALS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('lendkraft_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const creds = credentials[email.toLowerCase()];
    // Simple validation: password must contain '123'
    if (creds && password.includes('123')) {
      const foundUser = MOCK_USERS.find((u) => u.id === creds.userId) || {
        id: creds.userId,
        name: creds.name,
        email: email,
        role: creds.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(creds.name)}&background=random`
      };
      
      const loggedInUser = { ...foundUser };
      setUser(loggedInUser);
      localStorage.setItem('lendkraft_user', JSON.stringify(loggedInUser));
      setLoading(false);
      return loggedInUser as User;
    }

    setLoading(false);
    throw new Error('Invalid email or password');
  };

  const register = async (email: string, password: string, name: string, role: Role) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Create a new entry in credentials state
    setCredentials(prev => ({
      ...prev,
      [email.toLowerCase()]: {
        role,
        userId: `new_${Date.now()}`,
        name
      }
    }));

    return { message: `Registration successful for ${role}! You can now login with ${email}.` };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lendkraft_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
