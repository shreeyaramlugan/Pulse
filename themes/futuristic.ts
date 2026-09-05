import { Theme } from "./types";

export const futuristic: Theme = {
  name: "futuristic",
  label: "Futuristic Technical",
  description: "Precision interfaces inspired by technical systems.",
mode: "dark",
  colors: {
    background: "#07111A",
    foreground: "#E6F1F5",

    card: "#0B1924",
    cardForeground: "#E6F1F5",

    primary: "#38BDF8",
    primaryForeground: "#031018",

    secondary: "#102532",
    secondaryForeground: "#B9D9E8",

    muted: "#0E202C",
    mutedForeground: "#6F94A5",

    accent: "#22D3EE",
    accentForeground: "#031014",

    border: "#193646",
    input: "#193646",
    ring: "#38BDF8",

    success: "#34D399",
    warning: "#FBBF24",
    danger: "#FB7185",
  },

  typography: {
    heading: "Space Grotesk",
    body: "Inter",
    mono: "JetBrains Mono",
  },

  radius: {
    sm: "3px",
    md: "5px",
    lg: "8px",
    xl: "12px",
  },

  effects: {
    shadow: "0 10px 35px rgba(0,0,0,0.4)",
    glow: "0 0 25px rgba(56,189,248,0.12)",
  },
};