// src/constants/colors.ts
// Light theme matching the logo (blues with light backgrounds)
export const Colors = {

      primary: '#4A7FD9',
  primaryLight: '#6B9FE8',
  dangerLight: '#FB2C36',
  danger:"#E7000B",

  // ===== BACKGROUND =====
  background: '#F5F8FC',
  card: '#FFFFFF',
  white: '#FFFFFF',

  // ===== TEXT =====
  black: '#1A1A2E',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  // ===== GRAYS (USED IN YOUR STYLES) =====
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',

  // ===== ATTENDANCE =====
  checkIn: '#34C759',
  checkOut: '#E74C3C',

  // ===== LOCATION =====
  insideOffice: '#34C759',
  outsideOffice: '#E74C3C',

  // ===== TIMER =====
  timerActive: '#4A7FD9',
  timerInactive: '#9CA3AF',
  timerBg: '#EBF1FC',

  // ===== ALERT =====
  warning: '#F5A623',
  warningBg: '#FEF5E7',

  // ===== DISTANCE =====
  distanceNear: '#34C759',
  distanceFar: '#E74C3C',

  // ===== UI =====
  border: '#E5E7EB',
  divider: '#F3F4F6',

  // ===== BADGES =====
  badgeSuccessBg: '#E8F9ED',
  badgeDangerBg: '#FDEDEC',
  badgeWarningBg: '#FEF5E7',
  // Primary - Logo blue shades
  
  primaryLighter: '#B8D4FF',
  primaryDark: '#2E5BB5',
  
  // Secondary - Accent
  secondary: '#5B8DEF',
  accent: '#8FB8FF',
  
  // Success - Green for inside office
  success: '#4CAF50',
  successLight: '#81C784',
  successLighter: '#C8E6C9',
  
  // Warning - Orange for alerts

  warningLight: '#FFB74D',
  
  // Error - Red
  error: '#EF5350',
  errorLight: '#FFCDD2',
  

  surface: '#FFFFFF',

  cardLight: '#F8FAFF',
  
  // Text

  textInverse: '#FFFFFF',
  

  borderLight: '#EDF2F9',
  
  // Map
  mapMarkerOffice: '#4A7DE4',
  mapMarkerUser: '#4CAF50',
  mapRoute: '#4A7DE4',
  
  // Status
  statusOnline: '#4CAF50',
  statusOffline: '#EF5350',
  statusSyncing: '#FF9800',
  
  // Gradient stops
  gradientStart: '#E8F0FE',
  gradientEnd: '#F0F4FA',
  darkBlue:"#2B7FFF"
};

export const Gradients = {
  primary: ['#4A7DE4', '#7BA3F5'],
  success: ['#4CAF50', '#81C784'],
  background: ['#F0F4FA', '#E8F0FE'],
  card: ['#FFFFFF', '#F8FAFF'],
};


export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};