/**
 * Design tokens shared by web (Tailwind) and mobile (NativeWind).
 * Single source of truth for the indigo on cool white system (see
 * apps/web recolor-plan.md). `globals.css` is the CSS authority; this file is
 * the JS authority (consumed by NativeWind / mobile and any JS that needs a hex).
 *
 * One accent only: indigo `primary`. success/warning/error are functional.
 */
export const colors = {
  light: {
    background: '#F8FAFC',
    backgroundSecondary: '#F1F5F9',
    backgroundTertiary: '#E2E8F0',
    card: '#FFFFFF',
    foreground: '#0F172A',
    foregroundSecondary: '#334155',
    foregroundMuted: '#64748B',
    primary: '#4F46E5',
    primaryHover: '#4338CA',
    primaryForeground: '#FFFFFF',
    secondary: '#EEF2FF',
    border: '#E2E8F0',
    borderSecondary: '#EEF2F6',
    success: '#16A34A',
    warning: '#D97706',
    error: '#DC2626',
    ring: '#4F46E5',
  },
  dark: {
    background: '#0F172A',
    backgroundSecondary: '#172033',
    backgroundTertiary: '#334155',
    card: '#1E293B',
    foreground: '#F1F5F9',
    foregroundSecondary: '#CBD5E1',
    foregroundMuted: '#94A3B8',
    primary: '#818CF8',
    primaryHover: '#A5B4FC',
    primaryForeground: '#0F172A',
    secondary: '#24284B',
    border: '#263143',
    borderSecondary: '#1B2536',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    ring: '#818CF8',
  },
  /** Functional tones (theme-agnostic aliases; prefer the light/dark maps above). */
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
} as const;

export type Colors = typeof colors;
