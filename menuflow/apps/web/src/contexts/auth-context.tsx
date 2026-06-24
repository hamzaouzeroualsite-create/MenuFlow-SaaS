'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { User, Restaurant } from '@/types';
import { loginWithEmail, logoutUser, subscribeToAuth } from '@/lib/firebase/auth';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { getDocument, COLLECTIONS } from '@/lib/firebase/firestore';
import { DEMO_RESTAURANT } from '@/lib/demo/data';

interface AuthContextValue {
  user: User | null;
  restaurant: Restaurant | null;
  loading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRestaurant = useCallback(async (u: User | null) => {
    if (!u?.restaurantId) {
      setRestaurant(null);
      return;
    }
    if (!isFirebaseConfigured) {
      setRestaurant(DEMO_RESTAURANT);
      return;
    }
    const r = await getDocument<Restaurant>(COLLECTIONS.restaurants, u.restaurantId);
    setRestaurant(r);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('menuflow-demo-user') : null;
      if (stored) {
        const u = JSON.parse(stored) as User;
        setUser(u);
        loadRestaurant(u);
      }
      setLoading(false);
      return;
    }
    const unsub = subscribeToAuth(async (u) => {
      setUser(u);
      await loadRestaurant(u);
      setLoading(false);
    });
    return unsub;
  }, [loadRestaurant]);

  const login = async (email: string, password: string) => {
    const u = await loginWithEmail(email, password);
    setUser(u);
    if (!isFirebaseConfigured) {
      localStorage.setItem('menuflow-demo-user', JSON.stringify(u));
    }
    await loadRestaurant(u);
    return u;
  };

  const logout = async () => {
    await logoutUser();
    localStorage.removeItem('menuflow-demo-user');
    setUser(null);
    setRestaurant(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        restaurant,
        loading,
        isDemo: !isFirebaseConfigured,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
