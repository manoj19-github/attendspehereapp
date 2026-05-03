


export const Colors = {
  primary: '#3730A3',       // indigo-700
  primaryDark: '#1E1B4B',   // indigo-950
  primaryMid: '#4338CA',    // indigo-700
  accent: '#2563EB',        // blue-600
  accentLight: '#3B82F6',   // blue-500
  accentSoft: '#BFDBFE',    // blue-200
  indigo: '#6366F1',        // indigo-500
  indigoLight: '#A5B4FC',   // indigo-300
  indigoSoft: '#E0E7FF',    // indigo-100
  white: '#FFFFFF',
  offWhite: '#F8FAFF',
  surface: '#EEF2FF',
  border: '#C7D2FE',
  textPrimary: '#1E1B4B',
  textSecondary: '#4338CA',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  gradient1: '#1E1B4B',
  gradient2: '#3730A3',
  gradient3: '#2563EB',
};



export function safeParse<T>(value: any, fallback: T): T {
  try {
    if (!value) return fallback;

    // If already object/array → return as-is
    if (typeof value === 'object') return value;

    // If string → parse
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
}






