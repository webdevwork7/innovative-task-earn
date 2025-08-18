import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  balance?: number;
  kycStatus?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (data: SignupData) => Promise<any>;
  logout: () => Promise<void>;
  refetch: () => void;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  referralCode?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);

  // Check authentication status
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/auth/check'],
    queryFn: async () => {
      const response = await fetch('/api/auth/check', {
        credentials: 'include'
      });
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    } else {
      setUser(null);
    }
  }, [data]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      return response.json();
    },
    onSuccess: (data) => {
      if (data?.user) {
        setUser(data.user);
        queryClient.invalidateQueries({ queryKey: ['/api/auth/check'] });
      }
    }
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async (signupData: SignupData) => {
      const response = await apiRequest('POST', '/api/auth/signup', signupData);
      return response.json();
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/check'] });
      queryClient.clear();
    }
  });

  const value: AuthContextType = {
    user,
    isLoading,
    login: async (email, password) => {
      try {
        const result = await loginMutation.mutateAsync({ email, password });
        if (result?.success && result?.user) {
          return { success: true, user: result.user };
        } else {
          return { success: false, error: result?.error || 'Login failed' };
        }
      } catch (error: any) {
        return { success: false, error: error?.message || 'Login failed' };
      }
    },
    signup: (data) => signupMutation.mutateAsync(data),
    logout: () => logoutMutation.mutateAsync(),
    refetch
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}