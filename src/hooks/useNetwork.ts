import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import { useOfflineStore } from '../store/useOfflineStore';
import { processQueue } from '../utils/sync.utils';
 // ✅ IMPORT processQueue

export const useNetwork = () => {
  useEffect(() => {
    // Load persisted queue on mount
    useOfflineStore.getState().loadQueue();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected ?? false;
      const wasOffline = !useOfflineStore.getState().isOnline;

      useOfflineStore.getState().setOnlineStatus(isConnected);

      // If came back online, process queue
      if (wasOffline && isConnected) {
        Toast.show({
          type: 'info',
          text1: '📡 Back Online',
          text2: 'Syncing pending data...',
        });

        // ✅ Use processQueue
        processQueue().then(({ success, failed }) => {
          if (success > 0 || failed > 0) {
            Toast.show({
              type: 'success',
              text1: '✅ Sync Complete',
              text2: `${success} synced${failed > 0 ? `, ${failed} failed` : ''}`,
            });
          }
        });
      }
    });

    return () => unsubscribe();
  }, []);
};