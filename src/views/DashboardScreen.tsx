import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Shadows, BorderRadius, Spacing } from '../constants/colors';

import { getCurrentPosition } from '../utils/location.utils';

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

  const user = useAuthStore((state) => state.user);

  // ✅ FIX: Use optional chaining + default values to prevent crashes if store hasn't hydrated
  const status = useLocationStore((state) => state.status ?? null);
  const firstCheckinDone = useLocationStore((state) => state.firstCheckinDone ?? false);
  const isTracking = useLocationStore((state) => state.isTracking ?? false);

  const { todayAttendance, setTodayAttendance } = useAttendanceStore();
  const isOnline = useOfflineStore((state) => state.isOnline ?? true);

  useEffect(() => {
    (async()=>{
      try{
      const position = await getCurrentPosition();
      console.log('position: ', position);
      }catch(error){
        console.log("error occured",error);
      }
    })();
    // loadDashboardData();
    // startBackgroundService();
  }, []);

  const startBackgroundService = async () => {
    try {
      // ✅ FIX: Guard against missing isServiceRunning method
      const isRunning =
        typeof backgroundLocationService.isServiceRunning === 'function'
          ? backgroundLocationService.isServiceRunning()
          : false;

      if (!isRunning) {
        await backgroundLocationService.start();
      }
    } catch (error) {
      console.error('Failed to start background service:', error);
      // ✅ FIX: Don't let this crash the screen — swallow and continue
    }
  };

  const loadDashboardData = async () => {
    try {
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
      // ✅ FIX: Swallow API errors so screen still renders
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
      setLoading(true);
      const position = await getCurrentPosition();
      
      const response = await apiClient.post('/location/checkin', {
        lat: position.latitude,
        lng: position.longitude,
      });

      if (response.data?.success) {
        Alert.alert('Success', 'Check-in successful!');
        useLocationStore.getState().setFirstCheckinDone(true);
        await loadDashboardData();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const showCheckinButton = !firstCheckinDone && status === 'in_office_area';

  // ✅ FIX: Only show full-screen loader on very first load with no cached data
  if (loading && !todayAttendance) {
    return <LoadingSpinner fullScreen message="Loading your dashboard..." />;
  }

  return (
    <View style={styles.container}>
      <OfflineBanner />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
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
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <StatusIndicator />

        {showCheckinButton && (
          <TouchableOpacity style={styles.checkinBtn} onPress={handleManualCheckin}>
            <Text style={styles.checkinBtnText}>✋ Tap to Check In</Text>
            <Text style={styles.checkinSubtext}>First check-in of the day required</Text>
          </TouchableOpacity>
        )}

        <OfficeMapBanner distance={0} />

        <WorkingHoursTimer />

        
        <AttendanceTimeline />

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('AttendanceHistory')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('FullMap')}
          >
            <Text style={styles.actionIcon}>🗺️</Text>
            <Text style={styles.actionText}>Full Map</Text>
          </TouchableOpacity>
        </View>
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