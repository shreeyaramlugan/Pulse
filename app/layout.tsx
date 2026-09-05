import type { Metadata } from "next";
import {
  DM_Mono,
  DM_Sans,
  Inter,
  JetBrains_Mono,
  Playfair_Display,
  Space_Grotesk,
} from "next/font/google";

import "./globals.css";

import { ThemeProvider } from "@/components/theme/themeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Automation",
  description:
    "Your personal productivity and business operating system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={[
          inter.variable,
          spaceGrotesk.variable,
          playfairDisplay.variable,
          dmSans.variable,
          dmMono.variable,
          jetBrainsMono.variable,
        ].join(" ")}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
