import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { LogIn, LogOut, ChevronDown, ChevronUp, Clock } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/colors';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { formatTime } from '../utils/time.utils';
import Card from './Card';

const AttendanceTimeline: React.FC = () => {
  const { todayAttendance } = useAttendanceStore();
  const [expanded, setExpanded] = useState(false);
  const animation = React.useRef(new Animated.Value(0)).current;

  const events = todayAttendance?.events ?? [];
  const displayEvents = expanded ? events : events.slice(0, 5);
  const hasMore = events.length > 5;

  const toggleExpand = () => {
    setExpanded(!expanded);
    Animated.spring(animation, {
      toValue: expanded ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const getIcon = (type: string) => {
    if (type === 'checkin') return <LogIn size={18} color={Colors.success} />;
    return <LogOut size={18} color={Colors.error} />;
  };

  const getStatusColor = (type: string) => {
    return type === 'checkin' ? Colors.success : Colors.error;
  };

  const getStatusBg = (type: string) => {
    return type === 'checkin' ? Colors.success + '15' : Colors.error + '15';
  };

  const safeFormatTime = (timestamp: any) => {
    try {
      return formatTime(timestamp);
    } catch {
      return '--:--';
    }
  };

  const rotateIcon = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Clock size={18} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Today's Sessions</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{events.length} events</Text>
        </View>
      </View>

      <View style={styles.timeline}>
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <LogIn size={32} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyText}>No check-ins today</Text>
            <Text style={styles.emptySubtext}>Tap "Check In" to start your day</Text>
          </View>
        ) : (
          <>
            {displayEvents.map((event, index) => (
              <View key={event.id ?? `event-${index}`} style={styles.eventRow}>
                {/* Timeline line */}
                <View style={styles.timelineLine}>
                  <View style={[styles.dot, { backgroundColor: getStatusColor(event.event_type) }]} />
                  {index < displayEvents.length - 1 && (
                    <View style={styles.line} />
                  )}
                  {index === displayEvents.length - 1 && expanded && index < events.length - 1 && (
                    <View style={[styles.line, styles.lineDashed]} />
                  )}
                </View>

                {/* Event card */}
                <View style={[styles.eventCard, { backgroundColor: getStatusBg(event.event_type) }]}>
                  <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                      <Text style={[styles.eventType, { color: getStatusColor(event.event_type) }]}>
                        {event.event_type === 'checkin' ? 'Check In' : 'Check Out'}
                      </Text>
                      {getIcon(event.event_type)}
                    </View>
                    <Text style={styles.eventTime}>
                      {safeFormatTime(event.timestamp_event)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Show More / Show Less button */}
            {hasMore && (
              <TouchableOpacity
                style={styles.showMoreBtn}
                onPress={toggleExpand}
                activeOpacity={0.7}
              >
                <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
                  <ChevronDown size={20} color={Colors.primary} />
                </Animated.View>
                <Text style={styles.showMoreText}>
                  {expanded ? 'Show Less' : `Show ${events.length - 5} More`}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  countBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  timeline: {
    paddingTop: 4,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  timelineLine: {
    alignItems: 'center',
    width: 28,
    marginTop: 4,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: Colors.card,
    ...Shadows.sm,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 50,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  lineDashed: {
    backgroundColor: Colors.primary + '40',
    borderStyle: 'dashed',
  },
  eventCard: {
    flex: 1,
    marginLeft: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    // ...Shadows.sm,
  },
  eventContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventType: {
    fontSize: 15,
    fontWeight: '800',
  },
  eventTime: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 4,
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
    gap: 6,
    backgroundColor: Colors.primary + '08',
    borderRadius: BorderRadius.lg,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default AttendanceTimeline;