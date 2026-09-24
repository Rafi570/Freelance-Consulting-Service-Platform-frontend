'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  IUser,
  getAuthToken,
  getStoredUser,
  clearAuthSession,
  loginUser,
  loginUserWithGoogle,
  verifyEmailOtp,
  setAuthSession
} from '@/lib/api';
import AuthModal from '@/components/AuthModal';
import { GoogleOAuthProvider } from '@react-oauth/google';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  setSession: (token: string, user: IUser) => void;
  authModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [isLoading, setIsLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await loginUser(email, password);
      setToken(res.data.accessToken);
      setUser(res.data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    setIsLoading(true);
    try {
      const res = await loginUserWithGoogle(idToken);
      setToken(res.data.accessToken);
      setUser(res.data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      const res = await verifyEmailOtp(email, otp);
      setToken(res.data.accessToken);
      setUser(res.data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const setSession = (newToken: string, newUser: IUser) => {
    setAuthSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setToken(null);
  };

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1029695050935-1f0tk8ulr5dq396kf4ll5c36e8ud7k3s.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthContext.Provider
        value={{
          user,
          token,
          isLoading,
          login,
          loginWithGoogle,
          verifyOtp,
          logout,
          setSession,
          authModalOpen,
          authModalTab,
          openAuthModal,
          closeAuthModal,
        }}
      >
        {children}
        <AuthModal
          isOpen={authModalOpen}
          onClose={closeAuthModal}
          initialTab={authModalTab}
        />
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
