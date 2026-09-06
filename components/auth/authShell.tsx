"use client";

import { Coffee, Sparkles } from "lucide-react";
import { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
  title: string;
  description: string;
  footer: ReactNode;
}

export function AuthShell({
  children,
  title,
  description,
  footer,
}: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 text-foreground">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-12rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="absolute bottom-[-10rem] left-[-10rem] h-[25rem] w-[25rem] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-5 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-theme)]">
              <Coffee className="h-6 w-6" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />

            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Pulse
            </span>

            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-theme)] sm:p-8">
          <div className="mb-7">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-card-foreground">
              {title}
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          {children}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          {footer}
        </div>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
          Your work. Your goals. Your system.
        </p>
      </div>
    </main>
  );
}
