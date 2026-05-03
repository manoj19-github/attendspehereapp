// src/constants/config.ts
export const API_BASE_URL = 'http://localhost:5000/api';

// export const OFFICE_LAT = 22.77930;
// export const OFFICE_LNG =  88.25524;
// export const OFFICE_RADIUS = 100;
// export const OFFICE_NAME = 'AttendSphere HQ';

// export const LOCATION_POLLING_INTERVAL = 30000; // 30 seconds


// export const WORKING_HOURS = {
//   start: 9, // 9 AM
//   end: 18, // 6 PM
//   days: [1, 2, 3, 4, 5], // Monday to Friday
// };

export const ASYNC_STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  REFRESH_TOKEN: '@refresh_token',
  USER_DATA: '@user_data',
  DEVICE_INFO: '@device_info',
  OFFLINE_QUEUE: '@offline_queue',
  LAST_SYNC: '@last_sync',
  SETTINGS: '@settings',
};

export const BACKGROUND_TASK_NAME = 'AttendSphereLocationTask';