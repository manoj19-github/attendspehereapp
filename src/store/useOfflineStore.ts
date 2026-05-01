import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineQueueItem } from '../types';

const OFFLINE_QUEUE_KEY = '@attendsphere_offline_queue';

interface OfflineStore {
  // State
  queue: OfflineQueueItem[];
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;

  // Actions
  setOnlineStatus: (status: boolean) => void;
  addToQueue: (item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>) => Promise<void>;
  removeFromQueue: (id: string) => Promise<void>;
  updateRetryCount: (id: string) => Promise<void>;
  clearQueue: () => Promise<void>;
  loadQueue: () => Promise<void>;
  setSyncing: (syncing: boolean) => void;
}

export const useOfflineStore = create<OfflineStore>((set, get) => ({
  queue: [],
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,

  setOnlineStatus: (status) => set({ isOnline: status }),

  addToQueue: async (item) => {
    const newItem: OfflineQueueItem = {
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    const updatedQueue = [...get().queue, newItem];
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
    set({ queue: updatedQueue, pendingCount: updatedQueue.length });
  },

  removeFromQueue: async (id) => {
    const updatedQueue = get().queue.filter((item) => item.id !== id);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
    set({ queue: updatedQueue, pendingCount: updatedQueue.length });
  },

  updateRetryCount: async (id) => {
    const updatedQueue = get().queue.map((item) =>
      item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item
    );
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
    set({ queue: updatedQueue });
  },

  clearQueue: async () => {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    set({ queue: [], pendingCount: 0 });
  },

  loadQueue: async () => {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (data) {
        const queue = JSON.parse(data) as OfflineQueueItem[];
        set({ queue, pendingCount: queue.length });
      }
    } catch (error) {
      console.error('Load queue error:', error);
    }
  },

  setSyncing: (isSyncing) => set({ isSyncing }),
}));