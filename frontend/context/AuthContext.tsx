"use client";
import { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
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

  async function refresh() {
    try {
      const user = await api.auth.me();
      dispatch({ type: "SET_USER", user });
    } catch {
      dispatch({ type: "CLEAR" });
    }
  }

  useEffect(() => { refresh(); }, []);

  async function login(email: string, password: string) {
    const user = await api.auth.login({ email, password }) as UserProfile;
    dispatch({ type: "SET_USER", user });
  }

  async function register(name: string, email: string, password: string) {
    const user = await api.auth.register({ name, email, password }) as UserProfile;
    dispatch({ type: "SET_USER", user });
  }

  async function logout() {
    await api.auth.logout();
    dispatch({ type: "CLEAR" });
  }

  return (
    <AuthContext.Provider value={{ state, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
