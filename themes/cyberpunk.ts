import { Theme } from "./types";

export const cyberpunk: Theme = {
  name: "cyberpunk",
  label: "Cyberpunk Dark Neon",
  description: "Dark, electric and unapologetically energetic.",
mode: "dark",
  colors: {
    background: "#08060D",
    foreground: "#F8F7FF",

    card: "#120D1C",
    cardForeground: "#F8F7FF",

    primary: "#FF2BD6",
    primaryForeground: "#160012",

    secondary: "#191127",
    secondaryForeground: "#E9D5FF",

    muted: "#171020",
    mutedForeground: "#9D8FAF",

    accent: "#00F5FF",
    accentForeground: "#001417",

    border: "#332047",
    input: "#332047",
    ring: "#FF2BD6",

    success: "#39FF88",
    warning: "#FFE600",
    danger: "#FF3864",
  },

  typography: {
    heading: "Space Grotesk",
    body: "Inter",
    mono: "JetBrains Mono",
  },

  radius: {
    sm: "2px",
    md: "4px",
    lg: "7px",
    xl: "10px",
  },

  effects: {
    shadow: "0 12px 40px rgba(0,0,0,0.55)",
    glow: "0 0 30px rgba(255,43,214,0.2)",
  },
};