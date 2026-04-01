// 'use client';

// import React, {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
// } from 'react';
// import { User } from '@/types';
// import { setAuthToken, clearAuthToken } from '@/lib/axios';

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface TenantContextValue {
//   user: User | null;
//   tenantId: string | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   login: (token: string, user: User) => void;
//   logout: () => void;
//   updateUser: (user: Partial<User>) => void;
// }

// // ─── Context ──────────────────────────────────────────────────────────────────

// const TenantContext = createContext<TenantContextValue | null>(null);

// const TOKEN_KEY = 'mt_todo_token';
// const USER_KEY = 'mt_todo_user';

// // ─── Provider ─────────────────────────────────────────────────────────────────

// export function TenantProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // Rehydrate from localStorage on mount
//   useEffect(() => {
//     try {
//       const storedToken = localStorage.getItem(TOKEN_KEY);
//       const storedUser = localStorage.getItem(USER_KEY);

//       if (storedToken && storedUser) {
//         const parsedUser: User = JSON.parse(storedUser);
//         setToken(storedToken);
//         setUser(parsedUser);
//         setAuthToken(storedToken, parsedUser.userTenants.tenant_id, parsedUser.userTenants.tenant.slug);
//       }
//     } catch {
//       // Corrupted storage — wipe it
//       localStorage.removeItem(TOKEN_KEY);
//       localStorage.removeItem(USER_KEY);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   const login = useCallback((newToken: string, newUser: User) => {
//     localStorage.setItem(TOKEN_KEY, newToken);
//     localStorage.setItem(USER_KEY, JSON.stringify(newUser));
//     setAuthToken(newToken, newUser.tenant_id, newUser.tenant.slug);
//     setToken(newToken);
//     setUser(newUser);
//   }, []);

//   const logout = useCallback(() => {
//     localStorage.removeItem(TOKEN_KEY);
//     localStorage.removeItem(USER_KEY);
//     clearAuthToken();
//     setToken(null);
//     setUser(null);
//   }, []);

//   const updateUser = useCallback((partial: Partial<User>) => {
//     setUser((prev) => {
//       if (!prev) return prev;
//       const updated = { ...prev, ...partial };
//       localStorage.setItem(USER_KEY, JSON.stringify(updated));
//       return updated;
//     });
//   }, []);

//   const value = useMemo<TenantContextValue>(
//     () => ({
//       user,
//       tenantId: user?.tenantId ?? null,
//       token,
//       isAuthenticated: !!token && !!user,
//       isLoading,
//       login,
//       logout,
//       updateUser,
//     }),
//     [user, token, isLoading, login, logout, updateUser],
//   );

//   return (
//     <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
//   );
// }

// // ─── Hook ─────────────────────────────────────────────────────────────────────

// export function useTenant(): TenantContextValue {
//   const ctx = useContext(TenantContext);
//   if (!ctx) {
//     throw new Error('useTenant must be used within <TenantProvider>');
//   }
//   return ctx;
// }

'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { User } from '@/types';
import { setAuthToken, clearAuthToken } from '@/lib/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TenantContextValue {
  user: User | null;
  tenantId: string | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const TenantContext = createContext<TenantContextValue | null>(null);

const TOKEN_KEY = 'mt_todo_token';
const USER_KEY = 'mt_todo_user';

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setAuthToken(storedToken, parsedUser.tenant.id, parsedUser.tenant.slug);
      }
    } catch {
      // Corrupted storage — wipe it
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setAuthToken(newToken, newUser.tenant.id, newUser.tenant.slug);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearAuthToken();
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = useMemo<TenantContextValue>(
    () => ({
      user,
      tenantId: user?.tenant.id ?? null,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [user, token, isLoading, login, logout, updateUser],
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error('useTenant must be used within <TenantProvider>');
  }
  return ctx;
}