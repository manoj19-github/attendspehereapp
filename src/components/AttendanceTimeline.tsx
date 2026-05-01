import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LogIn, LogOut, Coffee } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { formatTime } from '../utils/time.utils';
import Card from './Card';

// ✅ FIX: Removed `events` prop entirely — component reads from store directly.
// The original DashboardScreen passed `events` as a prop but the component
// signature didn't actually use it, causing a silent mismatch and potential crash
// when TypeScript expected the prop shape.
const AttendanceTimeline: React.FC = () => {
  const { todayAttendance } = useAttendanceStore();

  // ✅ FIX: Default to empty array if attendance data hasn't loaded yet
  const events = todayAttendance?.events ?? [];

  const getIcon = (type: string) => {
    if (type === 'checkin') return <LogIn size={16} color={Colors.success} />;
    return <LogOut size={16} color={Colors.error} />;
  };

  const getStatusColor = (type: string) => {
    return type === 'checkin' ? Colors.success : Colors.error;
  };

  // ✅ FIX: Guard formatTime — if timestamp is null/undefined it may throw
  const safeFormatTime = (timestamp: any) => {
    try {
      return formatTime(timestamp);
    } catch {
      return '--:--';
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Coffee size={20} color={Colors.primary} />
        <Text style={styles.title}>Today's Sessions</Text>
        <Text style={styles.sessionCount}>
          {/* ✅ FIX: Use Math.floor not ceil to avoid showing "1 session" with only 1 event */}
          {Math.floor(events.length / 2)} sessions
        </Text>
      </View>

      <ScrollView style={styles.timeline} showsVerticalScrollIndicator={false}>
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No check-ins today</Text>
            <Text style={styles.emptySubtext}>Tap "Check In" to start your day</Text>
          </View>
        ) : (
          events.map((event, index) => (
            // ✅ FIX: Fall back to index if event.id is undefined (prevents key warning/crash)
            <View key={event.id ?? `event-${index}`} style={styles.eventRow}>
              <View style={styles.timelineLine}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: getStatusColor(event.event_type) },
                  ]}
                />
                {index < events.length - 1 && <View style={styles.line} />}
              </View>
              <View style={styles.eventContent}>
                <Text style={styles.eventType}>
                  {event.event_type === 'checkin' ? 'Check In' : 'Check Out'}
                </Text>
                <Text style={styles.eventTime}>
                  {safeFormatTime(event.timestamp_event)}
                </Text>
              </View>
              {getIcon(event.event_type)}
            </View>
          ))
        )}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 300,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  sessionCount: {
    fontSize: 12,
    color: Colors.textMuted,
    backgroundColor: Colors.primaryLighter,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeline: {
    maxHeight: 220,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  timelineLine: {
    alignItems: 'center',
    width: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.card,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  eventContent: {
    flex: 1,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  eventTime: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
});

export default AttendanceTimeline;