// src/api/attendance.api.ts
import apiClient from './client';

export const attendanceApi = {
  getHistory: (params?: { page?: number; limit?: number }) =>
    apiClient.get('/attendance/history', { params }),

  getToday: () => apiClient.get('/attendance/today'),

  getReport: (startDate: string, endDate: string) =>
    apiClient.get('/attendance/report', { params: { startDate, endDate } }),



  /**
   * Get attendance events for a specific date
   */
  getByDate: (date: string) =>
    apiClient.get('/attendance/history', { params: { date, page: 1, limit: 100 } }),
};