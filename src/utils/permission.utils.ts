// src/services/location.service.ts
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import BackgroundActions from 'react-native-background-actions';

import { useLocationStore } from '../store/useLocationStore';
import { useOfflineStore } from '../store/useOfflineStore';
import { useAuthStore } from '../store/useAuthStore';
import { 
  BACKGROUND_TASK_NAME, 
  LOCATION_POLLING_INTERVAL, 
  OFFICE_LAT, 
  OFFICE_LNG 
} from '../enviroments';

import { isWithinWorkingHours } from '../utils/time.utils';
 // ✅ FIXED: was importing itself
import { LocationCoords } from '../types'; // ✅ FIXED: Now properly exported
import { calculateDistance } from '../utils/distance.utils';
import { locationApi } from '../service/location.service';

class LocationService {
  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  async requestLocationPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const foreground = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        
        const background = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
        );

        return (
          foreground === PermissionsAndroid.RESULTS.GRANTED &&
          background === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const status = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
        return status === RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  }

  async checkLocationPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const foreground = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        const background = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
        );
        return foreground && background;
      } else {
        const status = await check(PERMISSIONS.IOS.LOCATION_ALWAYS);
        return status === RESULTS.GRANTED;
      }
    } catch {
      return false;
    }
  }

  startPolling() {
    if (this.pollingInterval) return;
    
    useLocationStore.getState().startTracking();
    this.pollingInterval = setInterval(() => {
      this.sendLocationPing();
    }, LOCATION_POLLING_INTERVAL);
    
    // Immediate first ping
    this.sendLocationPing();
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    useLocationStore.getState().stopTracking();
  }

  private async sendLocationPing() {
    const { isOnline } = useOfflineStore.getState();
    const { user } = useAuthStore.getState();

    if (!user) return;

    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const distance = calculateDistance(latitude, longitude, OFFICE_LAT, OFFICE_LNG);
        const status = distance <= 100 ? 'in_office_area' : 'out_office_area';
        const isWorkingHours = isWithinWorkingHours();

        useLocationStore.getState().updateLocation(latitude, longitude, distance, status, isWorkingHours);

        const payload = { lat: latitude, lng: longitude };

        if (isOnline) {
          try {
            await locationApi.ping(payload);
          } catch (error) {
            // Queue for retry if failed
            await useOfflineStore.getState().addToQueue({
              type: 'location_ping',
              data: payload,
            });
          }
        } else {
          await useOfflineStore.getState().addToQueue({
            type: 'location_ping',
            data: payload,
          });
        }
      },
      (error) => {
        console.error('Location error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  }

  async startBackgroundTracking() {
    const options = {
      taskName: BACKGROUND_TASK_NAME,
      taskTitle: 'AttendSphere Tracking',
      taskDesc: 'Tracking your location for attendance',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#4A7DE4',
      linkingURI: 'attendsphere://',
      parameters: {
        delay: LOCATION_POLLING_INTERVAL,
      },
    };

    try {
      await BackgroundActions.start(this.backgroundTask, options);
    } catch (error) {
      console.error('Background task error:', error);
    }
  }

  async stopBackgroundTracking() {
    await BackgroundActions.stop();
  }

  private backgroundTask = async (taskData: any) => {
    const { delay } = taskData;
    
    while (BackgroundActions.isRunning()) {
      await this.sendLocationPing();
      await this.sleep(delay);
    }
  };

  private sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
}

export const locationService = new LocationService();

// ==================== STANDALONE HELPERS ====================

export const getCurrentPosition = (): Promise<LocationCoords> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString(),
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  });
};

export const watchPosition = (
  onLocation: (coords: LocationCoords) => void,
  onError?: (error: any) => void,
) => {
  return Geolocation.watchPosition(
    (position) => {
      onLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString(),
      });
    },
    (error) => onError?.(error),
    {
      enableHighAccuracy: true,
      distanceFilter: 10,
      interval: 30000,
      fastestInterval: 30000,
    },
  );
};

export const clearWatch = (watchId: number) => {
  Geolocation.clearWatch(watchId);
};