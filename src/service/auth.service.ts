// src/service/auth.service.ts
import apiClient from './client';

export const authApi = {
  getOfficeSettings: () => apiClient.get('/office-settings'),
  login: (data: {
    email: string;
    password: string;
    androidId: string;
    fingerPrint: string;
  }) => apiClient.post('/auth/login', data),

  register: (data: {
    fullName: string;
    email: string;
    password: string;
    role?: string;
    androidId: string;
    deviceModel: string;
    osVersion: string;
    fingerPrint: string;
  
  }) => {
    console.log("data data", data);
    apiClient.post('/auth/register', data)},

  registerDevice: (data: {
    androidId: string;
    deviceModel: string;
    osVersion: string;
    fingerPrint: string;
  }) => apiClient.post('/device/register', data),

  getTokenDetails: () => apiClient.get('/auth/me'),

  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),
};

export default authApi;