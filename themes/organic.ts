import { Theme } from "./types";

export const organic: Theme = {
  name: "organic",
  label: "Organic",
  description: "Calm, natural and grounded.",
mode: "light",
  colors: {
    background: "#F4F1E8",
    foreground: "#29332B",

    card: "#FBFAF5",
    cardForeground: "#29332B",

    primary: "#657153",
    primaryForeground: "#F8F6EF",

    secondary: "#DDDCCB",
    secondaryForeground: "#3C4537",

    muted: "#EAE8DC",
    mutedForeground: "#73786D",

    accent: "#B77A55",
    accentForeground: "#FFF8F1",

    border: "#D7D4C6",
    input: "#D7D4C6",
    ring: "#657153",

    success: "#63845A",
    warning: "#B78B45",
    danger: "#A85C50",
  },

  typography: {
    heading: "DM Sans",
    body: "DM Sans",
    mono: "DM Mono",
  },

  radius: {
    sm: "8px",
    md: "12px",
    lg: "18px",
    xl: "24px",
  },

  effects: {
    shadow: "0 8px 25px rgba(57,63,47,0.08)",
    glow: "0 0 20px rgba(101,113,83,0.08)",
  },
};