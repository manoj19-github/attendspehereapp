// src/views/PermissionScreen.tsx

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  requestMultiple,
  checkMultiple,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';

import { Colors, Shadows, BorderRadius, Spacing } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ASYNC_STORAGE_KEYS } from '../enviroments';

interface PermissionStatus {
  location: boolean;
  backgroundLocation: boolean;
  notification: boolean;
}

export const PermissionScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [permissions, setPermissions] = useState<PermissionStatus>({
    location: false,
    backgroundLocation: false,
    notification: false,
  });

  const [checking, setChecking] = useState(true);
  const [requesting, setRequesting] = useState(false);
  

  useFocusEffect(
    useCallback(() => {
      checkCurrentPermissions();
       (async()=>{
        try{
        const token = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN);
        console.log("token", token);
        }
        catch(error){
          console.log("error6666", error);
        }
    

  })()
    }, [])
  )


  // ✅ Get permissions safely (Android version aware)
  const getPermissions = () => {
    const perms = [
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
    ];

    // Android 13+ only
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      perms.push('android.permission.POST_NOTIFICATIONS' as any);
    }

    return perms;
  };

  // ✅ Extract notification status safely
  const getNotificationStatus = (results: any) => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      return results['android.permission.POST_NOTIFICATIONS'] === RESULTS.GRANTED;
    }
    return true; // older Android → auto granted
  };

  // ✅ Check permissions
  const checkCurrentPermissions = async () => {
    try {
      const results = await checkMultiple(getPermissions());

      const status: PermissionStatus = {
        location:
          results[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED,
        backgroundLocation:
          results[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION] ===
          RESULTS.GRANTED,
        notification: getNotificationStatus(results),
      };

      setPermissions(status);

      if (
        status.location &&
        status.backgroundLocation &&
        status.notification
      ) {
        navigation.replace('Main');
      }
    } catch (error) {
      console.error('Permission check error:', error);
    } finally {
      setChecking(false);
    }
  };

  // ✅ Request permissions
 const requestAllPermissions = async () => {
  setRequesting(true);

  try {
    const results = await requestMultiple(getPermissions());
    console.log('results: ', results);

    const fineLocation = results[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];
    const bgLocation = results[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION];

    const status: PermissionStatus = {
      location: fineLocation === RESULTS.GRANTED,
      backgroundLocation: bgLocation === RESULTS.GRANTED,
      notification: getNotificationStatus(results),
    };

    setPermissions(status);

    // ✅ All granted → go to Main
    if (status.location && status.backgroundLocation && status.notification) {
      navigation.replace('Main');
      return;
    }

    // 🚫 BLOCKED: Must open Settings manually
    if (fineLocation === RESULTS.BLOCKED || bgLocation === RESULTS.BLOCKED) {
      Alert.alert(
        'Permission Blocked',
        'Location permission was permanently denied. Please enable it in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => Linking.openSettings() // Opens app settings
          },
        ]
      );
      return;
    }

    // ❌ DENIED (not blocked): Can ask again or show rationale
    if (fineLocation === RESULTS.DENIED || bgLocation === RESULTS.DENIED) {
      Alert.alert(
        'Permissions Required',
        'All permissions are needed for attendance tracking.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Again', onPress: requestAllPermissions },
        ]
      );
      return;
    }

  } catch (error) {
    console.error('Permission request error:', error);
    Alert.alert('Error', 'Failed to request permissions');
  } finally {
    setRequesting(false);
  }
};

  // ✅ Skip (optional)
  const handleSkip = () => {
    Alert.alert(
      'Skip Permissions?',
      'Some features may not work properly without permissions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: () => navigation.replace('Main'),
        },
      ]
    );
  };

  // ✅ Loading screen
  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.checkingText}>Checking permissions...</Text>
      </View>
    );
  }

  const allGranted =
    permissions.location &&
    permissions.backgroundLocation &&
    permissions.notification;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🔒</Text>
        </View>

        <Text style={styles.title}>Permissions Required</Text>

        <Text style={styles.subtitle}>
          AttendSphere needs these permissions to track your attendance
        </Text>
      </View>

      <View style={styles.permissionsList}>
        <PermissionItem
          icon="📍"
          title="Location Access"
          description="Required to calculate distance from office"
          granted={permissions.location}
        />

        <PermissionItem
          icon="🔄"
          title="Background Location"
          description="Required for tracking in background"
          granted={permissions.backgroundLocation}
        />

        <PermissionItem
          icon="🔔"
          title="Notifications"
          description="Required for alerts & reminders"
          granted={permissions.notification}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, allGranted && styles.buttonSuccess]}
        onPress={requestAllPermissions}
        disabled={requesting}
      >
        {requesting ? (
          <ActivityIndicator color={Colors.textInverse} />
        ) : (
          <Text style={styles.buttonText}>
            {allGranted ? '✓ All Set!' : 'Enable Permissions'}
          </Text>
        )}
      </TouchableOpacity>

      {/* {!allGranted && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      )} */}
    </View>
  );
};

// ================= COMPONENT =================

const PermissionItem: React.FC<{
  icon: string;
  title: string;
  description: string;
  granted: boolean;
}> = ({ icon, title, description, granted }) => (
  <View style={styles.permissionItem}>
    <Text style={styles.permissionIcon}>{icon}</Text>

    <View style={styles.permissionContent}>
      <Text style={styles.permissionTitle}>{title}</Text>
      <Text style={styles.permissionDesc}>{description}</Text>
    </View>

    <View
      style={[
        styles.badge,
        granted ? styles.badgeGranted : styles.badgePending,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          granted ? styles.badgeTextGranted : styles.badgeTextPending,
        ]}
      >
        {granted ? '✓' : '!'}
      </Text>
    </View>
  </View>
);

// ================= STYLES =================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  checkingText: {
    marginTop: Spacing.md,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
  permissionsList: {
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  permissionIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  permissionDesc: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeGranted: {
    backgroundColor: Colors.successLight,
  },
  badgePending: {
    backgroundColor: Colors.dangerLight,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  badgeTextGranted: {
    color: Colors.success,
  },
  badgeTextPending: {
    color: Colors.danger,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.md,
  },
  buttonSuccess: {
    backgroundColor: Colors.success,
  },
  buttonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  skipText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});