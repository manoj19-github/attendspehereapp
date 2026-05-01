// src/store/useAuthStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { OfficeSettings, User } from '../types';
import { ASYNC_STORAGE_KEYS } from '../enviroments';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  officeSettings: OfficeSettings | null;
  
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
  updateToken: (accessToken: string) => Promise<void>;
  setUser: (user:any) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>
  setAccessToken: (accessToken: string) => Promise<void>;
  setOfficeSettings: (officeSettings: OfficeSettings) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  officeSettings: null,
  setOfficeSettings: (officeSettings) => set({ officeSettings }),
  setAccessToken: async (accessToken) => {
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN, accessToken);
    set({ accessToken,isAuthenticated:true });
  },

  setAuth: async (user, accessToken, refreshToken) => {
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN, accessToken);
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN);
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.REFRESH_TOKEN);
    await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.USER_DATA);
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
   
    
  },

  loadAuth: async () => {
    try {
      const [token, refresh, userData] = await Promise.all([
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN),
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(ASYNC_STORAGE_KEYS.USER_DATA),
      ]);


      if (token && refresh && userData) {
        set({
          accessToken: token,
          refreshToken: refresh,
          user: JSON.parse(userData),
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Load auth error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateToken: async (accessToken) => {
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN, accessToken);
    set({ accessToken });
  },
  setUser: async (user:any) => {
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    set({ user });
  },
  setTokens: async (accessToken:string, refreshToken:string) => {
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN, accessToken);
    await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    set({ accessToken, refreshToken });
    if(accessToken){
      set({isAuthenticated:true})
    }
  },
}));