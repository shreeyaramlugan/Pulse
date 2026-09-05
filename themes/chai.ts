import { Theme } from "./types";

export const chai: Theme = {
  name: "chai",
  label: "Chai",
  description: "Warm, earthy and quietly energetic.",
mode: "light",
  colors: {
    background: "#FAF3E8",
    foreground: "#1C1208",

    card: "#FFF9F0",
    cardForeground: "#1C1208",

    primary: "#C8651B",
    primaryForeground: "#FFF8EF",

    secondary: "#E8D5BF",
    secondaryForeground: "#4B2A16",

    muted: "#F0E4D5",
    mutedForeground: "#806A57",

    accent: "#8B3E0A",
    accentForeground: "#FFF8EF",

    border: "#DFCAB4",
    input: "#DFCAB4",
    ring: "#C8651B",

    success: "#668A55",
    warning: "#C68A32",
    danger: "#B5533D",
  },

  typography: {
    heading: "Playfair Display",
    body: "DM Sans",
    mono: "DM Mono",
  },

  radius: {
    sm: "6px",
    md: "9px",
    lg: "14px",
    xl: "20px",
  },

  effects: {
    shadow: "0 10px 30px rgba(82,46,20,0.10)",
    glow: "0 0 20px rgba(200,101,27,0.08)",
  },
};