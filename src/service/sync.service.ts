/* eslint-disable @typescript-eslint/no-unused-vars */
import NetInfo from '@react-native-community/netinfo';
import { useOfflineStore } from '../store/useOfflineStore';
import { useAppStore } from '../store/useAppStore';
import { locationApi } from './location.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineQueueItem } from '../types';

const QUEUE_KEY = '@offline_queue';

class SyncService {
  private unsubscribe: (() => void) | null = null;

  startListening() {
    this.unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected ?? false;
      useOfflineStore.getState().setOnlineStatus(isOnline);
      
      if (isOnline) {
        this.syncOfflineData();
      }
    });
  }

  stopListening() {
    this.unsubscribe?.();
  }

  async syncOfflineData() {
    const { queue, isSyncing } = useOfflineStore.getState();
    
    if (isSyncing || queue.length === 0) return;
    
    useOfflineStore.getState().setSyncing(true);
    useAppStore.getState().setSuccess('Syncing offline data...');

    for (const item of queue) {
      try {
        if (item.type === 'location_ping') {
          await locationApi.ping(item.data);
        }
        
        await useOfflineStore.getState().removeFromQueue(item.id);
      } catch (error: any) {
        if (item.retryCount >= 3) {
          await useOfflineStore.getState().removeFromQueue(item.id);
        } else {
          await useOfflineStore.getState().updateRetryCount(item.id);
        }
      }
    }

    useOfflineStore.getState().setSyncing(false);
    const remaining = useOfflineStore.getState().queue.length;
    
    if (remaining === 0) {
      useAppStore.getState().setSuccess('All data synced!');
    }
  }
}

export const syncService = new SyncService();

// ✅ ADDED: Queue helper functions
export const getQueuedItems = async (): Promise<OfflineQueueItem[]> => {
  const data = await AsyncStorage.getItem(QUEUE_KEY);
  return data ? JSON.parse(data) : [];
};

export const addToQueue = async (item: OfflineQueueItem) => {
  const queue = await getQueuedItems();
  queue.push(item);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const removeFromQueue = async (id: string) => {
  const queue = await getQueuedItems();
  const filtered = queue.filter((item) => item.id !== id);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
};

// ✅ ADDED: Queue a location ping for offline sync
export const queueLocationPing = async (data: {
  lat: number;
  lng: number;
  timestamp: string;
}) => {
  const newItem: OfflineQueueItem = {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'location_ping',
    data,
    timestamp: new Date().toISOString(),
    retryCount: 0,
  };

  const queue = await getQueuedItems();
  queue.push(newItem);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  
  // Also update Zustand store
  useOfflineStore.getState().addToQueue({
    type: 'location_ping',
    data,
  });
};

// ✅ ADDED: Queue a manual checkin for offline sync
export const queueCheckin = async (data: {
  lat: number;
  lng: number;
}) => {
  const newItem: OfflineQueueItem = {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'attendance',
    data,
    timestamp: new Date().toISOString(),
    retryCount: 0,
  };

  const queue = await getQueuedItems();
  queue.push(newItem);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  
  // Also update Zustand store
  useOfflineStore.getState().addToQueue({
    type: 'attendance',
    data,
  });
};

export const processQueue = async (): Promise<{ success: number; failed: number }> => {
  const queue = await getQueuedItems();
  let success = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      if (item.type === 'location_ping') {
        await locationApi.ping(item.data);
      } else if (item.type === 'attendance') {
        await locationApi.manualCheckin(item.data);
      }
      await removeFromQueue(item.id);
      success++;
    } catch (error:any) {
      failed++;
      if (item.retryCount >= 3) {
        await removeFromQueue(item.id);
      }
    }
  }

  return { success, failed };
};