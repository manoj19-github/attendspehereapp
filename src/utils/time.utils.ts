// src/utils/time.ts
import dayjs from 'dayjs';
import { useAuthStore } from '../store/useAuthStore';



export const isWithinWorkingHours = (date: Date = new Date()): boolean => {
  const officeSettings = useAuthStore.getState().officeSettings;
  const day = date.getDay();
  if (!officeSettings?.WORKING_HOURS?.days.includes(day)) return false;

  const hour = date.getHours();
  return hour >= officeSettings?.WORKING_HOURS?.start && hour < officeSettings?.WORKING_HOURS?.end;
};

export const formatTime = (date: string | Date): string => {
  return dayjs(date).format('h:mm A');
};

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('MMM D, YYYY');
};

export const formatDuration = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

export const getCurrentTime = (): string => {
  return dayjs().format('h:mm:ss A');
};



// export const formatTime = (dateString: string): string => {
//   return dayjs(dateString).format('h:mm A');
// };

// export const formatDate = (dateString: string): string => {
//   return dayjs(dateString).format('MMM D, YYYY');
// };

export const formatDateShort = (dateString: string): string => {
  return dayjs(dateString).format('ddd, MMM D');
};

// export const formatDuration = (hours: number): string => {
//   const h = Math.floor(hours);
//   const m = Math.round((hours - h) * 60);
//   if (h === 0) return `${m}m`;
//   return `${h}h ${m}m`;
// };

export const isWorkingHours = (): boolean => {
  const now = dayjs();
  const day = now.day();
  if (day === 0 || day === 6) return false;
  
  const hour = now.hour();
  return hour >= 9 && hour < 18;
};

export const getWorkingHoursProgress = (totalHours: number): number => {
  return Math.min((totalHours / 8) * 100, 100);
};