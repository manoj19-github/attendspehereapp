import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,

  RefreshControl,
} from 'react-native';
import { Colors, Shadows, BorderRadius, Spacing } from '../constants/colors';


import { formatDate, formatTime } from '../utils/time.utils';
import { AttendanceEvent } from '../types';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { attendanceApi } from '../service/attendance.service';
import { useFocusEffect } from '@react-navigation/native';


export const AttendanceHistoryScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { history, setHistory } = useAttendanceStore();

  useFocusEffect(
    useCallback(
      () => {
        loadHistory();
      },
      []
    )
  )


  const loadHistory = async (pageNum: number = 1) => {
    try {
      const response = await attendanceApi.getHistory({page: pageNum, limit: 20});
      const data = response.data?.data || [];
      
      if (pageNum === 1) {
        setHistory(data);
      } else {
        setHistory([...history, ...data]);
      }
      
      setHasMore(data.length === 20);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadHistory(1);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadHistory(nextPage);
  };

  const renderItem = ({ item }: { item: AttendanceEvent }) => (
    <View style={styles.item}>
      <View style={styles.dateSection}>
        <Text style={styles.day}>{formatDate(item.event_date)}</Text>
      </View>
      <View style={styles.eventCard}>
        <View style={styles.eventRow}>
          <View style={[
            styles.eventDot,
            item.event_type === 'checkin' ? styles.checkinDot : styles.checkoutDot
          ]} />
          <View style={styles.eventInfo}>
            <Text style={styles.eventType}>
              {item.event_type === 'checkin' ? 'Check In' : 'Check Out'}
            </Text>
            <Text style={styles.eventTime}>{formatTime(item.timestamp_event)}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Attendance History</Text>
        <Text style={styles.subtitle}>Last 7 days & more</Text>
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No attendance records found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.secondary,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.gradientEnd,
  },
  subtitle: {
    fontSize: 14,
    color:  Colors.secondary,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  item: {
    marginBottom: Spacing.md,
  },
  dateSection: {
    marginBottom: Spacing.sm,
  },
  day: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  eventCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  checkinDot: {
    backgroundColor: Colors.success,
  },
  checkoutDot: {
    backgroundColor: Colors.error,
  },
  eventInfo: {
    flex: 1,
  },
  eventType: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  eventTime: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.warning,
  },
});