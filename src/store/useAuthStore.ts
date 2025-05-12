
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,

        login: async (email: string, password: string) => {
          // Mock login - in real app, this would call an API
          return new Promise<void>((resolve) => {
            setTimeout(() => {
              set({
                user: {
                  id: "user-1",
                  email,
                },
                isAuthenticated: true,
              });
              resolve();
            }, 1000);
          });
        },

        register: async (email: string, password: string) => {
          // Mock register - in real app, this would call an API
          return new Promise<void>((resolve) => {
            setTimeout(() => {
              set({
                user: {
                  id: "user-1",
                  email,
                },
                isAuthenticated: true,
              });
              resolve();
            }, 1000);
          });
        },

        logout: () => {
          set({ user: null, isAuthenticated: false });
        },
      }),
      {
        name: "auth-storage",
      }
    )
  )
);
