import { Theme } from "./types";

export const mission: Theme = {
  name: "mission",
  label: "Mission",
  description: "Focused, utilitarian and built for getting things done.",
mode: "dark",
  colors: {
    background: "#101214",
    foreground: "#E8E9EA",

    card: "#17191C",
    cardForeground: "#E8E9EA",

    primary: "#D6FF4B",
    primaryForeground: "#101400",

    secondary: "#202328",
    secondaryForeground: "#D0D3D6",

    muted: "#1B1E22",
    mutedForeground: "#858A91",

    accent: "#6EE7B7",
    accentForeground: "#04130D",

    border: "#2A2E34",
    input: "#2A2E34",
    ring: "#D6FF4B",

    success: "#6EE7B7",
    warning: "#F5C451",
    danger: "#F87171",
  },

  typography: {
    heading: "Space Grotesk",
    body: "Inter",
    mono: "JetBrains Mono",
  },

  radius: {
    sm: "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
  },

  effects: {
    shadow: "0 8px 25px rgba(0,0,0,0.35)",
    glow: "0 0 18px rgba(214,255,75,0.08)",
  },
};