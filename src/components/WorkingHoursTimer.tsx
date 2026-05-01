import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, AlertCircle } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { getCurrentTime, formatDuration } from '../utils/time.utils';
import Card from './Card';

const WorkingHoursTimer: React.FC = () => {
  const { todayAttendance } = useAttendanceStore();
  const [currentTime, setCurrentTime] = useState(() => {
    // ✅ FIX: Wrap initial call in try/catch in case util throws on first render
    try {
      return getCurrentTime();
    } catch {
      return '';
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        setCurrentTime(getCurrentTime());
      } catch {
        // silently ignore timer errors
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ FIX: Safely read totalWorkingHours — default to 0 if attendance is null/undefined
  const totalHours = todayAttendance?.totalWorkingHours ?? 0;
  const isComplete = totalHours >= 8;
  const progress = Math.min((totalHours / 8) * 100, 100);

  // ✅ FIX: Guard formatDuration calls — it may crash on 0 or negative values
  const formattedTotal = (() => {
    try {
      return formatDuration(totalHours);
    } catch {
      return '0h 0m';
    }
  })();

  const formattedRemaining = (() => {
    try {
      return formatDuration(Math.max(8 - totalHours, 0));
    } catch {
      return '0h 0m';
    }
  })();

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Clock size={20} color={Colors.primary} />
        <Text style={styles.title}>Working Hours</Text>
        {isComplete ? (
          <View style={styles.completeBadge}>
            <Text style={styles.completeText}>Complete</Text>
          </View>
        ) : (
          <View style={styles.incompleteBadge}>
            <AlertCircle size={14} color={Colors.warning} />
            <Text style={styles.incompleteText}>{formattedRemaining} left</Text>
          </View>
        )}
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formattedTotal}</Text>
        <Text style={styles.currentTime}>{currentTime}</Text>
      </View>

      <View style={styles.progressContainer}>
        {/* ✅ FIX: Cast width to string explicitly for TypeScript — RN needs `${n}%` */}
        <View style={[styles.progressBar, { width: `${progress}%` as any }]} />
      </View>

      <Text style={styles.progressText}>
        {progress.toFixed(0)}% of 8 hours
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
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
  completeBadge: {
    backgroundColor: Colors.successLighter,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  incompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  incompleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.warning,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  timer: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary,
  },
  currentTime: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  progressContainer: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'right',
  },
});

export default WorkingHoursTimer;