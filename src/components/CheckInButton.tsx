// src/components/dashboard/CheckInButton.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LogIn, LogOut } from 'lucide-react-native';

import Geolocation from 'react-native-geolocation-service';
import { Colors } from '../constants/colors';
import { locationApi } from '../service/location.service';
import { useAppStore } from '../store/useAppStore';
import { useAttendanceStore } from '../store/useAttendanceStore';
import { useLocationStore } from '../store/useLocationStore';

const CheckInButton: React.FC = () => {
  const { status } = useLocationStore();
  const { todayAttendance, addEvent } = useAttendanceStore();
  const { setLoading, setError, setSuccess } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const isInside = status === 'in_office_area';
  const hasCheckedIn = todayAttendance && todayAttendance.events.length > 0;
  const lastEvent = todayAttendance?.events[todayAttendance.events.length - 1];
  const isCheckedIn = lastEvent?.event_type === 'checkin';

  const handlePress = async () => {
    if (!isInside) {
      setError('You must be inside the office to check in');
      return;
    }

    setIsProcessing(true);
    setLoading(true);

    Geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await locationApi.manualCheckin({ lat: latitude, lng: longitude });
          
          if (response.data.success) {
            setSuccess(isCheckedIn ? 'Checked out successfully!' : 'Checked in successfully!');
            // Refresh today's attendance
            // In real app, you'd fetch fresh data here
          }
        } catch (error: any) {
          setError(error.response?.data?.message || 'Check-in failed');
        } finally {
          setIsProcessing(false);
          setLoading(false);
        }
      },
      (error) => {
        setError('Could not get your location');
        setIsProcessing(false);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  if (!isInside && !hasCheckedIn) {
    return (
      <View style={[styles.container, styles.disabledContainer]}>
        <Text style={styles.disabledText}>Go to office to check in</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isProcessing || !isInside}
      style={[
        styles.container,
        isCheckedIn ? styles.checkoutButton : styles.checkinButton,
        (!isInside || isProcessing) && styles.disabledButton,
      ]}
      activeOpacity={0.8}
    >
      {isProcessing ? (
        <ActivityIndicator color={Colors.textInverse} />
      ) : (
        <>
          {isCheckedIn ? <LogOut size={24} color={Colors.textInverse} /> : <LogIn size={24} color={Colors.textInverse} />}
          <Text style={styles.text}>
            {isCheckedIn ? 'Check Out' : 'Check In'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    gap: 8,
  },
  checkinButton: {
    backgroundColor: Colors.success,
  },
  checkoutButton: {
    backgroundColor: Colors.error,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledContainer: {
    backgroundColor: Colors.borderLight,
    paddingVertical: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  disabledText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});

export default CheckInButton;