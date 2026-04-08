import { create } from "zustand";

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: localStorage.getItem("gym-theme") !== "light",
  toggle: () =>
    set((s) => {
      const next = !s.isDark;
      localStorage.setItem("gym-theme", next ? "dark" : "light");
      return { isDark: next };
    }),
}));
