// src/types/index.ts
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'employee';
}

export interface DeviceInfo {
  androidId: string;
  deviceModel: string;
  osVersion: string;
  fingerprint: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface LocationState {
  latitude: number;
  longitude: number;
  distance: number;
  status: 'in_office_area' | 'out_office_area';
  isWorkingHours: boolean;
  isSameLocation:boolean;
}

export interface AttendanceEvent {
  id: string;
  event_date: string;
  event_type: 'checkin' | 'checkout';
  timestamp_event: string;
}

export interface TodayAttendance {
  events: AttendanceEvent[];
  totalWorkingHours: number;
  isComplete: boolean;
  sessions: number;
}

export interface WorkingHoursReport {
  user_id: string;
  full_name: string;
  event_date: string;
  working_hours: number;
}

export interface OfflineQueueItem {
  id: string;
  type: 'location_ping' | 'attendance' | 'status_update' ;
  data: any;
  timestamp: string;
  retryCount: number;
}

export interface AppState {
  isOnline: boolean;
  isLoading: boolean;
  error: string | null;
}




// src/types/index.ts

// ==================== AUTH TYPES ====================

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'employee';
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// ==================== DEVICE TYPES ====================

export interface DeviceInfoData {
  androidId: string;
  deviceModel: string;
  osVersion: string;
  fingerprint: string;
}

// ==================== LOCATION TYPES ====================

export interface LocationCoords {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface LocationState {
  latitude: number;
  longitude: number;
  distance: number;
  status: 'in_office_area' | 'out_office_area';
  isWorkingHours: boolean;
}

export interface LocationPingPayload {
  lat: number;
  lng: number;
  timestamp?: string;
}

export interface LocationPingResponse {
  distance: number;
  status: 'in_office_area' | 'out_office_area';
  isWorkingHours: boolean;
  locationLogged: boolean;
  attendanceEvent: 'checkin' | 'checkout' | null;
  firstCheckinDone: boolean;
  officeLocation: {
    lat: number;
    lng: number;
  };
}

// ==================== ATTENDANCE TYPES ====================

export interface AttendanceEvent {
  id: string;
  event_date: string;
  event_type: 'checkin' | 'checkout';
  timestamp_event: string;
  created_at: string;
}

export interface TodayAttendance {
  events: AttendanceEvent[];
  totalWorkingHours: number;
  isComplete: boolean;
  sessions: number;
}

// ==================== OFFLINE TYPES ====================

export interface OfflineQueueItem {
  id: string;
  type: 'location_ping' | 'attendance' | 'generic';
  data: any;
  timestamp: string;
  retryCount: number;
}

// ==================== API TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}


export interface WorkingHours {
	start: number;
	end: number;
	days: number[];
}

export interface OfficeConfig {
	OFFICE_LAT: number;
	OFFICE_LNG: number;
	OFFICE_RADIUS: number;
	OFFICE_NAME: string;
	OFFICE_ADDRESS: string;

	LOCATION_POLLING_INTERVAL: number;

	DISTANCE_THRESHOLD: number;
	TIME_INTERVAL_MS: number;

	WORKING_HOURS:WorkingHours;
}