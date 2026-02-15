/**
 * Design tokens for consistent UI styling across the app.
 * These values are mirrored in tailwind.config.ts where applicable.
 */

export const colors = {
  maroon: {
    900: "#500000",
    700: "#6B1D1D",
    100: "#F5E6E6",
    50: "#FBF5F5",
  },
  gray: {
    900: "#1a1a1a",
    700: "#404040",
    600: "#525252",
    500: "#737373",
    400: "#a3a3a3",
    300: "#d4d4d4",
    200: "#e5e5e5",
    100: "#f5f5f5",
    50: "#fafafa",
  },
  status: {
    success: "#16a34a",
    successBg: "#f0fdf4",
    error: "#dc2626",
    errorBg: "#fef2f2",
    warning: "#d97706",
    warningBg: "#fffbeb",
  },
} as const;

/** Chart color palette (maroon theme) */
export const chartColors = {
  primary: "#500000",
  primaryLight: "rgba(80, 0, 0, 0.15)",
  secondary: "#6B1D1D",
  grid: "#e5e5e5",
  text: "#737373",
} as const;
