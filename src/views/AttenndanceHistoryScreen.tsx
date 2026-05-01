import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors, Shadows, BorderRadius, Spacing } from '../constants/colors';
import { formatDate, formatTime } from '../utils/time.utils';
import { AttendanceEvent } from '../types';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { attendanceApi } from '../service/attendance.service';
import { ArrowBigLeft, ArrowLeft, Icon } from 'lucide-react-native';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Group flat event array by calendar date string (YYYY-MM-DD) */
function groupByDate(events: AttendanceEvent[]): { date: string; events: AttendanceEvent[] }[] {
  const map = new Map<string, AttendanceEvent[]>();
  for (const ev of events) {
    // Use timestamp_event to derive a local date key
    const raw = ev.timestamp_event ?? ev.event_date ?? '';
    const key = raw ? new Date(raw).toLocaleDateString('en-CA') : 'unknown'; // YYYY-MM-DD
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(ev);
  }
  // Sort descending (newest first)
  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, evs]) => ({
      date,
      events: evs.sort(
        (a, b) =>
          new Date(a.timestamp_event ?? 0).getTime() -
          new Date(b.timestamp_event ?? 0).getTime(),
      ),
    }));
}

/** Pair checkin+checkout events into sessions */
function buildSessions(events: AttendanceEvent[]): {
  checkin: AttendanceEvent | null;
  checkout: AttendanceEvent | null;
  durationMin: number | null;
}[] {
  const sessions: { checkin: AttendanceEvent | null; checkout: AttendanceEvent | null; durationMin: number | null }[] = [];
  let i = 0;
  while (i < events.length) {
    const ev = events[i];
    if (ev.event_type === 'checkin') {
      const next = events[i + 1];
      const checkout = next?.event_type === 'checkout' ? next : null;
      let durationMin: number | null = null;
      if (checkout) {
        durationMin = Math.round(
          (new Date(checkout.timestamp_event).getTime() - new Date(ev.timestamp_event).getTime()) / 60000,
        );
      }
      sessions.push({ checkin: ev, checkout, durationMin });
      i += checkout ? 2 : 1;
    } else {
      // orphan checkout
      sessions.push({ checkin: null, checkout: ev, durationMin: null });
      i++;
    }
  }
  return sessions;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m > 0 ? `${m}m` : ''}`.trim();
}

function friendlyDate(dateStr: string): { weekday: string; full: string; isToday: boolean; isYesterday: boolean } {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const full = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return { weekday, full, isToday, isYesterday };
}

// ─── Animated Event Row ────────────────────────────────────────────────────────

const AnimatedEventRow: React.FC<{
  session: { checkin: AttendanceEvent | null; checkout: AttendanceEvent | null; durationMin: number | null };
  index: number;
  isLast: boolean;
}> = ({ session, index, isLast }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const { checkin, checkout, durationMin } = session;
  const isComplete = !!checkin && !!checkout;
  const isOngoing = !!checkin && !checkout;

  return (
    <Animated.View
      style={[
        styles.sessionCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        isComplete && styles.sessionCardComplete,
        isOngoing && styles.sessionCardOngoing,
      ]}
    >
      {/* Session index badge */}
      <View style={[styles.sessionBadge, isOngoing && styles.sessionBadgeOngoing]}>
        <Text style={styles.sessionBadgeText}>{index + 1}</Text>
      </View>

      {/* Events column */}
      <View style={styles.sessionEvents}>
        {/* Check-in row */}
        {checkin && (
          <View style={styles.eventPill}>
            <View style={styles.checkinIconWrap}>
              <Text style={styles.checkinIcon}>↑</Text>
            </View>
            <View style={styles.eventPillInfo}>
              <Text style={styles.eventPillLabel}>Check In</Text>
              <Text style={styles.eventPillTime}>{formatTime(checkin.timestamp_event)}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
          </View>
        )}

        {/* Connector line */}
        {checkin && (checkout || isOngoing) && (
          <View style={styles.connectorWrap}>
            <View style={[styles.connectorLine, isOngoing && styles.connectorLineDashed]} />
            {durationMin !== null && (
              <View style={styles.durationChip}>
                <Text style={styles.durationText}>{formatDuration(durationMin)}</Text>
              </View>
            )}
            {isOngoing && (
              <View style={styles.ongoingChip}>
                <View style={styles.ongoingDot} />
                <Text style={styles.ongoingText}>Active</Text>
              </View>
            )}
          </View>
        )}

        {/* Check-out row */}
        {checkout && (
          <View style={styles.eventPill}>
            <View style={styles.checkoutIconWrap}>
              <Text style={styles.checkoutIcon}>↓</Text>
            </View>
            <View style={styles.eventPillInfo}>
              <Text style={styles.eventPillLabel}>Check Out</Text>
              <Text style={styles.eventPillTime}>{formatTime(checkout.timestamp_event)}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: Colors.error }]} />
          </View>
        )}

        {/* Orphan checkout */}
        {!checkin && checkout && (
          <View style={styles.orphanNote}>
            <Text style={styles.orphanText}>⚠ Missing check-in</Text>
          </View>
        )}
      </View>

      {/* Right status strip */}
      <View style={[
        styles.sessionStrip,
        isComplete && styles.sessionStripComplete,
        isOngoing && styles.sessionStripOngoing,
      ]} />
    </Animated.View>
  );
};

// ─── Day Section ───────────────────────────────────────────────────────────────

const DaySection: React.FC<{
  group: { date: string; events: AttendanceEvent[] };
  sectionIndex: number;
}> = ({ group, sectionIndex }) => {
  const { weekday, full, isToday, isYesterday } = friendlyDate(group.date);
  const sessions = buildSessions(group.events);

  const totalMins = sessions.reduce((acc, s) => acc + (s.durationMin ?? 0), 0);
  const totalCheckins = sessions.filter((s) => !!s.checkin).length;
  const isFullDay = totalMins >= 480; // 8 hours

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-12)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 280, delay: sectionIndex * 40, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 280, delay: sectionIndex * 40, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.daySection}>
      {/* Day header */}
      <Animated.View style={[styles.dayHeader, { opacity: headerFade, transform: [{ translateX: headerSlide }] }]}>
        <View style={styles.dayHeaderLeft}>
          <View style={[styles.dayLabel, isToday && styles.dayLabelToday, isYesterday && styles.dayLabelYesterday]}>
            <Text style={[styles.dayLabelText, (isToday || isYesterday) && styles.dayLabelTextHighlight]}>
              {isToday ? 'TODAY' : isYesterday ? 'YESTERDAY' : weekday.toUpperCase().slice(0, 3)}
            </Text>
          </View>
          <Text style={styles.dayFull}>{full}</Text>
        </View>

        <View style={styles.daySummary}>
          {totalMins > 0 && (
            <View style={[styles.daySummaryChip, isFullDay && styles.daySummaryChipGood]}>
              <Text style={[styles.daySummaryText, isFullDay && styles.daySummaryTextGood]}>
                {formatDuration(totalMins)}
              </Text>
            </View>
          )}
          <Text style={styles.daySessionCount}>
            {totalCheckins} session{totalCheckins !== 1 ? 's' : ''}
          </Text>
        </View>
      </Animated.View>

      {/* Divider */}
      <View style={styles.dayDivider} />

      {/* Session cards */}
      <View style={styles.sessionsWrap}>
        {sessions.map((session, i) => (
          <AnimatedEventRow
            key={`${group.date}-${i}`}
            session={session}
            index={i}
            isLast={i === sessions.length - 1}
          />
        ))}
      </View>
    </View>
  );
};

// ─── Summary Header ───────────────────────────────────────────────────────────

const SummaryHeader: React.FC<{ totalEvents: number; uniqueDays: number }> = ({
  totalEvents,
  uniqueDays,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
   const navigation = useNavigation();
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.summaryHeader, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.summaryTop}>
        <View>
      
          <Text style={styles.summaryTitle}>Attendance</Text>
          <Text style={styles.summarySubtitle}>Your work history</Text>
        </View>
        <View style={styles.summaryIconWrap}>
          <Text style={styles.summaryIcon}>📊</Text>
        </View>
      </View>

      <View style={styles.summaryStats}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{uniqueDays}</Text>
          <Text style={styles.statLabel}>Days</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{Math.floor(totalEvents / 2)}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalEvents}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
      </View>
    </Animated.View>
  );
};

// ─── Empty State ───────────────────────────────────────────────────────────────

const EmptyState: React.FC = () => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -8, duration: 700, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.emptyState}>
      <Animated.Text style={[styles.emptyEmoji, { transform: [{ translateY: bounceAnim }] }]}>
        📭
      </Animated.Text>
      <Text style={styles.emptyTitle}>No records yet</Text>
      <Text style={styles.emptySubtitle}>
        Your attendance history will appear{'\n'}here after your first check-in
      </Text>
    </View>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────

export const AttendanceHistoryScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const isMounted = useRef(true);

  const { history, setHistory } = useAttendanceStore();

  React.useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory(1, true);
    }, []),
  );

  const loadHistory = async (pageNum = 1, reset = false) => {
    try {
      const response = await attendanceApi.getHistory({ page: pageNum, limit: 20 });
      const data: AttendanceEvent[] = response.data?.data || [];

      if (!isMounted.current) return;

      if (reset || pageNum === 1) {
        setHistory(data);
      } else {
        setHistory([...history, ...data]);
      }
      setHasMore(data.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory(1, true);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    if(history.length === 0) return;
    await loadHistory(page + 1);
    setLoadingMore(false);
  };

  const grouped = groupByDate(history ?? []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <FlatList
        data={grouped}
        keyExtractor={(item) => item.date}
        renderItem={({ item, index }) => (
          <DaySection group={item} sectionIndex={index} />
        )}
        ListHeaderComponent={
          <SummaryHeader
            totalEvents={history?.length ?? 0}
            uniqueDays={grouped.length}
          />
        }
        ListEmptyComponent={<EmptyState />}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadMoreWrap}>
              <View style={styles.loadMoreDots}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={[styles.loadMoreDot, { opacity: 0.3 + i * 0.3 }]} />
                ))}
              </View>
              <Text style={styles.loadMoreText}>Loading more…</Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <View style={{height:50}}/>
    </View>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  listContent: {
    paddingBottom: 48,
  },

  // ── Summary header ──────────────────────────────────────────────────────────
  summaryHeader: {
    marginHorizontal: 16,
    marginTop: Platform.OS === 'android' ? 16 : 12,
    marginBottom: 8,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 22,
    ...Shadows.lg,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.white,
    marginTop:15,
    letterSpacing: -0.5,
  },
  summarySubtitle: {
    fontSize: 13,
    color: Colors.primaryLighter,
    marginTop: 3,
    fontWeight: '500',
  },
  summaryIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIcon: { fontSize: 22 },
  summaryStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 16,
    padding: 14,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.primaryLighter,
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginVertical: 4,
  },

  // ── Day section ─────────────────────────────────────────────────────────────
  daySection: {
    marginHorizontal: 16,
    marginTop: 22,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dayLabel: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayLabelToday: { backgroundColor: Colors.primary },
  dayLabelYesterday: { backgroundColor: Colors.secondary },
  dayLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  dayLabelTextHighlight: { color: Colors.white },
  dayFull: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  daySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  daySummaryChip: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  daySummaryChipGood: { backgroundColor: Colors.successLighter },
  daySummaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  daySummaryTextGood: { color: Colors.success },
  daySessionCount: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  dayDivider: {
    height: 1.5,
    backgroundColor: Colors.borderLight,
    marginBottom: 12,
    borderRadius: 1,
  },
  sessionsWrap: { gap: 10 },

  // ── Session card ────────────────────────────────────────────────────────────
  sessionCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  sessionCardComplete: {
    borderColor: Colors.successLighter,
  },
  sessionCardOngoing: {
    borderColor: Colors.primaryLighter,
  },
  sessionBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
    flexShrink: 0,
  },
  sessionBadgeOngoing: { backgroundColor: Colors.primaryLighter },
  sessionBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  sessionEvents: { flex: 1, gap: 0 },
  sessionStrip: {
    width: 4,
    borderRadius: 2,
    marginLeft: 12,
    backgroundColor: Colors.borderLight,
  },
  sessionStripComplete: { backgroundColor: Colors.success },
  sessionStripOngoing: { backgroundColor: Colors.primary },

  // ── Event pill ──────────────────────────────────────────────────────────────
  eventPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 10,
  },
  checkinIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Colors.successLighter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkinIcon: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.success,
  },
  checkoutIcon: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.error,
  },
  eventPillInfo: { flex: 1 },
  eventPillLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  eventPillTime: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
    fontWeight: '500',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },

  // ── Connector ───────────────────────────────────────────────────────────────
  connectorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 8,
  },
  connectorLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.borderLight,
    borderRadius: 1,
    marginLeft: 14,  // align with icon center
  },
  connectorLineDashed: { backgroundColor: Colors.primaryLighter },
  durationChip: {
    backgroundColor: Colors.timerBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    marginLeft: 8,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  ongoingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLighter + '40',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    gap: 4,
    marginLeft: 4,
  },
  ongoingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  ongoingText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.3,
  },

  // ── Orphan note ─────────────────────────────────────────────────────────────
  orphanNote: {
    backgroundColor: Colors.warningBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  orphanText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '600',
  },

  // ── Empty state ─────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 18 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 21,
    fontWeight: '400',
  },

  // ── Load more ───────────────────────────────────────────────────────────────
  loadMoreWrap: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadMoreDots: {
    flexDirection: 'row',
    gap: 6,
  },
  loadMoreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  loadMoreText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});

export default AttendanceHistoryScreen;