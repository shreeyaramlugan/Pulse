import { Theme } from "./types";

export const obsidian: Theme = {
  name: "obsidian",
  label: "Obsidian",
  description: "Dark, premium and minimal.",
mode: "dark",
  colors: {
    background: "#0B0B0D",
    foreground: "#F5F5F5",

    card: "#141417",
    cardForeground: "#F5F5F5",

    primary: "#FFFFFF",
    primaryForeground: "#0B0B0D",

    secondary: "#1C1C21",
    secondaryForeground: "#E5E5E7",

    muted: "#18181B",
    mutedForeground: "#8A8A93",

    accent: "#A1A1AA",
    accentForeground: "#09090B",

    border: "#27272A",
    input: "#27272A",
    ring: "#71717A",

    success: "#4ADE80",
    warning: "#FACC15",
    danger: "#F87171",
  },

  typography: {
    heading: "Inter",
    body: "Inter",
    mono: "JetBrains Mono",
  },

  radius: {
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
  },

  effects: {
    shadow: "0 10px 30px rgba(0,0,0,0.35)",
    glow: "0 0 20px rgba(255,255,255,0.05)",
  },
};