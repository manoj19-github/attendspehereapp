// src/components/common/OfflineBanner.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { useOfflineStore } from '../store/useOfflineStore';
import { syncService } from '../utils/sync.utils';


const OfflineBanner: React.FC = () => {
  const { isOnline, queue, isSyncing } = useOfflineStore();

  if (isOnline && queue.length === 0) return null;

  return (
    <View style={styles.container}>
      <WifiOff size={16} color={Colors.warning} />
      <Text style={styles.text}>
        {!isOnline 
          ? `You're offline. ${queue.length} items queued.` 
          : `${queue.length} items pending sync.`
        }
      </Text>
      {isOnline && queue.length > 0 && (
        <TouchableOpacity onPress={() => syncService.syncOfflineData()} disabled={isSyncing}>
          <RefreshCw size={16} color={Colors.primary} style={isSyncing && styles.spinning} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.warningLight + '30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    fontSize: 13,
    color: Colors.warning,
    fontWeight: '500',
    flex: 1,
  },
  spinning: {
    transform: [{ rotate: '45deg' }],
  },
});

export default OfflineBanner;