// src/store/useAppStore.ts
import { create } from 'zustand';

interface AppStore {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (message: string | null) => void;
  clearMessages: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  isLoading: false,
  error: null,
  successMessage: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, successMessage: null }),
  setSuccess: (message) => set({ successMessage: message, error: null }),
  clearMessages: () => set({ error: null, successMessage: null }),
}));