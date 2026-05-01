// src/api/location.api.ts
import apiClient from './client';

export const locationApi = {
  ping: (data: { lat: number; lng: number; }) =>
    apiClient.post('/location/ping', data),

  manualCheckin: (data: { lat: number; lng: number }) =>
    apiClient.post('/location/checkin', data),

  getHistory: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/location/history', { params }),
};