// src/components/common/StatusBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';


interface Props {
  status: 'online' | 'offline' | 'syncing';
  text?: string;
}

const StatusBadge: React.FC<Props> = ({ status, text }) => {
  const colors = {
    online: Colors.statusOnline,
    offline: Colors.statusOffline,
    syncing: Colors.statusSyncing,
  };

  const defaultTexts = {
    online: 'Online',
    offline: 'Offline',
    syncing: 'Syncing...',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors[status] + '20' }]}>
      <View style={[styles.dot, { backgroundColor: colors[status] }]} />
      <Text style={[styles.text, { color: colors[status] }]}>
        {text || defaultTexts[status]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StatusBadge;