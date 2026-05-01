import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors, Shadows, BorderRadius, Spacing } from '../constants/colors';
import { getCurrentPosition } from '../utils/location.utils';
import { isWithinWorkingHours } from '../utils/time.utils'; // ✅ IMPORTED
import { locationApi } from '../service/location.service'; // ✅ IMPORTED

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
  const isTracking = useLocationStore((state) => state.isTracking ?? false);

  const { todayAttendance, setTodayAttendance } = useAttendanceStore();
  const isOnline = useOfflineStore((state) => state.isOnline ?? true);

  // ✅ CHECKED-IN STATE: true if last event today is 'checkin'
  const isCheckedIn = useMemo(() => {
    if (!todayAttendance?.events?.length) return false;
    const lastEvent = todayAttendance.events[todayAttendance.events.length - 1];
    return lastEvent.event_type === 'checkin';
  }, [todayAttendance]);

  const isWorkingHours = useMemo(() => isWithinWorkingHours(), [officeSettings]);

  // ✅ SHOW CHECKIN: no checkin yet + inside office
  const showCheckinButton = useMemo(
    () => !isCheckedIn && !firstCheckinDone && status === 'in_office_area',
    [isCheckedIn, firstCheckinDone, status]
  );

  // ✅ SHOW CHECKOUT: currently checked in (covers working-hours-ended + manual)
  const showCheckoutButton = useMemo(
    () => isCheckedIn,
    [isCheckedIn]
  );

  // ✅ URGENT CHECKOUT: working hours ended but still checked in
  const isUrgentCheckout = useMemo(
    () => isCheckedIn && !isWorkingHours,
    [isCheckedIn, isWorkingHours]
  );

  useFocusEffect(
    useCallback(() => {
      console.log('useFocusEffect:   76');
    (async () => {
      try {
        const position: any = await getCurrentPosition();
        console.log('position:   76', position);
        useLocationStore.getState().setCurrentLocation(position);
      } catch (error) {
        console.log('location error', error);
      }
    })();
    loadDashboardData();  
    startBackgroundService();
  }, []));

  const startBackgroundService = async () => {
    try {
      const isRunning =
        typeof backgroundLocationService.isServiceRunning === 'function'
          ? backgroundLocationService.isServiceRunning()
          : false;

      if (!isRunning) {
        await backgroundLocationService.start();
      }
    } catch (error) {
      console.error('Failed to start background service:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/attendance/today');
      if (response.data?.data) {
        setTodayAttendance(response.data.data);

        const hasCheckin = response.data.data.events?.some(
          (e: any) => e.event_type === 'checkin'
        );
        if (hasCheckin) {
          useLocationStore.getState().setFirstCheckinDone(true);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // ✅ MANUAL CHECK-IN
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

  // ✅ MANUAL CHECK-OUT (works inside OR outside office)
  const handleManualCheckout = async () => {
    try {
      if (loading) return;
      setLoading(true);

      // Try to get current location for the record (optional)
      let lat, lng;
      try {
        const position: any = await getCurrentPosition();
        lat = position.latitude;
        lng = position.longitude;
        useLocationStore.getState().setCurrentLocation(position);
      } catch {
        // Location failed — allow checkout anyway (working hours ended, user left, GPS off, etc.)
        lat = currentLocation?.latitude;
        lng = currentLocation?.longitude;
      }

      const response = await locationApi.manualCheckout({ lat, lng });

      if (response.data?.success) {
        Alert.alert('✅ Checked Out', 'You have been checked out successfully.');
        useLocationStore.getState().setFirstCheckinDone(false); // Reset for next day
        await loadDashboardData();
      }
    } catch (error: any) {
      console.log('error: ', error);
      Alert.alert('❌ Error', error.response?.data?.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !todayAttendance) {
    return <LoadingSpinner fullScreen message="Please wait while we load your dashboard..." />;
  }

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.fullName?.split(' ')[0] ?? 'User'} 👋
            </Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsBtn}
            disabled={loading}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>


      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        
        <StatusIndicator />

        {/* ✅ CHECK-IN BUTTON */}
        {showCheckinButton && (
          <TouchableOpacity
            disabled={loading}
            style={styles.checkinBtn}
            onPress={handleManualCheckin}
          >
            <Text style={styles.checkinBtnText}>✋ Tap to Check In</Text>
            <Text style={styles.checkinSubtext}>First check-in of the day required</Text>
          </TouchableOpacity>
        )}

        {/* ✅ CHECK-OUT BUTTON */}
        {showCheckoutButton && (
          <TouchableOpacity
            disabled={loading}
            style={[
              styles.checkoutBtn,
              isUrgentCheckout && styles.checkoutBtnUrgent,
            ]}
            onPress={handleManualCheckout}
          >
            <Text style={styles.checkoutBtnText}>
              {isUrgentCheckout ? '⚠️ Check Out Now' : '🚪 Check Out'}
            </Text>
            <Text style={styles.checkoutSubtext}>
              {isUrgentCheckout
                ? 'Working hours ended — you are still checked in'
                : 'Manual check-out'}
            </Text>
          </TouchableOpacity>
        )}

        <OfficeMapBanner
          distance={distance}
          userLat={currentLocation?.latitude}
          userLng={currentLocation?.longitude}
        />

        <WorkingHoursTimer />

        <AttendanceTimeline />
        <View style={{height:50}}/>

        
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  date: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  settingsIcon: {
    fontSize: 20,
  },
  checkinBtn: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.md,
  },
  checkinBtnText: {
    color: Colors.textInverse,
    fontSize: 18,
    fontWeight: '800',
  },
  checkinSubtext: {
    color: Colors.primaryLighter,
    fontSize: 12,
    marginTop: 4,
  },
  // ✅ NEW: Checkout button styles
  checkoutBtn: {
    backgroundColor: Colors.warning || '#F59E0B',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.md,
  },
  checkoutBtnUrgent: {
    backgroundColor: Colors.error || '#EF4444',
    borderWidth: 2,
    borderColor: '#B91C1C',
  },
  checkoutBtnText: {
    color: Colors.textInverse || '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  checkoutSubtext: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});