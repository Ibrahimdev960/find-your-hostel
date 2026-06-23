/**
 * Design tokens shared by web (Tailwind) and mobile (NativeWind).
 * Single source of truth for brand colors; Tailwind configs read from here.
 */
export const colors = {
  brand: {
    50: '#eef6ff',
    100: '#d9eaff',
    200: '#bcdaff',
    300: '#8ec2ff',
    400: '#599fff',
    500: '#337bff',
    600: '#1d5cf5',
    700: '#1647e1',
    800: '#193cb6',
    900: '#1a378f',
  },
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
} as const;

export type Colors = typeof colors;
