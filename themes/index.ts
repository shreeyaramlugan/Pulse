import { Theme, ThemeName } from "./types";

import { obsidian } from "./obsidian";
import { futuristic } from "./futuristic";
import { cyberpunk } from "./cyberpunk";
import { organic } from "./organic";
import { mission } from "./mission";
import { chai } from "./chai";
import { pink } from "./pink";

export const themes: Record<ThemeName, Theme> = {
  obsidian,
  futuristic,
  cyberpunk,
  organic,
  mission,
  chai,
  pink,
};

export const defaultTheme: ThemeName = "obsidian";

export {
  obsidian,
  futuristic,
  cyberpunk,
  organic,
  mission,
  chai,
  pink,
};