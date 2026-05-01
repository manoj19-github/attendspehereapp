// src/views/DashboardScreen.tsx
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  LogOut,
  LogIn,
  Bell,
  Clock,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  Sparkles,
} from 'lucide-react-native';
import { Colors, Shadows, BorderRadius, Spacing } from '../constants/colors';
import { getCurrentPosition } from '../utils/location.utils';
import { isWithinWorkingHours } from '../utils/time.utils';
import { locationApi } from '../service/location.service';

import AttendanceTimeline from '../components/AttendanceTimeline';
import OfficeMapBanner from '../components/OfficeMapBanner';
import OfflineBanner from '../components/OfflineBanner';
import StatusIndicator from '../components/StatusIndicator';
import WorkingHoursTimer from '../components/WorkingHoursTimer';
import apiClient from '../service/client';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { useAuthStore } from '../store/useAuthStore';
import { useLocationStore } from '../store/useLocationStore';
import { useOfflineStore } from '../store/useOfflineStore';
import { backgroundLocationService } from '../service/backgroundLocationService';
import LoadingSpinner from '../components/LoadingSpinner';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, officeSettings } = useAuthStore();
  const { distance, currentLocation } = useLocationStore();

  const status = useLocationStore((state) => state.status ?? null);
  const firstCheckinDone = useLocationStore((state) => state.firstCheckinDone ?? false);

  const { todayAttendance, setTodayAttendance } = useAttendanceStore();
  const isOnline = useOfflineStore((state) => state.isOnline ?? true);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const isCheckedIn = useMemo(() => {
    if (!todayAttendance?.events?.length) return false;
    const lastEvent = todayAttendance.events[todayAttendance.events.length - 1];
    return lastEvent.event_type === 'checkin';
  }, [todayAttendance]);

  const isWorkingHours = useMemo(() => isWithinWorkingHours(), [officeSettings]);

  const showCheckinButton = useMemo(
    () => !isCheckedIn && !firstCheckinDone && status === 'in_office_area',
    [isCheckedIn, firstCheckinDone, status]
  );

  const showCheckoutButton = useMemo(() => isCheckedIn, [isCheckedIn]);
  const isUrgentCheckout = useMemo(() => isCheckedIn && !isWorkingHours, [isCheckedIn, isWorkingHours]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const position: any = await getCurrentPosition();
          useLocationStore.getState().setCurrentLocation(position);
        } catch (error) {
          console.log('location error', error);
        }
      })();
      loadDashboardData();
      startBackgroundService();
    }, [])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const startBackgroundService = async () => {
    try {
      const isRunning =
        typeof backgroundLocationService.isServiceRunning === 'function'
          ? backgroundLocationService.isServiceRunning()
          : false;
      if (!isRunning) await backgroundLocationService.start();
    } catch (error) {
      console.error('Background service error:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/attendance/today');
      if (response.data?.data) {
        setTodayAttendance(response.data.data);
        const hasCheckin = response.data.data.events?.some((e: any) => e.event_type === 'checkin');
        if (hasCheckin) useLocationStore.getState().setFirstCheckinDone(true);
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleManualCheckin = async () => {
    try {
      if (loading) return;
      setLoading(true);
      const position: any = await getCurrentPosition();
      useLocationStore.getState().setCurrentLocation(position);

      const response = await apiClient.post('/location/checkin', {
        lat: position.latitude,
        lng: position.longitude,
      });

      if (response.data?.success) {
        Alert.alert('✅ Success', 'Check-in successful!');
        useLocationStore.getState().setFirstCheckinDone(true);
        await loadDashboardData();
      }
    } catch (error: any) {
      Alert.alert('❌ Error', error.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckout = async () => {
    try {
      if (loading) return;
      setLoading(true);
      let lat, lng;
      try {
        const position: any = await getCurrentPosition();
        lat = position.latitude;
        lng = position.longitude;
        useLocationStore.getState().setCurrentLocation(position);
      } catch {
        lat = currentLocation?.latitude;
        lng = currentLocation?.longitude;
      }

      const response = await locationApi.manualCheckout({ lat, lng });
      if (response.data?.success) {
        Alert.alert('✅ Checked Out', 'You have been checked out successfully.');
        useLocationStore.getState().setFirstCheckinDone(false);
        await loadDashboardData();
      }
    } catch (error: any) {
      Alert.alert('❌ Error', error.response?.data?.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  // Get greeting with icon
  const getGreetingData = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: Sun, color: '#F59E0B', bg: '#FEF3C7' };
    if (hour < 17) return { text: 'Good Afternoon', icon: Sun, color: '#F97316', bg: '#FFEDD5' };
    if (hour < 21) return { text: 'Good Evening', icon: Sunset, color: '#8B5CF6', bg: '#EDE9FE' };
    return { text: 'Good Night', icon: Moon, color: '#6366F1', bg: '#E0E7FF' };
  };

  const greeting = getGreetingData();
  const GreetingIcon = greeting.icon;

  if (loading && !todayAttendance) {
    return <LoadingSpinner fullScreen message="Loading your dashboard..." />;
  }

  return (
    <View style={styles.container}>
      <OfflineBanner />

      {/* 🎨 Gradient Header Background */}
      <View style={styles.headerBg}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
      </View>
          
          <View style={styles.headerRow}>
            {/* Left: Avatar + Greeting */}
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.greetingBox}>
                <View style={styles.greetingRow}>
                  <View style={[styles.greetingIconBox, { backgroundColor: greeting.bg }]}>
                    <GreetingIcon size={12} color={greeting.color} strokeWidth={2.5} />
                  </View>
                  <Text style={[styles.greetingText, { color: greeting.color }]}>
                    {greeting.text}
                  </Text>
                </View>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.fullName ?? 'User'}
                </Text>
              </View>
            </View>

            {/* Right: Date + Notification */}
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.notificationBtn}
                // onPress={() => navigation.navigate('Notifications')}
                activeOpacity={0.7}
              >
                <Bell size={21} color={Colors.darkBlue} />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Date Chip - Below greeting */}
          <View style={styles.dateRow}>
            <View style={styles.dateChip}>
              <Clock size={12} color={Colors.primary} />
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.statusChip}>
              <Sparkles size={12} color="#10B981" />
              <Text style={styles.statusChipText}>
                {isWorkingHours ? 'Working Hours' : 'Off Hours'}
              </Text>
            </View>
          </View>
        


      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ✨ MODERN COMPACT HEADER */}
    
        {/* Status Indicator */}
        <Animated.View>
          <StatusIndicator />
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View >
          {showCheckinButton && (
            <TouchableOpacity
              disabled={loading}
              style={styles.checkinCard}
              onPress={handleManualCheckin}
              activeOpacity={0.8}
            >
              <View style={styles.checkinIconCircle}>
                <LogIn size={22} color="#fff" />
              </View>
              <View style={styles.checkinContent}>
                <Text style={styles.checkinTitle}>Check In</Text>
                <Text style={styles.checkinSubtitle}>Tap to start your day</Text>
              </View>
              <ChevronRight size={18} color={Colors.primary} />
            </TouchableOpacity>
          )}

          {showCheckoutButton && (
            <TouchableOpacity
              disabled={loading}
              style={[
                styles.checkoutCard,
                isUrgentCheckout && styles.checkoutCardUrgent,
              ]}
              onPress={handleManualCheckout}
              activeOpacity={0.8}
            >
              <View style={[
                styles.checkoutIconCircle,
                isUrgentCheckout && { backgroundColor: Colors.error + '15' }
              ]}>
                <LogOut
                  size={22}
                  color={isUrgentCheckout ? Colors.error : Colors.warning}
                />
              </View>
              <View style={styles.checkinContent}>
                <Text style={[
                  styles.checkoutTitle,
                  isUrgentCheckout && { color: Colors.error }
                ]}>
                  {isUrgentCheckout ? 'Check Out Now' : 'Check Out'}
                </Text>
                <Text style={styles.checkoutSubtitle}>
                  {isUrgentCheckout ? 'Hours ended — still checked in' : 'End your session'}
                </Text>
              </View>
              <ChevronRight
                size={18}
                color={isUrgentCheckout ? Colors.error : Colors.warning}
              />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Office Map Banner */}
        <Animated.View >
          <OfficeMapBanner
            distance={distance}
            userLat={currentLocation?.latitude}
            userLng={currentLocation?.longitude}
          />
        </Animated.View>

        {/* Working Hours Timer */}
        <Animated.View >
          <WorkingHoursTimer />
        </Animated.View>

        {/* Attendance Timeline */}
        <Animated.View >
          <AttendanceTimeline />
        </Animated.View>

        <View style={{ height: 30 }} />
      </ScrollView>
      <View style={{ height: 100 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // 🎨 Header Background
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
  scrollContent: {
    paddingTop: 0,
    // paddingHorizontal: Spacing.md,
  },
  // ✨ COMPACT MODERN HEADER
  header: {
    paddingTop:  13,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    width: '100%',
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  // Avatar
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  // Greeting Box
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
    fontSize: 22,
    fontWeight: '900',
    color:Colors.darkBlue,
    letterSpacing: -0.3,
  },
  // Header Right
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  // Date Row
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    paddingLeft: 46, // Align with greeting (backBtn 36 + gap 10)
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
    color: Colors.primary,
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
  // Cards
  checkinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginVertical: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.primary + '12',
    ...Shadows.md,
  },
  checkinIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  checkinContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  checkinTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  checkinSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
    fontWeight: '500',
  },
  checkoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginVertical: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.warning + '15',
    ...Shadows.md,
  },
  checkoutCardUrgent: {
    borderColor: Colors.error + '25',
    backgroundColor: Colors.error + '03',
  },
  checkoutIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.warning + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.warning,
  },
  checkoutSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
    fontWeight: '500',
  },
});

export default DashboardScreen;