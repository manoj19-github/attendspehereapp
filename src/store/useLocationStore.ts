// src/store/useLocationStore.ts
import { create } from 'zustand';
import { LocationState } from '../types';

interface LocationStore extends LocationState {
  isTracking: boolean;
  lastPingTime: string | null;
  firstCheckinDone: boolean;
  officeLocation: { lat: number; lng: number } | null;
  currentLocation: { latitude: number; longitude: number } | null;  // ✅ ADDED

  startTracking: () => void;
  stopTracking: () => void;
  updateLocation: (lat: number, lng: number, distance: number, status: LocationState['status'], isWorkingHours: boolean) => void;
  setCurrentLocation: (location: { latitude: number; longitude: number }) => void;  // ✅ ADDED
  setFirstCheckinDone: (done: boolean) => void;
  setOfficeLocation: (location: { lat: number; lng: number }) => void;
  reset: () => void;
}

const initialState: LocationState = {
  latitude: 0,
  longitude: 0,
  distance: 0,
  status: 'out_office_area',
  isWorkingHours: false,
  isSameLocation: false,
};

export const useLocationStore = create<LocationStore>((set) => ({
  ...initialState,
  isTracking: false,
  lastPingTime: null,
  firstCheckinDone: false,
  officeLocation: null,
  currentLocation: null,
  isSameLocation: false, // ✅ ADDED

  startTracking: () => set({ isTracking: true }),
  stopTracking: () => set({ isTracking: false }),

  updateLocation: (latitude, longitude, distance, status, isWorkingHours) =>
    set({ latitude, longitude, distance, status, isWorkingHours, lastPingTime: new Date().toISOString() }),

  setCurrentLocation: (currentLocation) => 
    set((state) => ({ currentLocation, 
      isSameLocation: currentLocation.latitude?.toFixed(4) === state.officeLocation?.lat?.toFixed(4) 
      && currentLocation.longitude?.toFixed(4) === state.officeLocation?.lng?.toFixed(4) })),

  setFirstCheckinDone: (firstCheckinDone) => set({ firstCheckinDone }),
  setOfficeLocation: (officeLocation) => 
    set((state) => ({ officeLocation, 
      isSameLocation: officeLocation.lat?.toFixed(4) === state.currentLocation?.latitude?.toFixed(4) &&
      officeLocation.lng?.toFixed(4) === state.currentLocation?.longitude?.toFixed(4) })),

  reset: () => set({
    ...initialState,
    isTracking: false,
    lastPingTime: null,
    firstCheckinDone: false,
    officeLocation: null,
    currentLocation: null  // ✅ ADDED
  }),
}));