"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, ReactNode } from "react";
import { api, type UserProfile } from "@/lib/api";

interface AuthState { user: UserProfile | null; loading: boolean; }
type Action =
  | { type: "SET_USER"; user: UserProfile }
  | { type: "CLEAR" }
  | { type: "LOADED" };

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case "SET_USER": return { user: action.user, loading: false };
    case "CLEAR":    return { user: null, loading: false };
    case "LOADED":   return { ...state, loading: false };
  }
}

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}>({ state: { user: null, loading: true }, login: async () => {}, register: async () => {}, logout: async () => {}, refresh: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { user: null, loading: true });

  const refresh = useCallback(async () => {
    try {
      const user = await api.auth.me();
      dispatch({ type: "SET_USER", user });
    } catch {
      dispatch({ type: "CLEAR" });
    }
  }, []);

  useEffect(() => { refresh(); }, []);

  const login = useCallback(async (email: string, password: string) => {
    const user = await api.auth.login({ email: email.trim().toLowerCase(), password }) as UserProfile;
    dispatch({ type: "SET_USER", user });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const user = await api.auth.register({ name: name.trim(), email: email.trim().toLowerCase(), password }) as UserProfile;
    dispatch({ type: "SET_USER", user });
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    dispatch({ type: "CLEAR" });
  }, []);

  const value = useMemo(() => ({ state, login, register, logout, refresh }), [state, login, register, logout, refresh]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
