import type { StyleSheet } from "react-native";

export const theme = {
  spacing: (unit: number) => unit * 4,
  colors: {
    primary: "#4B5563",
    secondary: "#6B7280",
    success: "#059669",
    warning: "#D97706",
    error: "#DC2626",
    background: "#FFFFFF",
    surface: "#F9FAFB",
    text: "#111827",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    placeholder: "#9CA3AF",
  },
  typography: {
    title: {
      fontFamily: "Lato",
      fontWeight: "900",
      fontSize: 28,
    },
    body: {
      fontFamily: "Lato",
      fontWeight: "400",
      fontSize: 16,
    },
    label: {
      fontFamily: "Lato",
      fontWeight: "700",
      fontSize: 12,
    },
    header: {
      fontFamily: "Lato",
      fontWeight: "900",
      fontSize: 16,
    },
    details: {
      fontFamily: "Lato",
      fontWeight: "400",
      fontSize: 14,
    },
  },
} as const;

export type Theme = typeof theme;

export const makeStyles = <
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>,
>(
  create: (theme: Theme) => T,
) => create(theme);
