// src/views/AttendanceHistoryScreen.tsx
import React, { useCallback, useRef, useState ,useEffect} from 'react';
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  TrendingUp,
  ChevronRight,
  MapPin,
  Briefcase,
} from 'lucide-react-native';
import { Colors, Shadows, BorderRadius, Spacing } from '../constants/colors';
import { formatDate, formatTime } from '../utils/time.utils';
import { AttendanceEvent } from '../types';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { attendanceApi } from '../service/attendance.service';
import { useAuthStore } from '../store/useAuthStore';
import { SafeAreaFrameContext } from 'react-native-safe-area-context';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByDate(events: AttendanceEvent[]): { date: string; events: AttendanceEvent[] }[] {
  const map = new Map<string, AttendanceEvent[]>();
  for (const ev of events) {
    const raw = ev.timestamp_event ?? ev.event_date ?? '';
    const key = raw ? new Date(raw).toLocaleDateString('en-CA') : 'unknown';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(ev);
  }
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

function buildSessions(events: AttendanceEvent[]) {
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
}> = ({ session, index }) => {
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
      <View style={[styles.sessionBadge, isOngoing && styles.sessionBadgeOngoing]}>
        <Text style={styles.sessionBadgeText}>{index + 1}</Text>
      </View>

      <View style={styles.sessionEvents}>
        {checkin && (
          <View style={styles.eventPill}>
            <View style={styles.checkinIconWrap}>
              <Briefcase size={16} color={Colors.success} />
            </View>
            <View style={styles.eventPillInfo}>
              <Text style={styles.eventPillLabel}>Check In</Text>
              <Text style={styles.eventPillTime}>{formatTime(checkin.timestamp_event)}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
          </View>
        )}

        {checkin && (checkout || isOngoing) && (
          <View style={styles.connectorWrap}>
            <View style={[styles.connectorLine, isOngoing && styles.connectorLineDashed]} />
            {durationMin !== null && (
              <View style={styles.durationChip}>
                <Clock size={10} color={Colors.primary} />
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

        {checkout && (
          <View style={styles.eventPill}>
            <View style={styles.checkoutIconWrap}>
              <MapPin size={16} color={Colors.error} />
            </View>
            <View style={styles.eventPillInfo}>
              <Text style={styles.eventPillLabel}>Check Out</Text>
              <Text style={styles.eventPillTime}>{formatTime(checkout.timestamp_event)}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: Colors.error }]} />
          </View>
        )}

        {!checkin && checkout && (
          <View style={styles.orphanNote}>
            <Text style={styles.orphanText}>⚠ Missing check-in</Text>
          </View>
        )}
      </View>

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
  const isFullDay = totalMins >= 480;

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

      <View style={styles.dayDivider} />

      <View style={styles.sessionsWrap}>
        {sessions.map((session, i) => (
          <AnimatedEventRow
            key={`${group.date}-${i}`}
            session={session}
            index={i}
          />
        ))}
      </View>
    </View>
  );
};

// ─── Summary Card ───────────────────────────────────────────────────────────

const SummaryCard: React.FC<{ totalEvents: number; uniqueDays: number }> = ({
  totalEvents,
  uniqueDays,
}) => {
  const totalHours = Math.floor(totalEvents / 2 * 8); // Approximate

  return (
    
    <View style={styles.summaryCard}>
      <View style={styles.summaryItem}>
        <View style={[styles.summaryIconBox, { backgroundColor: '#EEF2FF' }]}>
          <CalendarDays size={20} color="#4A7DE4" />
        </View>
        <Text style={styles.summaryNumber}>{uniqueDays}</Text>
        <Text style={styles.summaryLabel}>Days</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <View style={[styles.summaryIconBox, { backgroundColor: '#ECFDF5' }]}>
          <TrendingUp size={20} color="#10B981" />
        </View>
        <Text style={styles.summaryNumber}>{Math.floor(totalEvents / 2)}</Text>
        <Text style={styles.summaryLabel}>Sessions</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <View style={[styles.summaryIconBox, { backgroundColor: '#FEF3C7' }]}>
          <Clock size={20} color="#F59E0B" />
        </View>
        <Text style={styles.summaryNumber}>{totalEvents}</Text>
        <Text style={styles.summaryLabel}>Events</Text>
      </View>
    </View>
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
  const navigation = useNavigation();

  const { history, setHistory } = useAttendanceStore();
  const { user } = useAuthStore();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
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
    if (history.length === 0) return;
    await loadHistory(page + 1);
    setLoadingMore(false);
  };

  const grouped = groupByDate(history ?? []);

  return (
    
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF2FF" />

      {/* 🎨 Gradient Header Background (same as Dashboard) */}
      <View style={styles.headerBg}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
      </View>

      {/* ✨ MODERN COMPACT HEADER */}
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {/* <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color="#1E293B" />
            </TouchableOpacity> */}
            <View style={styles.greetingBox}>
              <View style={styles.greetingRow}>
                <View style={[styles.greetingIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <CalendarDays size={12} color="#F59E0B" strokeWidth={2.5} />
                </View>
                <Text style={[styles.greetingText, { color: '#F59E0B' }]}>
                  Attendance
                </Text>
              </View>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.fullName ?? 'User'}
              </Text>
            </View>
          </View>
        </View>

        {/* Date Row */}
        <View style={styles.dateRow}>
          <View style={styles.dateChip}>
            <Clock size={12} color="#4A7DE4" />
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.statusChip}>
            <TrendingUp size={12} color="#059669" />
            <Text style={styles.statusChipText}>
              {grouped.length} Days
            </Text>
          </View>
        </View>
      </Animated.View>

      <FlatList
        data={grouped}
        keyExtractor={(item) => item.date}
        renderItem={({ item, index }) => (
          <DaySection group={item} sectionIndex={index} />
        )}
        ListHeaderComponent={
          history?.length > 0 ? (
            <SummaryCard
              totalEvents={history?.length ?? 0}
              uniqueDays={grouped.length}
            />
          ) : null
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
      <View style={{ height: 50 }} />
    </View>
    
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // 🎨 Header Background (matches DashboardScreen)
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: '#EEF2FF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerCircle1: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#C7D2FE',
    opacity: 0.4,
  },
  headerCircle2: {
    position: 'absolute',
    top: 20,
    left: -15,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A5B4FC',
    opacity: 0.3,
  },

  // ✨ COMPACT MODERN HEADER
  header: {
    paddingTop: 10,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  greetingBox: {
    flex: 1,
    justifyContent: 'center',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  greetingIconBox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.darkBlue,
    letterSpacing: -0.3,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
    ...Shadows.sm,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A7DE4',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },

  listContent: {
    paddingBottom: 48,
    paddingHorizontal: Spacing.md,
  },

  // ── Summary Card ──────────────────────────────────────────────────────────
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E293B',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },

  // ── Day section ─────────────────────────────────────────────────────────────
  daySection: {
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
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayLabelToday: { backgroundColor: '#4A7DE4' },
  dayLabelYesterday: { backgroundColor: '#8B5CF6' },
  dayLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  dayLabelTextHighlight: { color: '#fff' },
  dayFull: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  daySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  daySummaryChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  daySummaryChipGood: { backgroundColor: '#D1FAE5' },
  daySummaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  daySummaryTextGood: { color: '#059669' },
  daySessionCount: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  dayDivider: {
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
    borderRadius: 1,
  },
  sessionsWrap: { gap: 10 },

  // ── Session card ────────────────────────────────────────────────────────────
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  sessionCardComplete: {
    borderColor: '#D1FAE5',
  },
  sessionCardOngoing: {
    borderColor: '#DBEAFE',
  },
  sessionBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
    flexShrink: 0,
  },
  sessionBadgeOngoing: { backgroundColor: '#DBEAFE' },
  sessionBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  sessionEvents: { flex: 1, gap: 0 },
  sessionStrip: {
    width: 4,
    borderRadius: 2,
    marginLeft: 12,
    backgroundColor: '#E2E8F0',
  },
  sessionStripComplete: { backgroundColor: '#10B981' },
  sessionStripOngoing: { backgroundColor: '#4A7DE4' },

  // ── Event pill ──────────────────────────────────────────────────────────────
  eventPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 10,
  },
  checkinIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventPillInfo: { flex: 1 },
  eventPillLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  eventPillTime: {
    fontSize: 12,
    color: '#64748B',
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
    backgroundColor: '#E2E8F0',
    borderRadius: 1,
    marginLeft: 14,
  },
  connectorLineDashed: { backgroundColor: '#DBEAFE' },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    gap: 4,
    marginLeft: 8,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A7DE4',
  },
  ongoingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
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
    backgroundColor: '#4A7DE4',
  },
  ongoingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4A7DE4',
    letterSpacing: 0.3,
  },

  // ── Orphan note ─────────────────────────────────────────────────────────────
  orphanNote: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  orphanText: {
    fontSize: 12,
    color: '#B45309',
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
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
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
    backgroundColor: '#4A7DE4',
  },
  loadMoreText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
});

export default AttendanceHistoryScreen;