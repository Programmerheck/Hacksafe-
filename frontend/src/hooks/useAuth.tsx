'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getDecodedToken, isTokenExpired } from '../utils/auth';
import { apiUrl } from '../lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if token exists in localStorage on mount
    const storedToken = localStorage.getItem('hs_token');
    
    if (storedToken) {
      if (isTokenExpired(storedToken)) {
        localStorage.removeItem('hs_token');
        setUser(null);
        setToken(null);
      } else {
        const decoded = getDecodedToken(storedToken);
        if (decoded) {
          setUser({
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role,
          });
          setToken(storedToken);
        }
      }
    }
    setLoading(false);
  }, []);

  // Protect route checking
  useEffect(() => {
    if (loading) return;

    const publicPages = ['/login', '/signup'];
    const isPublicPage = publicPages.includes(pathname);

    const storedToken = localStorage.getItem('hs_token');

    if (!storedToken && !isPublicPage) {
      router.push('/login');
    } else if (storedToken && isPublicPage) {
      router.push('/dashboard');
    }
  }, [pathname, token, loading, router]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        return { success: false, message: data.message || 'Login failed.' };
      }

      localStorage.setItem('hs_token', data.token);
      setToken(data.token);
      setUser(data.user);
      router.push('/dashboard');
      return { success: true };
    } catch (err: any) {
      return { success: false, message: 'Server is currently offline or unreachable.' };
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const res = await fetch(apiUrl('/api/auth/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        return { success: false, message: data.message || 'Signup failed.' };
      }

      localStorage.setItem('hs_token', data.token);
      setToken(data.token);
      setUser(data.user);
      router.push('/dashboard');
      return { success: true };
    } catch (err: any) {
      return { success: false, message: 'Server is currently offline or unreachable.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('hs_token');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
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
