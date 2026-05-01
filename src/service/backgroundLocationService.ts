// src/services/backgroundLocationService.ts
import BackgroundService from 'react-native-background-actions';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

import { useLocationStore } from '../store/useLocationStore';
import { useOfflineStore } from '../store/useOfflineStore';
import { useAuthStore } from '../store/useAuthStore';
import { isWithinWorkingHours } from '../utils/time.utils';

import { locationApi } from './location.service';
import { queueLocationPing } from './sync.service';

const sleep = (time: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), time));

class BackgroundLocationService {
  private static instance: BackgroundLocationService;
  private isRunning: boolean = false;
  private readonly POLLING_INTERVAL = 30000; // 30 seconds

  static getInstance(): BackgroundLocationService {
    if (!BackgroundLocationService.instance) {
      BackgroundLocationService.instance = new BackgroundLocationService();
    }
    return BackgroundLocationService.instance;
  }

  private getCurrentPosition(): Promise<{ latitude: number; longitude: number; timestamp: string }> {
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
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  }

  private veryIntensiveTask = async (taskDataArguments: any) => {
    const { delay } = taskDataArguments;
    
    await new Promise(async (resolve) => {
      while (BackgroundService.isRunning()) {
        try {
          // Check authentication
          const isAuthenticated = useAuthStore.getState().isAuthenticated;
          if (!isAuthenticated) {
            await sleep(this.POLLING_INTERVAL);
            continue;
          }

          // Check working hours
          if (!isWithinWorkingHours()) {
            console.log('Outside working hours - skipping location ping');
            await sleep(this.POLLING_INTERVAL);
            continue;
          }

          // Get current location
          const location = await this.getCurrentPosition();
          
          // Update store
          useLocationStore.getState().updateLocation(
            location.latitude,
            location.longitude,
            0, // distance will be calculated by backend
            'out_office_area', // will be updated by backend response
            true
          );

          // Send to server
          try {
            const response = await locationApi.ping({
              lat: location.latitude,
              lng: location.longitude,
              
            });

            if (response.data?.data) {
              const data = response.data.data;
              useLocationStore.getState().updateLocation(
                location.latitude,
                location.longitude,
                data.distance,
                data.status,
                data.isWorkingHours
              );
              
              if (data.officeLocation) {
                useLocationStore.getState().setOfficeLocation(data.officeLocation);
              }
              
              if (data.firstCheckinDone) {
                useLocationStore.getState().setFirstCheckinDone(true);
              }
            }

            useOfflineStore.getState().setOnlineStatus(true);
          } catch (error: any) {
            if (error.message === 'OFFLINE_REQUEST_QUEUED') {
              console.log('Location ping queued for offline sync');
            } else {
              console.error('Location ping failed:', error);
              useOfflineStore.getState().setOnlineStatus(false);
              // Queue for retry
              await queueLocationPing({
                lat: location.latitude,
                lng: location.longitude,
                timestamp: location.timestamp,
              });
            }
          }
        } catch (error) {
          console.error('Background task error:', error);
        }

        await sleep(this.POLLING_INTERVAL);
      }
      resolve(undefined);
    });
  };

  async start() {
    if (this.isRunning) {
      console.log('Background service already running');
      return;
    }

    // Request permissions if needed
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
    }

    const options = {
      taskName: 'AttendSphereLocation',
      taskTitle: 'AttendSphere Location Tracking',
      taskDesc: 'Tracking your location for attendance during work hours',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#4A7DE4',
      linkingURI: 'attendsphere://location',
      parameters: { delay: 1000 },
    };

    try {
      await BackgroundService.start(this.veryIntensiveTask, options);
      this.isRunning = true;
      useLocationStore.getState().startTracking();
      console.log('✅ Background location service started');
    } catch (error) {
      console.error('Failed to start background service:', error);
      throw error;
    }
  }

  async stop() {
    if (!this.isRunning) return;

    try {
      await BackgroundService.stop();
      this.isRunning = false;
      useLocationStore.getState().stopTracking();
      console.log('🛑 Background location service stopped');
    } catch (error) {
      console.error('Failed to stop background service:', error);
    }
  }

  isServiceRunning(): boolean {
    return this.isRunning && BackgroundService.isRunning();
  }
}

export const backgroundLocationService = BackgroundLocationService.getInstance();