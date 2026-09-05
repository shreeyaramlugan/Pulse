import { Theme } from "./types";

export const pink: Theme = {
  name: "pink",
  label: "Pretty in Pink",
  description: "Soft, playful and polished.",
mode: "light",
  colors: {
    background: "#FFF5F8",
    foreground: "#3A2730",

    card: "#FFFFFF",
    cardForeground: "#3A2730",

    primary: "#E889A8",
    primaryForeground: "#FFFFFF",

    secondary: "#F7DCE5",
    secondaryForeground: "#613B48",

    muted: "#F9EAF0",
    mutedForeground: "#92707C",

    accent: "#C85C86",
    accentForeground: "#FFFFFF",

    border: "#F0CCD9",
    input: "#F0CCD9",
    ring: "#E889A8",

    success: "#70A58A",
    warning: "#D6A24A",
    danger: "#D66A79",
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
    xl: "26px",
  },

  effects: {
    shadow: "0 10px 30px rgba(154,73,104,0.10)",
    glow: "0 0 25px rgba(232,137,168,0.12)",
  },
};