/* eslint-disable @typescript-eslint/no-unused-vars */
// src/services/location.service.ts
import Geolocation from 'react-native-geolocation-service';

import { PermissionsAndroid, Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS,  openSettings, } from 'react-native-permissions';
import BackgroundActions from 'react-native-background-actions';

import { useLocationStore } from '../store/useLocationStore';
import { useOfflineStore } from '../store/useOfflineStore';
import { useAuthStore } from '../store/useAuthStore';
import { BACKGROUND_TASK_NAME,  } from '../enviroments';

import { isWithinWorkingHours } from './time.utils';
import { locationApi } from '../service/location.service';



import { LocationCoords } from '../types';
import { calculateDistance } from './distance.utils';
import Toast from 'react-native-toast-message';




export async function ensureLocationPermission(): Promise<boolean> {
  const perm =
    Platform.OS === "ios"
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

  const current = await check(perm);

  if (current === RESULTS.GRANTED) return true;

  if (current === RESULTS.BLOCKED) {
    // User permanently denied (or disabled). You must send them to settings.
    await openSettings();
    return false;
  }

  // RESULTS.DENIED or RESULTS.LIMITED => request
  const res = await request(perm);
  return res === RESULTS.GRANTED;
}


// export const enableLocation = async () => {
//   try {
//     await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
//       interval: 10000,
      
//     });
//     return true;
//   } catch (err) {
//     console.log('User did not enable location');
//     return false;
//   }
// };



class LocationService {
  private pollingInterval: any | null = null;

  async requestLocationPermissions(): Promise<boolean> {
    const officeSettings = useAuthStore.getState().officeSettings;
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
     const officeSettings = useAuthStore.getState().officeSettings;
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
    } catch (error: any) {
      return false;
    }
  }

  startPolling() {
     const officeSettings = useAuthStore.getState().officeSettings;
    if (this.pollingInterval) return;

    useLocationStore.getState().startTracking();
    this.pollingInterval = setInterval(() => {
      this.sendLocationPing();
    }, officeSettings?.LOCATION_POLLING_INTERVAL);

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
  try {
    const { isOnline } = useOfflineStore.getState();
    const { user } = useAuthStore.getState();

    if (!user) return;

    // ✅ 1. Check permission
    // const hasPermission = await locationService.checkLocationPermissions();
    const hasPermission = await ensureLocationPermission();

    if (!hasPermission) {
      console.log('Location permission denied');
      return;
    }

    // ✅ 2. Ensure GPS is ON (Android)
 

    // ✅ 3. Get location (Promise-based for better handling)
    const position = await new Promise<any>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (err) => reject(err),
        {
          enableHighAccuracy: true, // 🔥 keep false for stability
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });

    const { latitude, longitude } = position.coords;
     const officeSettings = useAuthStore.getState().officeSettings;
     const officeRadius = officeSettings?.OFFICE_RADIUS??0;

    // ✅ 4. Business logic
    const distance = calculateDistance(latitude, longitude, officeSettings?.OFFICE_LAT??0, officeSettings?.OFFICE_LNG??0);
    const status = distance <= officeRadius? 'in_office_area': 'out_office_area';
    console.log('status: 174', status);
    const isWorkingHours = isWithinWorkingHours();

    useLocationStore.getState().updateLocation(
      latitude,
      longitude,
      distance,
      status,
      isWorkingHours
    );

    const payload = { lat: latitude, lng: longitude };

    // ✅ 5. API + offline queue
    if (isOnline) {
      try {
        await locationApi.ping(payload);
      } catch (error) {
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

  } catch (error: any) {
    console.log('sendLocationPing error:', error);

    // ✅ Optional: handle specific errors
    if (error?.code === 2) {
      console.log('GPS OFF or location unavailable');
    }

    if (error?.code === 3) {
      console.log('Location timeout');
    }
  }
}

  async startBackgroundTracking() {
    const officeSettings = useAuthStore.getState().officeSettings;
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
        delay: officeSettings?.LOCATION_POLLING_INTERVAL??0,
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

  private sleep = (ms: number) => new Promise((resolve:any) => setTimeout(resolve, ms));
}

export const locationService = new LocationService();



export const getCurrentPosition = async () => {
  try {
    // const hasPermission = await locationService.checkLocationPermissions();
    const hasPermission = await ensureLocationPermission();

    if (!hasPermission) {
      throw new Error('Permission denied');
    }

        


    return await new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date().toISOString(),
          });
        },
        (error) => {
          console.log('Geo error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true, // 🔥 IMPORTANT change
          timeout: 10000,
          maximumAge: 10000,
          forceRequestLocation: true,
          showLocationDialog: true,
        }
      );
    });

  } catch (error) {
    console.log('FINAL ERROR:', error);
    throw error;
  }
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