import { create } from "zustand";
import { api } from "../lib/api";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  language: string;
  unit_system: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  role: string;
  avatar_url?: string;
  bio?: string;
  height_cm?: number;
  weight_kg?: number;
  date_of_birth?: string;
  gender?: string;
  fitness_goal?: string;
  activity_level?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    language?: string;
  }) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("gym-token"),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem("gym-token"),

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Login failed" }));
        throw new Error(err.detail || "Login failed");
      }
      const data = await res.json();
      localStorage.setItem("gym-token", data.access_token);
      set({ token: data.access_token, isAuthenticated: true });
      const user = await api<User>("/api/auth/me");
      set({ user, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api<{ access_token: string }>("/api/auth/register", {
        method: "POST",
        body: data,
      });
      localStorage.setItem("gym-token", res.access_token);
      set({ token: res.access_token, isAuthenticated: true });
      const user = await api<User>("/api/auth/me");
      set({ user, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  logout: () => {
    localStorage.removeItem("gym-token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const user = await api<User>("/api/auth/me");
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem("gym-token");
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: async (data) => {
    const user = await api<User>("/api/auth/me", { method: "PUT", body: data });
    set({ user });
  },
}));
