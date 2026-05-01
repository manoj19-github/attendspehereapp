// src/store/useAttendanceStore.ts
import { create } from 'zustand';
import { AttendanceEvent } from '../types';

interface AttendanceStore {
  todayAttendance: {
    events: AttendanceEvent[];
    totalWorkingHours: number;
    isComplete: boolean;
    sessions: number;
  } | null;
  history: AttendanceEvent[];
  isLoading: boolean;
  
  setTodayAttendance: (data: any) => void;
  setHistory: (history: AttendanceEvent[]) => void;
  setLoading: (loading: boolean) => void;
  addEvent: (event: AttendanceEvent) => void;
  setWorkingHours:(workingHours:number)=>void;
}

export const useAttendanceStore = create<AttendanceStore>((set) => ({
  todayAttendance: null,
  history: [],
  isLoading: false,

  setWorkingHours:(workingHours:number)=>
     set((state) => ({
      todayAttendance: state.todayAttendance
        ? {
            ...state.todayAttendance,
            totalWorkingHours: workingHours,
          }
        : { events: [], totalWorkingHours: workingHours, isComplete: false, sessions: 0 },
    })),

  setTodayAttendance: (todayAttendance) => set({ todayAttendance }),
  setHistory: (history) => set({ history }),
  setLoading: (isLoading) => set({ isLoading }),
  addEvent: (event) =>
    set((state) => ({
      todayAttendance: state.todayAttendance
        ? {
            ...state.todayAttendance,
            events: [...state.todayAttendance.events, event],
          }
        : { events: [event], totalWorkingHours: 0, isComplete: false, sessions: 0 },
    })),
}));