
export type ThemeName =
  | "obsidian"
  | "futuristic"
  | "cyberpunk"
  | "organic"
  | "mission"
  | "chai"
  | "pink";

export type ThemeMode = "light" | "dark";

export interface Theme {
  name: ThemeName;
  label: string;
  description: string;
  mode: ThemeMode;

  colors: {
    background: string;
    foreground: string;

    card: string;
    cardForeground: string;

    primary: string;
    primaryForeground: string;

    secondary: string;
    secondaryForeground: string;

    muted: string;
    mutedForeground: string;

    accent: string;
    accentForeground: string;

    border: string;
    input: string;
    ring: string;

    success: string;
    warning: string;
    danger: string;
  };

  typography: {
    heading: string;
    body: string;
    mono: string;
  };

  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  effects: {
    shadow: string;
    glow: string;
  };
}

